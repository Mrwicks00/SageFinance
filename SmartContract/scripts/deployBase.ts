import * as hre from "hardhat"

import { ethers,  } from "hardhat";
import { BigNumberish } from "ethers"; // Import BigNumberish for clarity with large numbers

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // --- Your YieldOptimizer Constructor Arguments (Base Sepolia Addresses) ---
  // Ensure these match the exact types in your Solidity constructor
  
  // NOTE: Base Sepolia is a relatively new testnet. Some addresses below need verification:
  // 1. Check https://docs.chain.link/data-feeds/price-feeds/addresses for latest price feeds
  // 2. Verify Aave V3 deployment on Base Sepolia at https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
  // 3. Check Compound V3 deployment status on Base Sepolia
  // 4. Verify Chainlink VRF V2.5 coordinator address for Base Sepolia
  
  // Chainlink Price Feeds (Base Sepolia) - VERIFY THESE ADDRESSES
  // Check: https://docs.chain.link/data-feeds/price-feeds/addresses/#base-sepolia-testnet
  const ethUsdPriceFeed: string = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"; // ETH/USD - NEEDS VERIFICATION
  const usdcUsdPriceFeed: string = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165"; // USDC/USD - NEEDS VERIFICATION
  
  // Token Addresses (Base Sepolia)
  const defaultStablecoinAddress: string = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC Base Sepolia - NEEDS VERIFICATION
  const defaultWethAddress: string = "0x4200000000000000000000000000000000000006"; // WETH Base Sepolia (Confirmed)
  
  // Your AI Agent address - UPDATE THIS WITH YOUR ACTUAL ADDRESS
  const aiAgent: string = "0xa4f7e9da12136de291aF8653395F926DA53496Fe"; // UPDATE THIS
  
  // Protocol Addresses (Base Sepolia)
  // AAVE V3 Pool - NEEDS VERIFICATION - Check https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
  const aaveLendingPool: string = "0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27"; // AAVE V3 Pool Base Sepolia - NEEDS VERIFICATION
  
  // Compound V3 Comet - NEEDS VERIFICATION - Check if deployed on Base Sepolia
  const compoundComet: string = "0x571621Ce60Cebb0c1D442B5afb38B1663C6Bf017"; // Compound V3 USDC Base Sepolia - NEEDS VERIFICATION
  
  // Uniswap V3 SwapRouter02 (Base Sepolia) - CONFIRMED
  const uniswapRouter: string = "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4"; // Confirmed from Uniswap docs
  
  // Chainlink VRF V2.5 (Base Sepolia) - NEEDS VERIFICATION
  // Check: https://docs.chain.link/vrf/v2-5/supported-networks#base-sepolia
  const vrfCoordinator: string = "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE"; // VRF V2.5 Coordinator Base Sepolia - NEEDS VERIFICATION
  
  // VRF Subscription ID - YOU NEED TO CREATE THIS
  // 1. Go to https://vrf.chain.link/
  // 2. Connect to Base Sepolia network
  // 3. Create a new subscription
  // 4. Fund it with LINK tokens
  // 5. Replace the ID below with your actual subscription ID
  const vrfSubscriptionId: BigNumberish = "30864230915599643546000355715244668751825915192059059765262085358475896839325"; // REPLACE WITH YOUR ACTUAL VRF SUBSCRIPTION ID
  
  // Chainlink VRF Key Hash (Base Sepolia) - NEEDS VERIFICATION
  // Check: https://docs.chain.link/vrf/v2-5/supported-networks#base-sepolia
  const keyHash: string = "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71"; // Key Hash Base Sepolia - NEEDS VERIFICATION
  
  // Initial Callback Gas Limit
  const initialCallbackGasLimit: number = 750000; // Starting with a generous limit, can be adjusted later

  console.log("=== IMPORTANT: VERIFY THESE ADDRESSES BEFORE DEPLOYMENT ===");
  console.log("ETH/USD Price Feed:", ethUsdPriceFeed);
  console.log("USDC/USD Price Feed:", usdcUsdPriceFeed);
  console.log("USDC Token:", defaultStablecoinAddress);
  console.log("WETH Token:", defaultWethAddress, "(✓ Confirmed)");
  console.log("AAVE Lending Pool:", aaveLendingPool);
  console.log("Compound Comet:", compoundComet);
  console.log("Uniswap Router:", uniswapRouter, "(✓ Confirmed)");
  console.log("VRF Coordinator:", vrfCoordinator);
  console.log("VRF Subscription ID:", vrfSubscriptionId);
  console.log("VRF Key Hash:", keyHash);
  console.log("AI Agent:", aiAgent);
  console.log("===============================================================");
  
  // Ask for confirmation before proceeding
  console.log("\nPlease verify all addresses above before proceeding with deployment!");
  console.log("Press Ctrl+C to cancel, or continue if all addresses are verified...\n");
  
  // Wait 5 seconds to give user time to read
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Get the ContractFactory for YieldOptimizer
  const YieldOptimizer = await ethers.getContractFactory("YieldOptimizer");

  // Deploy the contract with the specified constructor arguments
  console.log("Deploying YieldOptimizer to Base Sepolia...");
  const yieldOptimizer = await YieldOptimizer.deploy(
    ethUsdPriceFeed,
    usdcUsdPriceFeed,
    defaultStablecoinAddress,
    defaultWethAddress,
    aiAgent,
    aaveLendingPool,
    compoundComet,
    uniswapRouter,
    vrfCoordinator,
    vrfSubscriptionId,
    keyHash,
    initialCallbackGasLimit
  );

  // Wait for the contract to be deployed and confirmed
  await yieldOptimizer.waitForDeployment();

  const deployedAddress = await yieldOptimizer.getAddress();
  console.log("YieldOptimizer deployed to:", deployedAddress);
  console.log("View on BaseScan:", `https://sepolia.basescan.org/address/${deployedAddress}`);

  // --- Optional: Verify your contract on BaseScan ---
  // Make sure BASESCAN_API_KEY is set in your .env file
  // and your hardhat.config.ts has the basescan/etherscan section configured for Base Sepolia.
  if (hre.network.name === "base-sepolia" && (process.env.BASESCAN_API_KEY || process.env.ETHERSCAN_API_KEY)) {
    console.log("Waiting for block confirmations before verification...");
    // Wait for a few blocks to be mined after deployment for BaseScan to pick it up
    await yieldOptimizer.deploymentTransaction()?.wait(5); // Wait for 5 confirmations

    console.log("Verifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [
          ethUsdPriceFeed,
          usdcUsdPriceFeed,
          defaultStablecoinAddress,
          defaultWethAddress,
          aiAgent,
          aaveLendingPool,
          compoundComet,
          uniswapRouter,
          vrfCoordinator,
          vrfSubscriptionId,
          keyHash,
          initialCallbackGasLimit
        ],
      });
      console.log("Contract verified successfully!");
    } catch (error: any) {
      if (error.message.includes("Reason: Already Verified")) {
        console.log("Contract is already verified!");
      } else {
        console.error("Contract verification failed:", error);
      }
    }
  }

  console.log("\n=== POST-DEPLOYMENT STEPS ===");
  console.log("1. Add the deployed contract address to your VRF subscription as a consumer");
  console.log(`   - Go to https://vrf.chain.link/`);
  console.log(`   - Select Base Sepolia network`);
  console.log(`   - Add consumer: ${deployedAddress}`);
  console.log("2. Fund your VRF subscription with LINK tokens");
  console.log("3. Test your contract functions on BaseScan");
  console.log("============================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});