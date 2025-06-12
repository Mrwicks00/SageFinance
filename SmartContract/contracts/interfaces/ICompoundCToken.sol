// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICompoundCToken {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}