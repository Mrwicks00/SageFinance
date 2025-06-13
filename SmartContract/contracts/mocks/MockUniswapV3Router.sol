// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./MockERC20.sol";


/**
 * @title MockUniswapV3Router
 * @dev Mock implementation of Uniswap V3 Router for testing
 */
contract MockUniswapV3Router {
    using SafeERC20 for IERC20;
    
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    
    // Mock exchange rate: 1 USDC = 0.0005 WETH (assuming 1 ETH = 2000 USDC)
    uint256 public constant MOCK_EXCHANGE_RATE = 5e14; // 0.0005 * 1e18
    
    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        returns (uint256 amountOut)
    {
        require(block.timestamp <= params.deadline, "Transaction too old");
        
        // Take input tokens from sender
        IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), params.amountIn);
        
        // Calculate output amount based on mock exchange rate
        if (params.tokenIn != params.tokenOut) {
            // For simplicity, just mint the output tokens to simulate the swap
            // In a real scenario, the router would have liquidity
            amountOut = _calculateSwapOutput(params.tokenIn, params.tokenOut, params.amountIn);
        } else {
            amountOut = params.amountIn; // Same token
        }
        
        require(amountOut >= params.amountOutMinimum, "Insufficient output amount");
        
        // Mint output tokens to recipient (simulating swap)
        _mintTokensTo(params.tokenOut, params.recipient, amountOut);
    }
    
    function _calculateSwapOutput(address tokenIn, address tokenOut, uint256 amountIn) 
        private 
        pure 
        returns (uint256) 
    {
        // Simple 1:1 swap for testing - you can make this more sophisticated
        // USDC (6 decimals) to WETH (18 decimals): assume 1 USDC = 0.0005 WETH
        // WETH to USDC: assume 1 WETH = 2000 USDC
        
        // For testing purposes, let's do a simple conversion
        // This assumes tokenIn has 6 decimals (USDC) and tokenOut has 18 decimals (WETH)
        return (amountIn * 1e12) / 2000; // Convert USDC to WETH equivalent
    }
    
    function _mintTokensTo(address token, address recipient, uint256 amount) private {
        // For testing, we'll try to transfer from our balance first
        // If we don't have enough, we'll mint (assuming the token has a mint function)
        IERC20 tokenContract = IERC20(token);
        
        if (tokenContract.balanceOf(address(this)) >= amount) {
            tokenContract.safeTransfer(recipient, amount);
        } else {
            // Try to mint tokens (this will work with MockERC20)
            try MockERC20(token).mint(recipient, amount) {
                // Minting successful
            } catch {
                // If minting fails, just transfer what we have or revert
                uint256 availableBalance = tokenContract.balanceOf(address(this));
                if (availableBalance > 0) {
                    tokenContract.safeTransfer(recipient, availableBalance);
                } else {
                    revert("Insufficient liquidity");
                }
            }
        }
    }
    
    // Add other required functions as stubs
    function decreaseLiquidity(bytes calldata) external pure returns (uint256, uint256) {
        return (0, 0);
    }
}

