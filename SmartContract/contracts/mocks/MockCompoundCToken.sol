// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockCompoundCToken
 * @dev Mock implementation of Compound cToken for testing
 */
contract MockCompoundCToken {
    using SafeERC20 for IERC20;

    string public name;
    string public symbol;
    uint8 public decimals;
    
    address public underlying;
    uint256 public exchangeRateStored;
    uint256 public supplyRatePerBlock;
    uint256 public borrowRatePerBlock;
    uint256 public reserveFactorMantissa;
    uint256 public totalSupply;
    uint256 public totalBorrows;
    uint256 public totalReserves;
    uint256 public accrualBlockNumber;
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public borrowBalances;
    
    // Constants
    uint256 internal constant MANTISSA = 1e18;
    uint256 internal constant BLOCKS_PER_YEAR = 2102400; // Approximate blocks per year
    
    event Mint(address minter, uint256 mintAmount, uint256 mintTokens);
    event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemTokens);
    event Borrow(address borrower, uint256 borrowAmount, uint256 accountBorrows, uint256 totalBorrows);
    event RepayBorrow(address payer, address borrower, uint256 repayAmount, uint256 accountBorrows, uint256 totalBorrows);

    constructor() {
        name = "Mock Compound USD Coin";
        symbol = "cUSDC";
        decimals = 8;
        exchangeRateStored = 200000000000000000000000000; // Initial exchange rate: 0.02
        supplyRatePerBlock = 317097919; // ~2% APY
        borrowRatePerBlock = 4756468797; // ~10% APY
        reserveFactorMantissa = 100000000000000000; // 10%
        accrualBlockNumber = block.number;
    }

    /**
     * @dev Set the underlying token address
     * @param _underlying The underlying token address
     */
    function setUnderlying(address _underlying) external {
        underlying = _underlying;
    }

    /**
     * @dev Mint cTokens by supplying underlying tokens
     * @param mintAmount The amount of underlying tokens to supply
     * @return 0 on success, otherwise an error code
     */
    function mint(uint256 mintAmount) external returns (uint256) {
        require(mintAmount > 0, "Mint amount must be positive");
        require(underlying != address(0), "Underlying not set");
        
        // Transfer underlying tokens from user
        IERC20(underlying).safeTransferFrom(msg.sender, address(this), mintAmount);
        
        // Calculate cTokens to mint
        uint256 cTokensToMint = (mintAmount * MANTISSA) / exchangeRateStored;
        
        // Update balances
        balances[msg.sender] += cTokensToMint;
        totalSupply += cTokensToMint;
        
        emit Mint(msg.sender, mintAmount, cTokensToMint);
        
        return 0; // Success
    }

    /**
     * @dev Redeem cTokens for underlying tokens
     * @param redeemTokens The number of cTokens to redeem
     * @return 0 on success, otherwise an error code
     */
    function redeem(uint256 redeemTokens) external returns (uint256) {
        require(redeemTokens > 0, "Redeem tokens must be positive");
        require(balances[msg.sender] >= redeemTokens, "Insufficient balance");
        
        // Calculate underlying amount to return
        uint256 underlyingAmount = (redeemTokens * exchangeRateStored) / MANTISSA;
        
        // Update balances
        balances[msg.sender] -= redeemTokens;
        totalSupply -= redeemTokens;
        
        // Transfer underlying tokens to user
        IERC20(underlying).safeTransfer(msg.sender, underlyingAmount);
        
        emit Redeem(msg.sender, underlyingAmount, redeemTokens);
        
        return 0; // Success
    }

    /**
     * @dev Redeem underlying tokens directly
     * @param redeemAmount The amount of underlying tokens to redeem
     * @return 0 on success, otherwise an error code
     */
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256) {
        require(redeemAmount > 0, "Redeem amount must be positive");
        
        // Calculate cTokens to redeem
        uint256 cTokensToRedeem = (redeemAmount * MANTISSA) / exchangeRateStored;
        require(balances[msg.sender] >= cTokensToRedeem, "Insufficient balance");
        
        // Update balances
        balances[msg.sender] -= cTokensToRedeem;
        totalSupply -= cTokensToRedeem;
        
        // Transfer underlying tokens to user
        IERC20(underlying).safeTransfer(msg.sender, redeemAmount);
        
        emit Redeem(msg.sender, redeemAmount, cTokensToRedeem);
        
        return 0; // Success
    }

    /**
     * @dev Get the current exchange rate
     * @return The current exchange rate scaled by 1e18
     */
    function exchangeRateCurrent() external view returns (uint256) {
        return exchangeRateStored;
    }

    /**
     * @dev Get account's cToken balance
     * @param account The account to query
     * @return The number of cTokens owned by account
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    /**
     * @dev Get the underlying balance of account
     * @param account The account to query
     * @return The amount of underlying tokens owned by account
     */
    function balanceOfUnderlying(address account) external view returns (uint256) {
        return (balances[account] * exchangeRateStored) / MANTISSA;
    }

    /**
     * @dev Get the current supply rate per block
     * @return The supply rate per block, scaled by 1e18
     */
    function supplyRatePerBlockCurrent() external view returns (uint256) {
        return supplyRatePerBlock;
    }

    /**
     * @dev Get the current borrow rate per block
     * @return The borrow rate per block, scaled by 1e18
     */
    function borrowRatePerBlockCurrent() external view returns (uint256) {
        return borrowRatePerBlock;
    }

    /**
     * @dev Get cash balance of this cToken in the underlying asset
     * @return The quantity of underlying asset owned by this contract
     */
    function getCash() external view returns (uint256) {
        if (underlying == address(0)) return 0;
        return IERC20(underlying).balanceOf(address(this));
    }

    /**
     * @dev Set exchange rate for testing
     * @param newRate The new exchange rate
     */
    function setExchangeRate(uint256 newRate) external {
        exchangeRateStored = newRate;
    }

    /**
     * @dev Set supply rate for testing
     * @param newRate The new supply rate per block
     */
    function setSupplyRate(uint256 newRate) external {
        supplyRatePerBlock = newRate;
    }

    /**
     * @dev Mock function to simulate interest accrual
     * @param account The account to accrue interest for
     * @param interestAmount The interest amount in underlying tokens
     */
    function mockAccrueInterest(address account, uint256 interestAmount) external {
        uint256 cTokensToMint = (interestAmount * MANTISSA) / exchangeRateStored;
        balances[account] += cTokensToMint;
        totalSupply += cTokensToMint;
    }

    /**
     * @dev Get account snapshot
     * @param account The account to query
     * @return (error code, cToken balance, borrow balance, exchange rate)
     */
    function getAccountSnapshot(address account) 
        external 
        view 
        returns (uint256, uint256, uint256, uint256) 
    {
        return (0, balances[account], borrowBalances[account], exchangeRateStored);
    }

    /**
     * @dev Borrow underlying tokens
     * @param borrowAmount The amount to borrow
     * @return 0 on success, error code on failure
     */
    function borrow(uint256 borrowAmount) external returns (uint256) {
        require(borrowAmount > 0, "Borrow amount must be positive");
        require(underlying != address(0), "Underlying not set");
        
        // Simple mock - just transfer tokens and update borrow balance
        borrowBalances[msg.sender] += borrowAmount;
        totalBorrows += borrowAmount;
        
        IERC20(underlying).safeTransfer(msg.sender, borrowAmount);
        
        emit Borrow(msg.sender, borrowAmount, borrowBalances[msg.sender], totalBorrows);
        
        return 0;
    }

    /**
     * @dev Repay borrowed tokens
     * @param repayAmount The amount to repay
     * @return 0 on success, error code on failure
     */
    function repayBorrow(uint256 repayAmount) external returns (uint256) {
        require(repayAmount > 0, "Repay amount must be positive");
        require(borrowBalances[msg.sender] >= repayAmount, "Repay amount exceeds borrow");
        
        IERC20(underlying).safeTransferFrom(msg.sender, address(this), repayAmount);
        
        borrowBalances[msg.sender] -= repayAmount;
        totalBorrows -= repayAmount;
        
        emit RepayBorrow(msg.sender, msg.sender, repayAmount, borrowBalances[msg.sender], totalBorrows);
        
        return 0;
    }
}