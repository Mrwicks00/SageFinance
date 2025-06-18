// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Custom error definitions
error SagefiStaking__ZeroAmount();
error SagefiStaking__NotStaked();
error SagefiStaking__InsufficientStakedAmount();
error SagefiStaking__YieldCalculationFailed(); // Reusing for generic internal failures
error SagefiStaking__AlreadyConfigured(); // For single-set properties
error SagefiStaking__InvalidYieldRate();
error SagefiStaking__AgentAlreadySet(); // Specific error for agent setup
error SagefiStaking__InvalidAgentAddress(); // Specific error for invalid agent address

contract SagefiStakingContract is Ownable, ReentrancyGuard {
    // --- State Variables ---
    IERC20 public immutable sageToken; // The token users will stake

    // Mapping to store user's staked balance
    mapping(address => uint256) public s_stakedBalances;
    // Mapping to store the timestamp of a user's last staking event (stake or unstake)
    mapping(address => uint256) public s_lastStakeUpdate;
    // Mapping to store the cumulative yield earned by a user at their last update
    mapping(address => uint256) public s_cumulativeYieldEarned;

    // Yield rate configuration (per 10,000 for percentage, e.g., 100 = 1%)
    // This represents the annual percentage yield (APY)
    uint256 public s_yieldRatePerYear; // Basis points (e.g., 500 for 5%)
    bool private s_isYieldRateConfigured; // To ensure yield rate is set only once by owner

    // Address of the authorized agent (MyCrossChainManager)
    address public s_authorizedAgent;
    bool private s_isAgentSet; // To ensure agent address is set only once by owner

    // --- Events ---
    event Staked(address indexed user, uint256 amount, uint256 newBalance);
    event Unstaked(address indexed user, uint256 amount, uint256 newBalance, uint256 yieldPaid);
    event YieldClaimed(address indexed user, uint256 yieldAmount);
    event YieldRateUpdated(uint256 newRate);
    event AgentAuthorized(address indexed agentAddress);

    // --- Constructor ---
    constructor(address _sageToken) Ownable(msg.sender) {
        if (_sageToken == address(0)) {
            revert SagefiStaking__ZeroAmount(); // Using a more general error for invalid address
        }
        sageToken = IERC20(_sageToken);
        s_isYieldRateConfigured = false;
        s_isAgentSet = false;
    }

    // --- External Functions ---

    /**
     * @notice Allows users to stake their tokens.
     * @param _amount The amount of tokens to stake.
     */
    function stake(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert SagefiStaking__ZeroAmount();

        // Transfer tokens from sender to this contract
        sageToken.transferFrom(msg.sender, address(this), _amount);

        // Calculate and update pending yield before updating balance
        _updateYield(msg.sender);

        s_stakedBalances[msg.sender] += _amount;
        s_lastStakeUpdate[msg.sender] = block.timestamp;

        emit Staked(msg.sender, _amount, s_stakedBalances[msg.sender]);
    }

    /**
     * @notice Allows an authorized agent (e.g., MyCrossChainManager) to stake tokens on behalf of a user.
     * This function is intended to be called by a trusted contract that has already received the tokens.
     * @param _forUser The address of the user who is actually staking.
     * @param _amount The amount of tokens to stake.
     */
    function stakeForUser(address _forUser, uint256 _amount) external nonReentrant {
        // Only allow the authorized agent (MyCrossChainManager) to call this function
        if (msg.sender != s_authorizedAgent) {
            revert OwnableUnauthorizedAccount(msg.sender); // Reusing Ownable's error for unauthorized access
        }
        if (_amount == 0) revert SagefiStaking__ZeroAmount();
        if (_forUser == address(0)) revert SagefiStaking__ZeroAmount(); // Invalid user address

        // The agent contract (MyCrossChainManager) should have received the tokens
        // and must have approved this staking contract to pull them.
        sageToken.transferFrom(msg.sender, address(this), _amount); // Pull from the agent (MyCrossChainManager)

        _updateYield(_forUser); // Update yield for the actual user, not the agent

        s_stakedBalances[_forUser] += _amount;
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

        // First, calculate and update pending yield
        _updateYield(msg.sender);

        // Deduct unstaked amount
        s_stakedBalances[msg.sender] -= _amount;
        s_lastStakeUpdate[msg.sender] = block.timestamp; // Update timestamp after unstake

        // Transfer unstaked principal
        sageToken.transfer(msg.sender, _amount);

        // If there's any cumulative yield, transfer it
        uint256 yieldToPay = s_cumulativeYieldEarned[msg.sender];
        s_cumulativeYieldEarned[msg.sender] = 0; // Reset cumulative yield after paying

        if (yieldToPay > 0) {
            // This design assumes the contract holds enough sageToken to pay out yield.
            // In a real scenario, yield might come from external sources or protocol fees.
            // For a simple demo, it's often assumed the contract is adequately funded.
            // Add a check to ensure contract has enough balance to pay yield
            if (sageToken.balanceOf(address(this)) < yieldToPay) {
                // This would indicate a funding issue for yield payouts
                revert SagefiStaking__YieldCalculationFailed(); // Or a more specific error
            }
            sageToken.transfer(msg.sender, yieldToPay);
            emit YieldClaimed(msg.sender, yieldToPay);
        }

        emit Unstaked(msg.sender, _amount, s_stakedBalances[msg.sender], yieldToPay);
    }

    /**
     * @notice Allows users to claim only their earned yield without unstaking principal.
     */
    function claimYield() external nonReentrant {
        // Calculate and update pending yield
        _updateYield(msg.sender);

        uint256 yieldToClaim = s_cumulativeYieldEarned[msg.sender];
        if (yieldToClaim == 0) return; // Nothing to claim

        s_cumulativeYieldEarned[msg.sender] = 0; // Reset after claiming

        // Add a check to ensure contract has enough balance to pay yield
        if (sageToken.balanceOf(address(this)) < yieldToClaim) {
            revert SagefiStaking__YieldCalculationFailed(); // Or a more specific error
        }
        sageToken.transfer(msg.sender, yieldToClaim);
        emit YieldClaimed(msg.sender, yieldToClaim);
    }

    // --- View Functions ---

    /**
     * @notice Returns a user's current staked balance.
     * @param _user The address of the user.
     * @return The staked balance.
     */
    function getStakedBalance(address _user) external view returns (uint256) {
        return s_stakedBalances[_user];
    }

    /**
     * @notice Calculates the pending yield for a user based on their staked balance and time.
     * @param _user The address of the user.
     * @return The pending yield amount.
     */
    function calculatePendingYield(address _user) public view returns (uint256) {
        if (s_stakedBalances[_user] == 0) return 0;

        uint256 timeStaked = block.timestamp - s_lastStakeUpdate[_user];
        if (timeStaked == 0) return s_cumulativeYieldEarned[_user]; // No new yield, return current cumulative

        // Annualized yield calculation:
        // (stakedAmount * yieldRatePerYear * timeStaked) / (10000 * 1 year in seconds)
        uint256 secondsPerYear = 365 days;

        // The result will be in the same token units as the stakedAmount
        uint256 currentYield = (s_stakedBalances[_user] * s_yieldRatePerYear * timeStaked) / (10000 * secondsPerYear);

        return s_cumulativeYieldEarned[_user] + currentYield;
    }

    // --- Internal/Private Functions ---

    /**
     * @notice Internal function to update a user's cumulative yield based on time elapsed.
     * @param _user The address of the user.
     */
    function _updateYield(address _user) internal {
        uint256 pendingYield = calculatePendingYield(_user);
        s_cumulativeYieldEarned[_user] = pendingYield;
        s_lastStakeUpdate[_user] = block.timestamp;
    }

    // --- Owner Functions ---

    /**
     * @notice Sets the annual yield rate for the staking contract.
     * Can only be called once by the owner.
     * @param _rateInBasisPoints The annual yield rate in basis points (e.g., 500 for 5%).
     */
    function setYieldRate(uint256 _rateInBasisPoints) external onlyOwner {
        if (s_isYieldRateConfigured) revert SagefiStaking__AlreadyConfigured();
        if (_rateInBasisPoints == 0) revert SagefiStaking__InvalidYieldRate();

        s_yieldRatePerYear = _rateInBasisPoints;
        s_isYieldRateConfigured = true;
        emit YieldRateUpdated(_rateInBasisPoints);
    }

    /**
     * @notice Sets the address of the authorized agent (e.g., MyCrossChainManager).
     * This agent will be allowed to call `stakeForUser`. Can only be called once by the owner.
     * @param _agentAddress The address of the authorized agent contract.
     */
    function setAuthorizedAgent(address _agentAddress) external onlyOwner {
        if (s_isAgentSet) revert SagefiStaking__AgentAlreadySet();
        if (_agentAddress == address(0)) revert SagefiStaking__InvalidAgentAddress();

        s_authorizedAgent = _agentAddress;
        s_isAgentSet = true;
        emit AgentAuthorized(_agentAddress);
    }

    /**
     * @notice Allows owner to withdraw any accidentally sent tokens that are not the staking token.
     * @param _token The address of the token to withdraw.
     * @param _amount The amount to withdraw.
     */
    function emergencyWithdrawForeignToken(address _token, uint256 _amount) external onlyOwner {
        if (_token == address(sageToken)) {
            // Prevent withdrawing the actual staking token accidentally
            revert SagefiStaking__YieldCalculationFailed(); // Reusing error
        }
        IERC20(_token).transfer(owner(), _amount);
    }
}