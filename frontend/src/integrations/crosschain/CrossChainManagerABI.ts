// src/integrations/crossChain/CrossChainManagerABI.ts

// This is the clean, formatted ABI for your CrossChainManager contract.
// It is explicitly typed with 'as const' for Wagmi/Viem type inference.
export const CrossChainManagerABI = [
    // Constructor
    {
        "inputs": [
            {"internalType": "address", "name": "_ccipRouter", "type": "address"},
            {"internalType": "address", "name": "_stablecoin", "type": "address"},
            {"internalType": "address", "name": "_aiAgent", "type": "address"},
            {"internalType": "address", "name": "_yieldOptimizer", "type": "address"},
            {"internalType": "uint64", "name": "_currentChainSelector", "type": "uint64"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },

    // Custom Errors
    {"inputs": [], "name": "InsufficientFee", "type": "error"},
    {"inputs": [], "name": "InvalidChainSelector", "type": "error"},
    {"inputs": [{"internalType": "address", "name": "router", "type": "address"}], "name": "InvalidRouter", "type": "error"},
    {"inputs": [], "name": "InvalidStrategyId", "type": "error"},
    {"inputs": [], "name": "MalformedMessageData", "type": "error"},
    {"inputs": [], "name": "NoTokensReceived", "type": "error"},
    {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "OwnableInvalidOwner", "type": "error"},
    {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "OwnableUnauthorizedAccount", "type": "error"},
    {"inputs": [], "name": "RateLimitExceeded", "type": "error"},
    {"inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error"},
    {"inputs": [{"internalType": "address", "name": "token", "type": "address"}], "name": "SafeERC20FailedOperation", "type": "error"},
    {"inputs": [], "name": "UnauthorizedCaller", "type": "error"},
    {"inputs": [], "name": "UnknownMessageType", "type": "error"},
    {"inputs": [], "name": "ZeroAddress", "type": "error"},
    {"inputs": [], "name": "ZeroAmount", "type": "error"},

    // Events
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "newAgent", "type": "address"}], "name": "AIAgentUpdated", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint64", "name": "chainSelector", "type": "uint64"}, {"indexed": true, "internalType": "address", "name": "managerAddress", "type": "address"}], "name": "CrossChainManagerUpdated", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "user", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "positionIndex", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "newStrategyId", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "CrossChainRebalanceExecuted", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "user", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}, {"indexed": true, "internalType": "uint64", "name": "destinationChainSelector", "type": "uint64"}, {"indexed": true, "internalType": "bytes32", "name": "messageId", "type": "bytes32"}], "name": "CrossChainRebalanceTriggered", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "sender", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}, {"indexed": true, "internalType": "uint64", "name": "destinationChainSelector", "type": "uint64"}, {"indexed": true, "internalType": "bytes32", "name": "messageId", "type": "bytes32"}], "name": "CrossChainTransferInitiated", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "receiver", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}, {"indexed": true, "internalType": "uint64", "name": "sourceChainSelector", "type": "uint64"}], "name": "CrossChainTransferReceived", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint64", "name": "newChainSelector", "type": "uint64"}], "name": "CurrentChainSelectorUpdated", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "newStrategyId", "type": "uint256"}], "name": "DefaultStrategyUpdated", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "token", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "EmergencyWithdrawal", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "NativeWithdrawal", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}], "name": "OwnershipTransferred", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint64", "name": "chainSelector", "type": "uint64"}, {"indexed": true, "internalType": "bool", "name": "supported", "type": "bool"}], "name": "SupportedChainUpdated", "type": "event"},

    // View Functions
    {"inputs": [], "name": "RATE_LIMIT_AMOUNT", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "RATE_LIMIT_WINDOW", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "aiAgent", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "ccipRouter", "outputs": [{"internalType": "contract IRouterClient", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint64", "name": "", "type": "uint64"}], "name": "crossChainManagers", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "currentChainSelector", "outputs": [{"internalType": "uint64", "name": "", "type": "uint64"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "defaultStrategyId", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "getRouter", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint64", "name": "destinationChainSelector", "type": "uint64"}, {"internalType": "address", "name": "receiver", "type": "address"}], "name": "getTransferFee", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "", "type": "address"}, {"internalType": "uint64", "name": "", "type": "uint64"}], "name": "lastTransferTimestamp", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "stablecoin", "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint64", "name": "", "type": "uint64"}], "name": "supportedChains", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}], "name": "supportsInterface", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "", "type": "address"}, {"internalType": "uint64", "name": "", "type": "uint64"}], "name": "transferAmountInWindow", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "yieldOptimizer", "outputs": [{"internalType": "contract IYieldOptimizer", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},

    // Write Functions
    {"inputs": [{"components": [{"internalType": "bytes32", "name": "messageId", "type": "bytes32"}, {"internalType": "uint64", "name": "sourceChainSelector", "type": "uint64"}, {"internalType": "bytes", "name": "sender", "type": "bytes"}, {"internalType": "bytes", "name": "data", "type": "bytes"}, {"components": [{"internalType": "address", "name": "token", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "internalType": "struct Client.EVMTokenAmount[]", "name": "destTokenAmounts", "type": "tuple[]"}], "internalType": "struct Client.Any2EVMMessage", "name": "message", "type": "tuple"}], "name": "__testReceiveCCIPMessage", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"components": [{"internalType": "bytes32", "name": "messageId", "type": "bytes32"}, {"internalType": "uint64", "name": "sourceChainSelector", "type": "uint64"}, {"internalType": "bytes", "name": "sender", "type": "bytes"}, {"internalType": "bytes", "name": "data", "type": "bytes"}, {"components": [{"internalType": "address", "name": "token", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "internalType": "struct Client.EVMTokenAmount[]", "name": "destTokenAmounts", "type": "tuple[]"}], "internalType": "struct Client.Any2EVMMessage", "name": "message", "type": "tuple"}], "name": "ccipReceive", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "token", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "_newAgent", "type": "address"}], "name": "setAIAgent", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint64", "name": "chainSelector", "type": "uint64"}, {"internalType": "address", "name": "managerAddress", "type": "address"}], "name": "setCrossChainManager", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint64", "name": "_chainSelector", "type": "uint64"}], "name": "setCurrentChainSelector", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_strategyId", "type": "uint256"}], "name": "setDefaultStrategy", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint64", "name": "destinationChainSelector", "type": "uint64"}, {"internalType": "address", "name": "receiver", "type": "address"}], "name": "transferCrossChain", "outputs": [], "stateMutability": "payable", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "uint256", "name": "positionIndex", "type": "uint256"}, {"internalType": "uint256", "name": "newStrategyId", "type": "uint256"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint64", "name": "destinationChainSelector", "type": "uint64"}], "name": "triggerCrossChainRebalance", "outputs": [], "stateMutability": "payable", "type": "function"},
    {"inputs": [{"internalType": "uint64", "name": "chainSelector", "type": "uint64"}, {"internalType": "bool", "name": "supported", "type": "bool"}], "name": "updateSupportedChain", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "withdrawNative", "outputs": [], "stateMutability": "nonpayable", "type": "function"},

    // Receive function for native token deposits
    {"stateMutability": "payable", "type": "receive"}
] as const;
