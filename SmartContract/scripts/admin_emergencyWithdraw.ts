import { ethers } from "hardhat";
import { Signer } from "ethers";
import { 
    YIELD_OPTIMIZER_CONTRACT_ADDRESS, 
    USDC_TOKEN_ADDRESS, LINK_TOKEN_ADDRESS, // Example tokens
    getYieldOptimizerContract, getTokenContract, ensureOwner 
} from "./_common_constants"; // Adjust path if needed

async function main() {
    console.log("Starting Admin Emergency Withdraw Script...");

    const [deployer]: Signer[] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`Connected with owner wallet: ${deployerAddress}`);

    const yieldOptimizerContract = await getYieldOptimizerContract(deployer);
    await ensureOwner(yieldOptimizerContract, deployerAddress);

    // --- Configuration for emergency withdraw ---
    const TOKEN_TO_WITHDRAW = USDC_TOKEN_ADDRESS; // Change to LINK_TOKEN_ADDRESS if needed
    const AMOUNT_TO_WITHDRAW = ethers.parseUnits("1", 6); // 1 USDC (assuming 6 decimals)
    // If withdrawing LINK: const AMOUNT_TO_WITHDRAW = ethers.parseUnits("1", 18); // 1 LINK (assuming 18 decimals)

    const tokenContract = await getTokenContract(TOKEN_TO_WITHDRAW, deployer);
    const tokenSymbol = await tokenContract.symbol();
    const tokenDecimals = await tokenContract.decimals();

    try {
        const contractTokenBalance = await tokenContract.balanceOf(YIELD_OPTIMIZER_CONTRACT_ADDRESS);
        console.log(`\nContract's current ${tokenSymbol} balance: ${ethers.formatUnits(contractTokenBalance, tokenDecimals)}`);

        if (contractTokenBalance < AMOUNT_TO_WITHDRAW) {
            console.error(`Error: Contract has insufficient ${tokenSymbol} to withdraw. Available: ${ethers.formatUnits(contractTokenBalance, tokenDecimals)}, Requested: ${ethers.formatUnits(AMOUNT_TO_WITHDRAW, tokenDecimals)}`);
            return;
        }

        console.log(`Attempting to emergency withdraw ${ethers.formatUnits(AMOUNT_TO_WITHDRAW, tokenDecimals)} ${tokenSymbol} to owner (${deployerAddress})...`);
        const tx = await yieldOptimizerContract.emergencyWithdraw(
            TOKEN_TO_WITHDRAW,
            AMOUNT_TO_WITHDRAW
        );

        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log("Emergency withdrawal successful!");

        const finalContractTokenBalance = await tokenContract.balanceOf(YIELD_OPTIMIZER_CONTRACT_ADDRESS);
        console.log(`Contract's final ${tokenSymbol} balance: ${ethers.formatUnits(finalContractTokenBalance, tokenDecimals)}`);
        const ownerTokenBalance = await tokenContract.balanceOf(deployerAddress);
        console.log(`Owner's final ${tokenSymbol} balance: ${ethers.formatUnits(ownerTokenBalance, tokenDecimals)}`);

    } catch (error: any) {
        console.error("An error occurred during emergency withdraw:");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});