import { ethers } from "hardhat";
import { BigNumberish } from "ethers";

async function main() {
  const [user] = await ethers.getSigners(); // Using 'user' for clarity, assuming deployer is the test user

  console.log("Executing deposit test with account:", user.address);

  // --- Configuration ---
  // Your NEWLY DEPLOYED YieldOptimizer contract address
  const YIELD_OPTIMIZER_ADDRESS = "0x4cF9c155E2b3d54C56DfB82c548229AA700Abcb6"; 
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC Sepolia address
  const AMOUNT_TO_DEPOSIT = ethers.parseUnits("5", 6); // Example: 100 USDC (USDC has 6 decimals)

  // Get contract instances
  const yieldOptimizer = await ethers.getContractAt("YieldOptimizer", YIELD_OPTIMIZER_ADDRESS, user);
  const usdc = await ethers.getContractAt("IERC20WithDecimals", USDC_ADDRESS, user); // Assuming IERC20WithDecimals is in your interfaces

  console.log(`\nAttempting to deposit ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, 6)} USDC into YieldOptimizer...`);

  // --- Check Allowance and Approve if Necessary ---
  const currentAllowance = await usdc.allowance(user.address, YIELD_OPTIMIZER_ADDRESS);

  if (currentAllowance < AMOUNT_TO_DEPOSIT) {
    console.log(`Current allowance (${ethers.formatUnits(currentAllowance, 6)} USDC) is insufficient.`);
    console.log("Approving YieldOptimizer to spend USDC...");
    const approveTx = await usdc.approve(YIELD_OPTIMIZER_ADDRESS, AMOUNT_TO_DEPOSIT);
    await approveTx.wait();
    console.log("USDC approved successfully!");
  } else {
    console.log(`Sufficient USDC allowance already exists: ${ethers.formatUnits(currentAllowance, 6)} USDC.`);
  }

  // --- Call depositRandom ---
  console.log("Calling depositRandom on YieldOptimizer...");
  try {
    const depositRandomTx = await yieldOptimizer.depositRandom(AMOUNT_TO_DEPOSIT);
    const receipt = await depositRandomTx.wait();
    console.log(`depositRandom transaction sent! Hash: ${receipt?.hash}`);

    // You can parse events from the receipt if you want to get the requestID directly here
    const randomDepositRequestedEvent = receipt?.logs.find(
      (log: any) => yieldOptimizer.interface.parseLog(log)?.name === "RandomDepositRequested"
    );

    if (randomDepositRequestedEvent) {
      const parsedLog = yieldOptimizer.interface.parseLog(randomDepositRequestedEvent as any);
      if (parsedLog) {
        const requestId = parsedLog.args.requestID;
        console.log(`VRF Randomness requested! Request ID: ${requestId}`);
      }
    } else {
      console.log("RandomDepositRequested event not found in transaction receipt.");
    }

    console.log("Waiting for VRF fulfillment (this happens automatically by Chainlink)...");

    // In a real test, you'd typically have a loop or a listener here
    // to wait for the fulfillRandomWords call and check for the Deposited event.
    // For a simple script, you might just check Etherscan manually after a minute or two.

  } catch (error) {
    console.error("Error during depositRandom:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});