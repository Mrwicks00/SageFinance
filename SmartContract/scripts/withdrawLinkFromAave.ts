import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// --- Configuration ---
// Your deployed YieldOptimizer contract address on Sepolia
const YIELD_OPTIMIZER_CONTRACT_ADDRESS = "0x21BC0cE9CdBFA9F0a1fe7F13c312257446AFC598";

// LINK Token address on Sepolia (for symbol/decimals lookup, not directly used in withdraw params)
const LINK_TOKEN_ADDRESS = "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5";

// Strategy ID for Aave (as defined in your contract)
const AAVE_STRATEGY_ID = 0; // Important for context, though not a direct withdraw parameter

// The index of the user's position to withdraw from.
// IMPORTANT: This assumes your LINK Aave position is at index 0.
// If you have multiple positions, you might need to query `userPositions`
// or use a more robust way to find the correct index.
const POSITION_INDEX_TO_WITHDRAW = 0;

// Amount of LINK to withdraw (e.g., 5 LINK). This should be less than or equal to
// the amount you deposited in that specific position.
const AMOUNT_TO_WITHDRAW = ethers.parseUnits("5", 18); // LINK has 18 decimals

// Chainlink Chain Selector for Sepolia (used for gamification tracking)
const SEPOLIA_CHAIN_SELECTOR = 11155111;

// --- Comprehensive YieldOptimizer Contract ABI for better error decoding ---
const YIELD_OPTIMIZER_ABI = [
    // Functions
    "function withdraw(uint256 positionIndex, uint256 amount, uint64 _chainSelector)",
    "function userPositions(address, uint256) view returns (uint256 strategyId, uint256 balance, uint256 lastUpdated, uint256 lastRebalanced)",
    "function getLinkPrice() view returns (uint256)", // If exists
    "function owner() view returns (address)",
    "function setSupportedStrategyToken(uint256 _strategyId, address _tokenAddress, bool _isSupported)",
    "function setStrategyAddresses(uint256 _strategyId, address _integrationAddress, address _aTokenAddress)",
    "function setPriceFeed(address _tokenAddress, address _priceFeedAddress)",
    "function setSlippageTolerance(uint256 _tolerance)",
    "function setMaxPositionsPerUser(uint256 _max)",
    "function pause()",
    "function unpause()",
    "function getSupportedDepositTokens(uint256 _strategyId) view returns (address[])",


    // Events
    "event Deposited(address indexed user, uint256 strategyId, uint256 amount)",
    "event Withdrawn(address indexed user, uint256 strategyId, uint256 amount)",
    "event Rebalanced(address indexed user, uint256 oldStrategyId, uint256 newStrategyId, uint256 amount)",
    "event FundsConsolidated(address indexed user, uint256 consolidatedAmount)",
    "event StrategyTokenSupportChanged(uint256 indexed strategyId, address indexed tokenAddress, bool isSupported)",
    "event StrategyAddressesUpdated(uint256 indexed strategyId, address oldIntegrationAddress, address newIntegrationAddress)",
    "event PriceFeedUpdated(address indexed tokenAddress, address oldPriceFeed, address newPriceFeed)",
    "event SlippageToleranceUpdated(uint256 oldTolerance, uint256 newTolerance)",
    "event MaxPositionsPerUserUpdated(uint256 oldMax, uint256 newMax)",
    "event Paused(address account)",
    "event Unpaused(address account)",
    "event UserInteractionTracked(address indexed user, uint64 chainSelector, uint256 interactionType)",
    "event RewardDrawDetailsSet(uint256 indexed drawId, uint256 drawTime, uint256 participantCount, uint256 rewardAmount)",
    "event RewardWinnerSelected(uint256 indexed drawId, address winner, uint256 rewardAmount)",
    "event WinnerDistributed(uint256 indexed drawId, address winner, uint256 amount)",

    // Custom Errors (Add ALL from your contract, from YieldOptimizer.sol and YieldOptimizerErrors.sol if separate)
    "error AavePoolUnavailable()",
    "error InsufficientBalance()",
    "error InsufficientParticipants()",
    "error InsufficientRewardFunds()",
    "error InvalidPriceFeed()",
    "error InvalidSlippage()",
    "error InvalidStrategy()",
    "error InvalidVRFRequest()",
    "error OperationInProgress()",
    "error OwnableInvalidOwner(address owner)", // For Ownable
    "error OwnableUnauthorizedAccount(address owner)", // For Ownable
    "error Paused()", // From Pausable
    "error PriceManipulationDetected()",
    "error RebalanceNotNeeded()",
    "error ReentrancyGuardReentrantCall()", // From ReentrancyGuard
    "error RewardDrawNotReady()",
    "error UnauthorizedCaller()",
    "error UnsupportedDepositToken()",
    "error ZeroAddress()",
    "error ZeroAmount()",
];

// --- ERC20 ABI (for LINK token details like decimals) ---
const ERC20_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
];

async function main() {
  console.log("Starting LINK withdrawal from Aave via YieldOptimizer...");

  // 1. Get the Signer
  const [deployer]: Signer[] = await ethers.getSigners();
  const signerAddress = await deployer.getAddress();
  console.log(`Connected with wallet address: ${signerAddress}`);

  // 2. Get Contract Instances using the ABIs
  const yieldOptimizerContract: Contract = new ethers.Contract(YIELD_OPTIMIZER_CONTRACT_ADDRESS, YIELD_OPTIMIZER_ABI, deployer);
  const linkTokenContract: Contract = new ethers.Contract(LINK_TOKEN_ADDRESS, ERC20_ABI, deployer);

  try {
    // Fetch LINK token details for logging
    const linkSymbol = await linkTokenContract.symbol();
    const linkDecimals = await linkTokenContract.decimals();

    console.log(`Attempting to withdraw ${ethers.formatUnits(AMOUNT_TO_WITHDRAW, linkDecimals)} ${linkSymbol}`);
    console.log(`From position index: ${POSITION_INDEX_TO_WITHDRAW}`);

    // 3. Verify the user's position balance before withdrawal
    let userPosition;
    try {
        userPosition = await yieldOptimizerContract.userPositions(signerAddress, POSITION_INDEX_TO_WITHDRAW);
        console.log(`Current balance in position ${POSITION_INDEX_TO_WITHDRAW} (Strategy ID ${userPosition.strategyId}): ${ethers.formatUnits(userPosition.balance, linkDecimals)} ${linkSymbol}`);
        if (userPosition.strategyId != AAVE_STRATEGY_ID) {
            console.warn(`Warning: Position ${POSITION_INDEX_TO_WITHDRAW} is not an Aave position (Strategy ID ${AAVE_STRATEGY_ID}). It is strategy ID ${userPosition.strategyId}.`);
            console.warn("Please ensure you are withdrawing from the correct position index and strategy.");
            // If you're sure it's an Aave position but at a different index, change POSITION_INDEX_TO_WITHDRAW
            // If it's a different strategy, you need a different script/strategyId.
        }
        if (userPosition.balance < AMOUNT_TO_WITHDRAW) {
            console.error(`Error: Insufficient balance in position ${POSITION_INDEX_TO_WITHDRAW}. You requested ${ethers.formatUnits(AMOUNT_TO_WITHDRAW, linkDecimals)}, but only ${ethers.formatUnits(userPosition.balance, linkDecimals)} is available.`);
            return;
        }
    } catch (e: any) {
        if (e.code === 'CALL_EXCEPTION' && e.message.includes('arrayify')) {
             console.error(`Error: Position index ${POSITION_INDEX_TO_WITHDRAW} might be out of bounds or no positions exist for this user. Check your 'userPositions' mapping.`);
        } else {
            console.error(`Error checking user position: ${e.message}`);
        }
        return;
    }


    // 4. Call the Withdraw Function
    console.log(`Calling withdraw function on YieldOptimizer...`);
    const withdrawTx = await yieldOptimizerContract.connect(deployer).withdraw(
      POSITION_INDEX_TO_WITHDRAW,
      AMOUNT_TO_WITHDRAW,
      SEPOLIA_CHAIN_SELECTOR
    );
    const receipt = await withdrawTx.wait();
    console.log(`Withdrawal transaction successful: ${receipt.hash}`);

    // Parse and log the Withdrawn event
    const iface = new ethers.Interface(YIELD_OPTIMIZER_ABI);
    for (const log of receipt!.logs) {
        try {
            const parsedLog = iface.parseLog(log);
            if (parsedLog && parsedLog.name === "Withdrawn") {
                console.log(`  'Withdrawn' Event Emitted:`);
                console.log(`    User: ${parsedLog.args.user}`);
                console.log(`    Strategy ID: ${parsedLog.args.strategyId}`);
                console.log(`    Amount: ${ethers.formatUnits(parsedLog.args.amount, linkDecimals)} ${linkSymbol}`);
            }
        } catch (e) {
            // Ignore logs that don't match our ABI (e.g., ERC20 Transfer events)
        }
    }

    // 5. Verify wallet LINK balance increase (optional, but good for verification)
    const finalUserLinkBalance = await linkTokenContract.balanceOf(signerAddress);
    console.log(`Your final wallet LINK balance: ${ethers.formatUnits(finalUserLinkBalance, linkDecimals)} ${linkSymbol}`);

    console.log("LINK withdrawal from Aave via YieldOptimizer completed successfully!");

  } catch (error: any) {
    console.error("An error occurred during the withdrawal process:");
    if (error.reason) {
      console.error(`Ethers.js Reason: ${error.reason}`);
    }
    if (error.data) {
        try {
            // Attempt to decode a custom error if data is available
            const decodedError = yieldOptimizerContract.interface.parseError(error.data);
            if (decodedError) {
                console.error(`Decoded Contract Error: ${decodedError.name}`);
                for (const [key, value] of Object.entries(decodedError.args)) {
                    if (isNaN(Number(key))) { // Avoid logging numerical keys for unnamed arguments
                        console.error(`  ${key}: ${value}`);
                    }
                }
            } else {
                 console.error(`Raw EVM Error Data: ${error.data}`);
                 console.error(`Could not decode specific error data. It might be a standard revert string or an error from an external call (e.g., Aave).`);
            }
        } catch (decodeError: any) {
            console.error(`Raw EVM Error Data: ${error.data}`);
            console.error(`Error attempting to decode custom error: ${decodeError.message}`);
        }
    }
    console.error(error); // Log the full error object for more context
  }
}

// Hardhat's recommended way to run scripts
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});