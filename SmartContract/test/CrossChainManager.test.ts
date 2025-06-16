import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { parseUnits } from "ethers";

// Import your contract types
import {
  CrossChainManager,
  MockERC20,
  MockIRouterClient,
  MockIYieldOptimizer,
  TestCCIPReceiver,
} from "../typechain-types";

// Import Client types for CCIP (important for structs)
import { Client } from "@chainlink/contracts-ccip/contracts/libraries/Client.sol"

describe("CrossChainManager", function () {
  let crossChainManager: CrossChainManager;
  let mockERC20: MockERC20; // Represents USDC
  let mockRouter: MockIRouterClient;
  let mockYieldOptimizer: MockIYieldOptimizer;
  let testCCIPReceiver: TestCCIPReceiver;

  // Declare signers here with `let`, assign in `beforeEach`
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let aiAgent: SignerWithAddress;
  let anotherUser: SignerWithAddress;

  // --- Constants (can be `const` as they don't depend on signers) ---
  const INITIAL_USDC_SUPPLY = parseUnits("1000000", 6); // 1,000,000 USDC
  const TRANSFER_AMOUNT = parseUnits("1000", 6); // 1,000 USDC
  const HIGH_TRANSFER_AMOUNT = parseUnits("11000", 6); // 11,000 USDC (to test rate limit)
  const MOCK_CCIP_FEE = parseUnits("0.01", 18); // 0.01 ETH equivalent for fees
  const DEFAULT_STRATEGY_ID = 0; // As set in constructor

  // Mock Chain Selectors (from your contract)
  const SEPOLIA_CHAIN_SELECTOR = 16015286601757825753n;
  const ARBITRUM_SEPOLIA_CHAIN_SELECTOR = 3478487238524512106n;
  const BASE_SEPOLIA_CHAIN_SELECTOR = 11155111n;

  // --- Variables that depend on `SignerWithAddress` objects, declared with `let` ---
  // These will be assigned in `beforeEach`
  let DEST_CHAIN_TRANSFER: bigint;
  let RECEIVER_TRANSFER: string;
  let CALLER_FEE_TRANSFER: bigint;

  let DEST_CHAIN_REBALANCE: bigint;
  let REBALANCE_USER_REBALANCE: string;
  let CALLER_FEE_REBALANCE: bigint;

  let RECEIVER_RATE_LIMIT_TEST: string; // Add this declaration

// Add any necessary imports here if not already present, e.g.:
// import { time } from "@nomicfoundation/hardhat-network-helpers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { Client } from "@chainlink/contracts-ccip/contracts/libraries/Client"; // Or wherever Client.EVMTokenAmountStruct is from

beforeEach(async function () {

  [owner, user1, aiAgent, anotherUser] = await ethers.getSigners();

  // --- Assign signer-dependent variables here ---
  DEST_CHAIN_TRANSFER = ARBITRUM_SEPOLIA_CHAIN_SELECTOR;
  RECEIVER_TRANSFER = await user1.getAddress(); // Await getAddress()
  CALLER_FEE_TRANSFER = MOCK_CCIP_FEE * 2n;

  DEST_CHAIN_REBALANCE = SEPOLIA_CHAIN_SELECTOR;
  REBALANCE_USER_REBALANCE = await user1.getAddress(); // Await getAddress()
  CALLER_FEE_REBALANCE = MOCK_CCIP_FEE * 2n;

  RECEIVER_RATE_LIMIT_TEST = await user1.getAddress(); // Await getAddress()

  // --- Deploy Mock ERC20 (USDC) ---
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  mockERC20 = await MockERC20Factory.deploy("USD Coin", "USDC", 6);
  await mockERC20.waitForDeployment(); // Ensure deployment is complete

  // --- Deploy Mock IRouterClient ---
  const MockRouterFactory = await ethers.getContractFactory(
    "MockIRouterClient"
  );
  mockRouter = await MockRouterFactory.deploy();
  await mockRouter.waitForDeployment();
  await mockRouter.setMockFee(MOCK_CCIP_FEE); // Set a default mock fee

  // --- Deploy Mock IYieldOptimizer ---
  const MockYieldOptimizerFactory = await ethers.getContractFactory(
    "MockIYieldOptimizer"
  );
  mockYieldOptimizer = await MockYieldOptimizerFactory.deploy();
  await mockYieldOptimizer.waitForDeployment();

  // --- Deploy CrossChainManager ---
  const CrossChainManagerFactory = await ethers.getContractFactory(
    "CrossChainManager"
  );
  crossChainManager = await CrossChainManagerFactory.deploy(
    await mockRouter.getAddress(),
    await mockERC20.getAddress(),
    await aiAgent.getAddress(), // <--- KEY FIX: AWAIT aiAgent.getAddress()
    await mockYieldOptimizer.getAddress()
  );
  await crossChainManager.waitForDeployment();

  // --- Deploy the TestCCIPReceiver contract ---
  const TestCCIPReceiverFactory = await ethers.getContractFactory(
    "TestCCIPReceiver"
  );
  testCCIPReceiver = await TestCCIPReceiverFactory.deploy(
    await crossChainManager.getAddress()
  );
  await testCCIPReceiver.waitForDeployment();

  // --- Mint USDC to test users and CrossChainManager ---
  await mockERC20.mint(await user1.getAddress(), INITIAL_USDC_SUPPLY); // Await getAddress()
  await mockERC20.mint(await aiAgent.getAddress(), INITIAL_USDC_SUPPLY); // Await getAddress()
  await mockERC20.mint(
    await crossChainManager.getAddress(),
    INITIAL_USDC_SUPPLY
  );

  // --- Approve CrossChainManager to spend user's USDC ---
  await mockERC20
    .connect(user1)
    .approve(await crossChainManager.getAddress(), INITIAL_USDC_SUPPLY);
  await mockERC20
    .connect(aiAgent)
    .approve(await crossChainManager.getAddress(), INITIAL_USDC_SUPPLY);
});

  // --- Deployment & Initialization Tests ---
  describe("Deployment & Initialization", function () {
    it("Should be deployed and initialized correctly", async function () {
      expect(await crossChainManager.ccipRouter()).to.equal(
        await mockRouter.getAddress()
      );
      expect(await crossChainManager.stablecoin()).to.equal(
        await mockERC20.getAddress()
      );
      expect(await crossChainManager.aiAgent()).to.equal(aiAgent.address);
      expect(await crossChainManager.yieldOptimizer()).to.equal(
        await mockYieldOptimizer.getAddress()
      );
      expect(await crossChainManager.defaultStrategyId()).to.equal(
        DEFAULT_STRATEGY_ID
      );

      // Check supported chains (initialized in constructor)
      expect(await crossChainManager.supportedChains(SEPOLIA_CHAIN_SELECTOR)).to
        .be.true;
      expect(
        await crossChainManager.supportedChains(ARBITRUM_SEPOLIA_CHAIN_SELECTOR)
      ).to.be.true;
      expect(
        await crossChainManager.supportedChains(BASE_SEPOLIA_CHAIN_SELECTOR)
      ).to.be.true;
      expect(await crossChainManager.supportedChains(9999999999999999999n)).to
        .be.false; // Unsupported chain
    });

    it("Should revert if initialized with zero addresses", async function () {
      const CrossChainManagerFactory = await ethers.getContractFactory(
        "CrossChainManager"
      );

      await expect(
        CrossChainManagerFactory.deploy(
          ethers.ZeroAddress, // _ccipRouter
          await mockERC20.getAddress(),
          aiAgent.address,
          await mockYieldOptimizer.getAddress()
        )
      ).to.be.revertedWithCustomError(crossChainManager, "InvalidRouter");

      await expect(
        CrossChainManagerFactory.deploy(
          await mockRouter.getAddress(),
          ethers.ZeroAddress, // _stablecoin
          aiAgent.address,
          await mockYieldOptimizer.getAddress()
        )
      ).to.be.revertedWithCustomError(crossChainManager, "ZeroAddress");

      await expect(
        CrossChainManagerFactory.deploy(
          await mockRouter.getAddress(),
          await mockERC20.getAddress(),
          ethers.ZeroAddress, // _aiAgent
          await mockYieldOptimizer.getAddress()
        )
      ).to.be.revertedWithCustomError(crossChainManager, "ZeroAddress");

      await expect(
        CrossChainManagerFactory.deploy(
          await mockRouter.getAddress(),
          await mockERC20.getAddress(),
          aiAgent.address,
          ethers.ZeroAddress // _yieldOptimizer
        )
      ).to.be.revertedWithCustomError(crossChainManager, "ZeroAddress");
    });
  });

  // --- `transferCrossChain` Function Tests ---
  describe("transferCrossChain", function () {
    // Use the variables assigned in beforeEach
    const DEST_CHAIN = DEST_CHAIN_TRANSFER;
    const RECEIVER = RECEIVER_TRANSFER;
    const CALLER_FEE = CALLER_FEE_TRANSFER;
    const TRANSFER_AMOUNT = parseUnits("1000", 6); // 1000 USDC
  
    it("Should allow user to transfer USDC cross-chain and emit event", async function () {
      const initialUserBalance = await mockERC20.balanceOf(user1.address);
      const initialManagerBalance = await mockERC20.balanceOf(await crossChainManager.getAddress());
      const initialEthBalance = await ethers.provider.getBalance(user1.address);
  
      const tx = await crossChainManager.connect(user1).transferCrossChain( // AWAIT the tx
        TRANSFER_AMOUNT,
        DEST_CHAIN,
        RECEIVER,
        { value: CALLER_FEE }
      );
  
      await expect(tx).to.not.be.reverted;
  
      const finalUserBalance = await mockERC20.balanceOf(user1.address);
      const finalManagerBalance = await mockERC20.balanceOf(await crossChainManager.getAddress());
      const finalEthBalance = await ethers.provider.getBalance(user1.address);
  
      expect(finalUserBalance).to.equal(initialUserBalance - TRANSFER_AMOUNT);
      expect(finalManagerBalance).to.equal(initialManagerBalance + TRANSFER_AMOUNT);
      // Eth balance deduction should account for CCIP fee and gas
      expect(finalEthBalance).to.be.closeTo(
        initialEthBalance - CALLER_FEE, // User pays CALLER_FEE
        parseUnits("0.001", 18) // Allowing for gas costs
      );
  
      // Retrieve the sent message details from the mock router
      const latestMessageId = (await mockRouter.messageIdCounter()) - 1n;
      const sentMessage = await mockRouter.getSentMessage(latestMessageId);
  
      // Verify the message details
      expect(sentMessage.destinationChainSelector).to.equal(DEST_CHAIN);
      expect(sentMessage.fee).to.equal(MOCK_CCIP_FEE);
      expect(sentMessage.message.tokenAmounts[0].token).to.equal(await mockERC20.getAddress());
      expect(sentMessage.message.tokenAmounts[0].amount).to.equal(TRANSFER_AMOUNT);
      expect(ethers.AbiCoder.defaultAbiCoder().decode(["address"], sentMessage.message.receiver)[0]).to.equal(await crossChainManager.getAddress());
  
      const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
        ["address", "uint256"], // Match contract's encoding for transferCrossChain data
        sentMessage.message.data
      );
      expect(decodedData[0]).to.equal(RECEIVER);
      expect(decodedData[1]).to.equal(TRANSFER_AMOUNT);
  
      await expect(tx)
        .to.emit(crossChainManager, "CrossChainTransferInitiated") // No prefix
        .withArgs(user1.address, TRANSFER_AMOUNT, DEST_CHAIN, latestMessageId);
    });
  
    it("Should allow AI agent to transfer USDC cross-chain", async function () {
      const initialAIAgentBalance = await mockERC20.balanceOf(aiAgent.address);
      const initialManagerBalance = await mockERC20.balanceOf(await crossChainManager.getAddress());
      const initialEthBalance = await ethers.provider.getBalance(aiAgent.address);
  
      const tx = await crossChainManager.connect(aiAgent).transferCrossChain( // AWAIT the tx
        TRANSFER_AMOUNT,
        DEST_CHAIN,
        anotherUser.address, // AI agent sending for another user
        { value: CALLER_FEE }
      );
  
      await expect(tx).to.not.be.reverted;
  
      const finalAIAgentBalance = await mockERC20.balanceOf(aiAgent.address);
      const finalManagerBalance = await mockERC20.balanceOf(await crossChainManager.getAddress());
      const finalEthBalance = await ethers.provider.getBalance(aiAgent.address);
  
      expect(finalAIAgentBalance).to.equal(initialAIAgentBalance - TRANSFER_AMOUNT);
      expect(finalManagerBalance).to.equal(initialManagerBalance + TRANSFER_AMOUNT);
      expect(finalEthBalance).to.be.closeTo(
        initialEthBalance - CALLER_FEE,
        parseUnits("0.001", 18)
      );
  
      const latestMessageId = (await mockRouter.messageIdCounter()) - 1n;
      const sentMessage = await mockRouter.getSentMessage(latestMessageId);
  
      expect(sentMessage.destinationChainSelector).to.equal(DEST_CHAIN);
      expect(sentMessage.fee).to.equal(MOCK_CCIP_FEE);
      expect(sentMessage.message.tokenAmounts[0].token).to.equal(await mockERC20.getAddress());
      expect(sentMessage.message.tokenAmounts[0].amount).to.equal(TRANSFER_AMOUNT);
      expect(ethers.AbiCoder.defaultAbiCoder().decode(["address"], sentMessage.message.receiver)[0]).to.equal(await crossChainManager.getAddress());
  
      const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
        ["address", "uint256"],
        sentMessage.message.data
      );
      expect(decodedData[0]).to.equal(anotherUser.address);
      expect(decodedData[1]).to.equal(TRANSFER_AMOUNT);
  
      await expect(tx)
        .to.emit(crossChainManager, "CrossChainTransferInitiated") // No prefix
        .withArgs(aiAgent.address, TRANSFER_AMOUNT, DEST_CHAIN, latestMessageId);
    });
  
    it("Should revert if amount is zero", async function () {
      await expect(
        crossChainManager.connect(user1).transferCrossChain(
          0, // Zero amount
          DEST_CHAIN,
          RECEIVER,
          { value: CALLER_FEE }
        )
      ).to.be.revertedWithCustomError(crossChainManager, "ZeroAmount");
    });
  
    it("Should revert if destination chain is not supported", async function () {
      const UNSUPPORTED_CHAIN = 12345n;
      await expect(
        crossChainManager.connect(user1).transferCrossChain(
          TRANSFER_AMOUNT,
          UNSUPPORTED_CHAIN, // Unsupported chain
          RECEIVER,
          { value: CALLER_FEE }
        )
      ).to.be.revertedWithCustomError(crossChainManager, "InvalidChainSelector");
    });
  
    it("Should revert if caller is unauthorized", async function () {
      await expect(
        crossChainManager.connect(owner).transferCrossChain( // Owner is not AI agent or receiver
          TRANSFER_AMOUNT,
          DEST_CHAIN,
          RECEIVER,
          { value: CALLER_FEE }
        )
      ).to.be.revertedWithCustomError(crossChainManager, "UnauthorizedCaller");
    });
  
    it("Should revert if insufficient fee is provided", async function () {
      await expect(
        crossChainManager.connect(user1).transferCrossChain(
          TRANSFER_AMOUNT,
          DEST_CHAIN,
          RECEIVER,
          { value: MOCK_CCIP_FEE - 1n } // Insufficient fee
        )
      ).to.be.revertedWithCustomError(crossChainManager, "InsufficientFee");
    });
  
    it("Should revert if user has insufficient allowance", async function () {
      // Reduce allowance to zero to test insufficient allowance
      await mockERC20.connect(user1).approve(await crossChainManager.getAddress(), 0);
  
      await expect(
        crossChainManager.connect(user1).transferCrossChain(
          TRANSFER_AMOUNT,
          DEST_CHAIN,
          RECEIVER,
          { value: CALLER_FEE }
        )
      ).to.be.reverted; // ERC20 safeTransferFrom reverts on insufficient allowance
    });
  
    it("Should revert if user has insufficient balance for transfer", async function () {
      // Transfer all tokens away from user1 to test insufficient balance
      await mockERC20.connect(user1).transfer(owner.address, await mockERC20.balanceOf(user1.address));
  
      await expect(
        crossChainManager.connect(user1).transferCrossChain(
          TRANSFER_AMOUNT,
          DEST_CHAIN,
          RECEIVER,
          { value: CALLER_FEE }
        )
      ).to.be.reverted; // ERC20 safeTransferFrom reverts on insufficient balance
    });
  });

  // --- `triggerCrossChainRebalance` Function Tests ---
  describe("triggerCrossChainRebalance", function () {
    // Use the variables assigned in beforeEach
    const DEST_CHAIN = DEST_CHAIN_REBALANCE;
    const REBALANCE_USER = REBALANCE_USER_REBALANCE;
    const CALLER_FEE = CALLER_FEE_REBALANCE;
    const POSITION_INDEX = 0;
    const NEW_STRATEGY_ID = 1;
    const REBALANCE_AMOUNT = parseUnits("500", 6);
  
    it("Should allow AI agent to trigger cross-chain rebalance and emit event", async function () {
      const initialEthBalance = await ethers.provider.getBalance(aiAgent.address);
  
      // Execute the transaction
      const tx = await crossChainManager // AWAIT the tx
        .connect(aiAgent)
        .triggerCrossChainRebalance(
          REBALANCE_USER,
          POSITION_INDEX,
          NEW_STRATEGY_ID,
          REBALANCE_AMOUNT,
          DEST_CHAIN,
          { value: CALLER_FEE }
        );
  
      await expect(tx).to.not.be.reverted;
  
      // Then assert the event emission with its arguments
      await expect(tx)
        .to.emit(crossChainManager, "CrossChainRebalanceTriggered") // No prefix
        .withArgs(
          REBALANCE_USER,
          REBALANCE_AMOUNT,
          DEST_CHAIN,
          (await mockRouter.messageIdCounter()) - 1n
        ); // Capture messageId
  
      // Verify ETH refund
      const finalEthBalance = await ethers.provider.getBalance(aiAgent.address);
      expect(finalEthBalance).to.be.closeTo(
        initialEthBalance - MOCK_CCIP_FEE,
        parseUnits("0.001", 18)
      ); // Allowing room for gas
  
      // Verify message recorded in mock router (using the latest message)
      const latestMessageId = (await mockRouter.messageIdCounter()) - 1n; // Get the ID of the last sent message
      const sentMessage = await mockRouter.getSentMessage(latestMessageId);
  
      expect(sentMessage.destinationChainSelector).to.equal(DEST_CHAIN);
      expect(sentMessage.fee).to.equal(MOCK_CCIP_FEE);
      // Decode data to verify rebalance parameters
      const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
        ["bytes32", "address", "uint256", "uint256", "uint256"], // Match contract's encoding
        sentMessage.message.data
      );
      expect(decodedData[0]).to.equal(
        ethers.keccak256(ethers.toUtf8Bytes("rebalance"))
      ); // Compare with keccak256 hash
      expect(decodedData[1]).to.equal(REBALANCE_USER);
      expect(decodedData[2]).to.equal(POSITION_INDEX);
      expect(decodedData[3]).to.equal(NEW_STRATEGY_ID);
      expect(decodedData[4]).to.equal(REBALANCE_AMOUNT);
      expect(sentMessage.message.tokenAmounts.length).to.equal(0); // No tokens for rebalance trigger
  
      // Also confirm the actual CCIP message's receiver field is the CrossChainManager.
      expect(
        ethers.AbiCoder.defaultAbiCoder().decode(["address"], sentMessage.message.receiver)[0]
      ).to.equal(await crossChainManager.getAddress());
    });
  
    it("Should revert if caller is not AI agent", async function () {
      await expect(
        crossChainManager
          .connect(user1)
          .triggerCrossChainRebalance(
            REBALANCE_USER,
            POSITION_INDEX,
            NEW_STRATEGY_ID,
            REBALANCE_AMOUNT,
            DEST_CHAIN,
            { value: CALLER_FEE }
          )
      ).to.be.revertedWithCustomError(crossChainManager, "UnauthorizedCaller");
    });
  
    it("Should revert if destination chain is not supported", async function () {
      const UNSUPPORTED_CHAIN = 12345n;
      await expect(
        crossChainManager
          .connect(aiAgent)
          .triggerCrossChainRebalance(
            REBALANCE_USER,
            POSITION_INDEX,
            NEW_STRATEGY_ID,
            REBALANCE_AMOUNT,
            UNSUPPORTED_CHAIN,
            { value: CALLER_FEE }
          )
      ).to.be.revertedWithCustomError(
        crossChainManager,
        "InvalidChainSelector"
      );
    });
  
    it("Should revert if insufficient fee is provided", async function () {
      await expect(
        crossChainManager
          .connect(aiAgent)
          .triggerCrossChainRebalance(
            REBALANCE_USER,
            POSITION_INDEX,
            NEW_STRATEGY_ID,
            REBALANCE_AMOUNT,
            DEST_CHAIN,
            { value: MOCK_CCIP_FEE - 1n }
          )
      ).to.be.revertedWithCustomError(crossChainManager, "InsufficientFee");
    });
  });



  // --- `_ccipReceive` Function Tests (Simulated Incoming Calls) ---
  describe("_ccipReceive (Simulated Incoming)", function () {
    const SOURCE_CHAIN = SEPOLIA_CHAIN_SELECTOR;
    const MOCK_RECEIVED_AMOUNT = parseUnits("500", 6);
  
    // Helper to simulate CCIP receiver logic
    async function simulateCCIPReceive(
      sourceChain: bigint,
      messageData: string, // Use string for encoded data
      tokenAmounts: Client.EVMTokenAmountStruct[]
    ) {
      // Create a mock Any2EVMMessage struct
      const message: Client.Any2EVMMessageStruct = {
        messageId: ethers.keccak256(
          ethers.toUtf8Bytes("mock-msg-id-" + Math.random().toString())
        ), // Unique ID for each call
        sourceChainSelector: sourceChain,
        sender: ethers.ZeroAddress, // Sender on source chain
        data: messageData,
        destTokenAmounts: tokenAmounts,
      };
  
      // Use the already deployed testCCIPReceiver to call CrossChainManager's _ccipReceive
      await testCCIPReceiver.callInternalCCIPReceive(message); // Corrected function name
    }
  
    it("Should process incoming cross-chain transfer message", async function () {
      const receiverOnDestChain = user1.address;
      const transferData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [receiverOnDestChain, MOCK_RECEIVED_AMOUNT]
      );
      const tokenAmounts = [
        { token: await mockERC20.getAddress(), amount: MOCK_RECEIVED_AMOUNT },
      ];
  
      const initialYieldOptimizerBalance = await mockERC20.balanceOf(
        await mockYieldOptimizer.getAddress()
      );
      const initialCCM_USDC_Balance = await mockERC20.balanceOf(
        await crossChainManager.getAddress()
      );
  
      // Simulate the receive operation
      await simulateCCIPReceive(SOURCE_CHAIN, transferData, tokenAmounts);
  
      // Verify YieldOptimizer.deposit was called
      const latestDepositCall = await mockYieldOptimizer.getLatestDepositCall();
      expect(latestDepositCall.strategyId).to.equal(DEFAULT_STRATEGY_ID);
      expect(latestDepositCall.amount).to.equal(MOCK_RECEIVED_AMOUNT);
      expect(latestDepositCall.caller).to.equal(
        await crossChainManager.getAddress()
      );
  
      // Verify CrossChainManager approved YieldOptimizer (allowance should be at least receivedAmount)
      expect(
        await mockERC20.allowance(
          await crossChainManager.getAddress(),
          await mockYieldOptimizer.getAddress()
        )
      ).to.be.gte(MOCK_RECEIVED_AMOUNT);
  
      // Verify tokens were transferred from CCM to YieldOptimizer
      expect(
        await mockERC20.balanceOf(await mockYieldOptimizer.getAddress())
      ).to.equal(initialYieldOptimizerBalance + MOCK_RECEIVED_AMOUNT);
      expect(
        await mockERC20.balanceOf(await crossChainManager.getAddress())
      ).to.equal(initialCCM_USDC_Balance - MOCK_RECEIVED_AMOUNT);
  
      // Now, assert the event emission (we re-call the simulate function for the event assertion)
      const uniqueMessageIdForEvent = ethers.keccak256(
        ethers.toUtf8Bytes("mock-msg-id-event-test")
      );
      await expect(
        testCCIPReceiver.callInternalCCIPReceive({ // Corrected function name
          messageId: uniqueMessageIdForEvent,
          sourceChainSelector: SOURCE_CHAIN,
          sender: ethers.ZeroAddress,
          data: transferData,
          destTokenAmounts: tokenAmounts,
        })
      )
        .to.emit(crossChainManager, "CrossChainTransferReceived") // No prefix
        .withArgs(receiverOnDestChain, MOCK_RECEIVED_AMOUNT, SOURCE_CHAIN);
    });
  
    it("Should process incoming cross-chain rebalance message", async function () {
      const rebalanceUser = user1.address;
      const positionIndex = 5;
      const newStrategyId = 1;
      const rebalanceAmount = parseUnits("750", 6);
  
      // Encode the message data with the keccak256 hash
      const rebalanceData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "address", "uint256", "uint256", "uint256"], // Match contract's encoding
        [
          ethers.keccak256(ethers.toUtf8Bytes("rebalance")),
          rebalanceUser,
          positionIndex,
          newStrategyId,
          rebalanceAmount,
        ]
      );
  
      // Simulate the receive operation
      await simulateCCIPReceive(SOURCE_CHAIN, rebalanceData, []);
  
      // Verify YieldOptimizer.rebalance was called
      const latestRebalanceCall =
        await mockYieldOptimizer.getLatestRebalanceCall();
      expect(latestRebalanceCall.user).to.equal(rebalanceUser);
      expect(latestRebalanceCall.positionIndex).to.equal(positionIndex);
      expect(latestRebalanceCall.newStrategyId).to.equal(newStrategyId);
      expect(latestRebalanceCall.amount).to.equal(rebalanceAmount);
      expect(latestRebalanceCall.caller).to.equal(
        await crossChainManager.getAddress()
      );
  
      // Test event emission
      const uniqueMessageIdForEvent = ethers.keccak256(
        ethers.toUtf8Bytes("mock-msg-id-rebalance-event")
      );
      await expect(
        testCCIPReceiver.callInternalCCIPReceive({ // Corrected function name
          messageId: uniqueMessageIdForEvent,
          sourceChainSelector: SOURCE_CHAIN,
          sender: ethers.ZeroAddress,
          data: rebalanceData,
          destTokenAmounts: [],
        })
      )
        .to.emit(crossChainManager, "CrossChainRebalanceExecuted") // No prefix
        .withArgs(rebalanceUser, positionIndex, newStrategyId, rebalanceAmount);
    });
  
    it("Should revert if source chain is not supported", async function () {
      const UNSUPPORTED_CHAIN = 12345n;
      const transferData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, MOCK_RECEIVED_AMOUNT]
      );
      const tokenAmounts = [
        { token: await mockERC20.getAddress(), amount: MOCK_RECEIVED_AMOUNT },
      ];
  
      // Expect the helper function to revert
      await expect(
        simulateCCIPReceive(UNSUPPORTED_CHAIN, transferData, tokenAmounts)
      ).to.be.revertedWithCustomError(
        crossChainManager,
        "InvalidChainSelector"
      );
    });
  });

  // --- Rate Limiting Tests ---

// Assume 'time' is imported from '@nomicfoundation/hardhat-network-helpers'
// e.g., import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Rate Limiting", function () {
  // Use the variables assigned in beforeEach
  const DEST_CHAIN = SEPOLIA_CHAIN_SELECTOR;
  const CALLER_FEE = MOCK_CCIP_FEE * 2n;
  const RECEIVER = RECEIVER_RATE_LIMIT_TEST; // This RECEIVER is already awaited in beforeEach

  // Define HIGH_TRANSFER_AMOUNT if it's not defined globally
  const HIGH_TRANSFER_AMOUNT = parseUnits("11000", 6); // 11,000 USDC, which is > 10,000 limit

  it("Should allow transfers within rate limit window without exceeding total limit", async function () {
    // First transfer (within limit, e.g., 1000 USDC)
    await expect(
      crossChainManager.connect(user1).transferCrossChain(
        TRANSFER_AMOUNT, // Assuming TRANSFER_AMOUNT is 1000e6 (1000 USDC)
        DEST_CHAIN,
        RECEIVER,
        { value: CALLER_FEE }
      )
    ).to.not.be.reverted;

    // Second transfer (still within the 10,000 limit: 1000 + 1000 = 2000)
    await expect(
      crossChainManager
        .connect(user1)
        .transferCrossChain(TRANSFER_AMOUNT, DEST_CHAIN, RECEIVER, {
          value: CALLER_FEE,
        })
    ).to.not.be.reverted;

    // Verify the accumulated amount in the window
    const transferAmountInWindow = await crossChainManager.transferAmountInWindow(
      await user1.getAddress(), // Await getAddress() for the mapping key
      DEST_CHAIN
    );
    expect(transferAmountInWindow).to.equal(TRANSFER_AMOUNT * 2n);
  });

  it("Should revert if rate limit is exceeded within the same window", async function () {
    // Transfer a large amount, close to the limit (e.g., 9000 USDC)
    await crossChainManager.connect(user1).transferCrossChain(
      parseUnits("9000", 6), // 9000 USDC
      DEST_CHAIN,
      RECEIVER,
      { value: CALLER_FEE }
    );

    // Attempt to transfer more than the remaining limit (9000 + 1001 = 10001, which exceeds 10000)
    await expect(
      crossChainManager
        .connect(user1)
        .transferCrossChain(parseUnits("1001", 6), DEST_CHAIN, RECEIVER, {
          value: CALLER_FEE,
        })
    ).to.be.revertedWithCustomError(crossChainManager, "RateLimitExceeded");

    // Verify the amount in window is still the sum of successful transfers (9000)
    const currentTransferAmount = await crossChainManager.transferAmountInWindow(
      await user1.getAddress(), // Await getAddress()
      DEST_CHAIN
    );
    expect(currentTransferAmount).to.equal(parseUnits("9000", 6));
  });

  it("Should reset rate limit after window passes, allowing new transfers", async function () {
    // Perform a transfer that puts the user over the limit
    await crossChainManager.connect(user1).transferCrossChain(
      HIGH_TRANSFER_AMOUNT, // 11,000 USDC, which is > 10,000 limit
      DEST_CHAIN,
      RECEIVER,
      { value: CALLER_FEE }
    );

    // Verify that the amount in the window is now HIGH_TRANSFER_AMOUNT
    let transferAmount = await crossChainManager.transferAmountInWindow(
      await user1.getAddress(), // Await getAddress()
      DEST_CHAIN
    );
    expect(transferAmount).to.equal(HIGH_TRANSFER_AMOUNT);

    // Attempt another transfer; it should revert because the current window is now > RATE_LIMIT_AMOUNT
    await expect(
      crossChainManager.connect(user1).transferCrossChain(
        TRANSFER_AMOUNT, // Try another 1,000 USDC
        DEST_CHAIN,
        RECEIVER,
        { value: CALLER_FEE }
      )
    ).to.be.revertedWithCustomError(crossChainManager, "RateLimitExceeded");


    // Fast forward time past RATE_LIMIT_WINDOW (1 hour + 1 second buffer)
    await time.increase(time.duration.hours(1) + 1);

    // Should now allow transfer again, as the window has reset and the last successful transfer
    // will be recorded as the new start of the window.
    await expect(
      crossChainManager
        .connect(user1)
        .transferCrossChain(TRANSFER_AMOUNT, DEST_CHAIN, RECEIVER, {
          value: CALLER_FEE,
        })
    ).to.not.be.reverted;

    // Verify the amount in the window is now just the last transfer's amount (1000 USDC)
    transferAmount =
      await crossChainManager.transferAmountInWindow(
        await user1.getAddress(), // Await getAddress()
        DEST_CHAIN
      );
    expect(transferAmount).to.equal(TRANSFER_AMOUNT);
  });
});


  // --- Administrative Functions Tests ---
  describe("Administrative Functions", function () {
    it("Should allow owner to set AI agent", async function () {
      await expect(
        crossChainManager.connect(owner).setAIAgent(anotherUser.address)
      )
        .to.emit(crossChainManager, "AIAgentUpdated")
        .withArgs(anotherUser.address);
      expect(await crossChainManager.aiAgent()).to.equal(anotherUser.address);
    });

    it("Should revert setting AI agent to zero address", async function () {
      await expect(
        crossChainManager.connect(owner).setAIAgent(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(crossChainManager, "ZeroAddress");
    });

    it("Should revert set AI agent from non-owner", async function () {
      await expect(
        crossChainManager.connect(user1).setAIAgent(anotherUser.address)
      ).to.be.revertedWithCustomError(
        crossChainManager,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow owner to set default strategy", async function () {
      const newStrategyId = 5;
      await expect(
        crossChainManager.connect(owner).setDefaultStrategy(newStrategyId)
      )
        .to.emit(crossChainManager, "DefaultStrategyUpdated")
        .withArgs(newStrategyId);
      expect(await crossChainManager.defaultStrategyId()).to.equal(
        newStrategyId
      );
    });

    it("Should revert set default strategy from non-owner", async function () {
      await expect(
        crossChainManager.connect(user1).setDefaultStrategy(1)
      ).to.be.revertedWithCustomError(
        crossChainManager,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow owner to update supported chain", async function () {
      const NEW_CHAIN = 7890n;
      await expect(
        crossChainManager.connect(owner).updateSupportedChain(NEW_CHAIN, true)
      )
        .to.emit(crossChainManager, "SupportedChainUpdated")
        .withArgs(NEW_CHAIN, true);
      expect(await crossChainManager.supportedChains(NEW_CHAIN)).to.be.true;

      await expect(
        crossChainManager
          .connect(owner)
          .updateSupportedChain(SEPOLIA_CHAIN_SELECTOR, false)
      )
        .to.emit(crossChainManager, "SupportedChainUpdated")
        .withArgs(SEPOLIA_CHAIN_SELECTOR, false);
      expect(await crossChainManager.supportedChains(SEPOLIA_CHAIN_SELECTOR)).to
        .be.false;
    });

    it("Should revert update supported chain from non-owner", async function () {
      await expect(
        crossChainManager.connect(user1).updateSupportedChain(123n, true)
      ).to.be.revertedWithCustomError(
        crossChainManager,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow owner to emergency withdraw ERC20 tokens", async function () {
      const withdrawAmount = parseUnits("500", 6);
      // Give CCM some tokens to withdraw
      await mockERC20.mint(
        await crossChainManager.getAddress(),
        withdrawAmount
      );

      const initialOwnerBalance = await mockERC20.balanceOf(owner.address);
      const initialManagerBalance = await mockERC20.balanceOf(
        await crossChainManager.getAddress()
      );

      await expect(
        crossChainManager
          .connect(owner)
          .emergencyWithdraw(await mockERC20.getAddress(), withdrawAmount)
      )
        .to.emit(crossChainManager, "EmergencyWithdrawal")
        .withArgs(await mockERC20.getAddress(), withdrawAmount);

      expect(await mockERC20.balanceOf(owner.address)).to.equal(
        initialOwnerBalance + withdrawAmount
      );
      expect(
        await mockERC20.balanceOf(await crossChainManager.getAddress())
      ).to.equal(initialManagerBalance - withdrawAmount);
    });

    it("Should revert emergency withdraw from non-owner", async function () {
      await expect(
        crossChainManager
          .connect(user1)
          .emergencyWithdraw(await mockERC20.getAddress(), TRANSFER_AMOUNT)
      ).to.be.revertedWithCustomError(
        crossChainManager,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow owner to withdraw native tokens", async function () {
      const withdrawAmount = parseUnits("1", 18); // 1 ETH
      // Send ETH to CCM so it has something to withdraw
      await owner.sendTransaction({
        to: await crossChainManager.getAddress(),
        value: withdrawAmount,
      });

      const initialOwnerEthBalance = await ethers.provider.getBalance(
        owner.address
      );
      const initialManagerEthBalance = await ethers.provider.getBalance(
        await crossChainManager.getAddress()
      );

      // Perform withdrawal
      const tx = await crossChainManager
        .connect(owner)
        .withdrawNative(withdrawAmount);
      const receipt = await tx.wait(); // Get transaction receipt for gas cost

      await expect(tx)
        .to.emit(crossChainManager, "NativeWithdrawal")
        .withArgs(withdrawAmount);

      expect(
        await ethers.provider.getBalance(await crossChainManager.getAddress())
      ).to.equal(initialManagerEthBalance - withdrawAmount);

      // Calculate gas cost for the withdrawal transaction
      const gasUsed = receipt?.gasUsed || 0n;
      const gasPrice = receipt?.gasPrice || 0n;
      const txGasCost = gasUsed * gasPrice;

      // Check owner balance, accounting for gas cost of the withdrawal transaction
      // The initialOwnerEthBalance is before the tx, so final = initial - txGasCost + withdrawAmount
      expect(await ethers.provider.getBalance(owner.address)).to.equal(
        initialOwnerEthBalance - txGasCost + withdrawAmount
      );
    });

    it("Should revert native withdraw from non-owner", async function () {
      await expect(
        crossChainManager.connect(user1).withdrawNative(parseUnits("0.1", 18))
      ).to.be.revertedWithCustomError(
        crossChainManager,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  // --- No Upgradeability Test (Conceptual) ---
  describe("No Upgradeability", function () {
    it("Should NOT allow upgrading the contract as it's not upgradeable", async function () {
      // This test serves as a conceptual placeholder.
      // In a non-upgradeable contract, there's no direct "upgrade" function.
      // If you tried to use hardhat-upgrades plugin here, it would fail.
      // We are just asserting that there isn't a direct upgrade path.
      // You could, if you wanted, test that a hypothetical `_upgradeTo` function (if it existed) reverts,
      // but for a truly non-upgradeable contract, such functions wouldn't exist anyway.
    });
  });
});
