import { ethers } from "hardhat";
import { Signer } from "ethers";
import { 
    YIELD_OPTIMIZER_CONTRACT_ADDRESS, 
    getYieldOptimizerContract, 
    getTokenContract 
} from "./_common_constants"; // Adjust path if needed

async function main() {
    console.log("Starting User Consolidate Positions Script (Manual Index Selection)...");

    const [userSigner]: Signer[] = await ethers.getSigners();
    const userAddress = await userSigner.getAddress();
    console.log(`Connected with user wallet: ${userAddress}`);

    const yieldOptimizerContract = await getYieldOptimizerContract(userSigner);

    // --- IMPORTANT: Manually set these based on your existing positions ---
    // You MUST have two existing positions for the user that can be consolidated.
    // They should ideally be for the same token and in the same strategy.
    const SOURCE_POSITION_INDEX = 0; // <--- REPLACE with an actual source position index
    const TARGET_POSITION_INDEX = 1; // <--- REPLACE with an actual target position index

    try {
        console.log(`\n--- Pre-Consolidation Checks for Selected Positions ---`);

        // Fetch source position details
        const sourcePosition = await yieldOptimizerContract.userPositions(userAddress, SOURCE_POSITION_INDEX);
        const sourceStrategyId = Number(sourcePosition[0]);
        const sourceBalance = sourcePosition[1];
        const sourceTokenAddress = sourcePosition[2]; // Assuming tokenAddress is at index 2

        if (sourceBalance === 0n) {
            console.error(`ERROR: Source position ${SOURCE_POSITION_INDEX} has 0 balance. Nothing to consolidate.`);
            return;
        }

        const sourceToken = await getTokenContract(sourceTokenAddress, userSigner);
        const sourceTokenSymbol = await sourceToken.symbol();
        const sourceTokenDecimals = await sourceToken.decimals();

        console.log(`Source Position ${SOURCE_POSITION_INDEX}:`);
        console.log(`  Strategy ID: ${sourceStrategyId}`);
        console.log(`  Token: ${sourceTokenSymbol} (${sourceTokenAddress})`);
        console.log(`  Balance: ${ethers.formatUnits(sourceBalance, sourceTokenDecimals)} ${sourceTokenSymbol}`);

        // Fetch target position details
        const targetPosition = await yieldOptimizerContract.userPositions(userAddress, TARGET_POSITION_INDEX);
        const targetStrategyId = Number(targetPosition[0]);
        const targetTokenAddress = targetPosition[2]; // Assuming tokenAddress is at index 2

        console.log(`Target Position ${TARGET_POSITION_INDEX}:`);
        console.log(`  Strategy ID: ${targetStrategyId}`);
        console.log(`  Token: ${targetTokenAddress}`); // Don't fetch symbol/decimals again unless different token

        // Basic compatibility check (optional but recommended for consolidation)
        if (sourceStrategyId !== targetStrategyId) {
            console.error(`ERROR: Source and target positions are in different strategies. Source: ${sourceStrategyId}, Target: ${targetStrategyId}.`);
            console.error("Consolidation typically requires positions in the same strategy.");
            return;
        }
        if (sourceTokenAddress.toLowerCase() !== targetTokenAddress.toLowerCase()) {
            console.error(`ERROR: Source and target positions are for different tokens. Source: ${sourceTokenAddress}, Target: ${targetTokenAddress}.`);
            console.error("Consolidation typically requires positions of the same token type.");
            return;
        }

        console.log(`\nInitiating consolidation of ${ethers.formatUnits(sourceBalance, sourceTokenDecimals)} ${sourceTokenSymbol} from position ${SOURCE_POSITION_INDEX} into position ${TARGET_POSITION_INDEX}...`);

        const tx = await yieldOptimizerContract.consolidate(
            userAddress,
            SOURCE_POSITION_INDEX,
            TARGET_POSITION_INDEX,
            sourceBalance // Consolidating the entire balance from the source position
        );

        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log("Consolidation successful!");

        console.log("\n--- Transaction Events ---");
        const iface = new ethers.Interface(yieldOptimizerContract.interface.fragments);
        for (const log of receipt!.logs) {
            try {
                const parsedLog = iface.parseLog(log);
                if (parsedLog && parsedLog.name === "Consolidated") { // Assuming a "Consolidated" event
                    console.log(`  'Consolidated' Event Emitted:`);
                    console.log(`    User: ${parsedLog.args.user}`);
                    console.log(`    Source Position: ${parsedLog.args.sourcePositionIndex}`);
                    console.log(`    Target Position: ${parsedLog.args.targetPositionIndex}`);
                    console.log(`    Amount: ${ethers.formatUnits(parsedLog.args.amount, sourceTokenDecimals)} ${sourceTokenSymbol}`);
                }
            } catch (e) { /* ignore non-Consolidated events */ }
        }

    } catch (error: any) {
        console.error("\nAN ERROR OCCURRED DURING CONSOLIDATION:");
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
        console.error("\nPossible reasons:");
        console.error("1. The specified SOURCE_POSITION_INDEX or TARGET_POSITION_INDEX do not exist for the user.");
        console.error("2. The source position has no balance.");
        console.error("3. The positions are not compatible for consolidation (e.g., different strategies or tokens).");
        console.error("4. The 'consolidate' function parameters or internal logic are incorrect.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});