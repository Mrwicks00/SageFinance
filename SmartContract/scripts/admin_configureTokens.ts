import { ethers } from "hardhat";
import { Signer } from "ethers";
import { 
    YIELD_OPTIMIZER_CONTRACT_ADDRESS,
    USDC_TOKEN_ADDRESS, LINK_TOKEN_ADDRESS, // Use LINK
    AAVE_STRATEGY_ID, COMPOUND_STRATEGY_ID,
    getYieldOptimizerContract, getTokenContract, ensureOwner 
} from "./_common_constants"; // Assuming common constants are in this path

async function main() {
    console.log("Starting Admin Configuration Script...");

    const [deployer]: Signer[] = await ethers.getSigners();
    const signerAddress = await deployer.getAddress();
    console.log(`Connected with wallet address: ${signerAddress}`);

    const yieldOptimizerContract = await getYieldOptimizerContract(deployer);
    await ensureOwner(yieldOptimizerContract, signerAddress);

    // --- Configure USDC ---
    const usdcToken = await getTokenContract(USDC_TOKEN_ADDRESS, deployer);
    const usdcSymbol = await usdcToken.symbol();
    console.log(`\n--- Configuring ${usdcSymbol} (${USDC_TOKEN_ADDRESS}) ---`);

    // Set USDC as supported for Aave
    let isSupported = await yieldOptimizerContract.supportedStrategyDepositTokens(AAVE_STRATEGY_ID, USDC_TOKEN_ADDRESS);
    if (!isSupported) {
        console.log(`Setting ${usdcSymbol} as supported for Aave (ID ${AAVE_STRATEGY_ID})...`);
        const tx = await yieldOptimizerContract.setSupportedStrategyToken(AAVE_STRATEGY_ID, USDC_TOKEN_ADDRESS, true);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
    } else {
        console.log(`${usdcSymbol} already supported for Aave (ID ${AAVE_STRATEGY_ID}).`);
    }

    // Set USDC as supported for Compound
    isSupported = await yieldOptimizerContract.supportedStrategyDepositTokens(COMPOUND_STRATEGY_ID, USDC_TOKEN_ADDRESS);
    if (!isSupported) {
        console.log(`Setting ${usdcSymbol} as supported for Compound (ID ${COMPOUND_STRATEGY_ID})...`);
        const tx = await yieldOptimizerContract.setSupportedStrategyToken(COMPOUND_STRATEGY_ID, USDC_TOKEN_ADDRESS, true);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
    } else {
        console.log(`${usdcSymbol} already supported for Compound (ID ${COMPOUND_STRATEGY_ID}).`);
    }

    // Set USDC as primary stablecoin for Aave
    let primaryStablecoin = await yieldOptimizerContract.strategyPrimaryStablecoins(AAVE_STRATEGY_ID);
    if (primaryStablecoin.toLowerCase() !== USDC_TOKEN_ADDRESS.toLowerCase()) {
        console.log(`Setting ${usdcSymbol} as primary stablecoin for Aave (ID ${AAVE_STRATEGY_ID})...`);
        const tx = await yieldOptimizerContract.setStrategyPrimaryStablecoin(AAVE_STRATEGY_ID, USDC_TOKEN_ADDRESS);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
    } else {
        console.log(`${usdcSymbol} already primary stablecoin for Aave (ID ${AAVE_STRATEGY_ID}).`);
    }

    // Set USDC as primary stablecoin for Compound
    primaryStablecoin = await yieldOptimizerContract.strategyPrimaryStablecoins(COMPOUND_STRATEGY_ID);
    if (primaryStablecoin.toLowerCase() !== USDC_TOKEN_ADDRESS.toLowerCase()) {
        console.log(`Setting ${usdcSymbol} as primary stablecoin for Compound (ID ${COMPOUND_STRATEGY_ID})...`);
        const tx = await yieldOptimizerContract.setStrategyPrimaryStablecoin(COMPOUND_STRATEGY_ID, USDC_TOKEN_ADDRESS);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
    } else {
        console.log(`${usdcSymbol} already primary stablecoin for Compound (ID ${COMPOUND_STRATEGY_ID}).`);
    }

    // --- Configure LINK ---
    const linkToken = await getTokenContract(LINK_TOKEN_ADDRESS, deployer);
    const linkSymbol = await linkToken.symbol();
    console.log(`\n--- Configuring ${linkSymbol} (${LINK_TOKEN_ADDRESS}) ---`);

    // Set LINK as supported for Aave
    isSupported = await yieldOptimizerContract.supportedStrategyDepositTokens(AAVE_STRATEGY_ID, LINK_TOKEN_ADDRESS);
    if (!isSupported) {
        console.log(`Setting ${linkSymbol} as supported for Aave (ID ${AAVE_STRATEGY_ID})...`);
        const tx = await yieldOptimizerContract.setSupportedStrategyToken(AAVE_STRATEGY_ID, LINK_TOKEN_ADDRESS, true);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
    } else {
        console.log(`${linkSymbol} already supported for Aave (ID ${AAVE_STRATEGY_ID}).`);
    }

    // Set LINK as supported for Compound
    isSupported = await yieldOptimizerContract.supportedStrategyDepositTokens(COMPOUND_STRATEGY_ID, LINK_TOKEN_ADDRESS);
    if (!isSupported) {
        console.log(`Setting ${linkSymbol} as supported for Compound (ID ${COMPOUND_STRATEGY_ID})...`);
        const tx = await yieldOptimizerContract.setSupportedStrategyToken(COMPOUND_STRATEGY_ID, LINK_TOKEN_ADDRESS, true);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
    } else {
        console.log(`${linkSymbol} already supported for Compound (ID ${COMPOUND_STRATEGY_ID}).`);
    }

    // Set LINK as primary WETH (assuming your contract uses `strategyPrimaryWeths` for LINK) for Aave
    let primaryWeth = await yieldOptimizerContract.strategyPrimaryWeths(AAVE_STRATEGY_ID);
    if (primaryWeth.toLowerCase() !== LINK_TOKEN_ADDRESS.toLowerCase()) {
        console.log(`Setting ${linkSymbol} as primary WETH for Aave (ID ${AAVE_STRATEGY_ID})...`);
        const tx = await yieldOptimizerContract.setStrategyPrimaryWeth(AAVE_STRATEGY_ID, LINK_TOKEN_ADDRESS);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
    } else {
        console.log(`${linkSymbol} already primary WETH for Aave (ID ${AAVE_STRATEGY_ID}).`);
    }

    // Set LINK as primary WETH (assuming your contract uses `strategyPrimaryWeths` for LINK) for Compound
    primaryWeth = await yieldOptimizerContract.strategyPrimaryWeths(COMPOUND_STRATEGY_ID);
    if (primaryWeth.toLowerCase() !== LINK_TOKEN_ADDRESS.toLowerCase()) {
        console.log(`Setting ${linkSymbol} as primary WETH for Compound (ID ${COMPOUND_STRATEGY_ID})...`);
        const tx = await yieldOptimizerContract.setStrategyPrimaryWeth(COMPOUND_STRATEGY_ID, LINK_TOKEN_ADDRESS);
        await tx.wait();
        console.log(`Tx: ${tx.hash}`);
    } else {
        console.log(`${linkSymbol} already primary WETH for Compound (ID ${COMPOUND_STRATEGY_ID}).`);
    }
    console.log("\nAdmin configuration complete!");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});