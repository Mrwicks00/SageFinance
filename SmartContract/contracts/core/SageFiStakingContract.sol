// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Custom error definitions
error SagefiStaking__ZeroAmount();
error SagefiStaking__ZeroAddress();
error SagefiStaking__NotStaked();
error SagefiStaking__InsufficientStakedAmount();
error SagefiStaking__InsufficientYieldReserves();
error SagefiStaking__CannotWithdrawStakingToken();
error SagefiStaking__InvalidYieldRate();
error SagefiStaking__InvalidAgentAddress();
error SagefiStaking__UnauthorizedAgent();
error SagefiStaking__MaxStakeExceeded();
error SagefiStaking__ContractNotConfigured();

contract SagefiStakingContract is Ownable, ReentrancyGuard {
    // --- Constants ---
    uint256 public constant MAX_YIELD_RATE = 10000; // 100% max APY
    uint256 public constant MAX_STAKE_PER_USER = 1_000_000e18; // 1M SAGE tokens max per user
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant BASIS_POINTS = 10000;

    // --- State Variables ---
    IERC20 public immutable sageToken; // The token users will stake

    // User staking data
    mapping(address => uint256) public s_stakedBalances;
    mapping(address => uint256) public s_lastStakeUpdate;
    mapping(address => uint256) public s_cumulativeYieldEarned;

    // Contract configuration
    uint256 public s_yieldRatePerYear; // Basis points (e.g., 500 for 5%)
    bool public s_isYieldRateConfigured;
    
    // Authorized agents for cross-chain staking
    mapping(address => bool) public s_authorizedAgents;
    
    // Yield funding and reserves
    uint256 public s_yieldReserves; // Tracks available yield funds
    uint256 public s_totalStaked; // Total amount staked across all users
    uint256 public s_totalYieldPaid; // Total yield paid out (for analytics)

    // Contract state
    bool public s_stakingPaused;

    // --- Events ---
    event Staked(address indexed user, uint256 amount, uint256 newBalance);
    event Unstaked(address indexed user, uint256 amount, uint256 newBalance, uint256 yieldPaid);
    event YieldClaimed(address indexed user, uint256 yieldAmount);
    event YieldRateUpdated(uint256 oldRate, uint256 newRate);
    event AgentAuthorized(address indexed agentAddress);
    event AgentRevoked(address indexed agentAddress);
    event YieldReservesDeposited(address indexed depositor, uint256 amount);
    event YieldReservesWithdrawn(address indexed withdrawer, uint256 amount);
    event StakingPausedUpdated(bool paused);

    // --- Modifiers ---
    modifier onlyWhenNotPaused() {
        if (s_stakingPaused) revert SagefiStaking__ContractNotConfigured();
        _;
    }

    modifier onlyAuthorizedAgent() {
        if (!s_authorizedAgents[msg.sender]) revert SagefiStaking__UnauthorizedAgent();
        _;
    }

    modifier onlyWhenConfigured() {
        if (!s_isYieldRateConfigured) revert SagefiStaking__ContractNotConfigured();
        _;
    }

    // --- Constructor ---
    constructor(address _sageToken) Ownable(msg.sender) {
        if (_sageToken == address(0)) revert SagefiStaking__ZeroAddress();
        
        sageToken = IERC20(_sageToken);
        s_isYieldRateConfigured = false;
        s_stakingPaused = false;
    }

    // --- External Functions ---

    /**
     * @notice Allows users to stake their tokens.
     * @param _amount The amount of tokens to stake.
     */
    function stake(uint256 _amount) external nonReentrant onlyWhenNotPaused onlyWhenConfigured {
        if (_amount == 0) revert SagefiStaking__ZeroAmount();
        if (s_stakedBalances[msg.sender] + _amount > MAX_STAKE_PER_USER) {
            revert SagefiStaking__MaxStakeExceeded();
        }

        // Transfer tokens from sender to this contract
        sageToken.transferFrom(msg.sender, address(this), _amount);

        // Calculate and update pending yield before updating balance
        _updateYield(msg.sender);

        s_stakedBalances[msg.sender] += _amount;
        s_totalStaked += _amount;
        s_lastStakeUpdate[msg.sender] = block.timestamp;

        emit Staked(msg.sender, _amount, s_stakedBalances[msg.sender]);
    }

    /**
     * @notice Allows an authorized agent (e.g., CrossChainManager) to stake tokens on behalf of a user.
     * @param _forUser The address of the user who is actually staking.
     * @param _amount The amount of tokens to stake.
     */
    function stakeForUser(address _forUser, uint256 _amount) 
        external 
        nonReentrant 
        onlyAuthorizedAgent 
        onlyWhenNotPaused 
        onlyWhenConfigured 
    {
        if (_amount == 0) revert SagefiStaking__ZeroAmount();
        if (_forUser == address(0)) revert SagefiStaking__ZeroAddress();
        if (s_stakedBalances[_forUser] + _amount > MAX_STAKE_PER_USER) {
            revert SagefiStaking__MaxStakeExceeded();
        }

        // The agent contract should have approved this contract to pull tokens
        sageToken.transferFrom(msg.sender, address(this), _amount);

        _updateYield(_forUser);

        s_stakedBalances[_forUser] += _amount;
        s_totalStaked += _amount;
        s_lastStakeUpdate[_forUser] = block.timestamp;

        emit Staked(_forUser, _amount, s_stakedBalances[_forUser]);
    }

    /**
     * @notice Allows users to unstake their tokens and claim earned yield.
     * @param _amount The amount of tokens to unstake.
     */
    function unstake(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert SagefiStaking__ZeroAmount();
        if (s_stakedBalances[msg.sender] < _amount) revert SagefiStaking__InsufficientStakedAmount();

        // Calculate and update pending yield
        _updateYield(msg.sender);

        // Deduct unstaked amount
        s_stakedBalances[msg.sender] -= _amount;
        s_totalStaked -= _amount;
        s_lastStakeUpdate[msg.sender] = block.timestamp;

        // Transfer unstaked principal
        sageToken.transfer(msg.sender, _amount);

        // Pay out accumulated yield
        uint256 yieldToPay = s_cumulativeYieldEarned[msg.sender];
        s_cumulativeYieldEarned[msg.sender] = 0;

        if (yieldToPay > 0) {
            _payYield(msg.sender, yieldToPay);
        }

        emit Unstaked(msg.sender, _amount, s_stakedBalances[msg.sender], yieldToPay);
    }

    /**
     * @notice Allows users to claim only their earned yield without unstaking principal.
     */
    function claimYield() external nonReentrant {
        _updateYield(msg.sender);

        uint256 yieldToClaim = s_cumulativeYieldEarned[msg.sender];
        if (yieldToClaim == 0) return;

        s_cumulativeYieldEarned[msg.sender] = 0;
        _payYield(msg.sender, yieldToClaim);

        emit YieldClaimed(msg.sender, yieldToClaim);
    }

    // --- Yield Management Functions ---

    /**
     * @notice Allows owner to deposit yield reserves to fund yield payments.
     * @param _amount Amount of SAGE tokens to deposit as yield reserves.
     */
    function depositYieldReserves(uint256 _amount) external onlyOwner {
        if (_amount == 0) revert SagefiStaking__ZeroAmount();

        sageToken.transferFrom(msg.sender, address(this), _amount);
        s_yieldReserves += _amount;

        emit YieldReservesDeposited(msg.sender, _amount);
    }

    /**
     * @notice Allows owner to withdraw excess yield reserves.
     * @param _amount Amount to withdraw from yield reserves.
     */
    function withdrawYieldReserves(uint256 _amount) external onlyOwner {
        if (_amount == 0) revert SagefiStaking__ZeroAmount();
        if (_amount > s_yieldReserves) revert SagefiStaking__InsufficientYieldReserves();

        s_yieldReserves -= _amount;
        sageToken.transfer(owner(), _amount);

        emit YieldReservesWithdrawn(msg.sender, _amount);
    }

    // --- View Functions ---

    /**
     * @notice Returns a user's current staked balance.
     */
    function getStakedBalance(address _user) external view returns (uint256) {
        return s_stakedBalances[_user];
    }

    /**
     * @notice Returns total amount staked across all users.
     */
    function getTotalStaked() external view returns (uint256) {
        return s_totalStaked;
    }

    /**
     * @notice Returns available yield reserves.
     */
    function getYieldReserves() external view returns (uint256) {
        return s_yieldReserves;
    }

    /**
     * @notice Returns total yield paid out historically.
     */
    function getTotalYieldPaid() external view returns (uint256) {
        return s_totalYieldPaid;
    }

    /**
     * @notice Checks if contract is properly configured for operation.
     */
    function isConfigured() external view returns (bool) {
        return s_isYieldRateConfigured && !s_stakingPaused;
    }

    /**
     * @notice Calculates the pending yield for a user.
     */
    function calculatePendingYield(address _user) public view returns (uint256) {
        if (s_stakedBalances[_user] == 0) return s_cumulativeYieldEarned[_user];

        uint256 timeStaked = block.timestamp - s_lastStakeUpdate[_user];
        if (timeStaked == 0) return s_cumulativeYieldEarned[_user];

        uint256 currentYield = (s_stakedBalances[_user] * s_yieldRatePerYear * timeStaked) / 
                              (BASIS_POINTS * SECONDS_PER_YEAR);

        return s_cumulativeYieldEarned[_user] + currentYield;
    }

    /**
     * @notice Estimates total pending yield across all users (for reserve planning).
     */
    function estimateTotalPendingYield() external view returns (uint256) {
        // This is a simplified estimation - in practice, you'd need to iterate through active stakers
        // or maintain a more sophisticated tracking system
        uint256 averageStakeTime = 30 days; // Assume average 30-day stake period
        return (s_totalStaked * s_yieldRatePerYear * averageStakeTime) / (BASIS_POINTS * SECONDS_PER_YEAR);
    }

    // --- Internal Functions ---

    /**
     * @notice Internal function to update a user's cumulative yield.
     */
    function _updateYield(address _user) internal {
        uint256 pendingYield = calculatePendingYield(_user);
        s_cumulativeYieldEarned[_user] = pendingYield;
        s_lastStakeUpdate[_user] = block.timestamp;
    }

    /**
     * @notice Internal function to pay yield from reserves.
     */
    function _payYield(address _to, uint256 _amount) internal {
        if (_amount > s_yieldReserves) revert SagefiStaking__InsufficientYieldReserves();
        
        s_yieldReserves -= _amount;
        s_totalYieldPaid += _amount;
        sageToken.transfer(_to, _amount);
    }

    // --- Owner Functions ---

    /**
     * @notice Sets or updates the annual yield rate.
     * @param _rateInBasisPoints The annual yield rate in basis points (e.g., 500 for 5%).
     */
    function setYieldRate(uint256 _rateInBasisPoints) external onlyOwner {
        if (_rateInBasisPoints == 0 || _rateInBasisPoints > MAX_YIELD_RATE) {
            revert SagefiStaking__InvalidYieldRate();
        }

        uint256 oldRate = s_yieldRatePerYear;
        s_yieldRatePerYear = _rateInBasisPoints;
        s_isYieldRateConfigured = true;

        emit YieldRateUpdated(oldRate, _rateInBasisPoints);
    }

    /**
     * @notice Authorizes an agent address (e.g., CrossChainManager).
     */
    function authorizeAgent(address _agentAddress) external onlyOwner {
        if (_agentAddress == address(0)) revert SagefiStaking__InvalidAgentAddress();
        
        s_authorizedAgents[_agentAddress] = true;
        emit AgentAuthorized(_agentAddress);
    }

    /**
     * @notice Revokes authorization for an agent address.
     */
    function revokeAgent(address _agentAddress) external onlyOwner {
        s_authorizedAgents[_agentAddress] = false;
        emit AgentRevoked(_agentAddress);
    }

    /**
     * @notice Pauses or unpauses staking operations.
     */
    function setStakingPaused(bool _paused) external onlyOwner {
        s_stakingPaused = _paused;
        emit StakingPausedUpdated(_paused);
    }

    /**
     * @notice Emergency function to withdraw foreign tokens (not SAGE).
     */
    function emergencyWithdrawForeignToken(address _token, uint256 _amount) external onlyOwner {
        if (_token == address(sageToken)) revert SagefiStaking__CannotWithdrawStakingToken();
        
        IERC20(_token).transfer(owner(), _amount);
    }

    /**
     * @notice Emergency function to withdraw native ETH.
     */
    function emergencyWithdrawNative() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}