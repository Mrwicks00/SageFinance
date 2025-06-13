// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @dev This is a modified version of Chainlink's VRFConsumerBaseV2
 * adapted for use with OpenZeppelin's upgradeable contracts.
 * The constructor is replaced with an initializer function.
 *
 * It provides the rawFulfillRandomWords function with the coordinator check,
 * and an internal virtual _fulfillRandomWords for subclasses to implement.
 */
abstract contract VRFConsumerBaseV2Upgradeable is Initializable {
    error OnlyCoordinatorCanFulfill(address have, address want);

    address private s_vrfCoordinator;

    function __VRFConsumerBaseV2Upgradeable_init(address vrfCoordinatorAddress) internal onlyInitializing {
        s_vrfCoordinator = vrfCoordinatorAddress;
    }

    function getVrfCoordinator() internal view returns (address) {
        return s_vrfCoordinator;
    }

    /**
     * @notice rawFulfillRandomWords receives the VRF response from the coordinator.
     * It includes the security check to ensure only the coordinator can call it.
     * This function is public/external so the coordinator can call it, and virtual
     * so it can be overridden by a direct child if necessary (though usually not).
     *
     * Your main consumer contract (YieldOptimizer) will implement _fulfillRandomWords.
     */
    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) public virtual { // REMOVED 'override' and changed visibility to 'public' for external call
        if (msg.sender != s_vrfCoordinator) {
            revert OnlyCoordinatorCanFulfill(msg.sender, s_vrfCoordinator);
        }
        _fulfillRandomWords(requestId, randomWords);
    }

    /**
     * @notice _fulfillRandomWords is the internal function that subclasses (like YieldOptimizer)
     * must implement to process the random words.
     */
    function _fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;
}