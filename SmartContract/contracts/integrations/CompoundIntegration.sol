// integrations/CompoundIntegration.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ICompoundV3Comet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Still needed for stablecoin.approve
import "../errors/YieldOptimizerErrors.sol";

library CompoundIntegration {
    function depositToCompound(
        ICompoundV3Comet comet,
        IERC20 stablecoin,
        uint256 amount
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        // Approve the Comet contract to spend USDC (the base asset)
        // The address of the Comet contract is where you approve the USDC for.
        stablecoin.approve(address(comet), amount);
        // Call the supply function on the Comet contract, passing the USDC asset address
        comet.supply(address(stablecoin), amount);
        // Compound V3's supply doesn't return a value to check. It reverts on failure.
    }

    function withdrawFromCompound(
        ICompoundV3Comet comet,
        uint256 amount,
        IERC20 stablecoin, // This parameter is no longer directly used in this function
        address to
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();

        // Use withdrawTo(to, asset, amount) as it's cleaner for specifying the recipient
        // The 'asset' is your stablecoin (USDC)
        comet.withdrawTo(to, address(stablecoin), amount);

        // No need for stablecoin.transfer(to, amount) here, as withdrawTo sends directly to 'to'.
    }

    function getSuppliedUSDCBalance(ICompoundV3Comet comet, address user) internal view returns (uint256) {
        // For the base asset (USDC), balanceOf(user) returns the principal supplied balance.
        return comet.balanceOf(user);
    }
}