// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUniswapV3Router.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Still needed for IERC20.approve
import "../interfaces/IERC20WithDecimals.sol"; // New: Import IERC20WithDecimals
import "../errors/YieldOptimizerErrors.sol";

library UniswapIntegration {
    function depositToUniswap(
        IUniswapV3Router router,
        IERC20WithDecimals tokenA, // Changed to IERC20WithDecimals (e.g., stablecoin)
        IERC20WithDecimals tokenB, // Changed to IERC20WithDecimals (e.g., weth)
        uint256 amount,
        uint256 minAmountOut
    ) internal returns (uint256 lpAmount) {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        uint256 halfAmount = amount / 2;

        tokenA.approve(address(router), halfAmount);
        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router.ExactInputSingleParams({
            tokenIn: address(tokenA),
            tokenOut: address(tokenB),
            fee: 3000,
            recipient: address(this),
            deadline: block.timestamp + 300,
            amountIn: halfAmount,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: 0
        });
        uint256 tokenBAmount = router.exactInputSingle(params);

        lpAmount = halfAmount + tokenBAmount;
    }

    function withdrawFromUniswap(
        IUniswapV3Router router,
        IERC20WithDecimals tokenA, // Changed to IERC20WithDecimals (e.g., stablecoin from LP)
        IERC20WithDecimals tokenB, // Changed to IERC20WithDecimals (e.g., weth from LP)
        uint256 lpAmount,
        address to,
        uint256 minAmountOut
    ) internal {
        if (lpAmount == 0) revert YieldOptimizerErrors.ZeroAmount();
        uint256 tokenBAmount = lpAmount / 2;

        tokenB.approve(address(router), tokenBAmount);
        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router.ExactInputSingleParams({
            tokenIn: address(tokenB),
            tokenOut: address(tokenA),
            fee: 3000,
            recipient: to,
            deadline: block.timestamp + 300,
            amountIn: tokenBAmount,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: 0
        });
        router.exactInputSingle(params);

        tokenA.transfer(to, lpAmount / 2);
    }
}