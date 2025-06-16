// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Ensure this pragma matches your YieldOptimizer contract

import "../structs/YieldOptimizerStructs.sol"; // Ensure this path is correct

interface IYieldOptimizer {
    // --- Core Functions ---
    function deposit(uint256 strategyId, uint256 amount) external;
    function depositRandom(uint256 amount) external returns (uint256 requestId);
    function withdraw(uint256 positionIndex, uint256 amount) external;
    
    // --- Rebalancing Functions ---
    // Note: The 'rebalance' function is public in YieldOptimizer, so it's included here as external.
    function rebalance(
        address user,
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount
    ) external;
    
    function rebalanceIfPriceThreshold(
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount,
        int256 priceThreshold,
        bool isPriceAboveThreshold
    ) external;
    
    function globalRebalance(
        address[] calldata users,
        uint256 newStrategyId
    ) external;
    
    // --- Position Management ---
    function consolidateMyPositions() external;
    
    // --- View Functions (Public State Variables and Getters) ---
    function getLatestPrice() external view returns (int256);
    function getUserBalance(address user) external view returns (uint256); // Added
    
    function strategies(uint256 strategyId) external view returns (YieldOptimizerStructs.Strategy memory);
    function userPositions(address user, uint256 index) external view returns (YieldOptimizerStructs.UserPosition memory);
    function vrfRequests(uint256 requestId) external view returns (YieldOptimizerStructs.VRFRequest memory); // Added
    
    function aiAgent() external view returns (address);
    function rebalanceInterval() external view returns (uint256);
    function lastGlobalRebalance() external view returns (uint256);
    function maxSlippageBPS() external view returns (uint256);
    function priceDeviationThreshold() external view returns (uint256);
    function lastValidPrice() external view returns (int256); // Added
    function lastPriceUpdate() external view returns (uint256); // Added
    function stablecoin() external view returns (address);
    function weth() external view returns (address);
    function MAX_POSITIONS_PER_USER() external view returns (uint256); // Added
    function userLastRebalance(address) external view returns (uint256); // Added

    // VRF Config (constants)
    function vrfCoordinator() external view returns (address); // Added
    function vrfSubscriptionId() external view returns (uint64); // Added
    function KEY_HASH() external view returns (bytes32); // Added
    function CALLBACK_GAS_LIMIT() external view returns (uint32); // Added
    function REQUEST_CONFIRMATIONS() external view returns (uint16); // Added
    function NUM_WORDS() external view returns (uint32); // Added
    
    // --- Admin Functions ---
    function setAIAgent(address _newAgent) external;
    function setMaxSlippage(uint256 _maxSlippageBPS) external;
    function pause() external;
    function unpause() external;
    function emergencyWithdraw(address token, uint256 amount) external;
}
