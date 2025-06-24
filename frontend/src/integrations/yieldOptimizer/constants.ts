// src/integrations/yieldOptimizer/constants.ts
import { Abi } from 'viem';

// Full ABI for the YieldOptimizer contract (paste your full ABI here)
export const YIELD_OPTIMIZER_ABI = [
    // Your entire ABI array goes here.
    // I'm putting a placeholder, but you should replace this with the full ABI you provided.
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "_ethUsdPriceFeed",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_usdcUsdPriceFeed",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_defaultStablecoinAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_defaultWethAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_aiAgent",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_aaveLendingPool",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_compoundComet",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_vrfCoordinator",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_vrfSubscriptionId",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "_keyHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint32",
            "name": "_initialCallbackGasLimit",
            "type": "uint32"
          },
          {
            "internalType": "address",
            "name": "_sageTokenAddress",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "EnforcedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InsufficientParticipants",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InsufficientRewardFunds",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidPriceFeed",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidSlippage",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidStrategy",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidVRFRequest",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "have",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "want",
            "type": "address"
          }
        ],
        "name": "OnlyCoordinatorCanFulfill",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "have",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "coordinator",
            "type": "address"
          }
        ],
        "name": "OnlyOwnerOrCoordinator",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "OperationInProgress",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "PriceManipulationDetected",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "RebalanceNotNeeded",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "RewardDrawNotReady",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "SafeERC20FailedOperation",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "UnauthorizedCaller",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "UnsupportedDepositToken",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAmount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "newAgent",
            "type": "address"
          }
        ],
        "name": "AIAgentUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newAmount",
            "type": "uint256"
          }
        ],
        "name": "BaseRewardAmountUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "vrfCoordinator",
            "type": "address"
          }
        ],
        "name": "CoordinatorSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Deposited",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newAmount",
            "type": "uint256"
          }
        ],
        "name": "MultiChainBonusAmountUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferRequested",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "PositionsConsolidated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "fromStrategy",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "toStrategy",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "Rebalanced",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address[]",
            "name": "winners",
            "type": "address[]"
          },
          {
            "indexed": false,
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "name": "RewardDrawFulfilled",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "caller",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalParticipants",
            "type": "uint256"
          }
        ],
        "name": "RewardDrawRequested",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "stablecoinAddress",
            "type": "address"
          }
        ],
        "name": "StrategyStablecoinUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "wethAddress",
            "type": "address"
          }
        ],
        "name": "StrategyWethUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isSupported",
            "type": "bool"
          }
        ],
        "name": "SupportedStrategyTokenUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint64",
            "name": "chainSelector",
            "type": "uint64"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "interactionType",
            "type": "uint256"
          }
        ],
        "name": "UserInteraction",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint32",
            "name": "newLimit",
            "type": "uint32"
          }
        ],
        "name": "VrfCallbackGasLimitUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Withdrawn",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "MAX_POSITIONS_PER_USER",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "NUM_WORDS",
        "outputs": [
          {
            "internalType": "uint32",
            "name": "",
            "type": "uint32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "PRICE_STALENESS_THRESHOLD",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "REQUEST_CONFIRMATIONS",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "REWARD_DRAW_INTERVAL",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "WINNER_COUNT",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "aaveLendingPool",
        "outputs": [
          {
            "internalType": "contract IAaveLendingPool",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "adjustableVrfCallbackGasLimit",
        "outputs": [
          {
            "internalType": "uint32",
            "name": "",
            "type": "uint32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "aiAgent",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "baseRewardAmount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "compoundComet",
        "outputs": [
          {
            "internalType": "contract ICompoundV3Comet",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "consolidateMyPositions",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "defaultStablecoin",
        "outputs": [
          {
            "internalType": "contract IERC20WithDecimals",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "defaultWeth",
        "outputs": [
          {
            "internalType": "contract IERC20WithDecimals",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_depositTokenAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "_chainSelector",
            "type": "uint64"
          },
          {
            "internalType": "address",
            "name": "_forUser",
            "type": "address"
          }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "emergencyWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "ethUsdPriceFeed",
        "outputs": [
          {
            "internalType": "contract AggregatorV3Interface",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getLatestPrice",
        "outputs": [
          {
            "internalType": "int256",
            "name": "",
            "type": "int256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getUserBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "users",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "newStrategyId",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "_chainSelector",
            "type": "uint64"
          }
        ],
        "name": "globalRebalance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "i_sageToken",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "lastGlobalRebalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "lastPriceUpdate",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "lastRewardDrawTime",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "lastValidPrice",
        "outputs": [
          {
            "internalType": "int256",
            "name": "",
            "type": "int256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "maxSlippageBPS",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "multiChainBonusAmount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paused",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "priceDeviationThreshold",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "randomWords",
            "type": "uint256[]"
          }
        ],
        "name": "rawFulfillRandomWords",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "positionIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "newStrategyId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "_chainSelector",
            "type": "uint64"
          }
        ],
        "name": "rebalance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "positionIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "newStrategyId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "int256",
            "name": "priceThreshold",
            "type": "int256"
          },
          {
            "internalType": "bool",
            "name": "isPriceAboveThreshold",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "_chainSelector",
            "type": "uint64"
          }
        ],
        "name": "rebalanceIfPriceThreshold",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rebalanceInterval",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "requestRewardDraw",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "s_vrfCoordinator",
        "outputs": [
          {
            "internalType": "contract IVRFCoordinatorV2Plus",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_newAgent",
            "type": "address"
          }
        ],
        "name": "setAIAgent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_newAmount",
            "type": "uint256"
          }
        ],
        "name": "setBaseRewardAmount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_vrfCoordinator",
            "type": "address"
          }
        ],
        "name": "setCoordinator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_maxSlippageBPS",
            "type": "uint256"
          }
        ],
        "name": "setMaxSlippage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_newAmount",
            "type": "uint256"
          }
        ],
        "name": "setMultiChainBonusAmount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_strategyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_stablecoinAddress",
            "type": "address"
          }
        ],
        "name": "setStrategyPrimaryStablecoin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_strategyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_wethAddress",
            "type": "address"
          }
        ],
        "name": "setStrategyPrimaryWeth",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_strategyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_tokenAddress",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "_isSupported",
            "type": "bool"
          }
        ],
        "name": "setSupportedStrategyToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint32",
            "name": "_newLimit",
            "type": "uint32"
          }
        ],
        "name": "setVrfCallbackGasLimit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "strategies",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "protocol",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "pool",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "receiptToken",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "strategyPrimaryStablecoins",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "strategyPrimaryWeths",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "supportedStrategyDepositTokens",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "usdcUsdPriceFeed",
        "outputs": [
          {
            "internalType": "contract AggregatorV3Interface",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "userChainInteractionCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "",
            "type": "uint64"
          }
        ],
        "name": "userInteractedOnChain",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "userLastRebalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "userPositions",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastUpdated",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastRebalanced",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "userTotalInteractions",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "vrfKeyHash",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "vrfRequests",
        "outputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "fulfilled",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "vrfSubscriptionId",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "positionIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "_chainSelector",
            "type": "uint64"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
] as const;


export const YIELD_OPTIMIZER_ADDRESSES: Record<number, `0x${string}`> = {
  11155111: "0x543aeA3ad17fE0a4cfc8546f958d15BB2828e68B", // Sepolia
  84532: "0x2fE627AD81358FC3a8ccC197869ad347E487c3C0",   // Base Sepolia
  421614: "0xA939e5f884f46a281Eac2c438a7337b890644b8C",   // Arbitrum Sepolia
};

// Addresses of supported tokens on various chains
export const TOKEN_ADDRESSES_MAP: Record<string, Record<number, `0x${string}`>> = {
  USDC: {
    11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",   // Base Sepolia
    421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"   // Arbitrum Sepolia
  },
  LINK: {
    11155111: "0xf8Fb3713D459D7C1018BD0A49D19b4C4C290EBE5" // Sepolia only
  }
};

// Addresses of external protocol contracts (Aave Lending Pool, Compound Comet)
export const EXTERNAL_PROTOCOL_ADDRESSES: Record<string, Record<number, `0x${string}`>> = {
  AAVE_POOL: {
    11155111: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Sepolia
    84532: "0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27" // Base Sepolia (though Aave USDC is not supported in yieldData for Base Sepolia)
  },
  COMPOUND_COMET: {
    11155111: "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e", // Sepolia
    84532: "0x571621Ce60Cebb0c1D442B5afb38B1663C6Bf017" // Base Sepolia
  }
};

// Alternative approach - define all as strings then convert to BigInt
export const CHAINLINK_CHAIN_SELECTORS: Record<number, bigint> = {
  11155111: BigInt("16015286601757825753"), // Sepolia
  84532: BigInt("10344971235874465080"),   // Base Sepolia
  421614: BigInt("3478487238524512106"),   // Arbitrum Sepolia
};

// Mapping for strategy IDs
// IMPORTANT: These values are derived from your provided script's comments
// "0: Aave, 1: Compound, 2: Uniswap"
export const STRATEGY_IDS: Record<string, number> = {
  AAVE: 0,
  COMPOUND: 1,
  UNISWAP: 2, // Included for completeness, though not currently used in your POOL_DATA
};