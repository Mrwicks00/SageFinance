// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// KEEPING YOUR SPECIFIC CHAINLINK IMPORT PATHS
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "./SageFiStakingContract.sol"; // Make sure your file name matches: SagefiStakingContract.sol

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
error SagefiCrossChainManager__AgentAlreadySet();
error SagefiCrossChainManager__UnauthorizedAgent();
error SagefiCrossChainManager__StakingTokenWithdrawAttempt();

contract SagefiCrossChainManager is Ownable, ReentrancyGuard, CCIPReceiver {
    using Client for Client.EVM2AnyMessage;

    IRouterClient public ccipRouter; // Declared here as you prefer
    IERC20 public immutable i_sageToken; // Your custom SageToken

    SagefiStakingContract public s_sagefiStakingContract;
    bool private s_isStakingContractSet;

    address public s_aiAgent;
    bool private s_isAIAgentSet;

    event CrossChainStakingInitiated(
        address indexed sender,
        uint256 amount,
        uint64 indexed destinationChainSelector,
        bytes32 indexed messageId,
        address originalRecipient
    );
    event CrossChainStakingExecuted(
        bytes32 indexed messageId, // CCIP Message ID
        address indexed user,
        uint256 amount,
        uint64 indexed sourceChainSelector
    );
    event AIAgentUpdated(address indexed newAgent);
    event SagefiStakingContractUpdated(address indexed newStakingContract);

    constructor(address _ccipRouter, address _sageToken) CCIPReceiver(_ccipRouter) Ownable(msg.sender) {
        if (_ccipRouter == address(0)) revert SagefiCrossChainManager__InvalidRouter();
        if (_sageToken == address(0)) revert SagefiCrossChainManager__InvalidToken();

        ccipRouter = IRouterClient(_ccipRouter); // Assigned here
        i_sageToken = IERC20(_sageToken);
        s_isStakingContractSet = false;
        s_isAIAgentSet = false;
    }

    function setSagefiStakingContract(address _stakingContract) external onlyOwner {
        if (s_isStakingContractSet) revert SagefiCrossChainManager__StakingContractNotSet();
        if (_stakingContract == address(0)) revert SagefiCrossChainManager__StakingContractNotSet();
        s_sagefiStakingContract = SagefiStakingContract(_stakingContract);
        s_isStakingContractSet = true;
        emit SagefiStakingContractUpdated(_stakingContract);
    }

    function setAIAgent(address _newAgent) external onlyOwner {
        if (s_isAIAgentSet) revert SagefiCrossChainManager__AgentAlreadySet();
        if (_newAgent == address(0)) revert SagefiCrossChainManager__ZeroAddress();
        s_aiAgent = _newAgent;
        s_isAIAgentSet = true;
        emit AIAgentUpdated(_newAgent);
    }

    function transferAndStakeCrossChain(
        uint256 _amount,
        uint64 _destinationChainSelector,
        address _receiverOnDest // Address of SagefiCrossChainManager on destination chain
    ) external payable nonReentrant returns (bytes32) {
        if (_amount == 0) revert SagefiCrossChainManager__ZeroAmount();
        if (_receiverOnDest == address(0)) revert SagefiCrossChainManager__ZeroAddress();

        i_sageToken.transferFrom(msg.sender, address(this), _amount);
        i_sageToken.approve(address(ccipRouter), _amount); // Using ccipRouter as declared by you

        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_sageToken),
            amount: _amount
        });

        bytes memory data = abi.encode(msg.sender); // Pass original sender's address for staking

        // FIX: Only pass gasLimit parameter
        Client.EVMExtraArgsV1 memory extraArgsV1 = Client.EVMExtraArgsV1({gasLimit: 300_000});

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiverOnDest),
            data: data,
            tokenAmounts: tokenAmounts,
            feeToken: address(0), // Pay in native gas
            extraArgs: Client._argsToBytes(extraArgsV1) // Pass the struct directly
        });

        uint256 fee = ccipRouter.getFee(_destinationChainSelector, message); // Using ccipRouter
        if (msg.value < fee) revert SagefiCrossChainManager__InsufficientFee();

        bytes32 messageId = ccipRouter.ccipSend{value: fee}( // Using ccipRouter
            _destinationChainSelector,
            message
        );

        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit CrossChainStakingInitiated(
            msg.sender,
            _amount,
            _destinationChainSelector,
            messageId,
            msg.sender
        );
        return messageId;
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        if (!s_isStakingContractSet || address(s_sagefiStakingContract) == address(0)) {
            revert SagefiCrossChainManager__StakingContractNotSet();
        }

        if (message.destTokenAmounts.length == 0) {
            revert SagefiCrossChainManager__NoTokensReceived();
        }
        if (message.destTokenAmounts[0].token != address(i_sageToken)) {
            revert SagefiCrossChainManager__IncorrectTokenReceived();
        }

        uint256 receivedAmount = message.destTokenAmounts[0].amount;
        
        // FIX: Removed try/catch. Direct decode.
        address originalUser = abi.decode(message.data, (address)); 

        if (originalUser == address(0)) revert SagefiCrossChainManager__ZeroAddress();

        i_sageToken.approve(address(s_sagefiStakingContract), receivedAmount);

        // Keep try/catch for external call to staking contract
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

    function emergencyWithdraw(IERC20 _token, uint256 _amount) external onlyOwner {
        if (address(_token) == address(i_sageToken)) {
            revert SagefiCrossChainManager__StakingTokenWithdrawAttempt();
        }
        _token.transfer(owner(), _amount);
    }

    function withdrawNative() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}