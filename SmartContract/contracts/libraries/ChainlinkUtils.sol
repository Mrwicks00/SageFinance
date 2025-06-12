// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "../errors/YieldOptimizerErrors.sol";

library ChainlinkUtils {
    function getLatestPrice(AggregatorV3Interface priceFeed) internal view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        if (price <= 0) revert YieldOptimizerErrors.InvalidPriceFeed();
        return price;
    }
}