// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockAggregatorV3Interface {
    int256 private _latestAnswer;
    uint8 public decimals = 8;
    
    function setLatestAnswer(int256 answer) external {
        _latestAnswer = answer;
    }
    
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (1, _latestAnswer, block.timestamp, block.timestamp, 1);
    }
}