// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INonfungiblePositionManager {
    // --- Structs for function parameters ---
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

    struct DecreaseLiquidityParams {
        uint256 tokenId;
        uint128 liquidity;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    // --- Functions ---

    /**
     * @dev Creates a new position for the given parameters, depositing as much token0 and token1 as possible.
     * @param params The parameters for the mint call.
     * @return tokenId The ID of the newly minted ERC721 token.
     * @return liquidity The amount of liquidity for which the position was initialized.
     * @return amount0 The amount of token0 consumed by the mint.
     * @return amount1 The amount of token1 consumed by the mint.
     */
    function mint(MintParams calldata params)
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    /**
     * @dev Decreases the amount of liquidity for a position, by burning a NFT.
     * @param params The parameters for the decreaseLiquidity call.
     * @return amount0 The amount of token0 withdrawn.
     * @return amount1 The amount of token1 withdrawn.
     */
    function decreaseLiquidity(DecreaseLiquidityParams calldata params)
        external
        payable
        returns (uint256 amount0, uint256 amount1);

    /**
     * @dev Collects tokens owed to a position.
     * @param params The parameters for the collect call.
     * @return amount0 The amount of token0 collected.
     * @return amount1 The amount of token1 collected.
     */
    function collect(CollectParams calldata params)
        external
        payable
        returns (uint256 amount0, uint256 amount1);

    /**
     * @dev Increases the amount of liquidity for a position.
     * @param params The parameters for the increaseLiquidity call.
     * @return liquidity The new liquidity amount.
     * @return amount0 The amount of token0 consumed by the increase.
     * @return amount1 The amount of token1 consumed by the increase.
     */
    function increaseLiquidity(IncreaseLiquidityParams calldata params)
        external
        payable
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    /**
     * @dev Returns the details of a position.
     * @param tokenId The ID of the token that represents the position.
     * @return nonce The nonce of the position.
     * @return operator The address of the operator of the position.
     * @return token0 The address of token0 in the pool.
     * @return token1 The address of token1 in the pool.
     * @return fee The fee tier of the pool.
     * @return tickLower The lower tick boundary of the position.
     * @return tickUpper The upper tick boundary of the position.
     * @return liquidity The amount of liquidity in the position.
     * @return feeGrowthInside0LastX128 The fee growth inside the position for token0.
     * @return feeGrowthInside1LastX128 The fee growth inside the position for token1.
     * @return tokensOwed0 The amount of token0 owed to the position.
     * @return tokensOwed1 The amount of token1 owed to the position.
     */
    function positions(uint256 tokenId)
        external
        view
        returns (
            uint96 nonce,
            address operator,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        );

    /**
     * @dev Burns a liquidity position, by burning a NFT.
     * @param tokenId The ID of the token that represents the position.
     */
    function burn(uint256 tokenId) external payable;
}