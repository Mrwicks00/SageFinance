// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
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
    UUPSUpgradeable
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
    uint256 public maxSlippageBPS = 300; // 3% default slippage tolerance
    uint256 public constant MAX_POSITIONS_PER_USER = 50; //max positions per user

    // Price Validation variables
    uint256 public priceDeviationThreshold = 500; // 5% max deviation
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

    // VRF callback
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal {
        require(msg.sender == address(vrfCoordinator), "Only VRF coordinator");
        YieldOptimizerStructs.VRFRequest storage request = vrfRequests[
            requestId
        ];
        if (request.fulfilled) revert YieldOptimizerErrors.InvalidVRFRequest();
        if (request.user == address(0))
            revert YieldOptimizerErrors.InvalidVRFRequest();

        // Select random strategy (0, 1, or 2)
        uint256 strategyId = randomWords[0] % 3;
        if (!strategies[strategyId].active)
            revert YieldOptimizerErrors.InvalidStrategy();

        // Deposit to random strategy
        if (strategyId == 0) {
            AaveIntegration.depositToAave(
                aaveLendingPool,
                stablecoin,
                request.amount,
                address(this)
            );
        } else if (strategyId == 1) {
            CompoundIntegration.depositToCompound(
                compoundCToken,
                stablecoin,
                request.amount
            );
        } else if (strategyId == 2) {
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
    ) public nonReentrant whenNotPaused {
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
        if (block.timestamp < position.lastRebalanced + rebalanceInterval)
            revert YieldOptimizerErrors.RebalanceNotNeeded();

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
    ) external nonReentrant whenNotPaused {
        int256 currentPrice = ChainlinkUtils.getLatestPrice(priceFeed);

        _validatePrice(currentPrice);

        bool shouldRebalance = isPriceAboveThreshold
            ? currentPrice > priceThreshold
            : currentPrice < priceThreshold;

        if (shouldRebalance) {
            rebalance(msg.sender, positionIndex, newStrategyId, amount);
        }
    }

    // Global rebalance
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
            for (uint256 j = 0; j < userPositions[users[i]].length; j++) {
                YieldOptimizerStructs.UserPosition
                    storage position = userPositions[users[i]][j];
                if (position.balance == 0) continue;

                // Withdraw
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

                // Deposit
                if (newStrategyId == 0) {
                    AaveIntegration.depositToAave(
                        aaveLendingPool,
                        stablecoin,
                        position.balance,
                        address(this)
                    );
                } else if (newStrategyId == 1) {
                    CompoundIntegration.depositToCompound(
                        compoundCToken,
                        stablecoin,
                        position.balance
                    );
                } else if (newStrategyId == 2) {
                    uint256 minAmountOut = _calculateMinAmountOut(
                        position.balance,
                        maxSlippageBPS
                    );
                    UniswapIntegration.depositToUniswap(
                        uniswapRouter,
                        stablecoin,
                        weth,
                        position.balance,
                        minAmountOut
                    );
                }

                uint256 amount = position.balance;
                position.balance = 0;
                userPositions[users[i]].push(
                    YieldOptimizerStructs.UserPosition({
                        strategyId: newStrategyId,
                        balance: amount,
                        lastUpdated: block.timestamp,
                        lastRebalanced: block.timestamp
                    })
                );

                emit YieldOptimizerEvents.Rebalanced(
                    users[i],
                    position.strategyId,
                    newStrategyId,
                    amount,
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
