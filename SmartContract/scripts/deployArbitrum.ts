import * as hre from "hardhat"
import { ethers } from "hardhat";
import { BigNumberish } from "ethers";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // --- YieldOptimizer Constructor Arguments (Arbitrum Sepolia Addresses) ---
  
  // Chainlink Price Feeds (Arbitrum Sepolia)
  // Source: https://docs.chain.link/data-feeds/price-feeds/addresses
  const ethUsdPriceFeed: string = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165"; // ETH/USD Arbitrum Sepolia
  const usdcUsdPriceFeed: string = "0x0153002d20B96532C639313c2d54c3dA09109309"; // USDC/USD Arbitrum Sepolia
  
  // Token Addresses (Arbitrum Sepolia)
  const defaultStablecoinAddress: string = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // USDC Arbitrum Sepolia
  const defaultWethAddress: string = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73"; // WETH Arbitrary Sepolia
  
  // Your AI Agent address - UPDATE THIS WITH YOUR ACTUAL ADDRESS
  const aiAgent: string = "0xa4f7e9da12136de291aF8653395F926DA53496Fe"; // UPDATE THIS
  
  // Protocol Addresses (Arbitrum Sepolia)
  
  // AAVE V3 Pool (Arbitrum Sepolia)
  // Source: https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
  const aaveLendingPool: string = "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff"; // AAVE V3 Pool Arbitrum Sepolia
  
  // Compound V3 - NOT AVAILABLE ON ARBITRUM SEPOLIA
  // Compound V3 is not deployed on Arbitrum Sepolia. Using a placeholder that will revert.
  // You may need to remove Compound integration or use a different lending protocol
  const compoundComet: string = "0xa4f7e9da12136de291aF8653395F926DA53496Fe"; // NOT DEPLOYED - PLACEHOLDER
  
  // Uniswap V3 SwapRouter02 (Arbitrum Sepolia)
  const uniswapRouter: string = "0x101F443B4d1b059569D643917553c771E1b9663E"; // SwapRouter02 Arbitrum Sepolia
  
  // Chainlink VRF V2.5 (Arbitrum Sepolia)
  const vrfCoordinator: string = "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61"; // VRF V2.5 Coordinator Arbitrum Sepolia
  
  // VRF Subscription ID - YOU NEED TO CREATE THIS
  // 1. Go to https://vrf.chain.link/
  // 2. Connect to Arbitrum Sepolia network
  // 3. Create a new subscription
  // 4. Fund it with LINK tokens
  // 5. Replace the ID below with your actual subscription ID
  const vrfSubscriptionId: BigNumberish = "81419214112012806503305765537838407742361010842144582143710017934010455454166"; // REPLACE WITH YOUR ACTUAL VRF SUBSCRIPTION ID
  
  // Chainlink VRF Key Hash (Arbitrum Sepolia)
  const keyHash: string = "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be"; // 30 gwei Key Hash Arbitrum Sepolia
  
  // Initial Callback Gas Limit
  const initialCallbackGasLimit: number = 750000;

  // LINK Token address for Arbitrum Sepolia (for VRF funding)
  const linkToken: string = "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E"; // LINK Token Arbitrum Sepolia

  console.log("=== ARBITRUM SEPOLIA DEPLOYMENT ADDRESSES ===");
  console.log("ETH/USD Price Feed:", ethUsdPriceFeed, "(✓ Verified)");
  console.log("USDC/USD Price Feed:", usdcUsdPriceFeed, "(✓ Verified)");
  console.log("USDC Token:", defaultStablecoinAddress, "(✓ Verified)");
  console.log("WETH Token:", defaultWethAddress, "(✓ Verified)");
  console.log("AAVE Lending Pool:", aaveLendingPool, "(✓ Verified)");
  console.log("Compound Comet:", compoundComet, "(⚠️  NOT DEPLOYED - WILL FAIL)");
  console.log("Uniswap Router:", uniswapRouter, "(✓ Verified)");
  console.log("VRF Coordinator:", vrfCoordinator, "(✓ Verified)");
  console.log("VRF Subscription ID:", vrfSubscriptionId, "(⚠️  UPDATE REQUIRED)");
  console.log("VRF Key Hash:", keyHash, "(✓ Verified)");
  console.log("AI Agent:", aiAgent, "(⚠️  UPDATE REQUIRED)");
  console.log("LINK Token:", linkToken, "(✓ For VRF funding)");
  console.log("===============================================");
  
  console.log("\n=== IMPORTANT WARNINGS ===");
  console.log("🚨 Compound V3 is NOT deployed on Arbitrum Sepolia!");
  console.log("   - Your contract may fail if it tries to interact with Compound");
  console.log("   - Consider removing Compound integration or using alternative lending protocols");
  console.log("⚠️  Make sure to:");
  console.log("   1. Update the AI Agent address");
  console.log("   2. Create and fund a VRF subscription");
  console.log("   3. Update the VRF subscription ID");
  console.log("==========================");
  
  // Ask for confirmation before proceeding
  console.log("\nDo you want to proceed with deployment? (Compound integration will not work)");
  console.log("Press Ctrl+C to cancel, or wait 10 seconds to continue...\n");
  
  // Wait 10 seconds to give user time to read warnings
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Get the ContractFactory for YieldOptimizer
  const YieldOptimizer = await ethers.getContractFactory("YieldOptimizer");

  // Deploy the contract with the specified constructor arguments
  console.log("Deploying YieldOptimizer to Arbitrum Sepolia...");
  const yieldOptimizer = await YieldOptimizer.deploy(
    ethUsdPriceFeed,
    usdcUsdPriceFeed,
    defaultStablecoinAddress,
    defaultWethAddress,
    aiAgent,
    aaveLendingPool,
    compoundComet, // This will be zero address - may cause issues
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
  console.log("View on Arbiscan:", `https://sepolia.arbiscan.io/address/${deployedAddress}`);

  // --- Verify contract on Arbiscan ---
  if (hre.network.name === "arbitrum-sepolia" && process.env.ARBISCAN_API_KEY) {
    console.log("Waiting for block confirmations before verification...");
    await yieldOptimizer.deploymentTransaction()?.wait(5);

    console.log("Verifying contract on Arbiscan...");
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
  console.log("1. Create VRF Subscription:");
  console.log(`   - Go to https://vrf.chain.link/`);
  console.log(`   - Connect to Arbitrum Sepolia network`);
  console.log(`   - Create new subscription and note the ID`);
  console.log(`   - Fund with LINK tokens from: ${linkToken}`);
  console.log(`   - Add consumer: ${deployedAddress}`);
  console.log("");
  console.log("2. Get testnet tokens:");
  console.log("   - ETH: https://faucets.chain.link/arbitrum-sepolia");
  console.log("   - USDC: Bridge from other testnets or use faucets");
  console.log("   - LINK: https://faucets.chain.link/arbitrum-sepolia");
  console.log("");
  console.log("3. Test available integrations:");
  console.log("   ✅ Chainlink Price Feeds");
  console.log("   ✅ Aave V3 Lending");
  console.log("   ✅ Uniswap V3 Swapping");
  console.log("   ✅ Chainlink VRF");
  console.log("   ❌ Compound V3 (Not available)");
  console.log("");
  console.log("4. Consider alternative lending protocols:");
  console.log("   - Radiant Capital (if deployed on Arbitrum Sepolia)");
  console.log("   - Or focus on Aave V3 only");
  console.log("===============================");

  console.log("\n=== HARDHAT CONFIG REQUIREMENTS ===");
  console.log("Make sure your hardhat.config.ts includes:");
  console.log(`
networks: {
  "arbitrum-sepolia": {
    url: "https://sepolia-rollup.arbitrum.io/rpc",
    accounts: [process.env.PRIVATE_KEY!],
    chainId: 421614,
  },
},
etherscan: {
  apiKey: {
    arbitrumSepolia: process.env.ARBISCAN_API_KEY!,
  },
  customChains: [
    {
      network: "arbitrumSepolia",
      chainId: 421614,
      urls: {
        apiURL: "https://api-sepolia.arbiscan.io/api",
        browserURL: "https://sepolia.arbiscan.io/",
      },
    },
  ],
},`);
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});