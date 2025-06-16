import { expect } from "chai";
import { ethers } from "hardhat"; // Removed `upgrades` import
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  YieldOptimizer,
  MockERC20,
  MockAggregatorV3Interface,
  MockVRFCoordinator, // Using your custom mock here
  MockAaveLendingPool,
  MockCompoundCToken,
  MockUniswapV3Router,
} from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

// Removed: require("@openzeppelin/hardhat-upgrades"); as it's not needed in test file

describe("YieldOptimizer - Extended Test Suite (Non-Upgradeable)", function () {
  let yieldOptimizer: YieldOptimizer;
  let mockUSDC: MockERC20;
  let mockWETH: MockERC20;
  let mockPriceFeed: MockAggregatorV3Interface;
  let mockVRFCoordinator: MockVRFCoordinator;
  let mockAaveLendingPool: MockAaveLendingPool;
  let mockCompoundCToken: MockCompoundCToken;
  let mockUniswapRouter: MockUniswapV3Router;

  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let aiAgent: SignerWithAddress;
  let newAiAgent: SignerWithAddress;

  const INITIAL_USDC_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDC
  const INITIAL_WETH_SUPPLY = ethers.parseUnits("1000", 18); // 1000 WETH
  const DEPOSIT_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDC
  const LARGE_DEPOSIT = ethers.parseUnits("10000", 6); // 10k USDC
  const SMALL_DEPOSIT = ethers.parseUnits("100", 6); // 100 USDC

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3, aiAgent, newAiAgent] =
      await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20Factory.deploy("USD Coin", "USDC", 6);
    mockWETH = await MockERC20Factory.deploy("Wrapped Ether", "WETH", 18);

    // Deploy mock contracts
    const MockPriceFeedFactory = await ethers.getContractFactory(
      "MockAggregatorV3Interface"
    );
    mockPriceFeed = await MockPriceFeedFactory.deploy();

    const MockVRFFactory = await ethers.getContractFactory(
      "MockVRFCoordinator"
    );
    mockVRFCoordinator = await MockVRFFactory.deploy();

    const MockAaveFactory = await ethers.getContractFactory(
      "MockAaveLendingPool"
    );
    mockAaveLendingPool = await MockAaveFactory.deploy();

    const MockCompoundFactory = await ethers.getContractFactory(
      "MockCompoundCToken"
    );
    mockCompoundCToken = await MockCompoundFactory.deploy();
    await mockCompoundCToken.setUnderlying(await mockUSDC.getAddress());

    const MockUniswapFactory = await ethers.getContractFactory(
      "MockUniswapV3Router"
    );
    mockUniswapRouter = await MockUniswapFactory.deploy();

    // --- START OF CHANGES FOR NON-UPGRADEABLE CONTRACT ---

    // Deploy YieldOptimizer directly (non-upgradeable)
    // Ensure your YieldOptimizer contract now has a constructor that accepts these arguments.
    const YieldOptimizerFactory = await ethers.getContractFactory(
      "YieldOptimizer"
    );

    yieldOptimizer = await YieldOptimizerFactory.deploy(
      await mockPriceFeed.getAddress(),
      await mockUSDC.getAddress(),
      await mockWETH.getAddress(),
      aiAgent.address,
      await mockAaveLendingPool.getAddress(),
      await mockCompoundCToken.getAddress(),
      await mockUniswapRouter.getAddress(),
      await mockVRFCoordinator.getAddress(),
      1 ,
      owner.address// Assuming this is a static subscriptionId or keyHash for your mock
    );

    // --- END OF CHANGES FOR NON-UPGRADEABLE CONTRACT ---

    // Setup initial token balances
    await mockUSDC.mint(user1.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(user2.address, INITIAL_USDC_SUPPLY);
    await mockUSDC.mint(user3.address, INITIAL_USDC_SUPPLY);
    await mockWETH.mint(await yieldOptimizer.getAddress(), INITIAL_WETH_SUPPLY);

    // Setup mock price feed
    await mockPriceFeed.setLatestAnswer(ethers.parseUnits("2000", 8)); // 1 ETH = 2000 USDC

    // Approve tokens for users
    await mockUSDC
      .connect(user1)
      .approve(await yieldOptimizer.getAddress(), INITIAL_USDC_SUPPLY);
    await mockUSDC
      .connect(user2)
      .approve(await yieldOptimizer.getAddress(), INITIAL_USDC_SUPPLY);
    await mockUSDC
      .connect(user3)
      .approve(await yieldOptimizer.getAddress(), INITIAL_USDC_SUPPLY);
  });

  describe("Advanced Deposit Scenarios", function () {
    it("Should handle multiple deposits to same strategy", async function () {
      const strategyId = 0;

      // First deposit
      await yieldOptimizer.connect(user1).deposit(strategyId, DEPOSIT_AMOUNT);

      // Second deposit
      await yieldOptimizer.connect(user1).deposit(strategyId, SMALL_DEPOSIT);

      // Check user has 2 positions
      const position1 = await yieldOptimizer.userPositions(user1.address, 0);
      const position2 = await yieldOptimizer.userPositions(user1.address, 1);

      expect(position1.balance).to.equal(DEPOSIT_AMOUNT);
      expect(position2.balance).to.equal(SMALL_DEPOSIT);
      expect(position1.strategyId).to.equal(strategyId);
      expect(position2.strategyId).to.equal(strategyId);
    });

    it("Should handle deposits to different strategies", async function () {
      // Deposit to Aave
      await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);

      // Deposit to Compound
      await yieldOptimizer.connect(user1).deposit(1, SMALL_DEPOSIT);

      // Deposit to Uniswap
      await yieldOptimizer.connect(user1).deposit(2, LARGE_DEPOSIT);

      const position1 = await yieldOptimizer.userPositions(user1.address, 0);
      const position2 = await yieldOptimizer.userPositions(user1.address, 1);
      const position3 = await yieldOptimizer.userPositions(user1.address, 2);

      expect(position1.strategyId).to.equal(0);
      expect(position2.strategyId).to.equal(1);
      expect(position3.strategyId).to.equal(2);
      expect(position1.balance).to.equal(DEPOSIT_AMOUNT);
      expect(position2.balance).to.equal(SMALL_DEPOSIT);
      expect(position3.balance).to.equal(LARGE_DEPOSIT);
    });

    it("Should revert when depositing to inactive strategy", async function () {
      // This would require adding a function to deactivate strategies
      // For now, we test with an invalid strategy ID
      await expect(
        yieldOptimizer.connect(user1).deposit(999, DEPOSIT_AMOUNT)
      ).to.be.revertedWithCustomError(yieldOptimizer, "InvalidStrategy");
    });

    it("Should handle edge case deposits (very small amounts)", async function () {
      const tinyAmount = 1; // 1 wei of USDC

      await expect(yieldOptimizer.connect(user1).deposit(0, tinyAmount))
        .to.emit(yieldOptimizer, "Deposited")
        .withArgs(user1.address, 0, tinyAmount);
    });
  });

  describe("Advanced Withdrawal Scenarios", function () {
    beforeEach(async function () {
      // Setup multiple positions for testing
      await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);
      await yieldOptimizer.connect(user1).deposit(1, SMALL_DEPOSIT);
      await yieldOptimizer.connect(user1).deposit(2, LARGE_DEPOSIT);
    });

    it("Should handle partial withdrawals", async function () {
      const withdrawAmount = ethers.parseUnits("500", 6);
      const positionIndex = 0;

      const initialBalance = await mockUSDC.balanceOf(user1.address);

      await expect(
        yieldOptimizer.connect(user1).withdraw(positionIndex, withdrawAmount)
      )
        .to.emit(yieldOptimizer, "Withdrawn")
        .withArgs(user1.address, 0, withdrawAmount);

      const position = await yieldOptimizer.userPositions(
        user1.address,
        positionIndex
      );
      expect(position.balance).to.equal(DEPOSIT_AMOUNT - withdrawAmount);

      // Check user received tokens
      expect(await mockUSDC.balanceOf(user1.address)).to.be.gt(initialBalance);
    });

    it("Should handle full withdrawals", async function () {
      const positionIndex = 1;

      await expect(
        yieldOptimizer.connect(user1).withdraw(positionIndex, SMALL_DEPOSIT)
      )
        .to.emit(yieldOptimizer, "Withdrawn")
        .withArgs(user1.address, 1, SMALL_DEPOSIT);

      const position = await yieldOptimizer.userPositions(
        user1.address,
        positionIndex
      );
      expect(position.balance).to.equal(0);
    });

    it("Should revert when withdrawing more than balance", async function () {
      const excessiveAmount = DEPOSIT_AMOUNT + ethers.parseUnits("1", 6);

      await expect(
        yieldOptimizer.connect(user1).withdraw(0, excessiveAmount)
      ).to.be.revertedWithCustomError(yieldOptimizer, "InsufficientBalance");
    });

    it("Should revert when withdrawing from invalid position", async function () {
      const invalidIndex = 999;

      await expect(
        yieldOptimizer.connect(user1).withdraw(invalidIndex, DEPOSIT_AMOUNT)
      ).to.be.revertedWithCustomError(yieldOptimizer, "InvalidStrategy");
    });

    it("Should handle withdrawals from all strategy types", async function () {
      // Test withdrawal from each strategy
      await yieldOptimizer
        .connect(user1)
        .withdraw(0, ethers.parseUnits("100", 6)); // Aave
      await yieldOptimizer
        .connect(user1)
        .withdraw(1, ethers.parseUnits("50", 6)); // Compound
      await yieldOptimizer
        .connect(user1)
        .withdraw(2, ethers.parseUnits("200", 6)); // Uniswap

      const position1 = await yieldOptimizer.userPositions(user1.address, 0);
      const position2 = await yieldOptimizer.userPositions(user1.address, 1);
      const position3 = await yieldOptimizer.userPositions(user1.address, 2);

      expect(position1.balance).to.equal(
        DEPOSIT_AMOUNT - ethers.parseUnits("100", 6)
      );
      expect(position2.balance).to.equal(
        SMALL_DEPOSIT - ethers.parseUnits("50", 6)
      );
      expect(position3.balance).to.equal(
        LARGE_DEPOSIT - ethers.parseUnits("200", 6)
      );
    });
  });

  describe("Rebalancing Functionality", function () {
    beforeEach(async function () {
      // Setup positions for rebalancing tests
      await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);
      await yieldOptimizer.connect(user2).deposit(1, LARGE_DEPOSIT);

      // Fast forward time to allow rebalancing
      await time.increase(24 * 60 * 60 + 1); // 1 day + 1 second
    });

    it("Should allow user to rebalance their own position", async function () {
      const positionIndex = 0;
      const newStrategyId = 1;
      const rebalanceAmount = ethers.parseUnits("500", 6);

      await expect(
        yieldOptimizer
          .connect(user1)
          .rebalance(
            user1.address,
            positionIndex,
            newStrategyId,
            rebalanceAmount
          )
      )
        .to.emit(yieldOptimizer, "Rebalanced")
        .withArgs(
          user1.address,
          0,
          newStrategyId,
          rebalanceAmount,
          (await time.latest()) + 1
        );

      // Check old position balance reduced
      const oldPosition = await yieldOptimizer.userPositions(
        user1.address,
        positionIndex
      );
      expect(oldPosition.balance).to.equal(DEPOSIT_AMOUNT - rebalanceAmount);

      // Check new position created
      const newPosition = await yieldOptimizer.userPositions(user1.address, 1);
      expect(newPosition.strategyId).to.equal(newStrategyId);
      expect(newPosition.balance).to.equal(rebalanceAmount);
    });

    it("Should allow AI agent to rebalance user positions", async function () {
      const positionIndex = 0;
      const newStrategyId = 2;
      const rebalanceAmount = ethers.parseUnits("300", 6);

      await expect(
        yieldOptimizer
          .connect(aiAgent)
          .rebalance(
            user1.address,
            positionIndex,
            newStrategyId,
            rebalanceAmount
          )
      ).to.emit(yieldOptimizer, "Rebalanced");

      const newPosition = await yieldOptimizer.userPositions(user1.address, 1);
      expect(newPosition.strategyId).to.equal(newStrategyId);
      expect(newPosition.balance).to.equal(rebalanceAmount);
    });

    it("Should revert rebalance from unauthorized caller", async function () {
      await expect(
        yieldOptimizer
          .connect(user2)
          .rebalance(user1.address, 0, 1, DEPOSIT_AMOUNT)
      ).to.be.revertedWithCustomError(yieldOptimizer, "UnauthorizedCaller");
    });

    it("Should revert rebalance before interval", async function () {
      // Reset time and try immediate rebalance
      await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);

      // Perform a rebalance (first one, so it will pass the userLastRebalance[user] != 0 check)
      // We increase time to ensure the initial rebalance is allowed if there's any other time-based check
      await time.increase(24 * 60 * 60 + 1); // 1 day + 1 second
      await yieldOptimizer
        .connect(user1)
        .rebalance(user1.address, 0, 1, DEPOSIT_AMOUNT);

      // Now, try to rebalance again immediately (before interval)
      // This attempt should trigger the RebalanceNotNeeded revert
      await expect(
        yieldOptimizer.connect(user1).rebalance(
          user1.address,
          0,
          1,
          DEPOSIT_AMOUNT // Rebalance the same position or another one
        )
      ).to.be.revertedWithCustomError(yieldOptimizer, "RebalanceNotNeeded");
    });

    it("Should handle rebalancing with insufficient balance", async function () {
      const excessiveAmount = DEPOSIT_AMOUNT + ethers.parseUnits("1", 6);

      await expect(
        yieldOptimizer
          .connect(user1)
          .rebalance(user1.address, 0, 1, excessiveAmount)
      ).to.be.revertedWithCustomError(yieldOptimizer, "InsufficientBalance");
    });
  });

  describe("Price-Based Rebalancing", function () {
    beforeEach(async function () {
      await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);
      await time.increase(24 * 60 * 60 + 1);
    });

    it("Should rebalance when price is above threshold", async function () {
      const priceThreshold = ethers.parseUnits("1800", 8); // Below current price of 2000
      const rebalanceAmount = ethers.parseUnits("500", 6);

      await expect(
        yieldOptimizer
          .connect(user1)
          .rebalanceIfPriceThreshold(
            0,
            1,
            rebalanceAmount,
            priceThreshold,
            true
          )
      ).to.emit(yieldOptimizer, "Rebalanced");
    });

    it("Should not rebalance when price condition not met", async function () {
      const priceThreshold = ethers.parseUnits("2500", 8); // Above current price of 2000
      const rebalanceAmount = ethers.parseUnits("500", 6);

      // Should not rebalance, no event emitted
      await yieldOptimizer
        .connect(user1)
        .rebalanceIfPriceThreshold(0, 1, rebalanceAmount, priceThreshold, true);

      // Position should remain unchanged
      const position = await yieldOptimizer.userPositions(user1.address, 0);
      expect(position.balance).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should rebalance when price is below threshold", async function () {
      const priceThreshold = ethers.parseUnits("2100", 8); // Above current price of 2000
      const rebalanceAmount = ethers.parseUnits("500", 6);

      await expect(
        yieldOptimizer
          .connect(user1)
          .rebalanceIfPriceThreshold(
            0,
            1,
            rebalanceAmount,
            priceThreshold,
            false
          )
      ).to.emit(yieldOptimizer, "Rebalanced");
    });
  });

  describe("Global Rebalancing", function () {
    beforeEach(async function () {
      // Setup multiple users with positions
      await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);
      await yieldOptimizer.connect(user1).deposit(1, SMALL_DEPOSIT);
      await yieldOptimizer.connect(user2).deposit(0, LARGE_DEPOSIT);
      await yieldOptimizer.connect(user3).deposit(2, DEPOSIT_AMOUNT);

      await time.increase(24 * 60 * 60 + 1);
    });

    it("Should allow AI agent to perform global rebalance", async function () {
      const users = [user1.address, user2.address, user3.address];
      const newStrategyId = 1;

      await expect(
        yieldOptimizer.connect(aiAgent).globalRebalance(users, newStrategyId)
      ).to.emit(yieldOptimizer, "Rebalanced");
    });

    it("Should allow owner to perform global rebalance", async function () {
      const users = [user1.address, user2.address];
      const newStrategyId = 2;

      await expect(
        yieldOptimizer.connect(owner).globalRebalance(users, newStrategyId)
      ).to.emit(yieldOptimizer, "Rebalanced");
    });

    it("Should revert global rebalance from unauthorized caller", async function () {
      const users = [user1.address];

      await expect(
        yieldOptimizer.connect(user1).globalRebalance(users, 1)
      ).to.be.revertedWithCustomError(yieldOptimizer, "UnauthorizedCaller");
    });

    it("Should revert global rebalance before interval", async function () {
      // Perform one global rebalance
      await yieldOptimizer.connect(aiAgent).globalRebalance([user1.address], 1);

      // Try immediate second rebalance
      await expect(
        yieldOptimizer.connect(aiAgent).globalRebalance([user1.address], 2)
      ).to.be.revertedWithCustomError(yieldOptimizer, "RebalanceNotNeeded");
    });
  });

  describe("VRF Random Deposits", function () {
    it("Should request random deposit successfully", async function () {
      const requestId = 1;

      // Mock VRF coordinator to return specific request ID
      await mockVRFCoordinator.setNextRequestId(requestId);

      await expect(yieldOptimizer.connect(user1).depositRandom(DEPOSIT_AMOUNT))
        .to.emit(yieldOptimizer, "RandomDepositRequested")
        .withArgs(user1.address, DEPOSIT_AMOUNT, requestId);

      // Check VRF request was stored
      const vrfRequest = await yieldOptimizer.vrfRequests(requestId);
      expect(vrfRequest.user).to.equal(user1.address);
      expect(vrfRequest.amount).to.equal(DEPOSIT_AMOUNT);
      expect(vrfRequest.fulfilled).to.be.false;
    });

    it("Should fulfill random deposit and create position", async function () {
      const requestId = 1;
      const randomWords = [5]; // This will select strategy 5 % 3 = 2 (Uniswap)

      // Setup VRF request
      await mockVRFCoordinator.setNextRequestId(requestId);
      await yieldOptimizer.connect(user1).depositRandom(DEPOSIT_AMOUNT);

      // Fulfill the request
      await expect(
        mockVRFCoordinator.fulfillRandomWords(requestId, randomWords)
      )
        .to.emit(yieldOptimizer, "RandomDepositFulfilled")
        .withArgs(user1.address, 2, DEPOSIT_AMOUNT);

      // Check position was created
      const position = await yieldOptimizer.userPositions(user1.address, 0);
      expect(position.strategyId).to.equal(2);
      expect(position.balance).to.equal(DEPOSIT_AMOUNT);

      // Check request marked as fulfilled
      const vrfRequest = await yieldOptimizer.vrfRequests(requestId);
      expect(vrfRequest.fulfilled).to.be.true;
    });
  });

  describe("Position Consolidation", function () {
    it("Should consolidate positions manually", async function () {
      // Create multiple positions in same strategies
      await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);
      await yieldOptimizer.connect(user1).deposit(0, SMALL_DEPOSIT);
      await yieldOptimizer.connect(user1).deposit(1, LARGE_DEPOSIT);
      await yieldOptimizer.connect(user1).deposit(1, DEPOSIT_AMOUNT);

      await expect(yieldOptimizer.connect(user1).consolidateMyPositions())
        .to.emit(yieldOptimizer, "PositionsConsolidated")
        .withArgs(user1.address);

      // Should have only 2 positions now (one per strategy used)
      const position1 = await yieldOptimizer.userPositions(user1.address, 0);
      const position2 = await yieldOptimizer.userPositions(user1.address, 1);

      // Sort positions by strategyId to ensure consistent checking
      const sortedPositions = [position1, position2].sort(
        (a, b) => Number(a.strategyId) - Number(b.strategyId)
      );

      // Check consolidated balances
      if (position1.strategyId === 0) {
        expect(sortedPositions[0].strategyId).to.equal(0);
        expect(sortedPositions[0].balance).to.equal(
          DEPOSIT_AMOUNT + SMALL_DEPOSIT
        ); // 1000 + 100 = 1100
      } else {
        expect(sortedPositions[1].strategyId).to.equal(1);
        expect(sortedPositions[1].balance).to.equal(
          LARGE_DEPOSIT + DEPOSIT_AMOUNT
        ); // 10000 + 1000 = 11000
      }
    });
  });

  describe("Price Validation and Security", function () {
    it("Should handle price deviation detection", async function () {
      // Set a very different price to trigger deviation
      await mockPriceFeed.setLatestAnswer(ethers.parseUnits("1000", 8)); // 50% drop

      // This should trigger price manipulation detection in rebalanceIfPriceThreshold
      await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);
      await time.increase(24 * 60 * 60 + 1);

      // The price validation should prevent manipulation
      // Note: You might need to adjust this test based on your exact price validation logic
    });

    it("Should get latest price correctly", async function () {
      const price = await yieldOptimizer.getLatestPrice();
      expect(price).to.equal(ethers.parseUnits("2000", 8));
    });
  });

  describe("Administrative Functions", function () {
    it("Should update AI agent", async function () {
      await expect(yieldOptimizer.connect(owner).setAIAgent(newAiAgent.address))
        .to.emit(yieldOptimizer, "AIAgentUpdated")
        .withArgs(newAiAgent.address);

      expect(await yieldOptimizer.aiAgent()).to.equal(newAiAgent.address);
    });

    it("Should set max slippage", async function () {
      const newSlippage = 500; // 5%

      await yieldOptimizer.connect(owner).setMaxSlippage(newSlippage);
      expect(await yieldOptimizer.maxSlippageBPS()).to.equal(newSlippage);
    });

    it("Should revert setting excessive slippage", async function () {
      const excessiveSlippage = 1500; // 15%

      await expect(
        yieldOptimizer.connect(owner).setMaxSlippage(excessiveSlippage)
      ).to.be.revertedWithCustomError(yieldOptimizer, "InvalidSlippage");
    });

    it("Should pause and unpause contract", async function () {
      await expect(yieldOptimizer.connect(owner).pause()).to.emit(
        yieldOptimizer,
        "Paused"
      );

      expect(await yieldOptimizer.paused()).to.be.true;

      // Should revert operations when paused
      await expect(
        yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT)
      ).to.be.revertedWithCustomError(yieldOptimizer, "EnforcedPause");

      await expect(yieldOptimizer.connect(owner).unpause()).to.emit(
        yieldOptimizer,
        "Unpaused"
      );

      expect(await yieldOptimizer.paused()).to.be.false;
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle zero address validations", async function () {
      // Test would require deployment with zero addresses, which should fail
      // This is more of an integration test during deployment
    });

    // it("Should handle contract with no balance", async function () {
    //  // Test withdrawal when contract has no tokens
    //  await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);

    //  await mockUSDC.burn(await yieldOptimizer.getAddress(), DEPOSIT_AMOUNT);
    //  // Withdrawal should handle gracefully or revert appropriately
    //  // Implementation depends on your error handling strategy
    // });

    it("Should handle very large deposits", async function () {
      const veryLargeAmount = ethers.parseUnits("1000000", 6); // 1M USDC

      await expect(yieldOptimizer.connect(user1).deposit(0, veryLargeAmount))
        .to.emit(yieldOptimizer, "Deposited")
        .withArgs(user1.address, 0, veryLargeAmount);
    });

    it("Should handle multiple users with same operations", async function () {
      // Stress test with multiple users performing same operations
      const promises = [];

      for (let i = 0; i < 3; i++) {
        const user = [user1, user2, user3][i];
        promises.push(
          yieldOptimizer.connect(user).deposit(i % 3, DEPOSIT_AMOUNT)
        );
      }

      await Promise.all(promises);

      // Verify all deposits succeeded
      for (let i = 0; i < 3; i++) {
        const user = [user1, user2, user3][i];
        const position = await yieldOptimizer.userPositions(user.address, 0);
        expect(position.balance).to.equal(DEPOSIT_AMOUNT);
      }
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should handle batch operations efficiently", async function () {
      // Test multiple deposits in sequence
      const startGas = await ethers.provider.getBalance(user1.address);

      await yieldOptimizer.connect(user1).deposit(0, SMALL_DEPOSIT);
      await yieldOptimizer.connect(user1).deposit(1, SMALL_DEPOSIT);
      await yieldOptimizer.connect(user1).deposit(2, SMALL_DEPOSIT);

      const endGas = await ethers.provider.getBalance(user1.address);

      // Basic check that operations completed
      expect(startGas).to.be.gt(endGas);
    });
  });

  describe("Integration with Mock Protocols", function () {
    it("Should interact correctly with Aave mock", async function () {
        await yieldOptimizer.connect(user1).deposit(0, DEPOSIT_AMOUNT);

        const usdcAddress = await mockUSDC.getAddress();
        const yieldOptimizerAddress = await yieldOptimizer.getAddress();

        console.log("Test: Querying Aave mock balance for asset:", usdcAddress);
        console.log("Test: Querying Aave mock balance for user:", yieldOptimizerAddress);

        const aaveBalance = await mockAaveLendingPool.getUserBalance(
            usdcAddress,
            yieldOptimizerAddress
        );
        console.log("Test: Aave Balance Retrieved in Test:", aaveBalance.toString());

        expect(aaveBalance).to.be.gt(0);
    });

    it("Should interact correctly with Compound mock", async function () {
      await yieldOptimizer.connect(user1).deposit(1, DEPOSIT_AMOUNT);

      // Verify interaction with Compound mock
      const compoundBalance = await mockCompoundCToken.balanceOf(
        await yieldOptimizer.getAddress()
      );
      expect(compoundBalance).to.be.gt(0);
    });

    it("Should interact correctly with Uniswap mock", async function () {
      await yieldOptimizer.connect(user1).deposit(2, DEPOSIT_AMOUNT);

      // Verify interaction with Uniswap mock
      // This would depend on your mock implementation
    });
  });
});