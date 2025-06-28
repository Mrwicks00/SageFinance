import { ethers, network, run } from "hardhat";
import { Signer } from "ethers";
import { SagefiStakingContract } from "../typechain-types"; 
import { MockERC20 } from "../typechain-types"; 

async function main() {
  const [deployer]: Signer[] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${await deployer.getAddress()}`);

  let sageTokenAddress: string;

  if (network.name === "sepolia") {
    sageTokenAddress = "0xb451d2be965c1b4d70066c79ea945883bb04f084";
  } else if (network.name === "base-sepolia") {
    sageTokenAddress = "0xef0bb5612d0aebf0c8aeaef891b23feaa1df0887";
  } else if (network.name === "arbitrum-sepolia") {
    sageTokenAddress = "0x5f75b9bd6b90be2a924a23a3a3a81030b9040bc3";
  } else {
   
    console.log("Deploying a Mock SAGE Token for local testing...");
    const MockERC20Factory = await ethers.getContractFactory("MockERC20"); 
    const mockSageToken: MockERC20 = await MockERC20Factory.deploy("Mock SAGE", "MSAGE");
    await mockSageToken.waitForDeployment();
    sageTokenAddress = await mockSageToken.getAddress();
    console.log(`Mock SAGE Token deployed to: ${sageTokenAddress}`);
  }


  console.log(`Using SAGE Token Address: ${sageTokenAddress} on ${network.name}`);

  // Get the ContractFactory and deploy the contract
  const SagefiStakingContractFactory = await ethers.getContractFactory("SagefiStakingContract");
  const sagefiStaking: SagefiStakingContract = await SagefiStakingContractFactory.deploy(sageTokenAddress);

  await sagefiStaking.waitForDeployment();

  const contractAddress: string = await sagefiStaking.getAddress();

  console.log(`SagefiStakingContract deployed to: ${contractAddress} on ${network.name}`);

  // Verify the contract on Etherscan/Basescan/Arbiscan
  if (["sepolia", "base-sepolia", "arbitrum-sepolia"].includes(network.name)) {
    console.log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [sageTokenAddress],
      });
      console.log("Contract verified successfully!");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract already verified.");
      } else {
        console.error("Error verifying contract:", error);
      }
    }
  }

  // Post-deployment configuration (Owner actions)
  console.log("Performing post-deployment configurations...");

  const defaultYieldRate: number = 500; 
  try {
    const currentYieldRate = await sagefiStaking.s_yieldRatePerYear();
    if (currentYieldRate.toString() !== defaultYieldRate.toString()) {
      console.log(`Setting yield rate to ${defaultYieldRate} basis points...`);
      const setRateTx = await sagefiStaking.setYieldRate(defaultYieldRate);
      await setRateTx.wait();
      console.log("Yield rate set successfully.");
    } else {
      console.log("Yield rate already set to the default value.");
    }
  } catch (error) {
    console.error("Error setting yield rate:", error);
  }

  console.log("Deployment and initial configuration complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });