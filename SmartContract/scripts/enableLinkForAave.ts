import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// --- Configuration ---
// Your deployed YieldOptimizer contract address on Sepolia
const YIELD_OPTIMIZER_CONTRACT_ADDRESS = "0x21BC0cE9CdBFA9F0a1fe7F13c312257446AFC598";

// LINK Token address on Sepolia
const LINK_TOKEN_ADDRESS = "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5";

// Strategy ID for Aave
const AAVE_STRATEGY_ID = 0;

// --- Minimal YieldOptimizer Contract ABI for setting support ---
const YIELD_OPTIMIZER_ABI = [
    // Functions
    "function setSupportedStrategyToken(uint256 _strategyId, address _tokenAddress, bool _isSupported)",
    "function owner() view returns (address)",
    "function supportedStrategyDepositTokens(uint256, address) view returns (bool)", // To check current status

    // Events
    "event SupportedStrategyTokenUpdated(uint256 indexed strategyId, address indexed tokenAddress, bool isSupported)",

    // Custom Errors (for owner-related errors)
    "error OwnableUnauthorizedAccount(address owner)",
    // Add other relevant custom errors from your contract for better debugging
];

async function main() {
    console.log("Starting script to enable LINK for Aave strategy in YieldOptimizer...");

    // 1. Get the Signer (must be the contract owner)
    const [deployer]: Signer[] = await ethers.getSigners();
    const signerAddress = await deployer.getAddress();
    console.log(`Connected with wallet address: ${signerAddress}`);

    // 2. Get Contract Instance
    const yieldOptimizerContract: Contract = new ethers.Contract(YIELD_OPTIMIZER_CONTRACT_ADDRESS, YIELD_OPTIMIZER_ABI, deployer);

    try {
        // Verify if the connected address is the owner
        const contractOwner = await yieldOptimizerContract.owner();
        if (signerAddress.toLowerCase() !== contractOwner.toLowerCase()) {
            console.error(`Error: Connected wallet (${signerAddress}) is not the contract owner (${contractOwner}). Only the owner can call setSupportedStrategyToken.`);
            return;
        }
        console.log(`Connected wallet is the contract owner.`);

        // Check current status
        const isCurrentlySupported = await yieldOptimizerContract.supportedStrategyDepositTokens(AAVE_STRATEGY_ID, LINK_TOKEN_ADDRESS);
        if (isCurrentlySupported) {
            console.log(`LINK is already supported for Aave Strategy ID ${AAVE_STRATEGY_ID}. No action needed.`);
            return;
        }

        // 3. Call setSupportedStrategyToken
        console.log(`Enabling LINK (${LINK_TOKEN_ADDRESS}) for Aave Strategy ID ${AAVE_STRATEGY_ID}...`);
        const tx = await yieldOptimizerContract.connect(deployer).setSupportedStrategyToken(
            AAVE_STRATEGY_ID,
            LINK_TOKEN_ADDRESS,
            true // Set to true to enable
        );

        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`LINK support for Aave strategy updated successfully!`);

        // Parse and log the event
        const iface = new ethers.Interface(YIELD_OPTIMIZER_ABI);
        for (const log of receipt!.logs) {
            try {
                const parsedLog = iface.parseLog(log);
                if (parsedLog && parsedLog.name === "SupportedStrategyTokenUpdated") {
                    console.log(`  'SupportedStrategyTokenUpdated' Event Emitted:`);
                    console.log(`    Strategy ID: ${parsedLog.args.strategyId}`);
                    console.log(`    Token Address: ${parsedLog.args.tokenAddress}`);
                    console.log(`    Is Supported: ${parsedLog.args.isSupported}`);
                }
            } catch (e) {
                // Ignore logs that don't match our ABI
            }
        }

    } catch (error: any) {
        console.error("An error occurred during the process:");
        if (error.reason) {
            console.error(`Ethers.js Reason: ${error.reason}`);
        }
        if (error.data) {
            try {
                const decodedError = yieldOptimizerContract.interface.parseError(error.data);
                if (decodedError) {
                    console.error(`Decoded Contract Error: ${decodedError.name}`);
                    for (const [key, value] of Object.entries(decodedError.args)) {
                        if (isNaN(Number(key))) {
                            console.error(`  ${key}: ${value}`);
                        }
                    }
                } else {
                    console.error(`Raw EVM Error Data: ${error.data}`);
                    console.error(`Could not decode specific error data.`);
                }
            } catch (decodeError: any) {
                console.error(`Raw EVM Error Data: ${error.data}`);
                console.error(`Error attempting to decode custom error: ${decodeError.message}`);
            }
        }
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});