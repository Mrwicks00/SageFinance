// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IAaveLendingPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../errors/YieldOptimizerErrors.sol";

library AaveIntegration {
    function depositToAave(
        IAaveLendingPool lendingPool,
        IERC20 stablecoin,
        uint256 amount,
        address onBehalfOf
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        stablecoin.approve(address(lendingPool), amount);
        lendingPool.supply(address(stablecoin), amount, onBehalfOf, 0);
    }

    function withdrawFromAave(
        IAaveLendingPool lendingPool,
        IERC20 stablecoin,
        uint256 amount,
        address to
    ) internal {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        lendingPool.withdraw(address(stablecoin), amount, to);
    }
}