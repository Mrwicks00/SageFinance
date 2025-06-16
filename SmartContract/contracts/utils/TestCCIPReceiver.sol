// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/contracts/libraries/Client.sol"; // Import Chainlink's Client library
import "../core/CrossChainManager.sol"; // Import your CrossChainManager contract

/**
 * @title TestCCIPReceiver
 * @dev Helper contract for testing the internal _ccipReceive function of CrossChainManager.
 * This contract is deployed on the same chain as CrossChainManager in tests.
 */
contract TestCCIPReceiver {
    // A reference to the CrossChainManager contract that this mock will interact with.
    CrossChainManager public targetManager;

    /**
     * @dev Constructor to set the address of the CrossChainManager.
     * @param _targetManager The address of the CrossChainManager instance to test.
     * Changed to 'address payable' because CrossChainManager has a payable receive/fallback function.
     */
    constructor(address payable _targetManager) {
        targetManager = CrossChainManager(_targetManager);
    }

    /**
     * @dev This function allows external test code to call the internal _ccipReceive
     * function on the target CrossChainManager indirectly, via a new test-only external helper.
     * @param message The Any2EVMMessage struct to pass to _ccipReceive.
     */
    function callInternalCCIPReceive(Client.Any2EVMMessage memory message) external {
        // Call the new external helper function on CrossChainManager
        // This function will in turn call the internal _ccipReceive.
        targetManager.__testReceiveCCIPMessage(message);
    }

    // Allows this contract to receive native tokens (e.g., ETH) if needed for tests.
    receive() external payable {}
}

