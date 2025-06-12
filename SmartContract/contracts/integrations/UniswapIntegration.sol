// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUniswapV3Router.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../errors/YieldOptimizerErrors.sol";

library UniswapIntegration {
    function depositToUniswap(
        IUniswapV3Router router,
        IERC20 stablecoin,
        IERC20 weth,
        uint256 amount,
        uint256 minAmountOut // Add slippage protection parameter
    ) internal returns (uint256 lpAmount) {
        if (amount == 0) revert YieldOptimizerErrors.ZeroAmount();
        uint256 halfAmount = amount / 2;

        // Swap half USDC to WETH with slippage protection
        stablecoin.approve(address(router), halfAmount);
        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router.ExactInputSingleParams({
            tokenIn: address(stablecoin),
            tokenOut: address(weth),
            fee: 3000, // 0.3% fee
            recipient: address(this),
            deadline: block.timestamp + 300,
            amountIn: halfAmount,
            amountOutMinimum: minAmountOut, // Use slippage protection
            sqrtPriceLimitX96: 0
        });
        uint256 wethAmount = router.exactInputSingle(params);

        // Simplified: Track LP amount as USDC equivalent
        lpAmount = halfAmount + wethAmount; // Placeholder
    }

    function withdrawFromUniswap(
        IUniswapV3Router router,
        IERC20 stablecoin,
        IERC20 weth,
        uint256 lpAmount,
        address to,
        uint256 minAmountOut // Add slippage protection parameter
    ) internal {
        if (lpAmount == 0) revert YieldOptimizerErrors.ZeroAmount();
        // Simplified: Assume LP amount is USDC equivalent, swap WETH back to USDC
        uint256 wethAmount = lpAmount / 2;
        
        weth.approve(address(router), wethAmount);
        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router.ExactInputSingleParams({
            tokenIn: address(weth), // Fixed: was wethAmount
            tokenOut: address(stablecoin), // Fixed: was Stablecoin
            fee: 3000,
            recipient: to,
            deadline: block.timestamp + 300,
            amountIn: wethAmount,
            amountOutMinimum: minAmountOut, // Use slippage protection
            sqrtPriceLimitX96: 0
        });
        router.exactInputSingle(params);
        
        // Transfer remaining stablecoin
        stablecoin.transfer(to, lpAmount / 2);
    }
}