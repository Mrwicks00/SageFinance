// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library YieldOptimizerEvents {
    event Deposited(address indexed user, uint256 strategyId, uint256 amount);
    event Withdrawn(address indexed user, uint256 strategyId, uint256 amount);
    event Rebalanced(address indexed user, uint256 fromStrategy, uint256 toStrategy, uint256 amount, uint256 timestamp);
    event RandomDepositRequested(address indexed user, uint256 amount, uint256 requestId);
    event RandomDepositFulfilled(address indexed user, uint256 strategyId, uint256 amount);
    event AIAgentUpdated(address indexed newAgent);
    event Paused(address indexed owner);
    event Unpaused(address indexed owner);
    event PositionsConsolidated(address indexed user);
    event StrategyStablecoinUpdated(uint256 strategyId, address stablecoinAddress);
    event StrategyWethUpdated(uint256 strategyId, address wethAddress);
    event SupportedStrategyTokenUpdated(uint256 strategyId, address tokenAddress, bool isSupported);
    event InvalidVRFRequest(); // This was
}