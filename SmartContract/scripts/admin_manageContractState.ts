import { ethers } from "hardhat";
import { Signer } from "ethers";
import { 
    YIELD_OPTIMIZER_CONTRACT_ADDRESS, 
    getYieldOptimizerContract, ensureOwner 
} from "./_common_constants"; // Adjust path if needed

async function main() {
    console.log("Starting Admin Contract State Management Script...");

    const [deployer, newAiAgentCandidate]: Signer[] = await ethers.getSigners(); // Assuming deployer is owner
    const deployerAddress = await deployer.getAddress();
    const newAiAgentAddress = await newAiAgentCandidate.getAddress(); // A new address to set as AI agent
    console.log(`Connected with owner wallet: ${deployerAddress}`);

    const yieldOptimizerContract = await getYieldOptimizerContract(deployer);
    await ensureOwner(yieldOptimizerContract, deployerAddress);

    try {
        // --- Set AI Agent ---
        const currentAiAgent = await yieldOptimizerContract.aiAgent();
        console.log(`\nCurrent AI Agent: ${currentAiAgent}`);
        if (currentAiAgent.toLowerCase() !== newAiAgentAddress.toLowerCase()) {
            console.log(`Setting new AI Agent to: ${newAiAgentAddress}...`);
            let tx = await yieldOptimizerContract.setAIAgent(newAiAgentAddress);
            await tx.wait();
            console.log(`Tx: ${tx.hash}`);
            console.log("AI Agent updated successfully!");
        } else {
            console.log("AI Agent is already set to the new address. Skipping update.");
        }

        // --- Pause Contract ---
        console.log("\nAttempting to pause the contract...");
        let tx = await yieldOptimizerContract.pause();
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
        console.log("Contract paused successfully!");

        // --- Unpause Contract ---
        console.log("\nAttempting to unpause the contract...");
        tx = await yieldOptimizerContract.unpause();
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
        console.log("Contract unpaused successfully!");

    } catch (error: any) {
        console.error("An error occurred during contract state management:");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});