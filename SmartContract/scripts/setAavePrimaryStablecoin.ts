import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// --- Configuration ---
// Your deployed YieldOptimizer contract address on Sepolia
const YIELD_OPTIMIZER_CONTRACT_ADDRESS = "0x21BC0cE9CdBFA9F0a1fe7F13c312257446AFC598";

// LINK Token address on Sepolia
const LINK_TOKEN_ADDRESS = "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5";

// Strategy ID for Aave
const AAVE_STRATEGY_ID = 0;

// --- Minimal YieldOptimizer Contract ABI for setting this ---
const YIELD_OPTIMIZER_ABI = [
    // Functions
    "function setStrategyPrimaryStablecoin(uint256 _strategyId, address _tokenAddress)", // Assuming this function exists
    "function strategyPrimaryStablecoins(uint256) view returns (address)", // To check current value
    "function owner() view returns (address)",

    // Events (add if your contract emits one for this action)
    // "event StrategyPrimaryStablecoinSet(uint256 indexed strategyId, address tokenAddress)",

    // Custom Errors (for owner-related errors)
    "error OwnableUnauthorizedAccount(address owner)",
    "error ZeroAddress()", // If your setter has a zero address check
];

async function main() {
    console.log("Starting script to set primary stablecoin for Aave strategy...");

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
            console.error(`Error: Connected wallet (${signerAddress}) is not the contract owner (${contractOwner}). Only the owner can call setStrategyPrimaryStablecoin.`);
            return;
        }
        console.log(`Connected wallet is the contract owner.`);

        // Check current status
        const currentPrimaryStablecoin = await yieldOptimizerContract.strategyPrimaryStablecoins(AAVE_STRATEGY_ID);
        console.log(`Current primary stablecoin for Aave (ID ${AAVE_STRATEGY_ID}): ${currentPrimaryStablecoin}`);

        if (currentPrimaryStablecoin.toLowerCase() === LINK_TOKEN_ADDRESS.toLowerCase()) {
            console.log(`LINK is already set as the primary stablecoin for Aave. No action needed.`);
            return;
        }

        // 3. Call setStrategyPrimaryStablecoin
        console.log(`Setting LINK (${LINK_TOKEN_ADDRESS}) as the primary stablecoin for Aave Strategy ID ${AAVE_STRATEGY_ID}...`);
        const tx = await yieldOptimizerContract.connect(deployer).setStrategyPrimaryStablecoin(
            AAVE_STRATEGY_ID,
            LINK_TOKEN_ADDRESS
        );

        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`Primary stablecoin for Aave strategy set successfully to LINK!`);

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