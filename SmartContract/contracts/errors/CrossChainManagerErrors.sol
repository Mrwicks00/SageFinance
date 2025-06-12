// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library CrossChainManagerErrors {
    error ZeroAmount();
    error TransferFailed();
    error UnauthorizedCaller();
    error InvalidChainSelector();
    error RateLimitExceeded();
    error ZeroAddress();
    error InsufficientFee();

}