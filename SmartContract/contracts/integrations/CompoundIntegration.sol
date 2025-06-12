// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ICompoundCToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../errors/YieldOptimizerErrors.sol";

library CompoundIntegration {
    function depositToCompound(
        ICompoundCToken cToken,
        IERC20 stablecoin,
        uint256 amount
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        stablecoin.approve(address(cToken), amount);
        if (cToken.mint(amount) != 0) revert YieldOptimizerErrors.TransferFailed();
    }

    function withdrawFromCompound(
        ICompoundCToken cToken,
        uint256 amount,
        IERC20 stablecoin,
        address to
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        if (cToken.redeemUnderlying(amount) != 0) revert YieldOptimizerErrors.TransferFailed();
        stablecoin.transfer(to, amount);
    }
}