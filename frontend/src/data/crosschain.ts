// src/data/crosschain.ts

import { Address } from 'viem';

export interface Chain {
  id: string; // e.g., 'sepolia'
  name: string; // e.g., 'Ethereum Sepolia'
  chainId: number; // e.g., 11155111
  selector: string; // Chainlink CCIP Chain Selector as a string (can be converted to bigint)
  logo: string;
  color: string; // Used for fallback chain icon
  rpcUrl: string;
  blockExplorer: string;
  isSupported: boolean; // Is this chain supported for transfers (source/destination)
  ccipExplorerUrl?: string; // Specific CCIP explorer URL for this chain if different
}

// USDC Contract Addresses (!!! IMPORTANT: REPLACE WITH REAL ADDRESSES FOR EACH NETWORK !!!)
// These are placeholders. Your actual USDC contract addresses are crucial for functionality.
// These should match the addresses you will put in src/integrations/crossChain/constants.ts
export const USDC_CONTRACT_ADDRESSES_DATA: Record<string, Address> = {
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",     // <<< REPLACE THIS
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // <<< REPLACE THIS
  arbitrumSepolia: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // <<< REPLACE THIS
};


export const SUPPORTED_CHAINS: Record<string, Chain> = {
  sepolia: {
    id: 'sepolia',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    selector: '16015286601757825753',
    logo: "/images/ethereum-logo.png",
    color: '#627EEA',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    isSupported: true,
    ccipExplorerUrl: 'https://ccip.chain.link/msg/'
  },
  baseSepolia: {
    id: 'baseSepolia',
    name: 'Base Sepolia',
    chainId: 84532,
    selector: '10344971235874465080',
    logo: "/images/base-logo.png",
    color: '#0052FF',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia-explorer.base.org',
    isSupported: true,
    ccipExplorerUrl: 'https://ccip.chain.link/msg/'
  },
  arbitrumSepolia: {
    id: 'arbitrumSepolia',
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    selector: '3478487238524512106',
    logo: "/images/arbitrum-logo.png",
    color: '#28A0F0',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia-explorer.arbitrum.io',
    isSupported: true,
    ccipExplorerUrl: 'https://ccip.chain.link/msg/'
  }
};

export const TRANSFER_ROUTES_CONFIG = {
  'sepolia-baseSepolia': { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  'baseSepolia-sepolia': { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  'sepolia-arbitrumSepolia': { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  'arbitrumSepolia-sepolia': { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  'baseSepolia-arbitrumSepolia': { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  'arbitrumSepolia-baseSepolia': { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
};

export const getTransferRoute = (fromId: string, toId: string) => {
    const routeKey = `${fromId}-${toId}`;
    return TRANSFER_ROUTES_CONFIG[routeKey as keyof typeof TRANSFER_ROUTES_CONFIG] || { isActive: false, estimatedTime: 'N/A', estimatedFee: 'N/A' };
};

// --- FIX: Redefined TransferStatus as an object interface ---
export interface TransferStatus {
  // The overall status of the transfer
  status: 'idle' | 'pending' | 'confirming' | 'bridging' | 'depositing' | 'completed' | 'failed';
  // The current step index in the TRANSFER_STEPS array
  step: number;
  // The total number of steps
  totalSteps: number;
  // Optional: Transaction hash from the source chain
  txHash?: string;
  // Optional: CCIP Message ID for tracking on CCIP explorer
  ccipMessageId?: string;
  // Optional: Error message if the transfer fails
  error?: string;
  // Optional: A more detailed message for the current status
  message?: string;
}
// --- END FIX ---

export const TRANSFER_STEPS = [
  'Approve USDC',
  'Initiate Transfer',
  'Cross-Chain Bridge',
  'Auto-Deposit to Yield'
];

export const CCIP_EXPLORER_BASE_URL = "https://ccip.chain.link/msg/";
