import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Running Yield Optimizer deposit test with account:", deployer.address);

  // --- Configuration ---
  // Your NEW Yield Optimizer contract address on Sepolia
  const YOUR_YIELD_OPTIMIZER_ADDRESS = "0x4cF9c155E2b3d54C56DfB82c548229AA700Abcb6";
  
  // *** IMPORTANT CHANGE: Using LINK for Aave V3 Sepolia ***
  const LINK_ADDRESS_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; 
  const TOKEN_TO_DEPOSIT_ADDRESS = LINK_ADDRESS_SEPOLIA; 

  // Amount of LINK to deposit (e.g., 10 LINK, LINK has 18 decimals)
  const AMOUNT_TO_DEPOSIT = ethers.parseUnits("4", 6); // 10 LINK (18 decimals)

  // Strategy ID for Aave (based on your contract: strategies[0] = Aave)
  const AAVE_STRATEGY_ID = 0;

  // --- ABIs ---
  // Minimal ERC20 ABI for approve and balanceOf
  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)",
    "function decimals() public view returns (uint8)",
    "function symbol() public view returns (string)",
  ];

  // ABI for your YieldOptimizer's deposit function
  const YIELD_OPTIMIZER_ABI = [
    "function deposit(address _depositTokenAddress, uint256 strategyId, uint256 amount) external",
    "function setSupportedStrategyToken(uint256 _strategyId, address _tokenAddress, bool _isSupported) external",
    "function setStrategyPrimaryStablecoin(uint256 _strategyId, address _stablecoinAddress) external",
    "function supportedStrategyDepositTokens(uint256, address) view returns (bool)",
  ];

  // --- Contract Instances ---
  const tokenContract = new ethers.Contract(TOKEN_TO_DEPOSIT_ADDRESS, ERC20_ABI, deployer);
  const yieldOptimizerContract = new ethers.Contract(YOUR_YIELD_OPTIMIZER_ADDRESS, YIELD_OPTIMIZER_ABI, deployer);

  const tokenSymbol = await tokenContract.symbol();
  const tokenDecimals = await tokenContract.decimals();

  console.log(`\nChecking ${tokenSymbol} balance of ${deployer.address}...`);
  const tokenBalance = await tokenContract.balanceOf(deployer.address);
  console.log(`${tokenSymbol} Balance: ${ethers.formatUnits(tokenBalance, tokenDecimals)} ${tokenSymbol}`);

  if (tokenBalance < AMOUNT_TO_DEPOSIT) {
    console.warn(`WARNING: Insufficient ${tokenSymbol} balance. You have ${ethers.formatUnits(tokenBalance, tokenDecimals)}, but trying to deposit ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, tokenDecimals)}.`);
    console.warn(`Please ensure you have enough Sepolia ${tokenSymbol} at this address, or decrease AMOUNT_TO_DEPOSIT.`);
    return;
  }

  // --- Step 1: Ensure your Yield Optimizer supports this token for Aave strategy ---
  console.log(`\nChecking if Yield Optimizer supports ${tokenSymbol} for Aave strategy (ID: ${AAVE_STRATEGY_ID})...`);
  const isSupported = await yieldOptimizerContract.supportedStrategyDepositTokens(AAVE_STRATEGY_ID, TOKEN_TO_DEPOSIT_ADDRESS);

  if (!isSupported) {
    console.log(`${tokenSymbol} (${TOKEN_TO_DEPOSIT_ADDRESS}) is NOT yet supported for Aave strategy. Setting support...`);
    try {
      const setSupportTx = await yieldOptimizerContract.setSupportedStrategyToken(AAVE_STRATEGY_ID, TOKEN_TO_DEPOSIT_ADDRESS, true);
      await setSupportTx.wait();
      console.log("Supported token set successfully! Tx:", setSupportTx.hash);
    } catch (error: any) {
      console.error("Failed to set supported token:", error.message || error);
      console.error("Ensure the calling account is the owner of the Yield Optimizer contract.");
      return;
    }
  } else {
    console.log(`${tokenSymbol} is already supported for Aave strategy.`);
  }

  // --- Step 2: Ensure Aave strategy has a primary stablecoin set (optional but good for future withdrawals) ---
  console.log(`\nSetting Aave strategy primary stablecoin to ${tokenSymbol} (${TOKEN_TO_DEPOSIT_ADDRESS})...`);
  try {
      const setPrimaryStablecoinTx = await yieldOptimizerContract.setStrategyPrimaryStablecoin(AAVE_STRATEGY_ID, TOKEN_TO_DEPOSIT_ADDRESS);
      await setPrimaryStablecoinTx.wait();
      console.log("Primary stablecoin set successfully! Tx:", setPrimaryStablecoinTx.hash);
  } catch (error: any) {
      console.error(`Failed to set Aave strategy primary stablecoin to ${tokenSymbol}:`, error.message || error);
      console.error("Ensure the calling account is the owner of the Yield Optimizer contract.");
      // Don't return, as this might not be critical for deposit itself, but will be for withdraw/rebalance.
  }


  // --- Step 3: Approve your Yield Optimizer to spend your LINK ---
  console.log(`\nApproving Your Yield Optimizer (${YOUR_YIELD_OPTIMIZER_ADDRESS}) to spend ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, tokenDecimals)} ${tokenSymbol}...`);
  try {
    const approveTx = await tokenContract.approve(YOUR_YIELD_OPTIMIZER_ADDRESS, AMOUNT_TO_DEPOSIT);
    await approveTx.wait();
    console.log("Approval successful! Tx:", approveTx.hash);
  } catch (error: any) {
    console.error(`${tokenSymbol} Approval to Yield Optimizer failed:`, error.message || error);
    return;
  }

  // --- Step 4: Call your Yield Optimizer's deposit function ---
  console.log(`\nAttempting to call deposit on Your Yield Optimizer with ${ethers.formatUnits(AMOUNT_TO_DEPOSIT, tokenDecimals)} ${tokenSymbol} for Aave strategy...`);
  try {
    const depositTx = await yieldOptimizerContract.deposit(TOKEN_TO_DEPOSIT_ADDRESS, AAVE_STRATEGY_ID, AMOUNT_TO_DEPOSIT);
    await depositTx.wait();
    console.log("Deposit to Yield Optimizer successful! Tx:", depositTx.hash);
  } catch (error: any) {
    console.error("Deposit to Yield Optimizer failed:");
    console.error(error.message || error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});