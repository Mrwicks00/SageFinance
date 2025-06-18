// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "../interfaces/IYieldOptimizer.sol";
import "../errors/CrossChainManagerErrors.sol";
import "../structs/CrossChainManagerStructs.sol";

contract CrossChainManager is Ownable, ReentrancyGuard, CCIPReceiver {
    using SafeERC20 for IERC20;

    IRouterClient public ccipRouter;
    IERC20 public stablecoin; // USDC
    address public aiAgent;
    IYieldOptimizer public yieldOptimizer;
    uint256 public defaultStrategyId;
    
    // Add current chain selector as a state variable
    uint64 public currentChainSelector;

    // Chain selectors for supported testnets
    mapping(uint64 => bool) public supportedChains;
    // Rate limiting: max USDC per user per hour
    uint256 public constant RATE_LIMIT_AMOUNT = 10000e6; // 10,000 USDC
    uint256 public constant RATE_LIMIT_WINDOW = 1 hours;
    mapping(address => mapping(uint64 => uint256)) public lastTransferTimestamp;
    mapping(address => mapping(uint64 => uint256)) public transferAmountInWindow;

    // --- EVENTS ---
    event CrossChainTransferInitiated(
        address indexed sender,
        uint256 amount,
        uint64 indexed destinationChainSelector,
        bytes32 indexed messageId
    );
    event CrossChainTransferReceived(
        address indexed receiver,
        uint256 amount,
        uint64 indexed sourceChainSelector
    );
    event CrossChainRebalanceTriggered(
        address indexed user,
        uint256 amount,
        uint64 indexed destinationChainSelector,
        bytes32 indexed messageId
    );
    event CrossChainRebalanceExecuted(
        address indexed user,
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount
    );
    event AIAgentUpdated(address indexed newAgent);
    event DefaultStrategyUpdated(uint256 indexed newStrategyId);
    event SupportedChainUpdated(uint64 indexed chainSelector, bool indexed supported);
    event EmergencyWithdrawal(address indexed token, uint256 amount);
    event NativeWithdrawal(uint256 amount);
    event CurrentChainSelectorUpdated(uint64 indexed newChainSelector);

    constructor(
        address _ccipRouter,
        address _stablecoin,
        address _aiAgent,
        address _yieldOptimizer,
        uint64 _currentChainSelector // Add this parameter
    ) CCIPReceiver(_ccipRouter) Ownable(msg.sender) {
        if (_ccipRouter == address(0)) revert CrossChainManagerErrors.ZeroAddress();
        if (_stablecoin == address(0)) revert CrossChainManagerErrors.ZeroAddress();
        if (_aiAgent == address(0)) revert CrossChainManagerErrors.ZeroAddress();
        if (_yieldOptimizer == address(0)) revert CrossChainManagerErrors.ZeroAddress();

        ccipRouter = IRouterClient(_ccipRouter);
        stablecoin = IERC20(_stablecoin);
        aiAgent = _aiAgent;
        yieldOptimizer = IYieldOptimizer(_yieldOptimizer);
        defaultStrategyId = 0;
        currentChainSelector = _currentChainSelector; // Set the current chain selector

        // Testnet chain selectors
        supportedChains[16015286601757825753] = true; // Sepolia
        supportedChains[3478487238524512106] = true; // Arbitrum Sepolia
        supportedChains[10344971235874465080] = true; // Base Sepolia
    }

    // Cross-chain USDC transfer
    function transferCrossChain(
        uint256 amount,
        uint64 destinationChainSelector,
        address receiver
    ) external payable nonReentrant {
        if (amount == 0) revert CrossChainManagerErrors.ZeroAmount();
        if (!supportedChains[destinationChainSelector])
            revert CrossChainManagerErrors.InvalidChainSelector();
        if (msg.sender != aiAgent && msg.sender != receiver)
            revert CrossChainManagerErrors.UnauthorizedCaller();

        // Rate limiting
        _checkRateLimit(msg.sender, destinationChainSelector, amount);

        // Transfer USDC from user
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        stablecoin.approve(address(ccipRouter), amount);

        // Create token amounts array
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(stablecoin),
            amount: amount
        });

        // Encode receiver data with the current chain selector
        bytes memory data = abi.encode(
            keccak256("deposit"),
            receiver,
            defaultStrategyId,
            amount,
            currentChainSelector // Use the stored current chain selector
        );

        // Create CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)),
            data: data,
            tokenAmounts: tokenAmounts,
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            )
        });

        // Calculate and check fee
        uint256 fee = ccipRouter.getFee(destinationChainSelector, message);
        if (msg.value < fee) revert CrossChainManagerErrors.InsufficientFee();

        // Send message
        bytes32 messageId = ccipRouter.ccipSend{value: fee}(
            destinationChainSelector,
            message
        );

        // Refund excess native token
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit CrossChainTransferInitiated(
            msg.sender,
            amount,
            destinationChainSelector,
            messageId
        );
    }

    // Cross-chain rebalance trigger
    function triggerCrossChainRebalance(
        address user,
        uint256 positionIndex,
        uint256 newStrategyId,
        uint256 amount,
        uint64 destinationChainSelector
    ) external payable nonReentrant {
        if (msg.sender != aiAgent)
            revert CrossChainManagerErrors.UnauthorizedCaller();
        if (!supportedChains[destinationChainSelector])
            revert CrossChainManagerErrors.InvalidChainSelector();

        // Encode rebalance parameters
        bytes memory data = abi.encode(
            keccak256("rebalance"),
            user,
            positionIndex,
            newStrategyId,
            amount,
            currentChainSelector // Use the stored current chain selector
        );

        // Create CCIP message (no tokens, just data)
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 300_000})
            )
        });

        // Calculate and check fee
        uint256 fee = ccipRouter.getFee(destinationChainSelector, message);
        if (msg.value < fee) revert CrossChainManagerErrors.InsufficientFee();

        // Send message
        bytes32 messageId = ccipRouter.ccipSend{value: fee}(
            destinationChainSelector,
            message
        );

        // Refund excess
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit CrossChainRebalanceTriggered(
            user,
            amount,
            destinationChainSelector,
            messageId
        );
    }

    // CCIP receive function
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        uint64 sourceChainSelector = message.sourceChainSelector;
        if (!supportedChains[sourceChainSelector])
            revert CrossChainManagerErrors.InvalidChainSelector();

        // Decode message data
        if (message.data.length > 0) {
            bytes32 messageType = abi.decode(message.data, (bytes32));

            if (messageType == keccak256("rebalance")) {
                // Handle rebalance message
                if (message.data.length >= 32 + 20 + 32 + 32 + 32 + 8) {
                    (
                        bytes32 decodedType,
                        address user,
                        uint256 positionIndex,
                        uint256 newStrategyId,
                        uint256 amount,
                        uint64 originChainSelector
                    ) = abi.decode(
                            message.data,
                            (bytes32, address, uint256, uint256, uint256, uint64)
                        );

                    require(decodedType == messageType, "Invalid message type decoded");

                    yieldOptimizer.rebalance(
                        user,
                        positionIndex,
                        newStrategyId,
                        amount,
                        originChainSelector
                    );
                    emit CrossChainRebalanceExecuted(
                        user,
                        positionIndex,
                        newStrategyId,
                        amount
                    );
                } else {
                    revert CrossChainManagerErrors.MalformedMessageData();
                }
            } else if (messageType == keccak256("deposit")) {
                // Handle deposit message
              // Handle deposit message
                if (message.data.length >= 32 + 20 + 32 + 32 + 8) {
                    (
                        bytes32 decodedType,
                        address receiver,
                        uint256 strategyIdToDeposit,
                        ,  // Skip amountToDeposit since it's unused
                        uint64 originChainSelector
                    ) = abi.decode(
                            message.data,
                            (bytes32, address, uint256, uint256, uint64)
                        );

                    require(decodedType == messageType, "Invalid message type decoded");

                    if (message.destTokenAmounts.length > 0) {
                        uint256 receivedAmount = message.destTokenAmounts[0].amount;

                        stablecoin.approve(address(yieldOptimizer), receivedAmount);
                        yieldOptimizer.deposit(
                            address(stablecoin),
                            strategyIdToDeposit,
                            receivedAmount,
                            originChainSelector
                        );

                        emit CrossChainTransferReceived(
                            receiver,
                            receivedAmount,
                            sourceChainSelector
                        );
                    } else {
                         revert CrossChainManagerErrors.NoTokensReceived();
                    }
                } else {
                    revert CrossChainManagerErrors.MalformedMessageData();
                }
            } else {
                revert CrossChainManagerErrors.UnknownMessageType();
            }
        } else {
            revert CrossChainManagerErrors.MalformedMessageData();
        }
    }

    function __testReceiveCCIPMessage(Client.Any2EVMMessage memory message) external {
        _ccipReceive(message);
    }

    // Internal rate limiting check
    function _checkRateLimit(
        address user,
        uint64 chainSelector,
        uint256 amount
    ) internal {
        uint256 currentTime = block.timestamp;

        if (
            currentTime <
            lastTransferTimestamp[user][chainSelector] + RATE_LIMIT_WINDOW
        ) {
            transferAmountInWindow[user][chainSelector] += amount;
            if (
                transferAmountInWindow[user][chainSelector] > RATE_LIMIT_AMOUNT
            ) {
                revert CrossChainManagerErrors.RateLimitExceeded();
            }
        } else {
            transferAmountInWindow[user][chainSelector] = amount;
            lastTransferTimestamp[user][chainSelector] = currentTime;
        }
    }

    // Get transfer fee
    function getTransferFee(
        uint256 amount,
        uint64 destinationChainSelector,
        address receiver
    ) external view returns (uint256) {
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(stablecoin),
            amount: amount
        });

        bytes memory data = abi.encode(
            keccak256("deposit"),
            receiver,
            defaultStrategyId,
            amount,
            currentChainSelector // Use the stored current chain selector
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)),
            data: data,
            tokenAmounts: tokenAmounts,
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            )
        });

        return ccipRouter.getFee(destinationChainSelector, message);
    }

    // Update current chain selector (owner only)
    function setCurrentChainSelector(uint64 _chainSelector) external onlyOwner {
        currentChainSelector = _chainSelector;
        emit CurrentChainSelectorUpdated(_chainSelector);
    }

    // Update AI agent
    function setAIAgent(address _newAgent) external onlyOwner {
        if (_newAgent == address(0))
            revert CrossChainManagerErrors.ZeroAddress();
        aiAgent = _newAgent;
        emit AIAgentUpdated(_newAgent);
    }

    // Update default strategy
    function setDefaultStrategy(uint256 _strategyId) external onlyOwner {
        if (_strategyId > 1) revert CrossChainManagerErrors.InvalidStrategyId();
        defaultStrategyId = _strategyId;
        emit DefaultStrategyUpdated(_strategyId);
    }

    // Update supported chain
    function updateSupportedChain(
        uint64 chainSelector,
        bool supported
    ) external onlyOwner {
        supportedChains[chainSelector] = supported;
        emit SupportedChainUpdated(chainSelector, supported);
    }

    // Emergency withdraw
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
        emit EmergencyWithdrawal(token, amount);
    }

    // Withdraw native tokens
    function withdrawNative(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
        emit NativeWithdrawal(amount);
    }

    // Receive function for native token deposits
    receive() external payable {}
}