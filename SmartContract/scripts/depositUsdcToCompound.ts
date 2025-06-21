import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// --- Configuration ---
// Your deployed YieldOptimizer contract address on Sepolia
const YIELD_OPTIMIZER_CONTRACT_ADDRESS = "0x21BC0cE9CdBFA9F0a1fe7F13c312257446AFC598";

// USDC Token address on Sepolia
const USDC_TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// Strategy ID for Compound (as defined in your contract, strategies[1])
const COMPOUND_STRATEGY_ID = 1;

// Amount of USDC to deposit (e.g., 50 USDC).
// USDC typically has 6 decimals, so 50 * 10^6
const AMOUNT_TO_DEPOSIT = ethers.parseUnits("2", 6); // Assuming 6 decimals for USDC

// Chainlink Chain Selector for Sepolia (used for gamification tracking)
const SEPOLIA_CHAIN_SELECTOR = 11155111;

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
];

// --- ERC20 ABI (for USDC token) ---
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
];

async function main() {
  console.log("Starting USDC deposit to Compound via YieldOptimizer...");

  // 1. Get the Signer
  const [deployer]: Signer[] = await ethers.getSigners();
  const signerAddress = await deployer.getAddress();
  console.log(`Connected with wallet address: ${signerAddress}`);

  // 2. Get Contract Instances using the ABIs
  const yieldOptimizerContract: Contract = new ethers.Contract(YIELD_OPTIMIZER_CONTRACT_ADDRESS, YIELD_OPTIMIZER_ABI, deployer);
  const usdcTokenContract: Contract = new ethers.Contract(USDC_TOKEN_ADDRESS, ERC20_ABI, deployer);

  try {
    // Fetch USDC token details for logging
    const usdcSymbol = await usdcTokenContract.symbol();
    const usdcDecimals = await usdcTokenContract.decimals();
    // Re-adjust AMOUNT_TO_DEPOSIT if your USDC token doesn't have 6 decimals
    // For most USDC, 6 decimals is standard, but dynamic fetching is safer:

    console.log(`Attempting to deposit ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, usdcDecimals)} ${usdcSymbol} (${USDC_TOKEN_ADDRESS})`);

    // Optional: Check and Set Supported Strategy Token (if necessary)
    // This part should generally only be run once by the contract owner.
    // If you encounter "YieldOptimizerErrors.UnsupportedDepositToken()", uncomment and use this block.
    const contractOwner = await yieldOptimizerContract.owner();
    if (signerAddress.toLowerCase() === contractOwner.toLowerCase()) {
      console.log(`Wallet is contract owner. Checking if ${usdcSymbol} is supported for Compound strategy...`);
      const isUsdcSupported = await yieldOptimizerContract.supportedStrategyDepositTokens(COMPOUND_STRATEGY_ID, USDC_TOKEN_ADDRESS);
      if (!isUsdcSupported) {
        console.log(`${usdcSymbol} is not yet supported for Compound strategy. Enabling it now...`);
        const setSupportTx = await yieldOptimizerContract.connect(deployer).setSupportedStrategyToken(COMPOUND_STRATEGY_ID, USDC_TOKEN_ADDRESS, true);
        await setSupportTx.wait();
        console.log(`${usdcSymbol} support enabled for Compound strategy in tx: ${setSupportTx.hash}`);
      } else {
        console.log(`${usdcSymbol} is already supported for Compound strategy.`);
      }
    } else {
      console.log("Wallet is not the contract owner. Cannot set supported tokens if needed.");
    }
    await new Promise(resolve => setTimeout(resolve, 3000)); // Short delay for chain sync

    // 3. Check USDC Balance
    const userUsdcBalance = await usdcTokenContract.balanceOf(signerAddress);
    console.log(`Your current ${usdcSymbol} balance: ${ethers.formatUnits(userUsdcBalance, usdcDecimals)} ${usdcSymbol}`);

    if (userUsdcBalance < AMOUNT_TO_DEPOSIT) {
      console.error(`Error: Insufficient ${usdcSymbol} balance. You need ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, usdcDecimals)} ${usdcSymbol}, but you only have ${ethers.formatUnits(userUsdcBalance, usdcDecimals)} ${usdcSymbol}.`);
      return;
    }

    // 4. Approve YieldOptimizer to Spend USDC
    console.log(`Approving YieldOptimizer contract (${YIELD_OPTIMIZER_CONTRACT_ADDRESS}) to spend ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, usdcDecimals)} ${usdcSymbol}...`);
    const approveTx = await usdcTokenContract.connect(deployer).approve(YIELD_OPTIMIZER_CONTRACT_ADDRESS, AMOUNT_TO_DEPOSIT);
    await approveTx.wait();
    console.log(`Approval successful in transaction: ${approveTx.hash}`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for block confirmation

    // 5. Call the Deposit Function
    console.log(`Calling deposit function on YieldOptimizer for ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, usdcDecimals)} ${usdcSymbol} into Compound strategy (ID: ${COMPOUND_STRATEGY_ID})...`);
    const depositTx = await yieldOptimizerContract.connect(deployer).deposit(
      USDC_TOKEN_ADDRESS,
      COMPOUND_STRATEGY_ID,
      AMOUNT_TO_DEPOSIT,
      SEPOLIA_CHAIN_SELECTOR
    );
    const receipt = await depositTx.wait();
    console.log(`Deposit transaction successful: ${receipt.hash}`);

    // Parse and log the Deposited event
    const iface = new ethers.Interface(YIELD_OPTIMIZER_ABI);
    for (const log of receipt!.logs) {
        try {
            const parsedLog = iface.parseLog(log);
            if (parsedLog && parsedLog.name === "Deposited") {
                console.log(`  'Deposited' Event Emitted:`);
                console.log(`    User: ${parsedLog.args.user}`);
                console.log(`    Strategy ID: ${parsedLog.args.strategyId}`);
                console.log(`    Amount: ${ethers.formatUnits(parsedLog.args.amount, usdcDecimals)} ${usdcSymbol}`);
            }
        } catch (e) {
            // Ignore logs that don't match our ABI (e.g., ERC20 Transfer events)
        }
    }

    console.log("USDC deposit to Compound via YieldOptimizer completed successfully!");

  } catch (error: any) {
    console.error("An error occurred during the deposit process:");
    if (error.reason) {
      console.error(`Ethers.js Reason: ${error.reason}`);
    }
    if (error.data) {
        try {
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