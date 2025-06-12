// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../structs/YieldOptimizerStructs.sol";

interface IYieldOptimizer {
    // Core Functions
    function deposit(uint256 strategyId, uint256 amount) external;
    function depositRandom(uint256 amount) external returns (uint256 requestId);
    function withdraw(uint256 positionIndex, uint256 amount) external;
    
    // Rebalancing Functions
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
    
    // Position Management
    function consolidateMyPositions() external;
    
    // View Functions
    function getLatestPrice() external view returns (int256);
    function strategies(uint256 strategyId) external view returns (YieldOptimizerStructs.Strategy memory);
    function userPositions(address user, uint256 index) external view returns (YieldOptimizerStructs.UserPosition memory);
    
    // Admin Functions
    function setAIAgent(address _newAgent) external;
    function setMaxSlippage(uint256 _maxSlippageBPS) external;
    function pause() external;
    function unpause() external;
    function emergencyWithdraw(address token, uint256 amount) external;
    
    // State Variables (getters)
    function aiAgent() external view returns (address);
    function rebalanceInterval() external view returns (uint256);
    function lastGlobalRebalance() external view returns (uint256);
    function maxSlippageBPS() external view returns (uint256);
    function priceDeviationThreshold() external view returns (uint256);
    function stablecoin() external view returns (address);
    function weth() external view returns (address);
}