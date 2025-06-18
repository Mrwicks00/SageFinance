// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ICompoundV3Comet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Still needed for IERC20.approve
import "../interfaces/IERC20WithDecimals.sol"; // New: Import IERC20WithDecimals
import "../errors/YieldOptimizerErrors.sol";

library CompoundIntegration {
    function depositToCompound(
        ICompoundV3Comet comet,
        IERC20WithDecimals _depositToken, // Changed to IERC20WithDecimals
        uint256 amount
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        _depositToken.approve(address(comet), amount); // Use the specific token
        comet.supply(address(_depositToken), amount);
    }

    function withdrawFromCompound(
        ICompoundV3Comet comet,
        uint256 amount,
        IERC20WithDecimals _withdrawToken, // Changed to IERC20WithDecimals
        address to
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        comet.withdrawTo(to, address(_withdrawToken), amount);
    }

    function getSuppliedUSDCBalance(ICompoundV3Comet comet, address user) internal view returns (uint256) {
        return comet.balanceOf(user);
    }
}