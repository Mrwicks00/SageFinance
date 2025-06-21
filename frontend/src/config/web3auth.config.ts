"use client"

import { Web3AuthNoModal } from "@web3auth/no-modal"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || ""

// Define all your chain configs
const chainConfigs = {
  sepolia: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0xaa36a7", // 11155111
    rpcTarget: "https://rpc.sepolia.org",
    displayName: "Ethereum Sepolia",
    blockExplorerUrl: "https://sepolia.etherscan.io/",
    ticker: "ETH",
    tickerName: "Ethereum",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  arbSepolia: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x66eee", // 421614
    rpcTarget: "https://sepolia-rollup.arbitrum.io/rpc",
    displayName: "Arbitrum Sepolia",
    blockExplorerUrl: "https://sepolia.arbiscan.io/",
    ticker: "ETH",
    tickerName: "Ethereum",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
  },
  baseSepolia: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x14a34", // 84532
    rpcTarget: "https://sepolia.base.org",
    displayName: "Base Sepolia",
    blockExplorerUrl: "https://sepolia.basescan.org/",
    ticker: "ETH",
    tickerName: "Ethereum",
    logo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
  }
} as const

// Type for chain keys
type ChainKey = keyof typeof chainConfigs

// Create providers for each chain
const providers: Record<ChainKey, EthereumPrivateKeyProvider> = {
  sepolia: new EthereumPrivateKeyProvider({
    config: { chainConfig: chainConfigs.sepolia }
  }),
  arbSepolia: new EthereumPrivateKeyProvider({
    config: { chainConfig: chainConfigs.arbSepolia }
  }),
  baseSepolia: new EthereumPrivateKeyProvider({
    config: { chainConfig: chainConfigs.baseSepolia }
  })
}

// Initialize with default chain (Sepolia)
export const web3auth = new Web3AuthNoModal({
  clientId,
  chainConfig: chainConfigs.sepolia,
  privateKeyProvider: providers.sepolia,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
})

// Create adapter but don't configure it yet
export const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    uxMode: "redirect",
    loginConfig: {
      google: {
        verifier: "sagefi-google",
        typeOfLogin: "google",
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      },
    },
  },
})

// Function to configure adapter (call this after init)
export const configureWeb3AuthAdapter = () => {
  if (typeof window !== 'undefined') {
    web3auth.configureAdapter(openloginAdapter)
  }
}

// Function to switch chains
export const switchChain = async (chainKey: ChainKey) => {
  if (!providers[chainKey]) {
    throw new Error(`Chain ${chainKey} not configured`)
  }
  
  const chainConfig = chainConfigs[chainKey]
  
  try {
    // Try to switch first
    await web3auth.switchChain({ chainId: chainConfig.chainId })
  } catch {
    // If chain doesn't exist, add it first
    await web3auth.addChain(chainConfig)
    await web3auth.switchChain({ chainId: chainConfig.chainId })
  }
}

// Export chain configs for easy access
export { chainConfigs }
export type { ChainKey }