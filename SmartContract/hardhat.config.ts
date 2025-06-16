import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY; 
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; 

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
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, // Or Infura URL
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 20000000000, // 20 Gwei (adjust as needed, 20 is often good for testnets)
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;