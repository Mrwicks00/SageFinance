// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20; // Match the pragma of your YieldOptimizer

// import "../interfaces/IYieldOptimizer.sol"; // Import your actual IYieldOptimizer interface
// import "../structs/YieldOptimizerStructs.sol"; // Import structs if used by the interface
// import "hardhat/console.sol"; // For debugging in tests
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


// /**
//  * @title MockIYieldOptimizer
//  * @dev Mock implementation of IYieldOptimizer for testing purposes.
//  * Records calls to relevant functions and provides stub implementations for others.
//  */
// contract MockIYieldOptimizer is IYieldOptimizer {
//     using SafeERC20 for IERC20;

//     // --- State variables to record calls for verification ---
//     struct DepositCall {
//         uint256 strategyId;
//         uint256 amount;
//         address caller;
//     }
//     DepositCall[] public depositCalls;

//     struct RebalanceCall {
//         address user;
//         uint256 positionIndex;
//         uint256 newStrategyId;
//         uint256 amount;
//         address caller;
//     }
//     RebalanceCall[] public rebalanceCalls;

//     // Mock balances to simulate receiving and holding tokens for tests
//     // This mapping will track what this mock contract *would* hold if it were a real YieldOptimizer.
//     mapping(address => mapping(address => uint256)) public mockTokenBalances; // tokenAddress => ownerAddress => amount

//     // Mock state for public getters from the interface
//     address public aiAgentMock;
//     uint256 public rebalanceIntervalMock;
//     uint256 public lastGlobalRebalanceMock;
//     uint256 public maxSlippageBPSMock;
//     uint256 public priceDeviationThresholdMock;
//     int256 public lastValidPriceMock;
//     uint256 public lastPriceUpdateMock;
//     address public stablecoinMock;
//     address public wethMock;
//     uint256 public constant MAX_POSITIONS_PER_USER_MOCK = 50;
//     mapping(address => uint256) public userLastRebalanceMock;

//     address public vrfCoordinatorMock;
//     uint64 public vrfSubscriptionIdMock;
//     bytes32 public constant KEY_HASH_MOCK = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
//     uint32 public constant CALLBACK_GAS_LIMIT_MOCK = 100000;
//     uint16 public constant REQUEST_CONFIRMATIONS_MOCK = 3;
//     uint32 public constant NUM_WORDS_MOCK = 1;


//     // Mock strategies and positions (simplified for testing external calls)
//     mapping(uint256 => YieldOptimizerStructs.Strategy) public strategiesMock;
//     mapping(address => YieldOptimizerStructs.UserPosition[]) public userPositionsMock;
//     mapping(uint256 => YieldOptimizerStructs.VRFRequest) public vrfRequestsMock;


//     constructor() {
//         // Initialize mock state variables if needed for tests
//         stablecoinMock = address(1); // Placeholder
//         wethMock = address(2); // Placeholder
//         aiAgentMock = address(3); // Placeholder
//         vrfCoordinatorMock = address(4); // Placeholder
//         vrfSubscriptionIdMock = 1; // Placeholder
//         rebalanceIntervalMock = 1 days;
//         maxSlippageBPSMock = 300;
//         priceDeviationThresholdMock = 500;
//         lastValidPriceMock = 2000e8; // Example price
//         lastPriceUpdateMock = block.timestamp;

//         strategiesMock[0] = YieldOptimizerStructs.Strategy(0, "Aave", address(10), address(0), true);
//         strategiesMock[1] = YieldOptimizerStructs.Strategy(1, "Compound", address(11), address(0), true);
//         strategiesMock[2] = YieldOptimizerStructs.Strategy(2, "Uniswap", address(12), address(0), true);
//     }

//     // --- Mock implementation of IYieldOptimizer functions ---

//     function deposit(uint256 _strategyId, uint256 _amount) external override {
//         console.log("MockIYieldOptimizer: deposit called");
//         console.log("  Strategy ID:", _strategyId);
//         console.log("  Amount:", _amount);
//         console.log("  Caller:", msg.sender);

//         depositCalls.push(DepositCall({
//             strategyId: _strategyId,
//             amount: _amount,
//             caller: msg.sender
//         }));

//         // Simulate receiving tokens if the CrossChainManager sends them.
//         // The CrossChainManager will `approve` this YieldOptimizer mock
//         // and then this mock will need to `transferFrom` the CCM.
//         // For testing, we just increment our internal mock balance.
//         // In a real scenario, this mock might need access to a mock ERC20 or assume balance.
//         // For this test, we'll assume the CCM has already transferred or approved.
//         // The `CrossChainManager` will have transferred funds to itself, then approved `yieldOptimizer`.
//         // So, this `deposit` function would typically pull from the `CrossChainManager`'s balance.
//         // For simplicity, let's just track the balance received by the mock.
//         mockTokenBalances[msg.sender][address(this)] += _amount;
//         // In a real mock scenario, you might do: IERC20(stablecoinMock).safeTransferFrom(msg.sender, address(this), _amount);
//         // but for a pure interface mock, we simplify.
//     }

//     function depositRandom(uint256 amount) external override returns (uint256 requestId) {
//         console.log("MockIYieldOptimizer: depositRandom called with amount", amount);
//         // Simulate a request ID being returned
//         requestId = 12345; // Fixed mock ID
//         vrfRequestsMock[requestId] = YieldOptimizerStructs.VRFRequest({
//             user: msg.sender,
//             amount: amount,
//             fulfilled: false
//         });
//         return requestId;
//     }

//     function withdraw(uint256 positionIndex, uint256 amount) external override {
//         console.log("MockIYieldOptimizer: withdraw called");
//         // Simulate withdrawal logic if needed for specific tests
//         require(userPositionsMock[msg.sender].length > positionIndex, "Invalid position index");
//         require(userPositionsMock[msg.sender][positionIndex].balance >= amount, "Insufficient position balance");
//         userPositionsMock[msg.sender][positionIndex].balance -= amount;
//         mockTokenBalances[msg.sender][address(this)] -= amount; // Simulate token outflow
//     }

//     function rebalance(
//         address _user,
//         uint256 _positionIndex,
//         uint256 _newStrategyId,
//         uint256 _amount
//     ) external override {
//         console.log("MockIYieldOptimizer: rebalance called");
//         console.log("  User:", _user);
//         console.log("  Position Index:", _positionIndex);
//         console.log("  New Strategy ID:", _newStrategyId);
//         console.log("  Amount:", _amount);
//         console.log("  Caller:", msg.sender);

//         rebalanceCalls.push(RebalanceCall({
//             user: _user,
//             positionIndex: _positionIndex,
//             newStrategyId: _newStrategyId,
//             amount: _amount,
//             caller: msg.sender
//         }));
//     }

//     function rebalanceIfPriceThreshold(
//         uint256 /* positionIndex */, // Unused parameter
//         uint256 /* newStrategyId */,   // Unused parameter
//         uint256 /* amount */,         // Unused parameter
//         int256 /* priceThreshold */,   // Unused parameter
//         bool /* isPriceAboveThreshold */ // Unused parameter
//     ) external pure override { // Changed to pure
//         console.log("MockIYieldOptimizer: rebalanceIfPriceThreshold called");
//         // Add specific mock logic if needed for price-based rebalance tests
//     }
    
//     function globalRebalance(
//         address[] calldata /* users */, // Unused parameter
//         uint256 /* newStrategyId */ // Unused parameter
//     ) external pure override { // Changed to pure
//         console.log("MockIYieldOptimizer: globalRebalance called");
//         // Add specific mock logic for global rebalance tests
//     }
    
//     function consolidateMyPositions() external pure override { // Changed to pure
//         console.log("MockIYieldOptimizer: consolidateMyPositions called");
//         // Add specific mock logic if needed for consolidation tests
//     }
    
//     // --- View Functions ---
//     function getLatestPrice() external view override returns (int256) {
//         return lastValidPriceMock; // Return mock price
//     }

//     function getUserBalance(address user) external view override returns (uint256) {
//         // Return a mock sum of user positions, or just a fixed value for simplicity
//         uint256 total = 0;
//         for(uint i=0; i<userPositionsMock[user].length; i++){
//             total += userPositionsMock[user][i].balance;
//         }
//         return total;
//     }

//     function strategies(uint256 strategyId) external view override returns (YieldOptimizerStructs.Strategy memory) {
//         return strategiesMock[strategyId];
//     }

//     function userPositions(address user, uint256 index) external view override returns (YieldOptimizerStructs.UserPosition memory) {
//         return userPositionsMock[user][index];
//     }

//     function vrfRequests(uint256 requestId) external view override returns (YieldOptimizerStructs.VRFRequest memory) {
//         return vrfRequestsMock[requestId];
//     }
    
//     function aiAgent() external view override returns (address) { return aiAgentMock; }
//     function rebalanceInterval() external view override returns (uint256) { return rebalanceIntervalMock; }
//     function lastGlobalRebalance() external view override returns (uint256) { return lastGlobalRebalanceMock; }
//     function maxSlippageBPS() external view override returns (uint256) { return maxSlippageBPSMock; }
//     function priceDeviationThreshold() external view override returns (uint256) { return priceDeviationThresholdMock; }
//     function lastValidPrice() external view override returns (int256) { return lastValidPriceMock; }
//     function lastPriceUpdate() external view override returns (uint256) { return lastPriceUpdateMock; }
//     function stablecoin() external view override returns (address) { return stablecoinMock; }
//     function weth() external view override returns (address) { return wethMock; }
//     function MAX_POSITIONS_PER_USER() external pure override returns (uint256) { return MAX_POSITIONS_PER_USER_MOCK; } // Changed to pure
//     function userLastRebalance(address _user) external view override returns (uint256) { return userLastRebalanceMock[_user]; }

//     // VRF Config (constants) - return mock values
//     function vrfCoordinator() external view override returns (address) { return vrfCoordinatorMock; }
//     function vrfSubscriptionId() external view override returns (uint64) { return vrfSubscriptionIdMock; }
//     function KEY_HASH() external pure override returns (bytes32) { return KEY_HASH_MOCK; } // Changed to pure
//     function CALLBACK_GAS_LIMIT() external pure override returns (uint32) { return CALLBACK_GAS_LIMIT_MOCK; } // Changed to pure
//     function REQUEST_CONFIRMATIONS() external pure override returns (uint16) { return REQUEST_CONFIRMATIONS_MOCK; } // Changed to pure
//     function NUM_WORDS() external pure override returns (uint32) { return NUM_WORDS_MOCK; } // Changed to pure
    
//     // --- Admin Functions ---
//     function setAIAgent(address _newAgent) external override {
//         console.log("MockIYieldOptimizer: setAIAgent called with", _newAgent);
//         aiAgentMock = _newAgent;
//     }

//     function setMaxSlippage(uint256 _maxSlippageBPS) external override {
//         console.log("MockIYieldOptimizer: setMaxSlippage called with", _maxSlippageBPS);
//         maxSlippageBPSMock = _maxSlippageBPS;
//     }

//     function pause() external override {
//         console.log("MockIYieldOptimizer: pause called");
//         // Simulate pause state if needed
//     }

//     function unpause() external override {
//         console.log("MockIYieldOptimizer: unpause called");
//         // Simulate unpause state if needed
//     }

//     function emergencyWithdraw(address token, uint256 amount) external override {
//         console.log("MockIYieldOptimizer: emergencyWithdraw called for token", token, "amount", amount);
//         // Simulate withdrawal if needed
//     }

//     // --- Helper functions for tests to retrieve recorded calls ---

//     function getLatestDepositCall() external view returns (DepositCall memory) {
//         require(depositCalls.length > 0, "No deposit calls recorded");
//         return depositCalls[depositCalls.length - 1];
//     }

//     function getLatestRebalanceCall() external view returns (RebalanceCall memory) {
//         require(rebalanceCalls.length > 0, "No rebalance calls recorded");
//         return rebalanceCalls[rebalanceCalls.length - 1];
//     }

//     function getDepositCallsCount() external view returns (uint256) {
//         return depositCalls.length;
//     }

//     function getRebalanceCallsCount() external view returns (uint256) {
//         return rebalanceCalls.length;
//     }
// }
