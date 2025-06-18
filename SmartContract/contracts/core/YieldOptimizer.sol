// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import "../interfaces/IERC20WithDecimals.sol"; // Using your specific interface
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "../errors/YieldOptimizerErrors.sol"; // Your custom errors
import "../events/YieldOptimizerEvents.sol"; // Your events
import "../structs/YieldOptimizerStructs.sol"; // Your structs
import "../integrations/AaveIntegration.sol";
// REMOVED: import "../integrations/UniswapIntegration.sol";
import "../integrations/CompoundIntegration.sol";
import "../interfaces/ICompoundV3Comet.sol"; // Your interface
import "../interfaces/IAaveLendingPool.sol"; // Your interface
// REMOVED: import "../interfaces/IUniswapV3Router.sol"; // Your interface

contract YieldOptimizer is ReentrancyGuard, Pausable, VRFConsumerBaseV2Plus {
    using AaveIntegration for *;
    using CompoundIntegration for *;
    // REMOVED: using UniswapIntegration for *;
    using SafeERC20 for IERC20; // For generic IERC20
    using SafeERC20 for IERC20WithDecimals; // For IERC20WithDecimals specific operations

    AggregatorV3Interface public ethUsdPriceFeed;
    AggregatorV3Interface public usdcUsdPriceFeed;

    // Default tokens for general contract operations like price feeds or fixed-pair swaps
    IERC20WithDecimals public defaultStablecoin; // e.g., USDC
    IERC20WithDecimals public defaultWeth;       // e.g., WETH

    // NEW: SageToken for rewards
    IERC20 public i_sageToken;

    address public aiAgent;
    uint256 public rebalanceInterval;
    uint256 public lastGlobalRebalance;
    uint256 public maxSlippageBPS; // slippage tolerance - KEPT FOR _calculateMinAmountOut if it's reused, but Uniswap is gone
    uint256 public constant MAX_POSITIONS_PER_USER = 50; // max positions per user

    mapping(address => uint256) public userLastRebalance;

    // Price Validation variables
    uint256 public priceDeviationThreshold; // max deviation
    int256 public lastValidPrice;
    uint256 public lastPriceUpdate;
    uint256 public constant PRICE_STALENESS_THRESHOLD = 3600; // 1 hour

    // Protocol contracts
    IAaveLendingPool public aaveLendingPool;
    ICompoundV3Comet public compoundComet;
    // REMOVED: IUniswapV3Router public uniswapRouter;

    // VRF configuration (for gamified experience)
    uint256 public vrfSubscriptionId;
    bytes32 public vrfKeyHash;
    uint32 public adjustableVrfCallbackGasLimit;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 1;
    uint256 public constant REWARD_DRAW_INTERVAL = 7 days; // Weekly draw
    uint256 public constant WINNER_COUNT = 5; // Five winners per draw
    uint256 public lastRewardDrawTime;

    // Gamified VRF related mappings
    mapping(uint256 => YieldOptimizerStructs.VRFRequest) public vrfRequests; // Renamed to be more generic for rewards
    mapping(address => bool) private _isParticipantEligibleForDraw; // Users who performed actions this week
    address[] private _weeklyParticipantsForDraw; // List of active participants for the current week's draw
    mapping(address => mapping(uint64 => bool)) public userInteractedOnChain; // Track if user interacted on a specific chain
    mapping(address => uint256) public userChainInteractionCount; // Number of unique chains a user interacted on
    mapping(address => uint256) public userTotalInteractions; // Total number of interactions (deposits/withdrawals/rebalances)
    uint256 public baseRewardAmount; // Amount of SageToken for each winner
    uint256 public multiChainBonusAmount; // Extra SageToken for multi-chain interaction

    // Strategies:
    mapping(uint256 => YieldOptimizerStructs.Strategy) public strategies;
    mapping(address => YieldOptimizerStructs.UserPosition[])
        public userPositions;

    // New: Mapping to track which ERC20 token addresses are supported for deposit into each strategy
    // Key: strategy ID => Key: token address => Value: true if supported
    mapping(uint256 => mapping(address => bool)) public supportedStrategyDepositTokens;

    // New: Mappings to store the primary stablecoin/WETH for each strategy,
    // useful for withdrawals or when a strategy *expects* a specific token.
    mapping(uint256 => address) public strategyPrimaryStablecoins;
    mapping(uint256 => address) public strategyPrimaryWeths;

    // Operation flags
    mapping(address => bool) private _depositInProgress;
    mapping(address => bool) private _withdrawInProgress;
    mapping(address => bool) private _rebalanceInProgress; // This flag is not actually used in your _performRebalance, consider if needed.

    event VrfCallbackGasLimitUpdated(uint32 newLimit);
    event RewardDrawRequested(address indexed caller, uint256 requestId, uint256 totalParticipants);
    event RewardDrawFulfilled(uint256 requestId, address[] winners, uint256[] amounts);
    event BaseRewardAmountUpdated(uint256 newAmount);
    event MultiChainBonusAmountUpdated(uint256 newAmount);
    event UserInteraction(address indexed user, uint64 indexed chainSelector, uint256 interactionType); // 0=deposit, 1=withdraw, 2=rebalance

    constructor(
        address _ethUsdPriceFeed,
        address _usdcUsdPriceFeed,
        address _defaultStablecoinAddress, // Now the default stablecoin address
        address _defaultWethAddress,       // Now the default WETH address
        address _aiAgent,
        address _aaveLendingPool,
        address _compoundComet,
        // REMOVED: address _uniswapRouter,
        address _vrfCoordinator,
        uint256 _vrfSubscriptionId,
        bytes32 _keyHash,
        uint32 _initialCallbackGasLimit,
        address _sageTokenAddress // NEW: SageToken address for rewards
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        if (_defaultStablecoinAddress == address(0) || _defaultWethAddress == address(0) ||
            _ethUsdPriceFeed == address(0) || _usdcUsdPriceFeed == address(0) ||
            _aiAgent == address(0) || _aaveLendingPool == address(0) ||
            _compoundComet == address(0) || _vrfCoordinator == address(0) ||
            _sageTokenAddress == address(0)) { // Added SageToken to zero address check
            revert YieldOptimizerErrors.ZeroAddress();
        }

        defaultStablecoin = IERC20WithDecimals(_defaultStablecoinAddress);
        defaultWeth = IERC20WithDecimals(_defaultWethAddress); // Keep defaultWeth for price calcs if _calculateMinAmountOut is kept
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
        usdcUsdPriceFeed = AggregatorV3Interface(_usdcUsdPriceFeed);
        aiAgent = _aiAgent;
        aaveLendingPool = IAaveLendingPool(_aaveLendingPool);
        compoundComet = ICompoundV3Comet(_compoundComet);
        // REMOVED: uniswapRouter = IUniswapV3Router(_uniswapRouter);
        vrfSubscriptionId = _vrfSubscriptionId;
        vrfKeyHash = _keyHash;
        adjustableVrfCallbackGasLimit = _initialCallbackGasLimit;
        rebalanceInterval = 1 days;

        i_sageToken = IERC20(_sageTokenAddress); // Initialize SageToken
        baseRewardAmount = 100 * (10**18); // Example: 100 SageToken
        multiChainBonusAmount = 50 * (10**18); // Example: 50 SageToken bonus
        lastRewardDrawTime = block.timestamp; // Initialize last draw time

        maxSlippageBPS = 300; // 3% default slippage tolerance (kept if _calculateMinAmountOut is used)
        priceDeviationThreshold = 500; // 5% max deviation

        // Initialize strategies - ONLY Aave and Compound
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
            address(compoundComet),
            address(0),
            true
        );
        // REMOVED: strategies[2] = YieldOptimizerStructs.Strategy( ... Uniswap ... );
    }

    // --- Admin Functions for Token & Strategy Configuration ---

     /**
     * @notice Allows the owner to set a new callback gas limit for VRF requests.
     * @param _newLimit The new callback gas limit to use.
     */
    function setVrfCallbackGasLimit(uint32 _newLimit) external onlyOwner {
        if (_newLimit == 0) revert YieldOptimizerErrors.ZeroAmount();
        adjustableVrfCallbackGasLimit = _newLimit;
        emit VrfCallbackGasLimitUpdated(_newLimit);
    }

    /**
     * @notice Sets or updates the primary stablecoin address for a given strategy.
     * @dev This is useful if a strategy has a specific stablecoin it primarily operates with (e.g., for withdrawals).
     * @param _strategyId The ID of the strategy.
     * @param _stablecoinAddress The ERC20 address of the stablecoin.
     */
    function setStrategyPrimaryStablecoin(uint256 _strategyId, address _stablecoinAddress) external onlyOwner {
        // Ensure _strategyId is valid for Aave/Compound
        if (_strategyId > 1) revert YieldOptimizerErrors.InvalidStrategy();
        if (_stablecoinAddress == address(0)) revert YieldOptimizerErrors.ZeroAddress();
        strategyPrimaryStablecoins[_strategyId] = _stablecoinAddress;
        emit YieldOptimizerEvents.StrategyStablecoinUpdated(_strategyId, _stablecoinAddress);
    }

    /**
     * @notice Sets or updates the primary WETH address for a given strategy.
     * @dev This is useful if a strategy has a specific WETH it primarily operates with (e.g., for withdrawals or specific swaps).
     * @param _strategyId The ID of the strategy.
     * @param _wethAddress The ERC20 address of the WETH.
     */
    function setStrategyPrimaryWeth(uint256 _strategyId, address _wethAddress) external onlyOwner {
        // Ensure _strategyId is valid for Aave/Compound
        if (_strategyId > 1) revert YieldOptimizerErrors.InvalidStrategy(); // Uniswap removed, so only 0,1
        if (_wethAddress == address(0)) revert YieldOptimizerErrors.ZeroAddress();
        strategyPrimaryWeths[_strategyId] = _wethAddress;
        emit YieldOptimizerEvents.StrategyWethUpdated(_strategyId, _wethAddress);
    }

    /**
     * @notice Configures which ERC20 tokens are supported for deposit into a specific strategy.
     * @param _strategyId The ID of the strategy.
     * @param _tokenAddress The ERC20 address of the token to set support for.
     * @param _isSupported True to support, false to remove support.
     */
    function setSupportedStrategyToken(uint256 _strategyId, address _tokenAddress, bool _isSupported) external onlyOwner {
        if (_strategyId > 1) revert YieldOptimizerErrors.InvalidStrategy(); // Uniswap removed, so only 0,1
        if (_tokenAddress == address(0)) revert YieldOptimizerErrors.ZeroAddress();
        supportedStrategyDepositTokens[_strategyId][_tokenAddress] = _isSupported;
        emit YieldOptimizerEvents.SupportedStrategyTokenUpdated(_strategyId, _tokenAddress, _isSupported);
    }

    /**
     * @notice Sets the base amount of SageToken awarded to each VRF winner.
     * @param _newAmount The new base reward amount.
     */
    function setBaseRewardAmount(uint256 _newAmount) external onlyOwner {
        baseRewardAmount = _newAmount;
        emit BaseRewardAmountUpdated(_newAmount);
    }

    /**
     * @notice Sets the bonus amount of SageToken for users who interacted on multiple chains.
     * @param _newAmount The new multi-chain bonus amount.
     */
    function setMultiChainBonusAmount(uint256 _newAmount) external onlyOwner {
        multiChainBonusAmount = _newAmount;
        emit MultiChainBonusAmountUpdated(_newAmount);
    }

    // --- Modifiers ---
    modifier canRebalance(address user) {
        if (
            userLastRebalance[user] != 0 &&
            block.timestamp < userLastRebalance[user] + rebalanceInterval
        ) {
            revert YieldOptimizerErrors.RebalanceNotNeeded();
        }
        _;
    }

    // --- Core Functions ---

    /**
     * @notice Allows a user to deposit a specified token into a specific yield strategy.
     * @param _depositTokenAddress The address of the ERC20 token to deposit.
     * @param strategyId The ID of the strategy to deposit into (e.g., 0 for Aave, 1 for Compound).
     * @param amount The amount of token to deposit.
     * @param _chainSelector The chain selector of the chain this interaction originated from (for gamification).
     */
    function deposit(
        address _depositTokenAddress,
        uint256 strategyId,
        uint256 amount,
        uint64 _chainSelector // NEW: For multi-chain tracking
    ) external nonReentrant whenNotPaused {
        if (_depositInProgress[msg.sender])
            revert YieldOptimizerErrors.OperationInProgress();
        _depositInProgress[msg.sender] = true;

        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        // Updated strategyId check since Uniswap (ID 2) is removed
        if (strategyId > 1 || !strategies[strategyId].active)
            revert YieldOptimizerErrors.InvalidStrategy();
        if (!supportedStrategyDepositTokens[strategyId][_depositTokenAddress])
            revert YieldOptimizerErrors.UnsupportedDepositToken(); 

        IERC20WithDecimals tokenToDeposit = IERC20WithDecimals(_depositTokenAddress);

        tokenToDeposit.safeTransferFrom(msg.sender, address(this), amount);

        if (strategyId == 0) { // Aave
            AaveIntegration.depositToAave(
                aaveLendingPool,
                tokenToDeposit,
                amount,
                address(this)
            );
        } else if (strategyId == 1) { // Compound
            CompoundIntegration.depositToCompound(
                compoundComet,
                tokenToDeposit,
                amount
            );
        }
        // REMOVED: else if (strategyId == 2) { ... Uniswap logic ... }

        _addUserPosition(
            msg.sender,
            YieldOptimizerStructs.UserPosition({
                strategyId: strategyId,
                balance: amount,
                lastUpdated: block.timestamp,
                lastRebalanced: block.timestamp
            })
        );

        _depositInProgress[msg.sender] = false;

        // NEW: Track user interaction for gamification
        _trackUserInteraction(msg.sender, _chainSelector, 0); // 0 for deposit

        emit YieldOptimizerEvents.Deposited(msg.sender, strategyId, amount);
    }

    // REMOVED: function depositRandom(...) and its internal logic

    // REMOVED: fulfillRandomWords (will be re-written for reward draws)


    /**
     * @notice Allows a user to withdraw a specified amount from a specific position.
     * @dev Infers the token to withdraw based on the strategy's primary stablecoin.
     * @param positionIndex The index of the user's position to withdraw from.
     * @param amount The amount to withdraw.
     * @param _chainSelector The chain selector of the chain this interaction originated from (for gamification).
     */
    function withdraw(
        uint256 positionIndex,
        uint256 amount,
        uint64 _chainSelector // NEW: For multi-chain tracking
    ) external nonReentrant whenNotPaused {
        if (_withdrawInProgress[msg.sender])
            revert YieldOptimizerErrors.OperationInProgress();
        _withdrawInProgress[msg.sender] = true;

        if (positionIndex >= userPositions[msg.sender].length)
            revert YieldOptimizerErrors.InvalidStrategy();
        YieldOptimizerStructs.UserPosition storage position = userPositions[
            msg.sender
        ][positionIndex];
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        if (amount > position.balance)
            revert YieldOptimizerErrors.InsufficientBalance();

        // Infer the token to withdraw based on the strategy's primary stablecoin
        IERC20WithDecimals tokenToWithdraw;
        // Updated strategyId check since Uniswap (ID 2) is removed
        if (position.strategyId == 0 || position.strategyId == 1) { // Aave or Compound (typically stablecoins)
            if (strategyPrimaryStablecoins[position.strategyId] == address(0)) revert YieldOptimizerErrors.UnsupportedDepositToken();
            tokenToWithdraw = IERC20WithDecimals(strategyPrimaryStablecoins[position.strategyId]);
        } else { // Handle invalid strategy ID if it somehow gets past checks (shouldn't with proper deployment)
            revert YieldOptimizerErrors.InvalidStrategy();
        }

        // --- Execute Withdrawal ---
        if (position.strategyId == 0) { // Aave
            AaveIntegration.withdrawFromAave(
                aaveLendingPool,
                tokenToWithdraw,
                amount,
                msg.sender // Recipient
            );
        } else if (position.strategyId == 1) { // Compound
            CompoundIntegration.withdrawFromCompound(
                compoundComet,
                amount,
                tokenToWithdraw,
                msg.sender // Recipient
            );
        }
        // REMOVED: else if (position.strategyId == 2) { ... Uniswap logic ... }

        position.balance -= amount;
        position.lastUpdated = block.timestamp;

        _withdrawInProgress[msg.sender] = false;

        // NEW: Track user interaction for gamification
        _trackUserInteraction(msg.sender, _chainSelector, 1); // 1 for withdraw

        emit YieldOptimizerEvents.Withdrawn(
            msg.sender,
            position.strategyId,
            amount
        );
    }

    /**
     * @notice Rebalances a specific user position to a new strategy.
     * @dev Can be called by the user or the AI agent.
     * @param user The address of the user whose position is being rebalanced.
     * @param positionIndex The index of the user's position to rebalance.
     * @param newStrategyId The ID of the new strategy to rebalance to.
     * @param amount The amount to rebalance from the position.
     * @param _chainSelector The chain selector of the chain this interaction originated from (for gamification).
     */
    function rebalance(
        address user,
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount,
        uint64 _chainSelector // NEW: For multi-chain tracking
    ) public canRebalance(user) whenNotPaused {
        if (msg.sender != aiAgent && msg.sender != user)
            revert YieldOptimizerErrors.UnauthorizedCaller();
        if (positionIndex >= userPositions[user].length)
            revert YieldOptimizerErrors.InvalidStrategy();
        // Updated strategyId check since Uniswap (ID 2) is removed
        if (newStrategyId > 1 || !strategies[newStrategyId].active)
            revert YieldOptimizerErrors.InvalidStrategy();
        
        YieldOptimizerStructs.UserPosition storage position = userPositions[
            user
        ][positionIndex];
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        if (amount > position.balance)
            revert YieldOptimizerErrors.InsufficientBalance();
        // Update user's last rebalance time
        userLastRebalance[user] = block.timestamp;

        // NEW: Track user interaction for gamification
        _trackUserInteraction(user, _chainSelector, 2); // 2 for rebalance

        // Use internal function to avoid reentrancy issues
        _performRebalance(user, positionIndex, newStrategyId, amount);
    }

    /**
     * @notice Internal function to perform the rebalance logic.
     * @dev Handles withdrawal from old strategy and deposit to new strategy.
     * @param user The address of the user.
     * @param positionIndex The index of the user's position.
     * @param newStrategyId The ID of the new strategy.
     * @param amount The amount to rebalance.
     */
    function _performRebalance(
        address user,
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount
    ) internal {
        YieldOptimizerStructs.UserPosition storage position = userPositions[
            user
        ][positionIndex];

        // Infer the token for withdrawal based on the old strategy's primary token
        IERC20WithDecimals tokenToRebalance;
        // Updated strategyId check since Uniswap (ID 2) is removed
        if (position.strategyId == 0 || position.strategyId == 1) { // Aave or Compound
            if (strategyPrimaryStablecoins[position.strategyId] == address(0)) revert YieldOptimizerErrors.UnsupportedDepositToken();
            tokenToRebalance = IERC20WithDecimals(strategyPrimaryStablecoins[position.strategyId]);
        } else {
            revert YieldOptimizerErrors.InvalidStrategy();
        }

        // --- Withdraw from old strategy ---
        if (position.strategyId == 0) { // Aave
            AaveIntegration.withdrawFromAave(
                aaveLendingPool,
                tokenToRebalance,
                amount,
                address(this) // Withdraw to this contract
            );
        } else if (position.strategyId == 1) { // Compound
            CompoundIntegration.withdrawFromCompound(
                compoundComet,
                amount,
                tokenToRebalance,
                address(this) // Withdraw to this contract
            );
        }
        // REMOVED: else if (position.strategyId == 2) { ... Uniswap logic ... }

        // --- Deposit to new strategy ---
        if (!supportedStrategyDepositTokens[newStrategyId][address(tokenToRebalance)]) {
            revert YieldOptimizerErrors.UnsupportedDepositToken(); // New strategy does not support this token
        }

        if (newStrategyId == 0) { // Aave
            AaveIntegration.depositToAave(
                aaveLendingPool,
                tokenToRebalance,
                amount,
                address(this)
            );
        } else if (newStrategyId == 1) { // Compound
            CompoundIntegration.depositToCompound(
                compoundComet,
                tokenToRebalance,
                amount
            );
        }
        // REMOVED: else if (newStrategyId == 2) { ... Uniswap logic ... }

        position.balance -= amount; // Reduce balance from old position
        _addUserPosition( // Add new consolidated position
            user,
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

    /**
     * @notice Validates the current USDC/USD price against a deviation threshold.
     * @dev Uses defaultStablecoin's price feed (assuming it's USDC).
     */
    function _validatePrice() private {
        (, int256 usdcUsdCurrentPrice, , ,) = usdcUsdPriceFeed.latestRoundData();
        if (usdcUsdCurrentPrice <= 0) revert YieldOptimizerErrors.InvalidPriceFeed();

        if (block.timestamp - lastPriceUpdate > PRICE_STALENESS_THRESHOLD) {
            if (lastValidPrice > 0) {
                uint256 deviation = lastValidPrice > usdcUsdCurrentPrice
                    ? uint256(
                        ((lastValidPrice - usdcUsdCurrentPrice) * 10000) /
                            lastValidPrice
                    )
                    : uint256(
                        ((usdcUsdCurrentPrice - lastValidPrice) * 10000) /
                            lastValidPrice
                    );

                if (deviation > priceDeviationThreshold) {
                    revert YieldOptimizerErrors.PriceManipulationDetected();
                }
            }
        }
        lastValidPrice = usdcUsdCurrentPrice;
        lastPriceUpdate = block.timestamp;
    }

    /**
     * @notice Triggers a rebalance if the current USDC/USD price meets a specified threshold.
     * @dev Uses defaultStablecoin's price feed for comparison.
     * @param positionIndex The index of the user's position to rebalance.
     * @param newStrategyId The ID of the new strategy.
     * @param amount The amount to rebalance.
     * @param priceThreshold The price threshold to compare against.
     * @param isPriceAboveThreshold If true, rebalance if current price > threshold; else, rebalance if current price < threshold.
     * @param _chainSelector The chain selector of the chain this interaction originated from (for gamification).
     */
    function rebalanceIfPriceThreshold(
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount,
        int256 priceThreshold,
        bool isPriceAboveThreshold,
        uint64 _chainSelector // NEW: For multi-chain tracking
    ) external whenNotPaused {
        _validatePrice(); // This validates USDC/USD price

        (, int256 currentPrice, , ,) = usdcUsdPriceFeed.latestRoundData(); // Re-fetch for comparison
        if (currentPrice <= 0) revert YieldOptimizerErrors.InvalidPriceFeed(); // Should already be caught by _validatePrice

        bool shouldRebalance = isPriceAboveThreshold
            ? currentPrice > priceThreshold
            : currentPrice < priceThreshold;

        if (shouldRebalance) {
            rebalance(msg.sender, positionIndex, newStrategyId, amount, _chainSelector);
        }
    }

    /**
     * @notice Performs a global rebalance for multiple users to a new strategy.
     * @dev Only callable by the AI agent or contract owner.
     * @param users An array of user addresses to rebalance.
     * @param newStrategyId The ID of the new strategy to rebalance all users' funds into.
     * @param _chainSelector The chain selector of the chain this interaction originated from (for gamification).
     */
    function globalRebalance(
        address[] calldata users,
        uint256 newStrategyId,
        uint64 _chainSelector // NEW: For multi-chain tracking
    ) external nonReentrant whenNotPaused {
        if (msg.sender != aiAgent && msg.sender != owner())
            revert YieldOptimizerErrors.UnauthorizedCaller();
        // Updated strategyId check since Uniswap (ID 2) is removed
        if (newStrategyId > 1 || !strategies[newStrategyId].active)
            revert YieldOptimizerErrors.InvalidStrategy();
        if (block.timestamp < lastGlobalRebalance + rebalanceInterval)
            revert YieldOptimizerErrors.RebalanceNotNeeded();

        for (uint256 i = 0; i < users.length; i++) {
            address currentUser = users[i];
            uint256 totalUserBalanceToRebalance = 0;

            // Temporarily store positions to avoid modifying array during iteration
            YieldOptimizerStructs.UserPosition[]
                memory userPositionsCopy = userPositions[currentUser];
            delete userPositions[currentUser]; // Clear current positions for consolidation

            for (uint256 j = 0; j < userPositionsCopy.length; j++) {
                YieldOptimizerStructs.UserPosition
                    memory position = userPositionsCopy[j];
                if (position.balance == 0) continue;

                // Infer the token for withdrawal based on the old strategy's primary token
                IERC20WithDecimals tokenToRebalance;
                // Updated strategyId check since Uniswap (ID 2) is removed
                if (position.strategyId == 0 || position.strategyId == 1) { // Aave or Compound
                    if (strategyPrimaryStablecoins[position.strategyId] == address(0)) revert YieldOptimizerErrors.UnsupportedDepositToken();
                    tokenToRebalance = IERC20WithDecimals(strategyPrimaryStablecoins[position.strategyId]);
                } else {
                    revert YieldOptimizerErrors.InvalidStrategy();
                }

                // --- Withdraw from old strategy to contract ---
                if (position.strategyId == 0) { // Aave
                    AaveIntegration.withdrawFromAave(
                        aaveLendingPool,
                        tokenToRebalance,
                        position.balance,
                        address(this) // Withdraw to this contract
                    );
                } else if (position.strategyId == 1) { // Compound
                    CompoundIntegration.withdrawFromCompound(
                        compoundComet,
                        position.balance,
                        tokenToRebalance,
                        address(this) // Withdraw to this contract
                    );
                }
                // REMOVED: else if (position.strategyId == 2) { ... Uniswap logic ... }
                totalUserBalanceToRebalance += position.balance;
            }

            // Deposit consolidated balance to new strategy for this user
            if (totalUserBalanceToRebalance > 0) {
                if (!supportedStrategyDepositTokens[newStrategyId][address(defaultStablecoin)]) {
                    revert YieldOptimizerErrors.UnsupportedDepositToken(); // Target strategy doesn't support defaultStablecoin
                }

                // Assuming global rebalance always consolidates into defaultStablecoin
                if (newStrategyId == 0) {
                    AaveIntegration.depositToAave(
                        aaveLendingPool,
                        defaultStablecoin, // Deposit the default stablecoin
                        totalUserBalanceToRebalance,
                        currentUser // Deposit back to user or contract? (Assuming to user as per original logic)
                    );
                } else if (newStrategyId == 1) {
                    CompoundIntegration.depositToCompound(
                        compoundComet,
                        defaultStablecoin, // Deposit the default stablecoin
                        totalUserBalanceToRebalance
                    );
                }
                // REMOVED: else if (newStrategyId == 2) { ... Uniswap logic ... }

                // Add a single, new consolidated position for the user
                _addUserPosition(
                    currentUser,
                    YieldOptimizerStructs.UserPosition({
                        strategyId: newStrategyId,
                        balance: totalUserBalanceToRebalance,
                        lastUpdated: block.timestamp,
                        lastRebalanced: block.timestamp
                    })
                );
                // NEW: Track user interaction for gamification (global rebalance counts as interaction for the user)
                _trackUserInteraction(currentUser, _chainSelector, 2); // 2 for rebalance
                
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

    /**
     * @notice Adds a new user position, consolidating existing positions if MAX_POSITIONS_PER_USER is reached.
     * @param user The address of the user.
     * @param position The UserPosition struct to add.
     */
    function _addUserPosition(
        address user,
        YieldOptimizerStructs.UserPosition memory position
    ) private {
        // Updated strategyId check since Uniswap (ID 2) is removed for consolidation
        if (userPositions[user].length >= MAX_POSITIONS_PER_USER) {
            _consolidatePositions(user);
        }
        userPositions[user].push(position);
    }

    /**
     * @notice Consolidates a user's positions by summing balances for each unique strategy ID.
     * @param user The address of the user whose positions to consolidate.
     */
    function _consolidatePositions(address user) private {
        YieldOptimizerStructs.UserPosition[] storage positions = userPositions[
            user
        ];

        // Assuming only 2 strategies now (Aave and Compound, IDs 0 and 1)
        uint256[2] memory strategyBalances; // Changed from 3 to 2
        bool[2] memory hasStrategy; // Changed from 3 to 2

        // Accumulate balances by strategy
        for (uint256 i = 0; i < positions.length; i++) {
            // Ensure strategyId is valid (0 or 1)
            if (positions[i].balance > 0 && positions[i].strategyId < 2) { // Changed from < 3 to < 2
                strategyBalances[positions[i].strategyId] += positions[i].balance;
                hasStrategy[positions[i].strategyId] = true;
            }
        }

        // Clear old positions
        delete userPositions[user];

        // Create consolidated positions
        for (uint256 strategyId = 0; strategyId < 2; strategyId++) { // Changed from < 3 to < 2
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

    /**
     * @notice Allows a user to manually consolidate their positions.
     */
    function consolidateMyPositions() external nonReentrant {
        _consolidatePositions(msg.sender);
        emit YieldOptimizerEvents.PositionsConsolidated(msg.sender);
    }

    /**
     * @notice Gets the latest USDC/USD price from the Chainlink price feed.
     * @return price The latest USDC/USD price.
     */
    function getLatestPrice() external view returns (int256) {
        (, int256 price, , ,) = usdcUsdPriceFeed.latestRoundData();
        if (price <= 0) revert YieldOptimizerErrors.InvalidPriceFeed();
        return price;
    }

    // --- Admin/Management Functions ---

    /**
     * @notice Updates the AI agent address.
     * @param _newAgent The address of the new AI agent.
     */
    function setAIAgent(address _newAgent) external onlyOwner {
        if (_newAgent == address(0)) revert YieldOptimizerErrors.ZeroAddress();
        aiAgent = _newAgent;
        emit YieldOptimizerEvents.AIAgentUpdated(_newAgent);
    }

    /**
     * @notice Pauses the contract, preventing certain operations.
     * @dev Only callable by the owner.
     */
    function pause() external onlyOwner {
        _pause();
        emit YieldOptimizerEvents.Paused(msg.sender);
    }

    /**
     * @notice Unpauses the contract, allowing operations to resume.
     * @dev Only callable by the owner.
     */
    function unpause() external onlyOwner {
        _unpause();
        emit YieldOptimizerEvents.Unpaused(msg.sender);
    }

    /**
     * @notice Allows the owner to withdraw any token in case of emergency.
     * @param token The address of the ERC20 token to withdraw.
     * @param amount The amount of token to withdraw.
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner nonReentrant {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @notice Gets the total balance of all positions for a given user.
     * @param user The address of the user.
     * @return totalBalance The total consolidated balance.
     */
    function getUserBalance(address user) external view returns (uint256) {
        uint256 totalBalance = 0;
        for (uint256 i = 0; i < userPositions[user].length; i++) {
            totalBalance += userPositions[user][i].balance;
        }
        return totalBalance;
    }

    /**
     * @notice Sets the maximum slippage tolerance for swaps in basis points.
     * @dev 100 BPS = 1%. Max 1000 BPS (10%).
     * @param _maxSlippageBPS The new max slippage in basis points.
     */
    function setMaxSlippage(uint256 _maxSlippageBPS) external onlyOwner {
        if (_maxSlippageBPS > 1000) // Max 10%
            revert YieldOptimizerErrors.InvalidSlippage();
        maxSlippageBPS = _maxSlippageBPS;
    }

    /**
     * @notice Calculates the minimum amount of output tokens expected after a swap.
     * @dev This calculation uses the default stablecoin and WETH price feeds.
     * @param amountIn The amount of input tokens.
     * @param slippageBPS The slippage tolerance in basis points.
     * @return The minimum expected output amount.
     */
    function _calculateMinAmountOut(
        uint256 amountIn,
        uint256 slippageBPS
    ) internal view returns (uint256) {
        // Fetch ETH/USD price
        (, int256 ethUsdPrice, , ,) = ethUsdPriceFeed.latestRoundData();
        if (ethUsdPrice <= 0) revert YieldOptimizerErrors.InvalidPriceFeed();

        // Fetch USDC/USD price (using defaultStablecoin's feed)
        (, int256 usdcUsdPrice, , ,) = usdcUsdPriceFeed.latestRoundData();
        if (usdcUsdPrice <= 0) revert YieldOptimizerErrors.InvalidPriceFeed();

        // Calculate expected output amount based on USD prices and token decimals
        // This implicitly assumes swapping between defaultStablecoin and defaultWeth
        // This function's utility is reduced without Uniswap, but kept if you have other uses for it.
        uint256 expectedOut = (amountIn * uint256(usdcUsdPrice) * (10**(defaultWeth.decimals() - defaultStablecoin.decimals()))) / uint256(ethUsdPrice);

        // Apply slippage
        return (expectedOut * (10000 - slippageBPS)) / 10000;
    }

    // --- NEW: Gamified VRF Logic ---

    /**
     * @notice Internal function to track user interactions for the VRF draw.
     * @param _user The address of the user who interacted.
     * @param _chainSelector The chain selector on which the interaction occurred.
     * @param _interactionType 0 for deposit, 1 for withdraw, 2 for rebalance.
     */
    function _trackUserInteraction(address _user, uint64 _chainSelector, uint256 _interactionType) private {
        // Mark user as eligible for the current draw if not already
        if (!_isParticipantEligibleForDraw[_user]) {
            _isParticipantEligibleForDraw[_user] = true;
            _weeklyParticipantsForDraw.push(_user);
        }

        // Track multi-chain interaction
        if (!userInteractedOnChain[_user][_chainSelector]) {
            userInteractedOnChain[_user][_chainSelector] = true;
            userChainInteractionCount[_user]++;
        }
        userTotalInteractions[_user]++; // Track total interactions for general metrics
        emit UserInteraction(_user, _chainSelector, _interactionType);
    }

    /**
     * @notice Requests random words from Chainlink VRF to select weekly winners.
     * @dev Callable by owner or AI agent only, and only after the reward draw interval.
     * Resets participant list for the next draw.
     * @return requestId The ID of the VRF request.
     */
    function requestRewardDraw() external onlyOwner returns (uint256 requestId) {
        if (block.timestamp < lastRewardDrawTime + REWARD_DRAW_INTERVAL) {
            revert YieldOptimizerErrors.RewardDrawNotReady();
        }
        if (_weeklyParticipantsForDraw.length < WINNER_COUNT) {
            revert YieldOptimizerErrors.InsufficientParticipants();
        }

        // Request VRF randomness
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: vrfKeyHash,
                subId: vrfSubscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: adjustableVrfCallbackGasLimit,
                numWords: NUM_WORDS, // Request one random word to shuffle and pick winners
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false})) // ADDED THIS LINE
            })
        );

        // Store participants for fulfillment
        vrfRequests[requestId] = YieldOptimizerStructs.VRFRequest({
            user: address(0), // Not directly tied to one user's deposit, so use address(0)
            amount: 0,
            tokenAddress: address(0),
            fulfilled: false,
            participants: _weeklyParticipantsForDraw // Store the list of participants for this specific draw
        });

        emit RewardDrawRequested(msg.sender, requestId, _weeklyParticipantsForDraw.length);

        // Reset for next week's draw AFTER the request is made
        _resetWeeklyParticipants();
    }

    /**
     * @notice Fulfills the reward draw after VRF randomness is received.
     * @dev Internal function called by VRF coordinator. Selects winners and distributes SageTokens.
     * @param requestId The ID of the VRF request.
     * @param randomWords The random words generated by VRF.
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        YieldOptimizerStructs.VRFRequest storage request = vrfRequests[requestId];
        if (request.fulfilled) revert YieldOptimizerErrors.InvalidVRFRequest();
        if (request.participants.length == 0) revert YieldOptimizerErrors.InsufficientParticipants(); // Should not happen if requestRewardDraw was checked

        uint256 randomNumber = randomWords[0];
        address[] memory winners = new address[](WINNER_COUNT);
        uint256[] memory amounts = new uint256[](WINNER_COUNT);

        // Create a mutable copy of participants to shuffle and pick from
        address[] memory eligibleParticipants = new address[](request.participants.length);
        for (uint224 i = 0; i < request.participants.length; i++) {
            eligibleParticipants[i] = request.participants[i];
        }

        uint256 currentParticipantCount = eligibleParticipants.length;

        // Select WINNER_COUNT unique winners
        for (uint256 i = 0; i < WINNER_COUNT; i++) {
            if (currentParticipantCount == 0) break; // Not enough unique participants left

            uint256 winnerIndex = randomNumber % currentParticipantCount;
            address winnerAddress = eligibleParticipants[winnerIndex];

            // Calculate reward for this winner
            uint256 rewardAmount = baseRewardAmount;
            if (userChainInteractionCount[winnerAddress] >= 3) { // Check for multi-chain bonus (assuming 3 chains: Sepolia, Arbitrum Sepolia, Base Sepolia)
                rewardAmount += multiChainBonusAmount;
            }

            winners[i] = winnerAddress;
            amounts[i] = rewardAmount;

            // Transfer SageToken to the winner
            // Ensure contract has enough SageToken
            if (i_sageToken.balanceOf(address(this)) < rewardAmount) {
                // Log this or handle appropriately, e.g., send partial reward, skip winner, or revert
                // For now, let's revert to indicate insufficient funds for prizes
                revert YieldOptimizerErrors.InsufficientRewardFunds();
            }
            i_sageToken.safeTransfer(winnerAddress, rewardAmount);

            // Remove the winner from the eligible participants to ensure uniqueness
            eligibleParticipants[winnerIndex] = eligibleParticipants[currentParticipantCount - 1];
            currentParticipantCount--;
            randomNumber = uint256(keccak256(abi.encodePacked(randomNumber, winnerIndex))); // Re-seed random number for next pick
        }

        request.fulfilled = true;
        lastRewardDrawTime = block.timestamp; // Update last draw time after fulfillment

        emit RewardDrawFulfilled(requestId, winners, amounts);
    }

    /**
     * @notice Resets the list of eligible participants for the next weekly draw.
     * @dev Internal function, called after a draw request.
     */
    function _resetWeeklyParticipants() private {
        for (uint256 i = 0; i < _weeklyParticipantsForDraw.length; i++) {
            _isParticipantEligibleForDraw[_weeklyParticipantsForDraw[i]] = false;
        }
        delete _weeklyParticipantsForDraw; // Clear the array
    }

    // --- REMOVED: Old _testCalculateMinAmountOut function ---
    // function _testCalculateMinAmountOut(...)
}