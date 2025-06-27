// src/data/crosschain.ts

import { Address } from 'viem';
import { sepolia, baseSepolia, arbitrumSepolia } from 'wagmi/chains'; // Import wagmi chain objects

// Extend the wagmi Chain type if necessary, or define a new one that combines properties
// Updated Chain interface - extend wagmi's Chain type properly
export interface Chain {
  id: number; // Keep this to match wagmi's chain.id
  name: string;
  chainId: number;
  selector: string;
  logo: string;
  color: string;
  rpcUrl: string;
  rpcUrls: {
    default: { http: string[] };
    public: { http: string[] };
  };
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isSupported: boolean;
  isTestnet?: boolean;
  ccipExplorerUrl?: string;
}

// Updated SUPPORTED_CHAINS_BY_ID - manually construct objects to avoid spread conflicts
export const SUPPORTED_CHAINS_BY_ID: Record<number, Chain> = {
  [sepolia.id]: {
    id: sepolia.id,
    name: 'Ethereum Sepolia',
    chainId: sepolia.id,
    selector: '16015286601757825753',
    logo: "/images/ethereum-logo.png",
    color: '#627EEA',
    rpcUrl: sepolia.rpcUrls.default.http[0],
    rpcUrls: {
      default: { http: [...sepolia.rpcUrls.default.http] },
      public: { http: [...sepolia.rpcUrls.default.http] }
    },
    blockExplorer: sepolia.blockExplorers?.default.url || 'https://sepolia.etherscan.io',
    nativeCurrency: sepolia.nativeCurrency,
    isSupported: true,
    isTestnet: sepolia.testnet || false,
    ccipExplorerUrl: 'https://ccip.chain.link/msg/'
  },
  [baseSepolia.id]: {
    id: baseSepolia.id,
    name: 'Base Sepolia',
    chainId: baseSepolia.id,
    selector: '10344971235874465080',
    logo: "/images/base-logo.png",
    color: '#0052FF',
    rpcUrl: baseSepolia.rpcUrls.default.http[0],
    rpcUrls: {
      default: { http: [...baseSepolia.rpcUrls.default.http] },
      public: { http: [...baseSepolia.rpcUrls.default.http] }
    },
    
    blockExplorer: baseSepolia.blockExplorers?.default.url || 'https://sepolia-explorer.base.org',
    nativeCurrency: baseSepolia.nativeCurrency,
    isSupported: true,
    isTestnet: baseSepolia.testnet || false,
    ccipExplorerUrl: 'https://ccip.chain.link/msg/'
  },
  [arbitrumSepolia.id]: {
    id: arbitrumSepolia.id,
    name: 'Arbitrum Sepolia',
    chainId: arbitrumSepolia.id,
    selector: '3478487238524512106',
    logo: "/images/arbitrum-logo.png",
    color: '#28A0F0',
    rpcUrl: arbitrumSepolia.rpcUrls.default.http[0],
    rpcUrls: {
      default: { http: [...arbitrumSepolia.rpcUrls.default.http] },
      public: { http: [...arbitrumSepolia.rpcUrls.default.http] }
    },
    blockExplorer: arbitrumSepolia.blockExplorers?.default.url || 'https://sepolia-explorer.arbitrum.io',
    nativeCurrency: arbitrumSepolia.nativeCurrency,
    isSupported: true,
    isTestnet: arbitrumSepolia.testnet || false,
    ccipExplorerUrl: 'https://ccip.chain.link/msg/'
  }
};
// USDC Contract Addresses - NOW KEYED BY NUMERICAL CHAIN ID
export const USDC_CONTRACT_ADDRESSES_DATA: Record<number, Address> = {
  [sepolia.id]: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  [arbitrumSepolia.id]: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
};

// --- Updated TRANSFER_ROUTES_CONFIG to use numerical chain IDs ---
export const TRANSFER_ROUTES_CONFIG: Record<string, { isActive: boolean; estimatedTime: string; estimatedFee: string }> = {
  // Sepolia (11155111) to Base Sepolia (84532)
  [`${sepolia.id}-${baseSepolia.id}`]: { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  // Base Sepolia (84532) to Sepolia (11155111)
  [`${baseSepolia.id}-${sepolia.id}`]: { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  // Sepolia (11155111) to Arbitrum Sepolia (421614)
  [`${sepolia.id}-${arbitrumSepolia.id}`]: { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  // Arbitrum Sepolia (421614) to Sepolia (11155111)
  [`${arbitrumSepolia.id}-${sepolia.id}`]: { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  // Base Sepolia (84532) to Arbitrum Sepolia (421614)
  [`${baseSepolia.id}-${arbitrumSepolia.id}`]: { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
  // Arbitrum Sepolia (421614) to Base Sepolia (84532)
  [`${arbitrumSepolia.id}-${baseSepolia.id}`]: { isActive: true, estimatedTime: '5-10 minutes', estimatedFee: '0.001' },
};

export const getTransferRoute = (fromChainId: number, toChainId: number) => { // Updated to accept numbers
    const routeKey = `${fromChainId}-${toChainId}`; // Key using numbers
    return TRANSFER_ROUTES_CONFIG[routeKey] || { isActive: false, estimatedTime: 'N/A', estimatedFee: 'N/A' };
};

export interface TransferStatus {
  status: 'idle' | 'pending' | 'confirming' | 'bridging' | 'depositing' | 'completed' | 'failed';
  step: number;
  totalSteps: number;
  txHash?: string;
  ccipMessageId?: string;
  error?: string;
  message?: string;
  isTransactionConfirmed?: boolean; // Added this property
}

export const TRANSFER_STEPS = [
  'Approve USDC',
  'Initiate Transfer',
  'Cross-Chain Bridge',
  'Auto-Deposit to Yield'
];

export const CCIP_EXPLORER_BASE_URL = "https://ccip.chain.link/msg/";

