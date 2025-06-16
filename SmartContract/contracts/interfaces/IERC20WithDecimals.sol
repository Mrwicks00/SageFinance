// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

interface IERC20WithDecimals is IERC20 {
    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10**2`).
     *
     * Tokens usually implement `decimals` with a value of 18, but this is not
     * required.
     *
     * If the token doesn't implement `decimals`, the caller should assume it has
     * as many as ETH (18).
     */
    function decimals() external view returns (uint8);
}