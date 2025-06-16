// interfaces/ICompoundV3Comet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICompoundV3Comet {
    // For supplying any asset, including the base asset (USDC)
    // The 'amount' of 'asset' is supplied by msg.sender (which is your YieldOptimizer contract)
    function supply(address asset, uint256 amount) external;

    // For withdrawing collateral or borrowing the base asset (USDC) to a specific address
    function withdrawTo(address to, address asset, uint256 amount) external;

    // Optional: If you might ever need a withdraw function that sends to msg.sender
    // function withdraw(address asset, uint256 amount) external;

    // For checking supplied balance of the base asset for a user
    function balanceOf(address account) external view returns (uint256);

    // Other functions (you can keep or remove what's not directly needed for your use case)
    function getSupplyRate(uint256 util) external view returns (uint64);
    function getUtilization() external view returns (uint256);

    // Events (optional, but good for tracking)
    event Supply(address indexed asset, address indexed from, address indexed to, uint256 amount);
    event Withdraw(address indexed asset, address indexed src, address indexed to, uint256 amount);
    // You might also find BaseSupply and BaseWithdraw events, depending on the exact ABI
}