import { ethers } from "hardhat";
import { Signer } from "ethers";
import { 
    YIELD_OPTIMIZER_CONTRACT_ADDRESS, 
    getYieldOptimizerContract, ensureOwner 
} from "./_common_constants"; // Adjust path if needed

async function main() {
    console.log("Starting Admin Set Reward Amounts Script...");

    const [deployer]: Signer[] = await ethers.getSigners();
    const signerAddress = await deployer.getAddress();
    console.log(`Connected with wallet: ${signerAddress}`);

    const yieldOptimizerContract = await getYieldOptimizerContract(deployer);
    await ensureOwner(yieldOptimizerContract, signerAddress);

    // --- Configuration ---
    const NEW_BASE_REWARD_AMOUNT = ethers.parseUnits("150", 18); // 150 SageToken (assuming 18 decimals)
    const NEW_MULTI_CHAIN_BONUS_AMOUNT = ethers.parseUnits("75", 18); // 75 SageToken

    try {
        console.log(`\nSetting Base Reward Amount to ${ethers.formatUnits(NEW_BASE_REWARD_AMOUNT, 18)} SageToken...`);
        let tx = await yieldOptimizerContract.setBaseRewardAmount(NEW_BASE_REWARD_AMOUNT);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);

        console.log(`\nSetting Multi-Chain Bonus Amount to ${ethers.formatUnits(NEW_MULTI_CHAIN_BONUS_AMOUNT, 18)} SageToken...`);
        tx = await yieldOptimizerContract.setMultiChainBonusAmount(NEW_MULTI_CHAIN_BONUS_AMOUNT);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);

        console.log("\nReward amounts updated successfully!");

    } catch (error: any) {
        console.error("An error occurred during setting reward amounts:");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});