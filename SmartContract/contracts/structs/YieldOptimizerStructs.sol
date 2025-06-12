// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library YieldOptimizerStructs {
    struct UserPosition {
        uint256 strategyId; // 0: Aave, 1: Compound, 2: Uniswap
        uint256 balance; // USDC balance in pool
        uint256 lastUpdated; // Timestamp of last update
        uint256 lastRebalanced; // Timestamp of last rebalance
    }

    struct Strategy {
        uint256 id; // 0: Aave, 1: Compound, 2: Uniswap
        string protocol; // "Aave", "Compound", "Uniswap"
        address pool; // Protocol contract address
        address receiptToken; // aUSDC, cUSDC, Uniswap LP token
        bool active; // Strategy status
    }

    struct VRFRequest {
        address user;
        uint256 amount;
        bool fulfilled;
    }
}