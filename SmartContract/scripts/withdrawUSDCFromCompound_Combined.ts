import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// --- Configuration ---
// Your deployed YieldOptimizer contract address on Sepolia
const YIELD_OPTIMIZER_CONTRACT_ADDRESS = "0x21BC0cE9CdBFA9F0a1fe7F13c312257446AFC598";

// --- TOKEN SPECIFIC CONFIGURATION (for USDC) ---
const TOKEN_SYMBOL = "USDC";
const TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC on Sepolia
const TOKEN_DECIMALS = 6; // USDC has 6 decimals

// --- STRATEGY SPECIFIC CONFIGURATION (for Compound) ---
const COMPOUND_STRATEGY_ID = 1; // Compound strategy ID
const SEPOLIA_CHAIN_SELECTOR = 11155111; // Chainlink Chain Selector for Sepolia

// --- WITHDRAWAL DETAILS ---
// IMPORTANT: This must be the correct position index for your USDC deposit in Compound!
// If your LINK Aave deposit was at index 0, and this was your next deposit, it's likely 1.
const POSITION_INDEX_TO_WITHDRAW = 1; // <--- ADJUST THIS VALUE IF NEEDED!

const AMOUNT_TO_WITHDRAW = ethers.parseUnits("1.5", TOKEN_DECIMALS); // 2 USDC to withdraw

// --- Comprehensive YieldOptimizer Contract ABI ---
// (Ensure this ABI accurately reflects your deployed contract, especially return types for views)
const YIELD_OPTIMIZER_ABI = [
    // Functions
    "function withdraw(uint256 positionIndex, uint256 amount, uint64 _chainSelector)",
    "function userPositions(address, uint256) view returns (uint256, uint256, uint256, uint256)",
    "function owner() view returns (address)",
    "function setStrategyPrimaryStablecoin(uint256 _strategyId, address _stablecoinAddress)",
    "function strategyPrimaryStablecoins(uint256) view returns (address)",

    // Events (Add ALL events your contract emits for better log parsing)
    "event Withdrawn(address indexed user, uint256 strategyId, uint256 amount)",
    "event StrategyStablecoinUpdated(uint256 indexed strategyId, address indexed stablecoinAddress)",
    // ... add any other events you want to parse

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

// --- ERC20 ABI (for token details like symbol/decimals) ---
const ERC20_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
];

async function main() {
  console.log(`Starting combined script for ${TOKEN_SYMBOL} withdrawal from Compound...`);

  // 1. Get the Signer
  const [deployer]: Signer[] = await ethers.getSigners();
  const signerAddress = await deployer.getAddress();
  console.log(`Connected with wallet address: ${signerAddress}`);

  // Normalize and validate addresses
  const yieldOptimizerAddr = ethers.getAddress(YIELD_OPTIMIZER_CONTRACT_ADDRESS);
  const tokenAddr = ethers.getAddress(TOKEN_ADDRESS);

  // 2. Get Contract Instances
  const yieldOptimizerContract: Contract = new ethers.Contract(yieldOptimizerAddr, YIELD_OPTIMIZER_ABI, deployer);
  const tokenContract: Contract = new ethers.Contract(tokenAddr, ERC20_ABI, deployer);

  try {
    // --- Step A: Set Primary Stablecoin for Compound Strategy ---
    console.log("\n--- Step A: Configuring Primary Stablecoin for Compound Strategy ---");

    // Verify if the connected address is the contract owner
    const contractOwner = await yieldOptimizerContract.owner();
    if (signerAddress.toLowerCase() !== contractOwner.toLowerCase()) {
        console.error(`Error: Connected wallet (${signerAddress}) is not the contract owner (${contractOwner}). Setting primary stablecoin requires owner permissions.`);
        return;
    }
    console.log(`Connected wallet is the contract owner. Proceeding to set primary stablecoin.`);

    const currentPrimaryStablecoin = await yieldOptimizerContract.strategyPrimaryStablecoins(COMPOUND_STRATEGY_ID);
    console.log(`Current primary stablecoin for Compound (ID ${COMPOUND_STRATEGY_ID}): ${currentPrimaryStablecoin}`);

    if (currentPrimaryStablecoin.toLowerCase() !== tokenAddr.toLowerCase()) { // Use normalized tokenAddr here
        console.log(`Setting ${TOKEN_SYMBOL} (${tokenAddr}) as the primary stablecoin for Compound Strategy ID ${COMPOUND_STRATEGY_ID}...`);
        const setTx = await yieldOptimizerContract.connect(deployer).setStrategyPrimaryStablecoin(
            COMPOUND_STRATEGY_ID,
            tokenAddr // Use the normalized address
        );
        console.log(`Transaction sent: ${setTx.hash}`);
        const setReceipt = await setTx.wait();
        console.log(`Transaction confirmed in block ${setReceipt.blockNumber}`);
        console.log(`Primary stablecoin for Compound strategy successfully set to ${TOKEN_SYMBOL}!`);
        // You can parse events here if you wish, similar to the withdraw event parsing below
    } else {
        console.log(`${TOKEN_SYMBOL} is already set as the primary stablecoin for Compound. No action needed.`);
    }

    // --- Step B: Proceed with Withdrawal ---
    console.log(`\n--- Step B: Attempting ${TOKEN_SYMBOL} Withdrawal ---`);

    const tokenSymbolFromContract = await tokenContract.symbol();
    const tokenDecimalsFromContract = await tokenContract.decimals();

    console.log(`Attempting to withdraw ${ethers.formatUnits(AMOUNT_TO_WITHDRAW, tokenDecimalsFromContract)} ${tokenSymbolFromContract}`);
    console.log(`From position index: ${POSITION_INDEX_TO_WITHDRAW}`);

    // Verify the user's position details before withdrawal
    let userPosition;
    try {
        const positionResult = await yieldOptimizerContract.userPositions(signerAddress, POSITION_INDEX_TO_WITHDRAW);
        // Accessing results by index as per the simplified ABI
        userPosition = {
            strategyId: positionResult[0],
            balance: positionResult[1],
            lastUpdated: positionResult[2],
            lastRebalanced: positionResult[3],
        };

        console.log(`Current balance in position ${POSITION_INDEX_TO_WITHDRAW} (Strategy ID ${userPosition.strategyId}): ${ethers.formatUnits(userPosition.balance, tokenDecimalsFromContract)} ${tokenSymbolFromContract}`);

        if (userPosition.strategyId != COMPOUND_STRATEGY_ID) {
            console.error(`Error: Position ${POSITION_INDEX_TO_WITHDRAW} is not a Compound position (Strategy ID ${COMPOUND_STRATEGY_ID}). It is strategy ID ${userPosition.strategyId}.`);
            console.error("Please verify your POSITION_INDEX_TO_WITHDRAW configuration.");
            return;
        }
        if (userPosition.balance < AMOUNT_TO_WITHDRAW) {
            console.error(`Error: Insufficient balance in position ${POSITION_INDEX_TO_WITHDRAW}. You requested ${ethers.formatUnits(AMOUNT_TO_WITHDRAW, tokenDecimalsFromContract)}, but only ${ethers.formatUnits(userPosition.balance, tokenDecimalsFromContract)} is available.`);
            return;
        }

    } catch (e: any) {
        console.error(`Error checking user position: ${e.message}`);
        console.error(`It's possible position index ${POSITION_INDEX_TO_WITHDRAW} is out of bounds or empty for this user.`);
        return;
    }

    // Call the Withdraw Function
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
                console.log(`    Amount: ${ethers.formatUnits(parsedLog.args.amount, tokenDecimalsFromContract)} ${tokenSymbolFromContract}`);
            }
        } catch (e) {
            // Ignore logs that don't match our ABI (e.g., ERC20 Transfer events)
        }
    }

    // Verify wallet token balance increase
    const finalUserTokenBalance = await tokenContract.balanceOf(signerAddress);
    console.log(`Your final wallet ${tokenSymbolFromContract} balance: ${ethers.formatUnits(finalUserTokenBalance, tokenDecimalsFromContract)} ${tokenSymbolFromContract}`);

    console.log(`${TOKEN_SYMBOL} withdrawal from Compound via YieldOptimizer completed successfully!`);

  } catch (error: any) {
    console.error("An error occurred during the process:");
    if (error.reason) {
      console.error(`Ethers.js Reason: ${error.reason}`);
    }
    if (error.data) {
        try {
            const decodedError = yieldOptimizerContract.interface.parseError(error.data);
            if (decodedError) {
                console.error(`Decoded Contract Error: ${decodedError.name}`);
                for (const [key, value] of Object.entries(decodedError.args)) {
                    if (isNaN(Number(key))) {
                        console.error(`  ${key}: ${value}`);
                    }
                }
            } else {
                 console.error(`Raw EVM Error Data: ${error.data}`);
                 console.error(`Could not decode specific error data. It might be a standard revert string or an error from an external call (e.g., Compound).`);
            }
        } catch (decodeError: any) {
            console.error(`Raw EVM Error Data: ${error.data}`);
            console.error(`Error attempting to decode custom error: ${decodeError.message}`);
        }
    }
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});