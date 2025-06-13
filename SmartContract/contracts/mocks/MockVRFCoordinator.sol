// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockVRFCoordinator
 * @dev Mock implementation of Chainlink VRF Coordinator for testing
 */
contract MockVRFCoordinator {
    struct RequestCommitment {
        uint64 blockNum;
        uint64 subId;
        uint32 callbackGasLimit;
        uint32 numWords;
        address sender;
    }

    mapping(uint256 => RequestCommitment) public requests;
    uint256 private requestIdCounter = 1;
    uint256 private nextRequestId;

    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );

    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256 outputSeed,
        uint96 payment,
        bool success
    );

    /**
     * @dev Set the next request ID for testing purposes
     */
    function setNextRequestId(uint256 _requestId) external {
        nextRequestId = _requestId;
    }

    /**
     * @dev Request random words (mock implementation)
     */
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {
        if (nextRequestId != 0) {
            requestId = nextRequestId;
            nextRequestId = 0; // Reset after use
        } else {
            requestId = requestIdCounter++;
        }
        
        requests[requestId] = RequestCommitment({
            blockNum: uint64(block.number),
            subId: subId,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords,
            sender: msg.sender
        });

        emit RandomWordsRequested(
            keyHash,
            requestId,
            0, // preSeed
            subId,
            requestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );

        return requestId;
    }

    /**
     * @dev Fulfill random words request (mock implementation)
     * @param requestId The request ID to fulfill
     * @param randomWords Array of random words to return
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        RequestCommitment memory request = requests[requestId];
        require(request.sender != address(0), "Request not found");

        // Call the requesting contract's fulfillRandomWords function
        (bool success, ) = request.sender.call(
            abi.encodeWithSignature(
                "rawFulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );

        emit RandomWordsFulfilled(requestId, randomWords[0], 0, success);
    }

    /**
     * @dev Mock function to simulate automatic fulfillment with pseudo-random numbers
     */
    function mockFulfillRandomWords(uint256 requestId) external {
        RequestCommitment memory request = requests[requestId];
        require(request.sender != address(0), "Request not found");

        // Generate pseudo-random numbers for testing
        uint256[] memory randomWords = new uint256[](request.numWords);
        for (uint32 i = 0; i < request.numWords; i++) {
            randomWords[i] = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        requestId,
                        i
                    )
                )
            );
        }

        // Call the requesting contract's fulfillRandomWords function
        (bool success, ) = request.sender.call(
            abi.encodeWithSignature(
                "rawFulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );

        emit RandomWordsFulfilled(requestId, randomWords[0], 0, success);
    }

    /**
     * @dev Get request details
     */
    function getRequestConfig() external pure returns (
        uint16 minimumRequestConfirmations,
        uint32 maxGasLimit,
        uint32 stalenessSeconds,
        uint32 gasAfterPaymentCalculation
    ) {
        return (3, 2500000, 86400, 33825);
    }

    /**
     * @dev Check if subscription exists and is funded
     */
    function getSubscription(uint64 subId) external pure returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        // Mock subscription data
        balance = 1000000000000000000; // 1 LINK
        reqCount = 0;
        owner = address(0);
        consumers = new address[](0);
    }
}