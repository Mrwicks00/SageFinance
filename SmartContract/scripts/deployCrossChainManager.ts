import * as hre from "hardhat";
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying CrossChainManager with the account:", deployer.address);

  // --- CrossChainManager Constructor Arguments (Sepolia Addresses) ---
  const ccipRouterAddress: string = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"; // Chainlink CCIP Router on Sepolia
  const stablecoinAddress: string = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC on Sepolia
  const aiAgentAddress: string = "0xa4f7e9da12136de291aF8653395F926DA53496Fe"; // Your AI Agent address
  const yieldOptimizerAddress: string = "0xe0377d6C3Ea0e3310Dd259914470668206F620ff"; // Your deployed YieldOptimizer address on Sepolia

  const CrossChainManager = await ethers.getContractFactory("CrossChainManager");
  const crossChainManager = await CrossChainManager.deploy(
    ccipRouterAddress,
    stablecoinAddress,
    aiAgentAddress,
    yieldOptimizerAddress
  );

  await crossChainManager.waitForDeployment();

  const deployedAddress = await crossChainManager.getAddress();
  console.log("CrossChainManager deployed to:", deployedAddress);

  // --- Optional: Verify your contract on Etherscan ---
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations before verification...");
    await crossChainManager.deploymentTransaction()?.wait(5); // Wait for 5 confirmations

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [
          ccipRouterAddress,
          stablecoinAddress,
          aiAgentAddress,
          yieldOptimizerAddress
        ],
      });
      console.log("CrossChainManager verified successfully!");
    } catch (error: any) {
      if (error.message.includes("Reason: Already Verified")) {
        console.log("CrossChainManager is already verified!");
      } else {
        console.error("CrossChainManager verification failed:", error);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});