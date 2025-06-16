// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the IRouterClient and Client libraries from your project's node_modules
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "hardhat/console.sol"; // For debugging in tests

/**
 * @title MockIRouterClient
 * @dev Mock implementation of Chainlink's IRouterClient for testing CCIP interactions.
 * This version specifically matches the provided IRouterClient interface.
 */
contract MockIRouterClient is IRouterClient {
    uint256 public mockFee = 1e16; // Default mock fee (0.01 ETH equivalent)

    // Struct to record sent CCIP messages for verification in tests.
    struct SentMessage {
        uint64 destinationChainSelector;
        Client.EVM2AnyMessage message;
        uint256 fee;
        bytes32 messageId;
    }

    // Mapping to retrieve sent messages by their generated ID.
    mapping(bytes32 => SentMessage) public sentMessages;
    uint256 public messageIdCounter = 0; // Use public for easier testing access

    // Event to signal that a CCIP message has been sent (for testing purposes).
    event CCIPMessageSent(bytes32 indexed messageId);

    /**
     * @dev Sets a mock fee that `getFee` will return.
     * @param _fee The mock fee to return.
     */
    function setMockFee(uint256 _fee) external {
        mockFee = _fee;
    }

    /**
     * @dev Mocks the getFee function as defined in your IRouterClient.
     * Returns the `mockFee` set in this contract.
     * @param _destinationChainSelector The chain selector of the destination.
     * @param _message The cross-chain CCIP message.
     * @return The mock fee.
     */
    function getFee(
        uint64 _destinationChainSelector,
        Client.EVM2AnyMessage memory _message
    ) public view override returns (uint256) {
        console.log("MockIRouterClient: getFee called for chain", _destinationChainSelector);
        return mockFee;
    }

    /**
     * @dev Mocks the ccipSend function as defined in your IRouterClient.
     * Records the message for later verification and emits an event.
     * @param _destinationChainSelector The chain selector of the destination.
     * @param _message The cross-chain CCIP message.
     * @return The generated mock message ID.
     */
    function ccipSend(
        uint64 _destinationChainSelector,
        Client.EVM2AnyMessage calldata _message // Note: Changed to 'calldata' to match IRouterClient
    ) public payable override returns (bytes32) {
        bytes32 messageId = keccak256(abi.encodePacked(block.timestamp, msg.sender, messageIdCounter));
        messageIdCounter++; // Increment for the next message ID
        
        sentMessages[messageId] = SentMessage({
            destinationChainSelector: _destinationChainSelector,
            message: _message, // Stores the entire message struct
            fee: msg.value,    // Records the actual fee paid
            messageId: messageId
        });

        console.log("MockIRouterClient: ccipSend called with fee", msg.value);
        console.log("  Destination Chain:", _destinationChainSelector);
        console.log("  Message ID:", uint256(messageId)); // Cast bytes32 to uint256 for logging
        
        emit CCIPMessageSent(messageId);
        return messageId;
    }

    /**
     * @dev Mocks the isChainSupported function as defined in your IRouterClient.
     * Returns true for the chain selectors supported in the CrossChainManager test.
     * Add more logic here if you need to test specific supported/unsupported chains.
     */
    function isChainSupported(
        uint64 destChainSelector
    ) external view override returns (bool supported) {
        // Mock to return true for the chains supported in CrossChainManager test
        return (destChainSelector == 16015286601757825753 // Sepolia
            || destChainSelector == 3478487238524512106   // Arbitrum Sepolia
            || destChainSelector == 11155111);            // Base Sepolia
    }

    /**
     * @dev Helper function for tests to retrieve a sent message.
     */
    function getSentMessage(bytes32 _messageId) external view returns (SentMessage memory) {
        return sentMessages[_messageId];
    }
}

