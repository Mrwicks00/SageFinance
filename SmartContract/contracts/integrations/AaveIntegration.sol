// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IAaveLendingPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Still needed for IERC20.approve
import "../interfaces/IERC20WithDecimals.sol"; // New: Import IERC20WithDecimals
import "../errors/YieldOptimizerErrors.sol";

library AaveIntegration {
    function depositToAave(
        IAaveLendingPool lendingPool,
        IERC20WithDecimals _depositToken, // Changed to IERC20WithDecimals
        uint256 amount,
        address onBehalfOf
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        _depositToken.approve(address(lendingPool), amount); // Use the specific token
        lendingPool.supply(address(_depositToken), amount, onBehalfOf, 0);
    }

    function withdrawFromAave(
        IAaveLendingPool lendingPool,
        IERC20WithDecimals _withdrawToken, // Changed to IERC20WithDecimals
        uint256 amount,
        address to
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        lendingPool.withdraw(address(_withdrawToken), amount, to);
    }
}