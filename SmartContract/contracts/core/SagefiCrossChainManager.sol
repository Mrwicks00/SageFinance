// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "./SageFiStakingContract.sol";

error SagefiCrossChainManager__ZeroAddress();
error SagefiCrossChainManager__InvalidRouter();
error SagefiCrossChainManager__InvalidToken();
error SagefiCrossChainManager__InsufficientFee();
error SagefiCrossChainManager__ZeroAmount();
error SagefiCrossChainManager__StakingContractNotSet();
error SagefiCrossChainManager__InvalidReceiverType();
error SagefiCrossChainManager__NoTokensReceived();
error SagefiCrossChainManager__IncorrectTokenReceived();
error SagefiCrossChainManager__StakingFailed();
error SagefiCrossChainManager__InvalidChainSelector();
error SagefiCrossChainManager__RateLimitExceeded();
error SagefiCrossChainManager__ContractPaused();
error SagefiCrossChainManager__InvalidGasLimit();

contract SagefiCrossChainManager is Ownable, ReentrancyGuard, CCIPReceiver {
    using Client for Client.EVM2AnyMessage;

    // --- Constants ---
    uint256 public constant MIN_GAS_LIMIT = 200_000;
    uint256 public constant MAX_GAS_LIMIT = 2_000_000;
    uint256 public constant DEFAULT_GAS_LIMIT = 300_000;

    // --- State Variables ---
    IRouterClient public ccipRouter;
    IERC20 public immutable i_sageToken;
    SagefiStakingContract public s_sagefiStakingContract;

    // Contract configuration
    bool public s_isStakingContractSet;
    bool public s_contractPaused;
    uint256 public s_gasLimit;

    // Chain validation and cross-chain manager tracking
    mapping(uint64 => bool) public supportedChains;
    mapping(uint64 => address) public crossChainManagers;

    // Rate limiting
    uint256 public s_rateLimitAmount; // Configurable rate limit
    uint256 public s_rateLimitWindow; // Configurable time window
    mapping(address => uint256) public lastTransferTimestamp;
    mapping(address => uint256) public transferAmountInWindow;

    // Statistics
    uint256 public totalCrossChainStakes;
    uint256 public totalCrossChainVolume;
    mapping(uint64 => uint256) public chainStakeCount;

    // --- Events ---
    event CrossChainStakingInitiated(
        address indexed sender,
        uint256 amount,
        uint64 indexed destinationChainSelector,
        bytes32 indexed messageId,
        address originalRecipient
    );
    event CrossChainStakingExecuted(
        bytes32 indexed messageId,
        address indexed user,
        uint256 amount,
        uint64 indexed sourceChainSelector
    );
    event SagefiStakingContractUpdated(address indexed oldContract, address indexed newContract);
    event SupportedChainUpdated(uint64 indexed chainSelector, bool indexed supported);
    event CrossChainManagerUpdated(uint64 indexed chainSelector, address indexed managerAddress);
    event RateLimitUpdated(uint256 newAmount, uint256 newWindow);
    event GasLimitUpdated(uint256 oldLimit, uint256 newLimit);
    event ContractPausedUpdated(bool paused);

    // --- Modifiers ---
    modifier onlyWhenNotPaused() {
        if (s_contractPaused) revert SagefiCrossChainManager__ContractPaused();
        _;
    }

    modifier onlyWhenStakingSet() {
        if (!s_isStakingContractSet || address(s_sagefiStakingContract) == address(0)) {
            revert SagefiCrossChainManager__StakingContractNotSet();
        }
        _;
    }

    // --- Constructor ---
    constructor(
        address _ccipRouter, 
        address _sageToken,
        uint256 _initialRateLimitAmount,
        uint256 _initialRateLimitWindow
    ) CCIPReceiver(_ccipRouter) Ownable(msg.sender) {
        if (_ccipRouter == address(0)) revert SagefiCrossChainManager__InvalidRouter();
        if (_sageToken == address(0)) revert SagefiCrossChainManager__InvalidToken();

        ccipRouter = IRouterClient(_ccipRouter);
        i_sageToken = IERC20(_sageToken);
        s_isStakingContractSet = false;
        s_contractPaused = false;
        s_gasLimit = DEFAULT_GAS_LIMIT;

        // Set initial rate limiting
        s_rateLimitAmount = _initialRateLimitAmount;
        s_rateLimitWindow = _initialRateLimitWindow;
    }

    // --- External Functions ---

    /**
     * @notice Transfer tokens cross-chain and stake them on destination.
     */
    function transferAndStakeCrossChain(
        uint256 _amount,
        uint64 _destinationChainSelector,
        address _receiverOnDest
    ) external payable nonReentrant onlyWhenNotPaused returns (bytes32) {
        if (_amount == 0) revert SagefiCrossChainManager__ZeroAmount();
        
        // Validate supported chain
        if (!supportedChains[_destinationChainSelector]) {
            revert SagefiCrossChainManager__InvalidChainSelector();
        }
        
        // Validate receiver address
        address expectedReceiver = crossChainManagers[_destinationChainSelector];
        if (expectedReceiver != address(0) && _receiverOnDest != expectedReceiver) {
            revert SagefiCrossChainManager__InvalidReceiverType();
        }
        if (_receiverOnDest == address(0)) revert SagefiCrossChainManager__ZeroAddress();

        // Rate limiting check
        _checkRateLimit(msg.sender, _amount);

        // Transfer tokens from user to this contract
        i_sageToken.transferFrom(msg.sender, address(this), _amount);
        i_sageToken.approve(address(ccipRouter), _amount);

        // Prepare CCIP message
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_sageToken),
            amount: _amount
        });

        bytes memory data = abi.encode(msg.sender);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiverOnDest),
            data: data,
            tokenAmounts: tokenAmounts,
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: s_gasLimit})
            )
        });

        // Calculate and check fee
        uint256 fee = ccipRouter.getFee(_destinationChainSelector, message);
        if (msg.value < fee) revert SagefiCrossChainManager__InsufficientFee();

        // Send CCIP message
        bytes32 messageId = ccipRouter.ccipSend{value: fee}(
            _destinationChainSelector,
            message
        );

        // Refund excess ETH
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        // Update statistics
        totalCrossChainStakes++;
        totalCrossChainVolume += _amount;
        chainStakeCount[_destinationChainSelector]++;

        emit CrossChainStakingInitiated(
            msg.sender,
            _amount,
            _destinationChainSelector,
            messageId,
            msg.sender
        );
        return messageId;
    }

    /**
     * @notice Get the fee required for cross-chain staking.
     */
    function getStakingFee(
        uint256 amount,
        uint64 destinationChainSelector,
        address receiverOnDest
    ) external view returns (uint256) {
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_sageToken),
            amount: amount
        });

        bytes memory data = abi.encode(msg.sender);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverOnDest),
            data: data,
            tokenAmounts: tokenAmounts,
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: s_gasLimit})
            )
        });

        return ccipRouter.getFee(destinationChainSelector, message);
    }

    // --- Internal Functions ---

    /**
     * @notice Handle incoming CCIP messages and execute staking.
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        // Validate source chain
        if (!supportedChains[message.sourceChainSelector]) {
            revert SagefiCrossChainManager__InvalidChainSelector();
        }

        // Ensure staking contract is set
        if (!s_isStakingContractSet || address(s_sagefiStakingContract) == address(0)) {
            revert SagefiCrossChainManager__StakingContractNotSet();
        }

        // Validate token transfer
        if (message.destTokenAmounts.length == 0) {
            revert SagefiCrossChainManager__NoTokensReceived();
        }
        if (message.destTokenAmounts[0].token != address(i_sageToken)) {
            revert SagefiCrossChainManager__IncorrectTokenReceived();
        }

        uint256 receivedAmount = message.destTokenAmounts[0].amount;
        address originalUser = abi.decode(message.data, (address));

        if (originalUser == address(0)) revert SagefiCrossChainManager__ZeroAddress();

        // Approve staking contract and execute stake
        i_sageToken.approve(address(s_sagefiStakingContract), receivedAmount);

        try s_sagefiStakingContract.stakeForUser(originalUser, receivedAmount) {
            emit CrossChainStakingExecuted(
                message.messageId,
                originalUser,
                receivedAmount,
                message.sourceChainSelector
            );
        } catch {
            revert SagefiCrossChainManager__StakingFailed();
        }
    }

    /**
     * @notice Rate limiting check with configurable parameters.
     */
    function _checkRateLimit(address user, uint256 amount) internal {
        if (s_rateLimitAmount == 0) return; // Rate limiting disabled

        uint256 currentTime = block.timestamp;

        if (currentTime < lastTransferTimestamp[user] + s_rateLimitWindow) {
            transferAmountInWindow[user] += amount;
            if (transferAmountInWindow[user] > s_rateLimitAmount) {
                revert SagefiCrossChainManager__RateLimitExceeded();
            }
        } else {
            transferAmountInWindow[user] = amount;
            lastTransferTimestamp[user] = currentTime;
        }
    }

    // --- Owner Functions ---

    /**
     * @notice Set or update the staking contract address.
     */
    function setSagefiStakingContract(address payable _stakingContract) external onlyOwner {
        if (_stakingContract == address(0)) revert SagefiCrossChainManager__ZeroAddress();
        
        address oldContract = address(s_sagefiStakingContract);
        s_sagefiStakingContract = SagefiStakingContract(_stakingContract);
        s_isStakingContractSet = true;
        
        emit SagefiStakingContractUpdated(oldContract, _stakingContract);
    }

    /**
     * @notice Update supported chain status.
     */
    function updateSupportedChain(uint64 chainSelector, bool supported) external onlyOwner {
        supportedChains[chainSelector] = supported;
        emit SupportedChainUpdated(chainSelector, supported);
    }

    /**
     * @notice Set cross-chain manager address for a specific chain.
     */
    function setCrossChainManager(uint64 chainSelector, address managerAddress) external onlyOwner {
        if (managerAddress == address(0)) revert SagefiCrossChainManager__ZeroAddress();
        crossChainManagers[chainSelector] = managerAddress;
        emit CrossChainManagerUpdated(chainSelector, managerAddress);
    }

    /**
     * @notice Update rate limiting parameters.
     */
    function updateRateLimit(uint256 newAmount, uint256 newWindow) external onlyOwner {
        s_rateLimitAmount = newAmount;
        s_rateLimitWindow = newWindow;
        emit RateLimitUpdated(newAmount, newWindow);
    }

    /**
     * @notice Update gas limit for CCIP messages.
     */
    function updateGasLimit(uint256 newGasLimit) external onlyOwner {
        if (newGasLimit < MIN_GAS_LIMIT || newGasLimit > MAX_GAS_LIMIT) {
            revert SagefiCrossChainManager__InvalidGasLimit();
        }
        
        uint256 oldLimit = s_gasLimit;
        s_gasLimit = newGasLimit;
        emit GasLimitUpdated(oldLimit, newGasLimit);
    }

    /**
     * @notice Pause or unpause the contract.
     */
    function setContractPaused(bool paused) external onlyOwner {
        s_contractPaused = paused;
        emit ContractPausedUpdated(paused);
    }

    // --- Emergency Functions ---

    /**
     * @notice Emergency withdrawal function (prevents withdrawing SAGE tokens).
     */
    function emergencyWithdraw(IERC20 _token, uint256 _amount) external onlyOwner {
        if (address(_token) == address(i_sageToken)) {
            revert SagefiCrossChainManager__InvalidToken(); // Can't withdraw staking token
        }
        _token.transfer(owner(), _amount);
    }

    /**
     * @notice Withdraw native ETH.
     */
    function withdrawNative() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // --- View Functions ---

    /**
     * @notice Check if a chain is supported.
     */
    function isChainSupported(uint64 chainSelector) external view returns (bool) {
        return supportedChains[chainSelector];
    }

    /**
     * @notice Get cross-chain statistics.
     */
    function getCrossChainStats() external view returns (
        uint256 totalStakes,
        uint256 totalVolume,
        bool isPaused,
        bool isStakingSet
    ) {
        return (
            totalCrossChainStakes,
            totalCrossChainVolume,
            s_contractPaused,
            s_isStakingContractSet
        );
    }

    /**
     * @notice Get rate limit info for a user.
     */
    function getRateLimitInfo(address user) external view returns (
        uint256 currentWindowAmount,
        uint256 lastTransferTime,
        uint256 remainingAmount,
        bool canTransfer
    ) {
        uint256 currentTime = block.timestamp;
        uint256 windowAmount = transferAmountInWindow[user];
        uint256 lastTime = lastTransferTimestamp[user];
        
        // Check if we're in a new window
        if (currentTime >= lastTime + s_rateLimitWindow) {
            windowAmount = 0;
        }
        
        uint256 remaining = s_rateLimitAmount > windowAmount ? s_rateLimitAmount - windowAmount : 0;
        bool canTransfer = s_rateLimitAmount == 0 || remaining > 0;
        
        return (windowAmount, lastTime, remaining, canTransfer);
    }

    /**
     * @notice Get contract configuration.
     */
    function getConfiguration() external view returns (
        uint256 gasLimit,
        uint256 rateLimitAmount,
        uint256 rateLimitWindow,
        address stakingContract
    ) {
        return (
            s_gasLimit,
            s_rateLimitAmount,
            s_rateLimitWindow,
            address(s_sagefiStakingContract)
        );
    }

    // --- Receive Function ---
    receive() external payable {}
}