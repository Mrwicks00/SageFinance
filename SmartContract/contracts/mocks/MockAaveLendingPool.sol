// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockAaveLendingPool
 * @dev Mock implementation of Aave Lending Pool for testing
 */
contract MockAaveLendingPool {
    using SafeERC20 for IERC20;

    struct ReserveData {
        uint256 liquidityRate;
        uint256 stableBorrowRate;
        uint256 variableBorrowRate;
        uint256 liquidityIndex;
        uint256 variableBorrowIndex;
        uint40 lastUpdateTimestamp;
        address aTokenAddress;
        address stableDebtTokenAddress;
        address variableDebtTokenAddress;
        address interestRateStrategyAddress;
        uint8 id;
    }

    mapping(address => ReserveData) public reserves;
    mapping(address => mapping(address => uint256)) public userBalances;
    
    // Mock interest rates (in ray units: 1e27 = 100%)
    uint256 public constant MOCK_LIQUIDITY_RATE = 25000000000000000000000000; // 2.5%
    uint256 public constant MOCK_STABLE_RATE = 40000000000000000000000000; // 4%
    uint256 public constant MOCK_VARIABLE_RATE = 35000000000000000000000000; // 3.5%

    event Deposit(
        address indexed reserve,
        address user,
        address indexed onBehalfOf,
        uint256 amount,
        uint16 indexed referral
    );

    event Withdraw(
        address indexed reserve,
        address indexed user,
        address indexed to,
        uint256 amount
    );

    constructor() {
        // Initialize with some default values
    }

    /**
     * @dev Deposits an amount of underlying asset into the reserve
     * @param asset The address of the underlying asset to deposit
     * @param amount The amount to be deposited
     * @param onBehalfOf The address that will receive the aTokens
     * @param referralCode Code used to register the integrator
     */
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to this contract
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user balance (simplified - in real Aave, aTokens are minted)
        userBalances[asset][onBehalfOf] += amount;
        
        emit Deposit(asset, msg.sender, onBehalfOf, amount, referralCode);
    }

    /**
     * @dev Withdraws an amount of underlying asset from the reserve
     * @param asset The address of the underlying asset to withdraw
     * @param amount The underlying amount to be withdrawn
     * @param to Address that will receive the underlying
     * @return The final amount withdrawn
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        uint256 userBalance = userBalances[asset][msg.sender];
        require(userBalance >= amount, "Not enough balance");
        
        // Update user balance
        userBalances[asset][msg.sender] = userBalance - amount;
        
        // Transfer tokens back to user
        IERC20(asset).safeTransfer(to, amount);
        
        emit Withdraw(asset, msg.sender, to, amount);
        
        return amount;
    }

    /**
     * @dev Returns the user account data across all the reserves
     * @param user The address of the user
     * @return totalCollateralETH the total collateral in ETH of the user
     * @return totalDebtETH the total debt in ETH of the user
     * @return availableBorrowsETH the borrowing power left of the user
     * @return currentLiquidationThreshold the liquidation threshold of the user
     * @return ltv the loan to value of the user
     * @return healthFactor the current health factor of the user
     */
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralETH,
            uint256 totalDebtETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        // Mock values for testing
        totalCollateralETH = 1000 * 1e18; // 1000 ETH worth
        totalDebtETH = 500 * 1e18; // 500 ETH worth
        availableBorrowsETH = 300 * 1e18; // 300 ETH worth
        currentLiquidationThreshold = 8000; // 80%
        ltv = 7500; // 75%
        healthFactor = 2 * 1e18; // 2.0 (healthy)
    }

    /**
     * @dev Returns the configuration of the reserve
     * @param asset The address of the underlying asset of the reserve
     * @return The configuration of the reserve
     */
    function getReserveData(address asset)
        external
        view
        returns (ReserveData memory)
    {
        ReserveData memory reserveData = reserves[asset];
        
        // If not initialized, return mock data
        if (reserveData.lastUpdateTimestamp == 0) {
            reserveData.liquidityRate = MOCK_LIQUIDITY_RATE;
            reserveData.stableBorrowRate = MOCK_STABLE_RATE;
            reserveData.variableBorrowRate = MOCK_VARIABLE_RATE;
            reserveData.liquidityIndex = 1e27; // 1.0 in ray
            reserveData.variableBorrowIndex = 1e27; // 1.0 in ray
            reserveData.lastUpdateTimestamp = uint40(block.timestamp);
        }
        
        return reserveData;
    }

    /**
     * @dev Returns the list of the initialized reserves
     * @return The addresses of the initialized reserves
     */
    function getReservesList() external pure returns (address[] memory) {
        // Return empty array for mock
        return new address[](0);
    }

    /**
     * @dev Get user balance for a specific asset
     * @param asset The asset address
     * @param user The user address
     * @return The user's balance
     */
    function getUserBalance(address asset, address user) 
        external 
        view 
        returns (uint256) 
    {
        return userBalances[asset][user];
    }

    /**
     * @dev Set mock reserve data for testing
     * @param asset The asset address
     * @param liquidityRate The liquidity rate
     * @param stableBorrowRate The stable borrow rate
     * @param variableBorrowRate The variable borrow rate
     */
    function setReserveData(
        address asset,
        uint256 liquidityRate,
        uint256 stableBorrowRate,
        uint256 variableBorrowRate
    ) external {
        reserves[asset] = ReserveData({
            liquidityRate: liquidityRate,
            stableBorrowRate: stableBorrowRate,
            variableBorrowRate: variableBorrowRate,
            liquidityIndex: 1e27,
            variableBorrowIndex: 1e27,
            lastUpdateTimestamp: uint40(block.timestamp),
            aTokenAddress: address(0),
            stableDebtTokenAddress: address(0),
            variableDebtTokenAddress: address(0),
            interestRateStrategyAddress: address(0),
            id: 0
        });
    }

    /**
     * @dev Mock function to simulate yield accrual
     * @param asset The asset address
     * @param user The user address
     * @param yieldAmount The yield amount to add
     */
    function mockAccrueYield(address asset, address user, uint256 yieldAmount) external {
        userBalances[asset][user] += yieldAmount;
    }
}