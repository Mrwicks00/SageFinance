// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

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

    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    struct DecreaseLiquidityParams {
        uint256 tokenId;
        uint128 liquidity;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }

    // Mock exchange rates (for simplicity, 1:1 ratio with some slippage)
    mapping(address => mapping(address => uint256)) public exchangeRates;
    
    // Position tracking
    mapping(uint256 => Position) public positions;
    uint256 public nextTokenId = 1;

    struct Position {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        uint256 feeGrowthInside0LastX128;
        uint256 feeGrowthInside1LastX128;
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    event Swap(
        address indexed sender,
        address indexed recipient,
        int256 amount0,
        int256 amount1,
        uint160 sqrtPriceX96,
        uint128 liquidity,
        int24 tick
    );

    event IncreaseLiquidity(
        uint256 indexed tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    event DecreaseLiquidity(
        uint256 indexed tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    constructor() {
        // Set some default exchange rates for testing
        // These are simplified and don't represent real market rates
    }

    /**
     * @dev Set exchange rate between two tokens for testing
     * @param tokenA First token
     * @param tokenB Second token  
     * @param rate Exchange rate (tokenA per tokenB, scaled by 1e18)
     */
    function setExchangeRate(address tokenA, address tokenB, uint256 rate) external {
        exchangeRates[tokenA][tokenB] = rate;
        if (rate > 0) {
            exchangeRates[tokenB][tokenA] = (1e18 * 1e18) / rate;
        }
    }

    /**
     * @dev Swaps amountIn of one token for as much as possible of another token
     * @param params The parameters necessary for the swap
     * @return amountOut The amount of the received token
     */
    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        returns (uint256 amountOut)
    {
        require(params.deadline >= block.timestamp, "Transaction too old");
        require(params.amountIn > 0, "Amount in must be positive");

        // Transfer input tokens from user
        IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), params.amountIn);

        // Calculate output amount (simplified)
        uint256 rate = exchangeRates[params.tokenIn][params.tokenOut];
        if (rate == 0) {
            rate = 1e18; // 1:1 default rate
        }
        
        // Apply 0.3% fee (similar to Uniswap V3)
        uint256 amountAfterFee = (params.amountIn * 997) / 1000;
        amountOut = (amountAfterFee * rate) / 1e18;

        require(amountOut >= params.amountOutMinimum, "Insufficient output amount");

        // Transfer output tokens to recipient
        IERC20(params.tokenOut).safeTransfer(params.recipient, amountOut);

        emit Swap(
            msg.sender,
            params.recipient,
            int256(params.amountIn),
            -int256(amountOut),
            0, // sqrtPriceX96
            0, // liquidity
            0  // tick
        );

        return amountOut;
    }

    /**
     * @dev Swaps as little as possible of one token for exact amount of another token
     * @param params The parameters necessary for the swap
     * @return amountIn The amount of the input token
     */
    function exactOutputSingle(ExactOutputSingleParams calldata params)
        external
        returns (uint256 amountIn)
    {
        require(params.deadline >= block.timestamp, "Transaction too old");
        require(params.amountOut > 0, "Amount out must be positive");

        // Calculate required input amount (simplified)
        uint256 rate = exchangeRates[params.tokenOut][params.tokenIn];
        if (rate == 0) {
            rate = 1e18; // 1:1 default rate
        }
        
        // Calculate amount needed before fees
        uint256 amountBeforeFee = (params.amountOut * rate) / 1e18;
        // Add 0.3% fee
        amountIn = (amountBeforeFee * 1000) / 997;

        require(amountIn <= params.amountInMaximum, "Excessive input amount");

        // Transfer input tokens from user
        IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Transfer exact output tokens to recipient
        IERC20(params.tokenOut).safeTransfer(params.recipient, params.amountOut);

        emit Swap(
            msg.sender,
            params.recipient,
            int256(amountIn),
            -int256(params.amountOut),
            0, // sqrtPriceX96
            0, // liquidity
            0  // tick
        );

        return amountIn;
    }

    /**
     * @dev Creates a new position wrapped in a NFT
     * @param params The params necessary to mint a position
     * @return tokenId The ID of the token that represents the minted position
     * @return liquidity The amount of liquidity for this position
     * @return amount0 The amount of token0
     * @return amount1 The amount of token1
     */
    function mint(MintParams calldata params)
        external
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        require(params.deadline >= block.timestamp, "Transaction too old");
        require(params.amount0Desired > 0 || params.amount1Desired > 0, "Must provide liquidity");

        tokenId = nextTokenId++;
        
        // Simplified liquidity calculation
        amount0 = params.amount0Desired;
        amount1 = params.amount1Desired;
        liquidity = uint128((amount0 + amount1) / 2); // Simplified

        require(amount0 >= params.amount0Min, "Insufficient amount0");
        require(amount1 >= params.amount1Min, "Insufficient amount1");

        // Transfer tokens from user
        if (amount0 > 0) {
            IERC20(params.token0).safeTransferFrom(msg.sender, address(this), amount0);
        }
        if (amount1 > 0) {
            IERC20(params.token1).safeTransferFrom(msg.sender, address(this), amount1);
        }

        // Store position
        positions[tokenId] = Position({
            token0: params.token0,
            token1: params.token1,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            liquidity: liquidity,
            feeGrowthInside0LastX128: 0,
            feeGrowthInside1LastX128: 0,
            tokensOwed0: 0,
            tokensOwed1: 0
        });

        return (tokenId, liquidity, amount0, amount1);
    }

    /**
     * @dev Increases the amount of liquidity in a position
     * @param params The parameters for increasing liquidity
     * @return liquidity The new liquidity amount as a result of the increase
     * @return amount0 The amount of token0 to achieve resulting liquidity
     * @return amount1 The amount of token1 to achieve resulting liquidity
     */
    function increaseLiquidity(IncreaseLiquidityParams calldata params)
        external
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        require(params.deadline >= block.timestamp, "Transaction too old");
        require(positions[params.tokenId].liquidity > 0, "Invalid token ID");

        Position storage position = positions[params.tokenId];
        
        // Simplified liquidity increase
        amount0 = params.amount0Desired;
        amount1 = params.amount1Desired;
        liquidity = uint128((amount0 + amount1) / 2);

        require(amount0 >= params.amount0Min, "Insufficient amount0");
        require(amount1 >= params.amount1Min, "Insufficient amount1");

        // Transfer tokens from user
        if (amount0 > 0) {
            IERC20(position.token0).safeTransferFrom(msg.sender, address(this), amount0);
        }
        if (amount1 > 0) {
            IERC20(position.token1).safeTransferFrom(msg.sender, address(this), amount1);
        }

        // Update position
        position.liquidity += liquidity;

        emit IncreaseLiquidity(params.tokenId, liquidity, amount0, amount1);

        return (liquidity, amount0, amount1);
    }

    /**
     * @dev Decreases the amount of liquidity in a position
     * @param params The parameters for decreasing liquidity
     * @return amount0 The amount of token0 withdrawn
     * @return amount1 The amount of token1 withdrawn
     */
    function decreaseLiquidity(DecreaseLiquidityParams calldata params)
        external
        returns (uint256 amount0, uint256 amount1)
    {
        require(params.deadline >= block.timestamp, "Transaction too old");
        require(positions[params.tokenId].liquidity >= params.liquidity, "Insufficient liquidity");

        Position storage position = positions[params.tokenId];
        
        // Simplified calculation - proportional withdrawal
        uint256 liquidityRatio = (uint256(params.liquidity) * 1e18) / uint256(position.liquidity);
        
        // Calculate amounts to withdraw (simplified)
        amount0 = (liquidityRatio * uint256(params.liquidity)) / 1e18;
        amount1 = (liquidityRatio * uint256(params.liquidity)) / 1e18;

        require(amount0 >= params.amount0Min, "Insufficient amount0");
        require(amount1 >= params.amount1Min, "Insufficient amount1");

        // Update position
        position.liquidity -= params.liquidity;
        position.tokensOwed0 += uint128(amount0);
        position.tokensOwed1 += uint128(amount1);

        emit DecreaseLiquidity(params.tokenId, params.liquidity, amount0, amount1);

        return (amount0, amount1);
    }

    /**
     * @dev Collects the fees associated with provided liquidity
     * @param params The parameters for collecting fees
     * @return amount0 The amount of fees collected in token0
     * @return amount1 The amount of fees collected in token1
     */
    function collect(CollectParams calldata params)
        external
        returns (uint256 amount0, uint256 amount1)
    {
        require(positions[params.tokenId].liquidity > 0, "Invalid token ID");

        Position storage position = positions[params.tokenId];
        
        // Calculate collectible amounts
        amount0 = params.amount0Max < position.tokensOwed0 ? 
                  params.amount0Max : position.tokensOwed0;
        amount1 = params.amount1Max < position.tokensOwed1 ? 
                  params.amount1Max : position.tokensOwed1;

        // Update owed amounts
        position.tokensOwed0 -= uint128(amount0);
        position.tokensOwed1 -= uint128(amount1);

        // Transfer tokens to recipient
        if (amount0 > 0) {
            IERC20(position.token0).safeTransfer(params.recipient, amount0);
        }
        if (amount1 > 0) {
            IERC20(position.token1).safeTransfer(params.recipient, amount1);
        }

        return (amount0, amount1);
    }

    /**
     * @dev Get position information
     * @param tokenId The ID of the token for which to get the position
     * @return nonce The nonce for permits
     * @return operator The address that is approved for the NFT
     * @return token0 The address of the token0 for a specific pool
     * @return token1 The address of the token1 for a specific pool
     * @return fee The fee associated with the pool
     * @return tickLower The lower end of the tick range for the position
     * @return tickUpper The higher end of the tick range for the position
     * @return liquidity The liquidity of the position
     * @return feeGrowthInside0LastX128 The fee growth inside the tick range for token0
     * @return feeGrowthInside1LastX128 The fee growth inside the tick range for token1
     * @return tokensOwed0 The uncollected amount of token0 owed to the position
     * @return tokensOwed1 The uncollected amount of token1 owed to the position
     */
    // function positions(uint256 tokenId)
    //     external
    //     view
    //     returns (
    //         uint96 nonce,
    //         address operator,
    //         address token0,
    //         address token1,
    //         uint24 fee,
    //         int24 tickLower,
    //         int24 tickUpper,
    //         uint128 liquidity,
    //         uint256 feeGrowthInside0LastX128,
    //         uint256 feeGrowthInside1LastX128,
    //         uint128 tokensOwed0,
    //         uint128 tokensOwed1
    //     )
    // {
    //     Position memory position = positions[tokenId];
    //     return (
    //         0, // nonce
    //         address(0), // operator
    //         position.token0,
    //         position.token1,
    //         position.fee,
    //         position.tickLower,
    //         position.tickUpper,
    //         position.liquidity,
    //         position.feeGrowthInside0LastX128,
    //         position.feeGrowthInside1LastX128,
    //         position.tokensOwed0,
    //         position.tokensOwed1
    //     );
    // }

    /**
     * @dev Mock function to simulate fee accrual
     * @param tokenId The position token ID
     * @param amount0 Fee amount in token0
     * @param amount1 Fee amount in token1
     */
    function mockAccrueFees(uint256 tokenId, uint128 amount0, uint128 amount1) external {
        require(positions[tokenId].liquidity > 0, "Invalid token ID");
        
        Position storage position = positions[tokenId];
        position.tokensOwed0 += amount0;
        position.tokensOwed1 += amount1;
    }

    /**
     * @dev Get the current sqrt price of a pool
     * @param token0 First token of the pool
     * @param token1 Second token of the pool
     * @param fee Fee tier of the pool
     * @return sqrtPriceX96 The sqrt price of the pool
     */
    function getPoolSqrtPrice(address token0, address token1, uint24 fee) 
        external 
        view 
        returns (uint160 sqrtPriceX96) 
    {
        // Return a mock sqrt price (simplified)
        return 79228162514264337593543950336; // Represents price of 1:1
    }
}