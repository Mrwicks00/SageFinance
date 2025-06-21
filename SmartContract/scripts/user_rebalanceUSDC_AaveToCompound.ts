import { ethers } from "hardhat";
import { Signer } from "ethers";
import { 
    YIELD_OPTIMIZER_CONTRACT_ADDRESS, SEPOLIA_CHAIN_SELECTOR, 
    USDC_TOKEN_ADDRESS, AAVE_STRATEGY_ID, COMPOUND_STRATEGY_ID,
    getYieldOptimizerContract, getTokenContract
} from "./_common_constants"; // Adjust path if needed

async function main() {
    console.log("Starting User Rebalance (USDC Aave to Compound) Script...");

    const [userSigner]: Signer[] = await ethers.getSigners();
    const userAddress = await userSigner.getAddress();
    console.log(`Connected with user wallet: ${userAddress}`);

    const yieldOptimizerContract = await getYieldOptimizerContract(userSigner);
    const usdcToken = await getTokenContract(USDC_TOKEN_ADDRESS, userSigner);
    const usdcDecimals = await usdcToken.decimals();
    const usdcSymbol = await usdcToken.symbol();

    // --- Configuration for this specific rebalance ---
    // You MUST verify this positionIndex. This assumes your USDC Aave deposit is at index 0.
    const POSITION_INDEX_TO_REBALANCE = 0; // <--- ADJUST THIS BASED ON YOUR ACTUAL POSITION
    const AMOUNT_TO_REBALANCE = ethers.parseUnits("2", usdcDecimals); // Rebalance 2 USDC

    try {
        const position = await yieldOptimizerContract.userPositions(userAddress, POSITION_INDEX_TO_REBALANCE);
        const currentStrategyId = Number(position[0]); // Explicitly cast BigInt to Number
        const currentBalance = position[1];
        
        console.log(`\n--- Pre-Rebalance Checks for Position ${POSITION_INDEX_TO_REBALANCE} ---`);
        console.log(`Current Strategy ID: ${currentStrategyId} (Expected: ${AAVE_STRATEGY_ID} for Aave)`);
        console.log(`Current Balance: ${ethers.formatUnits(currentBalance, usdcDecimals)} ${usdcSymbol}`);
        
        // This check should now definitely evaluate as false if currentStrategyId is 0.
        // If this error still shows up with 0 !== 0, it indicates a deeper environment issue.
        if (currentStrategyId !== AAVE_STRATEGY_ID) {
            console.error(`ERROR: Position ${POSITION_INDEX_TO_REBALANCE} is in strategy ID ${currentStrategyId}, but expected to be in Aave (ID ${AAVE_STRATEGY_ID}).`);
            console.error("Please ensure you're using the correct POSITION_INDEX_TO_REBALANCE, or that the position is indeed in Aave.");
            return;
        }
        if (currentBalance < AMOUNT_TO_REBALANCE) {
            console.error(`ERROR: Insufficient balance in position. Available: ${ethers.formatUnits(currentBalance, usdcDecimals)}, Requested: ${ethers.formatUnits(AMOUNT_TO_REBALANCE, usdcDecimals)}`);
            return;
        }

        console.log(`\nInitiating rebalance of ${ethers.formatUnits(AMOUNT_TO_REBALANCE, usdcDecimals)} ${usdcSymbol} from Aave to Compound...`);
        const tx = await yieldOptimizerContract.rebalance(
            userAddress,
            POSITION_INDEX_TO_REBALANCE,
            COMPOUND_STRATEGY_ID, // New strategy is Compound
            AMOUNT_TO_REBALANCE,
            SEPOLIA_CHAIN_SELECTOR
        );

        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log("Rebalance successful!");

        console.log("\n--- Transaction Events ---");
        const iface = new ethers.Interface(yieldOptimizerContract.interface.fragments);
        for (const log of receipt!.logs) {
            try {
                const parsedLog = iface.parseLog(log);
                if (parsedLog && parsedLog.name === "Rebalanced") {
                    console.log(`  'Rebalanced' Event Emitted:`);
                    console.log(`    User: ${parsedLog.args.user}`);
                    console.log(`    Old Strategy ID: ${parsedLog.args.oldStrategyId}`);
                    console.log(`    New Strategy ID: ${parsedLog.args.newStrategyId}`);
                    console.log(`    Amount: ${ethers.formatUnits(parsedLog.args.amount, usdcDecimals)} ${usdcSymbol}`);
                }
            } catch (e) { /* ignore non-Rebalanced events */ }
        }

    } catch (error: any) {
        console.error("\nAN ERROR OCCURRED DURING REBALANCE:");
        console.error(`Error Message: ${error.message}`);
        if (error.reason) {
            console.error(`Revert Reason (if available): ${error.reason}`);
        }
        if (error.data) {
            console.error(`Revert Data (if available): ${error.data}`);
        }
        if (error.code === 'CALL_EXCEPTION') {
            console.error("This is likely an on-chain revert. Check transaction details for specific error.");
        }
        console.error("\nPossible reasons (based on your observations):");
        console.error("1. USDC Address Mismatch: Aave Sepolia might use a different USDC address than the one configured in your contract.");
        console.error("2. Aave Supply Cap Full: The USDC pool on Aave Sepolia might have reached its deposit limit.");
        console.error("3. Insufficient allowances: Ensure your contract has approval from the Aave/Compound protocol to pull/push tokens.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});