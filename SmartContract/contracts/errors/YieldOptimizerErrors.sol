// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library YieldOptimizerErrors {
    error ZeroAmount();
    error InsufficientBalance();
    error TransferFailed();
    error UnauthorizedCaller();
    error InvalidPriceFeed();
    error RebalanceNotNeeded();
    error Paused();
    error OperationInProgress();
    error InvalidSlippage();
    error PriceManipulationDetected();
    error ZeroAddress();
    error InvalidStrategy();
    error InvalidVRFRequest();
}
