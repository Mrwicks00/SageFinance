import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// --- GLOBAL CONFIGURATION ---
const YIELD_OPTIMIZER_CONTRACT_ADDRESS = "0x18F645aAAA77722d8644d9a35b21F1999A3fdEf8"; // Your deployed contract
const SEPOLIA_CHAIN_SELECTOR = 11155111; // Chainlink Chain Selector for Sepolia

// --- CORRECTED TOKEN ADDRESSES (Sepolia) ---
const USDC_TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC on Sepolia (6 decimals)
const LINK_TOKEN_ADDRESS = "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5"; // LINK on Sepolia (18 decimals)

// --- NEW CCIP-Related Constants ---
export const CROSS_CHAIN_MANAGER_CONTRACT_ADDRESS = "0xa4e8a4E9C84D9b8B02095AeE9d4f163744A4d734"; // Sepolia CrossChainManager address
export const BASE_CROSS_CHAIN = "0x79661a34488f91a50Ff99027B905a87E72c7291A"
export const BASE_SEPOLIA_CHAIN_SELECTOR = "10344971235874465080"; // Chainlink Chain Selector for Base Sepolia
export const ARB_SEPOLIA_CHAIN_SELECTOR = "3478487238524512106"
export const SEPOLIA_CHAIN_SELECTOR2 = "16015286601757825753"; // Chainlink Chain Selector for Sepolia
export const USDC_TOKEN_ADDRESS_CCIP = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Sepolia (CCIP-enabled)


// --- STRATEGY IDs ---
const AAVE_STRATEGY_ID = 0;
const COMPOUND_STRATEGY_ID = 1;

// --- GENERIC ABIs (Expanded with all contract functions and events) ---
const YIELD_OPTIMIZER_ABI = [
    // Owner/Admin Functions
    "function owner() view returns (address)",
    "function setVrfCallbackGasLimit(uint32 _newLimit)",
    "function setStrategyPrimaryStablecoin(uint256 _strategyId, address _stablecoinAddress)",
    "function setStrategyPrimaryWeth(uint256 _strategyId, address _wethAddress)", // Renamed from WETH to generic 'WETH' in comment as the contract keeps it
    "function setSupportedStrategyToken(uint256 _strategyId, address _tokenAddress, bool _isSupported)",
    "function setBaseRewardAmount(uint256 _newAmount)",
    "function setMultiChainBonusAmount(uint256 _newAmount)",
    "function setAIAgent(address _newAgent)",
    "function pause()",
    "function unpause()",
    "function emergencyWithdraw(address token, uint256 amount)",
    "function setMaxSlippage(uint256 _maxSlippageBPS)",
    "function requestRewardDraw() returns (uint256 requestId)",

    // Core User Functions
    "function deposit(address _depositTokenAddress, uint256 strategyId, uint256 amount, uint64 _chainSelector, address _forUser)",
    "function withdraw(uint256 positionIndex, uint256 amount, uint64 _chainSelector)",
    "function rebalance(address user, uint256 positionIndex, uint256 newStrategyId, uint256 amount, uint64 _chainSelector)",
    "function rebalanceIfPriceThreshold(uint256 positionIndex, uint256 newStrategyId, uint256 amount, int256 priceThreshold, bool isPriceAboveThreshold, uint64 _chainSelector)",
    "function globalRebalance(address[] calldata users, uint256 newStrategyId, uint64 _chainSelector)",
    "function consolidateMyPositions()",

    // View Functions
    "function userPositions(address, uint256) view returns (uint256 strategyId, uint256 balance, uint256 lastUpdated, uint256 lastRebalanced)",
    "function strategyPrimaryStablecoins(uint256) view returns (address)",
    "function strategyPrimaryWeths(uint256) view returns (address)",
    "function supportedStrategyDepositTokens(uint256, address) view returns (bool)",
    "function getLatestPrice() view returns (int256)",
    "function getUserBalance(address user) view returns (uint256)",
    "function i_sageToken() view returns (address)", // Assuming i_sageToken is public view
    "function baseRewardAmount() view returns (uint256)",
    "function multiChainBonusAmount() view returns (uint256)",
    "function lastRewardDrawTime() view returns (uint256)",
    "function REWARD_DRAW_INTERVAL() view returns (uint256)",
    "function aiAgent() view returns (address)",
    "function _weeklyParticipantsForDraw(uint256) view returns (address)", // To check participants, if needed
    "function crossChainManagers(uint64 chainSelector) external view returns (address);",

    // Events (Added all from your contract, including inherited Pausable ones)
    "event VrfCallbackGasLimitUpdated(uint32 newLimit)",
    "event RewardDrawRequested(address indexed caller, uint256 requestId, uint256 totalParticipants)",
    "event RewardDrawFulfilled(uint256 requestId, address[] winners, uint256[] amounts)",
    "event BaseRewardAmountUpdated(uint256 newAmount)",
    "event MultiChainBonusAmountUpdated(uint256 newAmount)",
    "event UserInteraction(address indexed user, uint64 indexed chainSelector, uint256 interactionType)",
    "event StrategyStablecoinUpdated(uint256 indexed strategyId, address indexed stablecoinAddress)",
    "event StrategyWethUpdated(uint256 indexed strategyId, address indexed wethAddress)",
    "event SupportedStrategyTokenUpdated(uint256 indexed strategyId, address indexed tokenAddress, bool isSupported)",
    "event Deposited(address indexed user, uint256 strategyId, uint256 amount)",
    "event Withdrawn(address indexed user, uint256 strategyId, uint256 amount)",
    "event Rebalanced(address indexed user, uint256 oldStrategyId, uint256 newStrategyId, uint256 amount, uint256 timestamp)",
    "event PositionsConsolidated(address indexed user)",
    "event AIAgentUpdated(address indexed newAgent)",
    "event Paused(address account)",
    "event Unpaused(address account)",

    // Custom Errors (Added all from your contract)
    "error AavePoolUnavailable()",
    "error InsufficientBalance()",
    "error InsufficientParticipants()",
    "error InsufficientRewardFunds()",
    "error InvalidPriceFeed()",
    "error InvalidSlippage()",
    "error InvalidStrategy()",
    "error InvalidVRFRequest()",
    "error OperationInProgress()",
    "error OwnableInvalidOwner(address owner)",
    "error OwnableUnauthorizedAccount(address owner)",
    "error Paused()",
    "error PriceManipulationDetected()",
    "error RebalanceNotNeeded()",
    "error ReentrancyGuardReentrantCall()",
    "error RewardDrawNotReady()",
    "error UnauthorizedCaller()",
    "error UnsupportedDepositToken()",
    "error ZeroAddress()",
    "error ZeroAmount()",
];

const ERC20_ABI = [
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
];

// Helper function to get contract instance
async function getYieldOptimizerContract(signer: Signer): Promise<Contract> {
    const yieldOptimizerAddr = ethers.getAddress(YIELD_OPTIMIZER_CONTRACT_ADDRESS);
    return new ethers.Contract(yieldOptimizerAddr, YIELD_OPTIMIZER_ABI, signer);
}

export async function getCrossChainManagerContract(signer: Signer) {
    const CrossChainManager = await ethers.getContractFactory("CrossChainManager");
    return CrossChainManager.attach(BASE_CROSS_CHAIN).connect(signer);
}

// Helper function to get token contract instance
async function getTokenContract(tokenAddress: string, signer: Signer): Promise<Contract> {
    const erc20Addr = ethers.getAddress(tokenAddress);
    return new ethers.Contract(erc20Addr, ERC20_ABI, signer);
}

// Helper to check if signer is owner
async function ensureOwner(yieldOptimizerContract: Contract, signerAddress: string) {
    const contractOwner = await yieldOptimizerContract.owner();
    if (signerAddress.toLowerCase() !== contractOwner.toLowerCase()) {
        throw new Error(`Error: Connected wallet (${signerAddress}) is not the contract owner (${contractOwner}). This function requires owner permissions.`);
    }
    console.log(`Connected wallet is the contract owner.`);
}

export {
    YIELD_OPTIMIZER_CONTRACT_ADDRESS, SEPOLIA_CHAIN_SELECTOR,
    USDC_TOKEN_ADDRESS, LINK_TOKEN_ADDRESS, // Exporting both tokens
    AAVE_STRATEGY_ID, COMPOUND_STRATEGY_ID,
    getYieldOptimizerContract, getTokenContract, ensureOwner,
    YIELD_OPTIMIZER_ABI, ERC20_ABI
};