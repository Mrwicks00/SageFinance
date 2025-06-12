// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library CrossChainManagerEvents {
    event CrossChainTransferInitiated(address indexed user, uint256 amount, uint64 destinationChain, bytes32 messageId);
    event CrossChainTransferReceived(address indexed user, uint256 amount, uint64 sourceChain);
    event CrossChainRebalanceTriggered(address indexed user, uint256 amount, uint64 destinationChain, bytes32 messageId);
    event CrossChainRebalanceExecuted(address indexed user, uint256 positionIndex, uint256 newStrategyId, uint256 amount);
}