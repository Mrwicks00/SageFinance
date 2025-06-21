import { ethers } from "hardhat";
import { Signer } from "ethers";
import { 
    YIELD_OPTIMIZER_CONTRACT_ADDRESS, 
    getYieldOptimizerContract, ensureOwner 
} from "./_common_constants"; // Adjust path if needed

async function main() {
    console.log("Starting Admin Request Reward Draw Script...");

    const [deployer]: Signer[] = await ethers.getSigners();
    const signerAddress = await deployer.getAddress();
    console.log(`Connected with owner wallet: ${signerAddress}`);

    const yieldOptimizerContract = await getYieldOptimizerContract(deployer);
    await ensureOwner(yieldOptimizerContract, signerAddress);

    try {
        const lastDrawTime = await yieldOptimizerContract.lastRewardDrawTime();
        const drawInterval = await yieldOptimizerContract.REWARD_DRAW_INTERVAL();
        const nextDrawTime = lastDrawTime + drawInterval;
        const currentTime = Math.floor(Date.now() / 1000);

        console.log(`\nLast Reward Draw Time: ${new Date(Number(lastDrawTime) * 1000).toLocaleString()}`);
        console.log(`Next Eligible Draw Time: ${new Date(Number(nextDrawTime) * 1000).toLocaleString()}`);
        console.log(`Current Time: ${new Date(currentTime * 1000).toLocaleString()}`);

        if (currentTime < nextDrawTime) {
            console.warn("Reward draw is not yet ready. Please wait until the next eligible time.");
            return; // 
            // You might want to uncomment `return;` if you want to prevent calling when not ready
            // return; 
        }

        // Check if there are enough participants (WINNER_COUNT is 5, from contract code)
        // Note: The `_weeklyParticipantsForDraw` array is private. We can't directly read its length.
        // The `requestRewardDraw` function itself has `_weeklyParticipantsForDraw.length < WINNER_COUNT` check.
        // You'll need to ensure users have interacted through deposit/withdraw/rebalance before calling this.
        
        console.log("\nAttempting to request a new reward draw from Chainlink VRF...");
        const tx = await yieldOptimizerContract.requestRewardDraw();

        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log("Reward draw requested successfully!");

        console.log("\n--- Transaction Events ---");
        const iface = new ethers.Interface(yieldOptimizerContract.interface.fragments);
        for (const log of receipt!.logs) {
            try {
                const parsedLog = iface.parseLog(log);
                if (parsedLog && parsedLog.name === "RewardDrawRequested") {
                    console.log(`  'RewardDrawRequested' Event Emitted:`);
                    console.log(`    Caller: ${parsedLog.args.caller}`);
                    console.log(`    Request ID: ${parsedLog.args.requestId}`);
                    console.log(`    Total Participants: ${parsedLog.args.totalParticipants}`);
                }
            } catch (e) { /* ignore */ }
        }

        console.log("\nVRF request sent. Chainlink VRF Coordinator will call `fulfillRandomWords` when randomness is available.");

    } catch (error: any) {
        console.error("An error occurred during reward draw request:");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});