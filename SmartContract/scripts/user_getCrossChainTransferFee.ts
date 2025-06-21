import { ethers } from "hardhat";
import { Signer } from "ethers";
import {
    CROSS_CHAIN_MANAGER_CONTRACT_ADDRESS,
    BASE_SEPOLIA_CHAIN_SELECTOR,
    USDC_TOKEN_ADDRESS_CCIP,
    getCrossChainManagerContract,
    getTokenContract
} from "./_common_constants"; // Adjust path if needed

async function main() {
    console.log("Starting User Get Cross-Chain Transfer Fee Script...");

    const [userSigner]: Signer[] = await ethers.getSigners();
    const userAddress = await userSigner.getAddress();
    console.log(`Connected with user wallet: ${userAddress}`);

    const crossChainManager = await getCrossChainManagerContract(userSigner);
    const usdcToken = await getTokenContract(USDC_TOKEN_ADDRESS_CCIP, userSigner);
    const usdcDecimals = await usdcToken.decimals();
    const usdcSymbol = await usdcToken.symbol();

    // --- Configuration for fee calculation ---
    const AMOUNT_TO_TRANSFER = ethers.parseUnits("1", usdcDecimals); // Example: 1 USDC
    const DESTINATION_CHAIN_SELECTOR = BASE_SEPOLIA_CHAIN_SELECTOR;
    const RECEIVER_ADDRESS_ON_DESTINATION = userAddress; // Receiver on the destination chain

    try {
        console.log(`\nCalculating fee for transferring ${ethers.formatUnits(AMOUNT_TO_TRANSFER, usdcDecimals)} ${usdcSymbol}:`);
        console.log(`  From Sepolia (Current Chain) to Base Sepolia (Selector: ${DESTINATION_CHAIN_SELECTOR})`);
        console.log(`  To receiver: ${RECEIVER_ADDRESS_ON_DESTINATION}`);

        const fee = await crossChainManager.getTransferFee(
            AMOUNT_TO_TRANSFER,
            DESTINATION_CHAIN_SELECTOR,
            RECEIVER_ADDRESS_ON_DESTINATION
        );

        console.log(`\nRequired CCIP Transfer Fee: ${ethers.formatEther(fee)} ETH`);
        console.log("This ETH amount needs to be sent with the 'transferCrossChain' transaction.");

    } catch (error: any) {
        console.error("\nAN ERROR OCCURRED DURING FEE CALCULATION:");
        console.error(`Error Message: ${error.message}`);
        if (error.reason) {
            console.error(`Revert Reason (if available): ${error.reason}`);
        }
        if (error.code === 'CALL_EXCEPTION') {
            console.error("This is likely an on-chain revert from the router. Check Chainlink documentation.");
        }
        console.error("\nPossible reasons:");
        console.error("1. Incorrect CHAIN_SELECTOR or token address.");
        console.error("2. Router is not configured or accessible for the specified chain combination.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});