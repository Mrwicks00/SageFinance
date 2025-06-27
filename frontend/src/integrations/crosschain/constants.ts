// src/integrations/crossChain/constants.ts

import { Address } from 'viem';
import { CrossChainManagerABI } from './CrossChainManagerABI'; // Import the ABI

export { CrossChainManagerABI }; // Re-export the ABI for convenience

// CrossChainManager Contract Addresses
export const CROSS_CHAIN_MANAGER_ADDRESSES: Record<number, Address> = {
  11155111: "0xa4e8a4E9C84D9b8B02095AeE9d4f163744A4d734",   // Sepolia
  84532: "0x79661a34488f91a50Ff99027B905a87E72c7291A",       // Base Sepolia
  421614: "0xb59E4c855a8E142e389bB535962622B42955b9BC",     // Arbitrum Sepolia
};

// USDC Contract Addresses (!!! IMPORTANT: REPLACE WITH REAL ADDRESSES FOR EACH NETWORK !!!)
// These are placeholders. Your actual USDC contract addresses are crucial for functionality.
export const USDC_CONTRACT_ADDRESSES_CROSSCHAIN: Record<number, Address> = {
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // <<< REPLACE THIS
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",   // <<< REPLACE THIS
  421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // <<< REPLACE THIS
};

// Chainlink CCIP Router Addresses (standard for testnets)
// Always verify these against the official Chainlink documentation: https://docs.chain.link/ccip/supported-networks/v1_2_0/
export const CCIP_ROUTER_ADDRESSES: Record<number, Address> = {
  11155111: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", // Sepolia
  84532: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",   // Base Sepolia
  421614: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165", // Arbitrum Sepolia (often same as Base Sepolia for testnet routers)
};

// Chainlink Chain Selectors for CCIP (from your crosschain.ts data)
export const CHAINLINK_CHAIN_SELECTORS_MAP: Record<number, bigint> = {
  11155111: 16015286601757825753n, // Ethereum Sepolia
  84532: 10344971235874465080n,   // Base Sepolia
  421614: 3478487238524512106n,   // Arbitrum Sepolia
};

// Default strategy ID for auto-deposit. This should match a strategy ID in your YieldOptimizer contract.
// Assuming your YieldOptimizer's Compound strategy is ID 1 (as per previous context).
export const DEFAULT_YIELD_OPTIMIZER_STRATEGY_ID = 1;

// Helper function to validate chain selector
export function validateChainSelector(chainId: number): boolean {
  return chainId in CHAINLINK_CHAIN_SELECTORS_MAP;
}

// Helper function to get supported chain pairs
export function getSupportedChainPairs(): Array<{source: number, destination: number}> {
  const chainIds = Object.keys(CHAINLINK_CHAIN_SELECTORS_MAP).map(Number);
  const pairs: Array<{source: number, destination: number}> = [];
  
  for (const source of chainIds) {
    for (const destination of chainIds) {
      if (source !== destination) {
        pairs.push({ source, destination });
      }
    }
  }
  
  return pairs;
}

// Helper function to validate if a route is supported
export function isRouteSupported(sourceChainId: number, destinationChainId: number): boolean {
  return validateChainSelector(sourceChainId) && 
         validateChainSelector(destinationChainId) && 
         sourceChainId !== destinationChainId &&
         sourceChainId in CROSS_CHAIN_MANAGER_ADDRESSES &&
         destinationChainId in CROSS_CHAIN_MANAGER_ADDRESSES;
}

// Default strategy ID for auto-deposit
// export const DEFAULT_YIELD_OPTIMIZER_STRATEGY_ID = 1;

// Chain configuration validation
export function validateChainConfiguration(chainId: number): {
  isValid: boolean;
  hasManager: boolean;
  hasUsdc: boolean;
  hasRouter: boolean;
  hasSelector: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const hasManager = chainId in CROSS_CHAIN_MANAGER_ADDRESSES;
  const hasUsdc = chainId in USDC_CONTRACT_ADDRESSES_CROSSCHAIN;
  const hasRouter = chainId in CCIP_ROUTER_ADDRESSES;
  const hasSelector = chainId in CHAINLINK_CHAIN_SELECTORS_MAP;

  if (!hasManager) issues.push(`Missing CrossChainManager address for chain ${chainId}`);
  if (!hasUsdc) issues.push(`Missing USDC address for chain ${chainId}`);
  if (!hasRouter) issues.push(`Missing CCIP Router address for chain ${chainId}`);
  if (!hasSelector) issues.push(`Missing chain selector for chain ${chainId}`);

  return {
    isValid: hasManager && hasUsdc && hasRouter && hasSelector,
    hasManager,
    hasUsdc,
    hasRouter,
    hasSelector,
    issues
  };
}
