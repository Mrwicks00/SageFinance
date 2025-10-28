import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY; 
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_2 = process.env.SECOND_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; 
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY; // Add this to your .env file

// Validate required environment variables
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is required in .env file");
}
if (!ETHERSCAN_API_KEY) {
  throw new Error("ETHERSCAN_API_KEY is required in .env file");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200  // Low runs value for size optimization
      },
      viaIR: true,
    },
  },
  networks: {
    // sepolia: {
    //   url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, // Or Infura URL
    //   accounts: [
    //     `0x${PRIVATE_KEY}`,   // Your first account
    //     `0x${PRIVATE_KEY_2}`  // <--- Your second account
    //   ],
    //   gasPrice: 20000000000, // 20 Gwei (adjust as needed, 20 is often good for testnets)
    // },
    "base-sepolia": {
      url: "https://sepolia.base.org", // Official Base Sepolia RPC
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 100000, // 1 Gwei (Base typically has lower gas prices)
      chainId: 84532, // Base Sepolia chain ID
    },
    "arbitrum-sepolia": {
      url: `https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    // Alternative Base Sepolia RPC endpoints (uncomment if needed)
    // "base-sepolia-alchemy": {
    //   url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, // If you have Alchemy Base Sepolia access
    //   accounts: [`0x${PRIVATE_KEY}`],
    //   gasPrice: 1000000000,
    //   chainId: 84532,
    // },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/"
        }
      }
    ]
  },
};

export default config;