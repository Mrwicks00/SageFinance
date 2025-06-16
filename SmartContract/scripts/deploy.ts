import * as hre from "hardhat"

import { ethers,  } from "hardhat";
import { BigNumberish } from "ethers"; // Import BigNumberish for clarity with large numbers

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // --- Your YieldOptimizer Constructor Arguments (Sepolia Addresses) ---
  // Ensure these match the exact types in your Solidity constructor
  const ethUsdPriceFeed: string = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  const usdcUsdPriceFeed: string = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E";
  const stablecoin: string = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC Sepolia
  const weth: string = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"; // WETH Sepolia
  const aiAgent: string = "0xa4f7e9da12136de291aF8653395F926DA53496Fe"; // Your AI Agent address
  const aaveLendingPool: string = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"; // CORRECTED AAVE V3 Pool for Sepolia
  const compoundComet: string = "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e"; // Compound V3 Comet USDC on Sepolia
  const uniswapRouter: string = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"; // Uniswap V3 SwapRouter02 on Sepolia
  const vrfCoordinator: string = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B"; // Chainlink VRF V2 Coordinator on Sepolia
  const vrfSubscriptionId: BigNumberish = "45637967718972486609456490017793923153518238960412990951905928516295505983196"; // Your VRF v2.5 Subscription ID (as string for large uint256)
  const keyHash: string = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"; // Chainlink VRF Key Hash for Sepolia (500 Gwei)

  // Get the ContractFactory for YieldOptimizer
  const YieldOptimizer = await ethers.getContractFactory("YieldOptimizer");

  // Deploy the contract with the specified constructor arguments
  const yieldOptimizer = await YieldOptimizer.deploy(
    ethUsdPriceFeed,
    usdcUsdPriceFeed,
    stablecoin,
    weth,
    aiAgent,
    aaveLendingPool, // Using the corrected Aave address
    compoundComet,
    uniswapRouter,
    vrfCoordinator,
    vrfSubscriptionId,
    keyHash
  );

  // Wait for the contract to be deployed and confirmed
  await yieldOptimizer.waitForDeployment();

  const deployedAddress = await yieldOptimizer.getAddress();
  console.log("YieldOptimizer deployed to:", deployedAddress);

  // --- Optional: Verify your contract on Etherscan ---
  // Make sure ETHERSCAN_API_KEY is set in your .env file
  // and your hardhat.config.ts has the etherscan section configured.
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations before verification...");
    // Wait for a few blocks to be mined after deployment for Etherscan to pick it up
    await yieldOptimizer.deploymentTransaction()?.wait(5); // Wait for 5 confirmations

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [
          ethUsdPriceFeed,
          usdcUsdPriceFeed,
          stablecoin,
          weth,
          aiAgent,
          aaveLendingPool,
          compoundComet,
          uniswapRouter,
          vrfCoordinator,
          vrfSubscriptionId,
          keyHash
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});