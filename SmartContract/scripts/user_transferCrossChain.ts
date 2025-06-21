import { ethers } from "hardhat";
import { Signer } from "ethers";
import {
    BASE_CROSS_CHAIN,
    ARB_SEPOLIA_CHAIN_SELECTOR,
    USDC_TOKEN_ADDRESS_CCIP,
    getCrossChainManagerContract,
    getTokenContract
} from "./_common_constants"; // Adjust path if needed

async function main() {
    console.log("Starting User Cross-Chain USDC Transfer Script...");

    const [userSigner]: Signer[] = await ethers.getSigners();
    const userAddress = await userSigner.getAddress();
    console.log(`Connected with user wallet: ${userAddress}`);

    const crossChainManager = await getCrossChainManagerContract(userSigner);
    const usdcToken = await getTokenContract(USDC_TOKEN_ADDRESS_CCIP, userSigner);
    const usdcDecimals = await usdcToken.decimals();
    const usdcSymbol = await usdcToken.symbol();

    // --- Configuration for the transfer ---
    const AMOUNT_TO_TRANSFER = ethers.parseUnits("1.5", usdcDecimals); // Changed to 1.5 USDC
    const DESTINATION_CHAIN_SELECTOR = ARB_SEPOLIA_CHAIN_SELECTOR;
    const RECEIVER_ADDRESS_ON_DESTINATION = userAddress; // The user's address on the destination chain

    try {
        console.log(`\n--- Pre-Transfer Checks ---`);
        const userUSDCBalance = await usdcToken.balanceOf(userAddress);
        console.log(`Your current USDC balance: ${ethers.formatUnits(userUSDCBalance, usdcDecimals)} ${usdcSymbol}`);
        if (userUSDCBalance < AMOUNT_TO_TRANSFER) {
            console.error(`ERROR: Insufficient USDC balance. Needed: ${ethers.formatUnits(AMOUNT_TO_TRANSFER, usdcDecimals)}, Have: ${ethers.formatUnits(userUSDCBalance, usdcDecimals)}`);
            return;
        }

        // 1. Get the required CCIP fee
        console.log("\nCalculating required CCIP fee...");
        const fee = await crossChainManager.getTransferFee(
            AMOUNT_TO_TRANSFER,
            DESTINATION_CHAIN_SELECTOR,
            RECEIVER_ADDRESS_ON_DESTINATION
        );
        console.log(`Required CCIP Transfer Fee: ${ethers.formatEther(fee)} ETH`);

        // 2. Approve the CrossChainManager to spend your USDC
        console.log(`\nApproving CrossChainManager (${BASE_CROSS_CHAIN}) to spend ${ethers.formatUnits(AMOUNT_TO_TRANSFER, usdcDecimals)} ${usdcSymbol}...`);
        const approveTx = await usdcToken.approve(BASE_CROSS_CHAIN, AMOUNT_TO_TRANSFER);
        console.log(`Approval Transaction sent: ${approveTx.hash}`);
        await approveTx.wait();
        console.log("Approval successful!");

        const destinationManager = await crossChainManager.crossChainManagers(DESTINATION_CHAIN_SELECTOR);
if (destinationManager === ethers.ZeroAddress) {
    console.error("ERROR: No CrossChainManager address set for destination chain!");
    return;
}
console.log(`Destination CrossChainManager: ${destinationManager}`);

        // 3. Initiate the cross-chain transfer
        console.log(`\nInitiating cross-chain transfer of ${ethers.formatUnits(AMOUNT_TO_TRANSFER, usdcDecimals)} ${usdcSymbol} to Base Sepolia...`);
        const transferTx = await crossChainManager.transferCrossChain(
            AMOUNT_TO_TRANSFER,
            DESTINATION_CHAIN_SELECTOR,
            RECEIVER_ADDRESS_ON_DESTINATION,
            { value: fee } // Attach the fee as msg.value
        );

        console.log(`Transfer Transaction sent: ${transferTx.hash}`);
        const receipt = await transferTx.wait();
        console.log(`Transfer confirmed in block ${receipt.blockNumber}`);
        console.log("Cross-chain transfer initiated successfully!");

        console.log("\n--- Transaction Events ---");
        const iface = new ethers.Interface(crossChainManager.interface.fragments);
        for (const log of receipt!.logs) {
            try {
                const parsedLog = iface.parseLog(log);
                if (parsedLog && parsedLog.name === "CrossChainTransferInitiated") {
                    console.log(`  'CrossChainTransferInitiated' Event Emitted:`);
                    console.log(`    Sender: ${parsedLog.args.sender}`);
                    console.log(`    Amount: ${parsedLog.args.amount.toString()} (raw)`); // Displaying raw to avoid decimal issues in case of error
                    console.log(`    Destination Chain Selector: ${parsedLog.args.destinationChainSelector}`);
                    console.log(`    Message ID: ${parsedLog.args.messageId}`);
                }
            } catch (e) { /* ignore non-CrossChainTransferInitiated events */ }
        }

        console.log("\nNote: The actual deposit on the destination chain will occur after CCIP processes the message.");

    } catch (error: any) {
        console.error("\nAN ERROR OCCURRED DURING CROSS-CHAIN TRANSFER:");
        console.error(`Error Message: ${error.message}`);
        if (error.reason) {
            console.error(`Revert Reason (if available): ${error.reason}`);
        }
        if (error.data) {
            console.error(`Revert Data (if available): ${error.data}`);
        }
        if (error.code === 'CALL_EXCEPTION') {
            console.error("This is likely an on-chain revert from the contract. Check transaction details.");
            console.error("Common issues: Insufficient ETH for fee, insufficient USDC allowance, rate limit exceeded, unauthorized caller.");
        }
        console.error("\nPlease ensure:");
        console.error("1. You have enough USDC in your wallet.");
        console.error("2. You have enough Sepolia ETH to cover the transaction fee AND the CCIP transfer fee.");
        console.error("3. The 'receiver' is valid and the CCIP Router is correctly set up for this path.");
        console.error("4. If the sender is NOT the receiver, ensure the sender is the AI Agent.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});