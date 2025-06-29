// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAaveLendingPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getUserBalance(address user, address asset) external view returns (uint256);
}