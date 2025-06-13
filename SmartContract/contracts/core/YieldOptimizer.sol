// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../utils/VRFConsumerBaseV2Upgradeable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "../errors/YieldOptimizerErrors.sol";
import "../events/YieldOptimizerEvents.sol";
import "../structs/YieldOptimizerStructs.sol";
import "../integrations/AaveIntegration.sol";
import "../integrations/CompoundIntegration.sol";
import "../integrations/UniswapIntegration.sol";
import "../libraries/ChainlinkUtils.sol";
import "../interfaces/IAaveLendingPool.sol";
import "../interfaces/ICompoundCToken.sol";
import "../interfaces/IUniswapV3Router.sol";

contract YieldOptimizer is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable,
    VRFConsumerBaseV2Upgradeable
{
    using AaveIntegration for *;
    using CompoundIntegration for *;
    using UniswapIntegration for *;
    using ChainlinkUtils for IERC20;
    using SafeERC20 for IERC20;

    AggregatorV3Interface public priceFeed; // USDC/ETH
    IERC20 public stablecoin; // USDC
    IERC20 public weth; // WETH
    address public aiAgent;
    uint256 public rebalanceInterval;
    uint256 public lastGlobalRebalance;
    uint256 public maxSlippageBPS; // slippage tolerance
    uint256 public constant MAX_POSITIONS_PER_USER = 50; //max positions per user

    mapping(address => uint256) public userLastRebalance;

    // Price Validation variables
    uint256 public priceDeviationThreshold; //max deviation
    int256 public lastValidPrice;
    uint256 public lastPriceUpdate;
    uint256 public constant PRICE_STALENESS_THRESHOLD = 3600; // 1 hour

    // Protocol contracts
    IAaveLendingPool public aaveLendingPool;
    ICompoundCToken public compoundCToken;
    IUniswapV3Router public uniswapRouter;

    // VRF configuration
    VRFCoordinatorV2Interface public vrfCoordinator;
    uint64 public vrfSubscriptionId;
    bytes32 public constant KEY_HASH =
        0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c; // Sepolia 150 gwei
    uint32 public constant CALLBACK_GAS_LIMIT = 100000;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 1;

    // Strategies:
    mapping(uint256 => YieldOptimizerStructs.Strategy) public strategies;
    mapping(address => YieldOptimizerStructs.UserPosition[])
        public userPositions;
    mapping(uint256 => YieldOptimizerStructs.VRFRequest) public vrfRequests;

    mapping(address => bool) private _depositInProgress;
    mapping(address => bool) private _withdrawInProgress;
    mapping(address => bool) private _rebalanceInProgress;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _priceFeed,
        address _stablecoin,
        address _weth,
        address _aiAgent,
        address _aaveLendingPool,
        address _compoundCToken,
        address _uniswapRouter,
        address _vrfCoordinator,
        uint64 _vrfSubscriptionId
    ) external initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        __VRFConsumerBaseV2Upgradeable_init(_vrfCoordinator);

        priceFeed = AggregatorV3Interface(_priceFeed);
        stablecoin = IERC20(_stablecoin);
        weth = IERC20(_weth);
        aiAgent = _aiAgent;
        aaveLendingPool = IAaveLendingPool(_aaveLendingPool);
        compoundCToken = ICompoundCToken(_compoundCToken);
        uniswapRouter = IUniswapV3Router(_uniswapRouter);
        if (_vrfCoordinator == address(0))
            revert YieldOptimizerErrors.ZeroAddress();
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfSubscriptionId = _vrfSubscriptionId;
        rebalanceInterval = 1 days;

        maxSlippageBPS = 300; // 3% default slippage tolerance
        priceDeviationThreshold = 500; // 5% max deviation

        // Initialize strategies
        strategies[0] = YieldOptimizerStructs.Strategy(
            0,
            "Aave",
            address(aaveLendingPool),
            address(0),
            true
        );
        strategies[1] = YieldOptimizerStructs.Strategy(
            1,
            "Compound",
            address(compoundCToken),
            address(compoundCToken),
            true
        );
        strategies[2] = YieldOptimizerStructs.Strategy(
            2,
            "Uniswap",
            address(uniswapRouter),
            address(0),
            true
        );
    }

    modifier canRebalance(address user) {
        if (
            userLastRebalance[user] != 0 &&
            block.timestamp < userLastRebalance[user] + rebalanceInterval
        ) {
            revert YieldOptimizerErrors.RebalanceNotNeeded();
        }
        _;
    }

    // Deposit to specified strategy
    function deposit(
        uint256 strategyId,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        if (_depositInProgress[msg.sender])
            revert YieldOptimizerErrors.OperationInProgress();
        _depositInProgress[msg.sender] = true;
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        if (!strategies[strategyId].active)
            revert YieldOptimizerErrors.InvalidStrategy();
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);

        if (strategyId == 0) {
            AaveIntegration.depositToAave(
                aaveLendingPool,
                stablecoin,
                amount,
                address(this)
            );
        } else if (strategyId == 1) {
            CompoundIntegration.depositToCompound(
                compoundCToken,
                stablecoin,
                amount
            );
        } else if (strategyId == 2) {
            uint256 minAmountOut = _calculateMinAmountOut(
                amount,
                maxSlippageBPS
            );
            UniswapIntegration.depositToUniswap(
                uniswapRouter,
                stablecoin,
                weth,
                amount,
                minAmountOut
            );
        }

        userPositions[msg.sender].push(
            YieldOptimizerStructs.UserPosition({
                strategyId: strategyId,
                balance: amount,
                lastUpdated: block.timestamp,
                lastRebalanced: block.timestamp
            })
        );

        _depositInProgress[msg.sender] = false;

        emit YieldOptimizerEvents.Deposited(msg.sender, strategyId, amount);
    }

    // Deposit with random strategy via VRF
    function depositRandom(
        uint256 amount
    ) external nonReentrant whenNotPaused returns (uint256 requestId) {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);

        // Request VRF randomness
        requestId = vrfCoordinator.requestRandomWords(
            KEY_HASH,
            vrfSubscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        vrfRequests[requestId] = YieldOptimizerStructs.VRFRequest({
            user: msg.sender,
            amount: amount,
            fulfilled: false
        });

        emit YieldOptimizerEvents.RandomDepositRequested(
            msg.sender,
            amount,
            requestId
        );
    }

        function _fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override { 

        YieldOptimizerStructs.VRFRequest storage request = vrfRequests[requestId];
        
        uint256 strategyId = randomWords[0] % 3;
        if (!strategies[strategyId].active) revert YieldOptimizerErrors.InvalidStrategy();

        // Deposit to random strategy
        if (strategyId == 0) {
            if (stablecoin.balanceOf(address(this)) < request.amount)
                revert YieldOptimizerErrors.InsufficientContractBalance();
            AaveIntegration.depositToAave(
                aaveLendingPool,
                stablecoin,
                request.amount,
                address(this)
            );
        } else if (strategyId == 1) {
            if (stablecoin.balanceOf(address(this)) < request.amount)
                revert YieldOptimizerErrors.InsufficientContractBalance();
            CompoundIntegration.depositToCompound(
                compoundCToken,
                stablecoin,
                request.amount
            );
        } else if (strategyId == 2) {
            if (stablecoin.balanceOf(address(this)) < request.amount)
                revert YieldOptimizerErrors.InsufficientContractBalance();
            uint256 minAmountOut = _calculateMinAmountOut(
                request.amount,
                maxSlippageBPS
            );
            UniswapIntegration.depositToUniswap(
                uniswapRouter,
                stablecoin,
                weth,
                request.amount,
                minAmountOut
            );
        }

        userPositions[request.user].push(
            YieldOptimizerStructs.UserPosition({
                strategyId: strategyId,
                balance: request.amount,
                lastUpdated: block.timestamp,
                lastRebalanced: block.timestamp
            })
        );

        request.fulfilled = true;
        emit YieldOptimizerEvents.RandomDepositFulfilled(
            request.user,
            strategyId,
            request.amount
        );
        emit YieldOptimizerEvents.Deposited(
            request.user,
            strategyId,
            request.amount
        );
    }
    // Withdraw from specified position
    function withdraw(
        uint256 positionIndex,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        if (positionIndex >= userPositions[msg.sender].length)
            revert YieldOptimizerErrors.InvalidStrategy();
        YieldOptimizerStructs.UserPosition storage position = userPositions[
            msg.sender
        ][positionIndex];
        if (amount > position.balance)
            revert YieldOptimizerErrors.InsufficientBalance();

        if (position.strategyId == 0) {
            AaveIntegration.withdrawFromAave(
                aaveLendingPool,
                stablecoin,
                amount,
                msg.sender
            );
        } else if (position.strategyId == 1) {
            CompoundIntegration.withdrawFromCompound(
                compoundCToken,
                amount,
                stablecoin,
                msg.sender
            );
        } else if (position.strategyId == 2) {
            uint256 minAmountOut = _calculateMinAmountOut(
                amount,
                maxSlippageBPS
            );
            UniswapIntegration.withdrawFromUniswap(
                uniswapRouter,
                stablecoin,
                weth,
                amount,
                msg.sender,
                minAmountOut
            );
        }

        position.balance -= amount;
        position.lastUpdated = block.timestamp;

        emit YieldOptimizerEvents.Withdrawn(
            msg.sender,
            position.strategyId,
            amount
        );
    }

    // Rebalance to a new strategy
    function rebalance(
        address user,
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount
    ) public canRebalance(user) whenNotPaused {
        if (msg.sender != aiAgent && msg.sender != user)
            revert YieldOptimizerErrors.UnauthorizedCaller();
        if (positionIndex >= userPositions[user].length)
            revert YieldOptimizerErrors.InvalidStrategy();
        if (!strategies[newStrategyId].active)
            revert YieldOptimizerErrors.InvalidStrategy();
        YieldOptimizerStructs.UserPosition storage position = userPositions[
            user
        ][positionIndex];
        if (amount > position.balance)
            revert YieldOptimizerErrors.InsufficientBalance();
        // Update user's last rebalance time
        userLastRebalance[user] = block.timestamp;

        // Use internal function to avoid reentrancy issues
        _performRebalance(user, positionIndex, newStrategyId, amount);
    }

    // Internal rebalance function to avoid reentrancy conflicts
    function _performRebalance(
        address user,
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount
    ) internal {
        YieldOptimizerStructs.UserPosition storage position = userPositions[
            user
        ][positionIndex];

        // Withdraw from old strategy
        if (position.strategyId == 0) {
            AaveIntegration.withdrawFromAave(
                aaveLendingPool,
                stablecoin,
                amount,
                address(this)
            );
        } else if (position.strategyId == 1) {
            CompoundIntegration.withdrawFromCompound(
                compoundCToken,
                amount,
                stablecoin,
                address(this)
            );
        } else if (position.strategyId == 2) {
            uint256 minAmountOut = _calculateMinAmountOut(
                amount,
                maxSlippageBPS
            );
            UniswapIntegration.withdrawFromUniswap(
                uniswapRouter,
                stablecoin,
                weth,
                amount,
                address(this),
                minAmountOut
            );
        }

        // Deposit to new strategy
        if (newStrategyId == 0) {
            AaveIntegration.depositToAave(
                aaveLendingPool,
                stablecoin,
                amount,
                address(this)
            );
        } else if (newStrategyId == 1) {
            CompoundIntegration.depositToCompound(
                compoundCToken,
                stablecoin,
                amount
            );
        } else if (newStrategyId == 2) {
            uint256 minAmountOut = _calculateMinAmountOut(
                amount,
                maxSlippageBPS
            );
            UniswapIntegration.depositToUniswap(
                uniswapRouter,
                stablecoin,
                weth,
                amount,
                minAmountOut
            );
        }

        position.balance -= amount;
        userPositions[user].push(
            YieldOptimizerStructs.UserPosition({
                strategyId: newStrategyId,
                balance: amount,
                lastUpdated: block.timestamp,
                lastRebalanced: block.timestamp
            })
        );

        emit YieldOptimizerEvents.Rebalanced(
            user,
            position.strategyId,
            newStrategyId,
            amount,
            block.timestamp
        );
    }

    function _validatePrice(int256 currentPrice) private {
        if (block.timestamp - lastPriceUpdate > PRICE_STALENESS_THRESHOLD) {
            if (lastValidPrice > 0) {
                uint256 deviation = lastValidPrice > currentPrice
                    ? uint256(
                        ((lastValidPrice - currentPrice) * 10000) /
                            lastValidPrice
                    )
                    : uint256(
                        ((currentPrice - lastValidPrice) * 10000) /
                            lastValidPrice
                    );

                if (deviation > priceDeviationThreshold) {
                    revert YieldOptimizerErrors.PriceManipulationDetected();
                }
            }
        }

        lastValidPrice = currentPrice;
        lastPriceUpdate = block.timestamp;
    }

    // Rebalance if price threshold is met
    function rebalanceIfPriceThreshold(
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount,
        int256 priceThreshold,
        bool isPriceAboveThreshold
    ) external whenNotPaused {
        int256 currentPrice = ChainlinkUtils.getLatestPrice(priceFeed);

        _validatePrice(currentPrice);

        bool shouldRebalance = isPriceAboveThreshold
            ? currentPrice > priceThreshold
            : currentPrice < priceThreshold;

        if (shouldRebalance) {
            rebalance(msg.sender, positionIndex, newStrategyId, amount);
        }
    }

    function globalRebalance(
        address[] calldata users,
        uint256 newStrategyId
    ) external nonReentrant whenNotPaused {
        if (msg.sender != aiAgent && msg.sender != owner())
            revert YieldOptimizerErrors.UnauthorizedCaller();
        if (!strategies[newStrategyId].active)
            revert YieldOptimizerErrors.InvalidStrategy();
        if (block.timestamp < lastGlobalRebalance + rebalanceInterval)
            revert YieldOptimizerErrors.RebalanceNotNeeded();

        for (uint256 i = 0; i < users.length; i++) {
            address currentUser = users[i];
            uint256 totalUserBalanceToRebalance = 0;

            // Temporarily store positions to avoid modifying array during iteration
            YieldOptimizerStructs.UserPosition[]
                memory userPositionsCopy = userPositions[currentUser];
            delete userPositions[currentUser]; // Clear current positions

            for (uint256 j = 0; j < userPositionsCopy.length; j++) {
                YieldOptimizerStructs.UserPosition
                    memory position = userPositionsCopy[j];
                if (position.balance == 0) continue;

                // Withdraw from old strategy to contract
                if (position.strategyId == 0) {
                    AaveIntegration.withdrawFromAave(
                        aaveLendingPool,
                        stablecoin,
                        position.balance,
                        address(this)
                    );
                } else if (position.strategyId == 1) {
                    CompoundIntegration.withdrawFromCompound(
                        compoundCToken,
                        position.balance,
                        stablecoin,
                        address(this)
                    );
                } else if (position.strategyId == 2) {
                    uint256 minAmountOut = _calculateMinAmountOut(
                        position.balance,
                        maxSlippageBPS
                    );
                    UniswapIntegration.withdrawFromUniswap(
                        uniswapRouter,
                        stablecoin,
                        weth,
                        position.balance,
                        address(this),
                        minAmountOut
                    );
                }
                totalUserBalanceToRebalance += position.balance;
            }

            // Deposit consolidated balance to new strategy for this user
            if (totalUserBalanceToRebalance > 0) {
                // This is where you would deposit the combined amount for currentUser into newStrategyId
                // You might want to create a new helper function for consolidated deposits
                if (newStrategyId == 0) {
                    AaveIntegration.depositToAave(
                        aaveLendingPool,
                        stablecoin,
                        totalUserBalanceToRebalance,
                        currentUser
                    ); // Deposit back to user or contract?
                } else if (newStrategyId == 1) {
                    CompoundIntegration.depositToCompound(
                        compoundCToken,
                        stablecoin,
                        totalUserBalanceToRebalance
                    );
                } else if (newStrategyId == 2) {
                    uint256 minAmountOut = _calculateMinAmountOut(
                        totalUserBalanceToRebalance,
                        maxSlippageBPS
                    );
                    UniswapIntegration.depositToUniswap(
                        uniswapRouter,
                        stablecoin,
                        weth,
                        totalUserBalanceToRebalance,
                        minAmountOut
                    );
                }

                // Add a single, new consolidated position for the user
                userPositions[currentUser].push(
                    YieldOptimizerStructs.UserPosition({
                        strategyId: newStrategyId,
                        balance: totalUserBalanceToRebalance,
                        lastUpdated: block.timestamp,
                        lastRebalanced: block.timestamp
                    })
                );
                emit YieldOptimizerEvents.Rebalanced(
                    currentUser,
                    999, // Indicate consolidated rebalance from multiple strategies
                    newStrategyId,
                    totalUserBalanceToRebalance,
                    block.timestamp
                );
            }
        }
        lastGlobalRebalance = block.timestamp;
    }

    // Modify position creation to check limits
    function _addUserPosition(
        address user,
        YieldOptimizerStructs.UserPosition memory position
    ) private {
        if (userPositions[user].length >= MAX_POSITIONS_PER_USER) {
            _consolidatePositions(user);
        }
        userPositions[user].push(position);
    }

    // Add position consolidation function (corrected version)
    function _consolidatePositions(address user) private {
        YieldOptimizerStructs.UserPosition[] storage positions = userPositions[
            user
        ];

        // Use arrays instead of mapping for memory operations
        uint256[3] memory strategyBalances; // Assuming 3 strategies (0, 1, 2)
        bool[3] memory hasStrategy;

        // Accumulate balances by strategy
        for (uint256 i = 0; i < positions.length; i++) {
            if (positions[i].balance > 0 && positions[i].strategyId < 3) {
                strategyBalances[positions[i].strategyId] += positions[i]
                    .balance;
                hasStrategy[positions[i].strategyId] = true;
            }
        }

        // Clear old positions
        delete userPositions[user];

        // Create consolidated positions
        for (uint256 strategyId = 0; strategyId < 3; strategyId++) {
            if (hasStrategy[strategyId] && strategyBalances[strategyId] > 0) {
                userPositions[user].push(
                    YieldOptimizerStructs.UserPosition({
                        strategyId: strategyId,
                        balance: strategyBalances[strategyId],
                        lastUpdated: block.timestamp,
                        lastRebalanced: block.timestamp
                    })
                );
            }
        }
    }

    // Add manual consolidation function for users
    function consolidateMyPositions() external nonReentrant {
        _consolidatePositions(msg.sender);
        emit YieldOptimizerEvents.PositionsConsolidated(msg.sender);
    }

    // Get latest price
    function getLatestPrice() external view returns (int256) {
        return ChainlinkUtils.getLatestPrice(priceFeed);
    }

    // Update AI agent
    function setAIAgent(address _newAgent) external onlyOwner {
        aiAgent = _newAgent;
        emit YieldOptimizerEvents.AIAgentUpdated(_newAgent);
    }

    // Pause contract
    function pause() external onlyOwner {
        _pause();
        emit YieldOptimizerEvents.Paused(msg.sender);
    }

    // Unpause contract
    function unpause() external onlyOwner {
        _unpause();
        emit YieldOptimizerEvents.Unpaused(msg.sender);
    }

    // Emergency withdraw
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner nonReentrant {
        IERC20(token).safeTransfer(owner(), amount);
    }

    // Required by UUPS
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function getUserBalance(address user) external view returns (uint256) {
        uint256 totalBalance = 0;
        for (uint256 i = 0; i < userPositions[user].length; i++) {
            totalBalance += userPositions[user][i].balance;
        }
        return totalBalance;
    }

    function setMaxSlippage(uint256 _maxSlippageBPS) external onlyOwner {
        if (_maxSlippageBPS > 1000)
            revert YieldOptimizerErrors.InvalidSlippage(); // Max 10%
        maxSlippageBPS = _maxSlippageBPS;
    }

    function _calculateMinAmountOut(
        uint256 amountIn,
        uint256 slippageBPS
    ) private view returns (uint256) {
        int256 currentPrice = ChainlinkUtils.getLatestPrice(priceFeed);
        uint256 expectedOut = (amountIn * uint256(currentPrice)) /
            (10 ** priceFeed.decimals());
        return (expectedOut * (10000 - slippageBPS)) / 10000;
    }
}
