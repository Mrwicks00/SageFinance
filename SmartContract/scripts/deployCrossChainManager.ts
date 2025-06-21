const { ethers, network } = require("hardhat");
const hre = require("hardhat"); // Import hardhat runtime environment for verification

// --- IMPORTANT: HARDCODED TESTNET ADDRESSES ---
// These are the official testnet addresses for USDC, Chainlink Router, and Chain Selectors.
// They are kept exactly as provided by you.
const CHAIN_CONFIGS = {
  sepolia: {
    chainId: 11155111,
    chainSelector: "16015286601757825753", // Sepolia Chainlink Chain Selector
    ccipRouter: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", // Chainlink Sepolia Router
    usdcToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Official Sepolia USDC for CCIP
    yieldOptimizerAddress: "0x543aeA3ad17fE0a4cfc8546f958d15BB2828e68B",
  },
  "base-sepolia": {
    chainId: 84532,
    chainSelector: "10344971235874465080", // Base Sepolia Chainlink Chain Selector
    ccipRouter: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93", // Chainlink Base Sepolia Router
    usdcToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Official Base Sepolia USDC for CCIP
    yieldOptimizerAddress: "0x2fE627AD81358FC3a8ccC197869ad347E487c3C0",
  },
  "arbitrum-sepolia": {
    chainId: 421614,
    chainSelector: "3478487238524512106", // Arbitrum Sepolia Chainlink Chain Selector
    ccipRouter: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165", // Chainlink Arbitrum Sepolia Router
    usdcToken: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Official Arbitrum Sepolia USDC for CCIP
    yieldOptimizerAddress: "0xA939e5f884f46a281Eac2c438a7337b890644b8C",
  },
};

async function main() {
  const currentNetworkName = network.name;
  const currentChainConfig = CHAIN_CONFIGS[currentNetworkName];

  if (!currentChainConfig) {
    console.error(`Error: Configuration for network '${currentNetworkName}' not found in script.`);
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log(`\nDeploying CrossChainManager to ${currentNetworkName} with account: ${deployer.address}`);

  // --- Input Validation ---
  if (!currentChainConfig.yieldOptimizerAddress || currentChainConfig.yieldOptimizerAddress.startsWith(`YOUR_YIELD_OPTIMIZER_ADDRESS_ON_`)) {
    console.error(`\nERROR: Please update 'yieldOptimizerAddress' for ${currentNetworkName} in CHAIN_CONFIGS with your deployed YieldOptimizer address.`);
    process.exit(1);
  }

  // --- Deploy CrossChainManager ---
  const CrossChainManager = await ethers.getContractFactory("CrossChainManager");
  const crossChainManager = await CrossChainManager.deploy(
    currentChainConfig.ccipRouter,
    currentChainConfig.usdcToken, // stablecoin (USDC)
    deployer.address, // aiAgent (can be updated later)
    currentChainConfig.yieldOptimizerAddress, // The *already deployed* YieldOptimizer on this network
    currentChainConfig.chainSelector // currentChainSelector for this network
  );
  await crossChainManager.waitForDeployment();
  const crossChainManagerAddress = await crossChainManager.getAddress();

  console.log(`\n✅ CrossChainManager deployed to ${currentNetworkName} at: ${crossChainManagerAddress}`);

  // --- Verification Logic ---
  // Ensure your hardhat.config.js has the etherscan API keys and custom chains configured.
  // The environment variables (e.g., BASESCAN_API_KEY) must be set for verification to work.
  if (process.env[`${currentNetworkName.toUpperCase().replace('-', '_')}_API_KEY`]) {
    console.log("Waiting for block confirmations before verification...");
    // Wait for a few blocks to be mined after deployment for Etherscan/Basescan/Arbiscan to pick it up
    await crossChainManager.deploymentTransaction()?.wait(5); // Wait for 5 confirmations

    console.log(`Verifying contract on ${currentNetworkName}scan...`);
    try {
      await hre.run("verify:verify", {
        address: crossChainManagerAddress,
        constructorArguments: [
          currentChainConfig.ccipRouter,
          currentChainConfig.usdcToken,
          deployer.address,
          currentChainConfig.yieldOptimizerAddress,
          currentChainConfig.chainSelector,
        ],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes("Reason: Already Verified")) {
        console.log("Contract is already verified!");
      } else {
        console.error("Contract verification failed:", error);
      }
    }
  } else {
    console.warn(`\n⚠️ Skipping verification for ${currentNetworkName}. Please ensure the correct API key is set in your .env file (e.g., ETHERSCAN_API_KEY, BASESCAN_API_KEY, ARBISCAN_API_KEY).`);
  }

  console.log(`\n--- IMPORTANT NEXT STEPS FOR ${currentNetworkName} ---`);

  // 1. Funding Link (if needed, not directly in this script)
  console.log(`1. Ensure your deployer wallet has enough native token (ETH) for gas and LINK tokens to pay for CCIP fees when initiating transfers.`);

  // 2. Initializing crossChainManagers mapping (after all CCMs are deployed)
  console.log(`\n2. After ALL CrossChainManager contracts are deployed on Sepolia, Base Sepolia, and Arbitrum Sepolia, you MUST link them together.`);
  console.log(`   For the CrossChainManager deployed on ${currentNetworkName} (${crossChainManagerAddress}):`);
  console.log(`   You will need to call 'setCrossChainManager' for the other chains. Example:`);
  console.log(`   - To link to Base Sepolia:`);
  console.log(`     Call 'setCrossChainManager(${CHAIN_CONFIGS["base-sepolia"].chainSelector}, "ACTUAL_BASE_SEPOLIA_CCM_ADDRESS")'`);
  console.log(`   - To link to Arbitrum Sepolia:`);
  console.log(`     Call 'setCrossChainManager(${CHAIN_CONFIGS["arbitrum-sepolia"].chainSelector}, "ACTUAL_ARBITRUM_SEPOLIA_CCM_ADDRESS")'`);
  console.log(`   (And similar calls on the Base Sepolia and Arbitrum Sepolia CrossChainManager instances for Sepolia's CCM address).`);
  console.log(`   You will get the "ACTUAL_..." addresses after successfully running this script on each respective network.`);

  // 3. Approve USDC for CrossChainManager (for users)
  console.log(`\n3. Instruct users to approve the CrossChainManager (${crossChainManagerAddress}) to spend their USDC on ${currentNetworkName}.`);
  console.log(`   Example: For a user to transfer 10 USDC (6 decimals) from their wallet to the CrossChainManager:`);
  console.log(`   USDC Contract (${currentChainConfig.usdcToken}).approve(${crossChainManagerAddress}, 10000000)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
