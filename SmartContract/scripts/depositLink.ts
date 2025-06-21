import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// --- Configuration ---
// Your deployed YieldOptimizer contract address on Sepolia
const YIELD_OPTIMIZER_CONTRACT_ADDRESS = "0x21BC0cE9CdBFA9F0a1fe7F13c312257446AFC598";

// LINK Token address on Sepolia (Chainlink recommends 0x779877A7B0D9E8603169DdbD7836e478b4624789 as of my last update, please double check)
const LINK_TOKEN_ADDRESS = "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5"; // Corrected LINK address for Sepolia

// Strategy ID for Aave (as defined in your contract)
const AAVE_STRATEGY_ID = 0;

// Amount of LINK to deposit (e.g., 10 LINK). Adjust as needed.
// LINK has 18 decimals, so 10 * 10^18
const AMOUNT_TO_DEPOSIT = ethers.parseUnits("10", 18);

// Chainlink Chain Selector for Sepolia (used for gamification tracking in your contract)
const SEPOLIA_CHAIN_SELECTOR = 11155111; // Source: Chainlink VRF documentation

// --- Minimal YieldOptimizer Contract ABI ---
// Including only the functions and events needed for this script
const YIELD_OPTIMIZER_ABI = [
    // Functions
    "function deposit(address _tokenAddress, uint256 _strategyId, uint256 _amount, uint64 _chainSelector)",
    "function setSupportedStrategyToken(uint256 _strategyId, address _tokenAddress, bool _isSupported)",
    "function owner() view returns (address)",
    "function supportedStrategyDepositTokens(uint256, address) view returns (bool)", // To check if token is supported

    // Events
    "event Deposited(address indexed user, uint256 strategyId, uint256 amount)",

    // Custom Errors (important for clear error messages on revert)
    "error UnsupportedDepositToken()",
    "error InvalidStrategy()",
    "error ZeroAddress()",
    "error ZeroAmount()",
    "error OwnableUnauthorizedAccount(address owner)",
    // Add other relevant custom errors from your contract for better debugging
    // e.g., "error InsufficientBalance()",
    // "error PriceManipulationDetected()",
    // "error AavePoolUnavailable()",
];

// --- ERC20 ABI (for LINK token) ---
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
];

async function main() {
  console.log("Starting LINK deposit to Aave via YieldOptimizer...");

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
    console.log(`Attempting to deposit ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, linkDecimals)} ${linkSymbol} (${LINK_TOKEN_ADDRESS})`);

    // Optional: Check and Set Supported Strategy Token (if necessary)
    // This part should generally only be run once by the contract owner.
    // If you encounter "YieldOptimizerErrors.UnsupportedDepositToken()", uncomment and use this block.
    const contractOwner = await yieldOptimizerContract.owner();
    if (signerAddress.toLowerCase() === contractOwner.toLowerCase()) {
      console.log("Wallet is contract owner. Checking if LINK is supported for Aave strategy...");
      const isLinkSupported = await yieldOptimizerContract.supportedStrategyDepositTokens(AAVE_STRATEGY_ID, LINK_TOKEN_ADDRESS);
      if (!isLinkSupported) {
        console.log("LINK is not yet supported for Aave strategy. Enabling it now...");
        const setSupportTx = await yieldOptimizerContract.connect(deployer).setSupportedStrategyToken(AAVE_STRATEGY_ID, LINK_TOKEN_ADDRESS, true);
        await setSupportTx.wait();
        console.log(`LINK support enabled for Aave strategy in tx: ${setSupportTx.hash}`);
      } else {
        console.log("LINK is already supported for Aave strategy.");
      }
    } else {
      console.log("Wallet is not the contract owner. Cannot set supported tokens if needed.");
    }
    await new Promise(resolve => setTimeout(resolve, 3000)); // Short delay for chain sync

    // 3. Check LINK Balance
    const userLinkBalance = await linkTokenContract.balanceOf(signerAddress);
    console.log(`Your current LINK balance: ${ethers.formatUnits(userLinkBalance, linkDecimals)} ${linkSymbol}`);

    if (userLinkBalance < AMOUNT_TO_DEPOSIT) {
      console.error(`Error: Insufficient LINK balance. You need ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, linkDecimals)} ${linkSymbol}, but you only have ${ethers.formatUnits(userLinkBalance, linkDecimals)} ${linkSymbol}.`);
      return;
    }

    // 4. Approve YieldOptimizer to Spend LINK
    console.log(`Approving YieldOptimizer contract (${YIELD_OPTIMIZER_CONTRACT_ADDRESS}) to spend ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, linkDecimals)} ${linkSymbol}...`);
    const approveTx = await linkTokenContract.connect(deployer).approve(YIELD_OPTIMIZER_CONTRACT_ADDRESS, AMOUNT_TO_DEPOSIT);
    await approveTx.wait();
    console.log(`Approval successful in transaction: ${approveTx.hash}`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for block confirmation

    // 5. Call the Deposit Function
    console.log(`Calling deposit function on YieldOptimizer for ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, linkDecimals)} ${linkSymbol} into Aave strategy (ID: ${AAVE_STRATEGY_ID})...`);
    const depositTx = await yieldOptimizerContract.connect(deployer).deposit(
      LINK_TOKEN_ADDRESS,
      AAVE_STRATEGY_ID,
      AMOUNT_TO_DEPOSIT,
      SEPOLIA_CHAIN_SELECTOR
    );
    const receipt = await depositTx.wait();
    console.log(`Deposit transaction successful: ${receipt.hash}`);

    // Parse and log the Deposited event
    const iface = new ethers.Interface(YIELD_OPTIMIZER_ABI); // Create an interface from the minimal ABI
    for (const log of receipt!.logs) {
        try {
            const parsedLog = iface.parseLog(log);
            if (parsedLog && parsedLog.name === "Deposited") {
                console.log(`  'Deposited' Event Emitted:`);
                console.log(`    User: ${parsedLog.args.user}`);
                console.log(`    Strategy ID: ${parsedLog.args.strategyId}`);
                console.log(`    Amount: ${ethers.formatUnits(parsedLog.args.amount, linkDecimals)} ${linkSymbol}`);
            }
        } catch (e) {
            // Ignore logs that don't match our ABI (e.g., ERC20 Transfer events)
        }
    }

    console.log("LINK deposit to Aave via YieldOptimizer completed successfully!");

  } catch (error: any) {
    console.error("An error occurred during the deposit process:");
    if (error.reason) {
      console.error(`Ethers.js Reason: ${error.reason}`);
    }
    if (error.data) {
        // Attempt to decode custom errors
        try {
            const decodedError = yieldOptimizerContract.interface.parseError(error.data); // Use the contract's interface
            if (decodedError) {
                console.error(`Decoded Contract Error: ${decodedError.name}`);
                for (const [key, value] of Object.entries(decodedError.args)) {
                    // Avoid logging numerical keys for unnamed arguments
                    if (isNaN(Number(key))) {
                        console.error(`  ${key}: ${value}`);
                    }
                }
            } else {
                 console.error(`Raw EVM Error Data: ${error.data}`);
                 console.error(`Could not decode specific error data. It might be a standard revert or an error not in our ABI.`);
            }
        } catch (decodeError: any) {
            console.error(`Raw EVM Error Data: ${error.data}`);
            console.error(`Error attempting to decode custom error: ${decodeError.message}`);
        }
    }
    console.error(error);
  }
}

// Hardhat's recommended way to run scripts
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});