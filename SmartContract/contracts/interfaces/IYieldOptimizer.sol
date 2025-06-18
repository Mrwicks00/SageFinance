// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "../interfaces/IERC20WithDecimals.sol"; // Ensure this path is correct for your setup
import "../structs/YieldOptimizerStructs.sol"; // Import your custom structs

interface IYieldOptimizer {
    // --- Public State Variable Getters ---
    function ethUsdPriceFeed() external view returns (address);
    function usdcUsdPriceFeed() external view returns (address);
    function defaultStablecoin() external view returns (IERC20WithDecimals);
    function defaultWeth() external view returns (IERC20WithDecimals);
    function i_sageToken() external view returns (IERC20); // New SageToken
    function aiAgent() external view returns (address);
    function rebalanceInterval() external view returns (uint256);
    function lastGlobalRebalance() external view returns (uint256);
    function maxSlippageBPS() external view returns (uint256);
    function MAX_POSITIONS_PER_USER() external view returns (uint256);
    function userLastRebalance(address) external view returns (uint256);
    function priceDeviationThreshold() external view returns (uint256);
    function lastValidPrice() external view returns (int256);
    function lastPriceUpdate() external view returns (uint256);
    function PRICE_STALENESS_THRESHOLD() external view returns (uint256);
    function aaveLendingPool() external view returns (address);
    function compoundComet() external view returns (address);
    function vrfSubscriptionId() external view returns (uint256);
    function vrfKeyHash() external view returns (bytes32);
    function adjustableVrfCallbackGasLimit() external view returns (uint32);
    function REQUEST_CONFIRMATIONS() external view returns (uint16);
    function NUM_WORDS() external view returns (uint32);
    function REWARD_DRAW_INTERVAL() external view returns (uint256);
    function WINNER_COUNT() external view returns (uint256);
    function lastRewardDrawTime() external view returns (uint256);
    function vrfRequests(uint256) external view returns (address user, uint256 amount, address tokenAddress, bool fulfilled); // Note: participants array won't be returned directly by getter
    function userInteractedOnChain(address, uint64) external view returns (bool);
    function userChainInteractionCount(address) external view returns (uint256);
    function userTotalInteractions(address) external view returns (uint256);
    function baseRewardAmount() external view returns (uint256);
    function multiChainBonusAmount() external view returns (uint256);

    // Mappings to structs directly accessible as getters
    function strategies(uint256) external view returns (uint256 id, string memory name, address contractAddress, address tokenAddress, bool active);

    // Mappings returning arrays (getter returns element by index)
    // Note: To get all positions for a user, you'd typically implement a separate getter in the contract.
    // This mapping getter only allows access to a specific index.
    function userPositions(address, uint256) external view returns (uint256 strategyId, uint256 balance, uint256 lastUpdated, uint256 lastRebalanced);

    // New mappings for strategy supported tokens and primary tokens
    function supportedStrategyDepositTokens(uint256, address) external view returns (bool);
    function strategyPrimaryStablecoins(uint256) external view returns (address);
    function strategyPrimaryWeths(uint256) external view returns (address);


    // --- External/Public Functions ---

    // Admin Functions for VRF & Strategy Configuration
    function setVrfCallbackGasLimit(uint32 _newLimit) external;
    function setStrategyPrimaryStablecoin(uint256 _strategyId, address _stablecoinAddress) external;
    function setStrategyPrimaryWeth(uint256 _strategyId, address _wethAddress) external;
    function setSupportedStrategyToken(uint256 _strategyId, address _tokenAddress, bool _isSupported) external;
    function setBaseRewardAmount(uint256 _newAmount) external;
    function setMultiChainBonusAmount(uint256 _newAmount) external;

    // Core User Operations (updated with _chainSelector)
    function deposit(
        address _depositTokenAddress,
        uint256 strategyId,
        uint256 amount,
        uint64 _chainSelector
    ) external;

    function withdraw(
        uint256 positionIndex,
        uint256 amount,
        uint64 _chainSelector
    ) external;

    function rebalance(
        address user,
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount,
        uint64 _chainSelector
    ) external;

    function rebalanceIfPriceThreshold(
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount,
        int256 priceThreshold,
        bool isPriceAboveThreshold,
        uint64 _chainSelector
    ) external;

    function globalRebalance(
        address[] calldata users,
        uint256 newStrategyId,
        uint64 _chainSelector
    ) external;

    function consolidateMyPositions() external;

    // General Information
    function getLatestPrice() external view returns (int256);
    function getUserBalance(address user) external view returns (uint256);

    // Admin/Management Functions
    function setAIAgent(address _newAgent) external;
    function pause() external;
    function unpause() external;
    function emergencyWithdraw(address token, uint256 amount) external;
    function setMaxSlippage(uint256 _maxSlippageBPS) external;

    // VRF Reward Draw Function
    function requestRewardDraw() external returns (uint256 requestId);
}