"use client"

import { createConfig, http } from "wagmi"
import { sepolia, baseSepolia, arbitrumSepolia } from "wagmi/chains"
import { 
  coinbaseWallet, 
  metaMask, 
  walletConnect, 
  injected
} from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

if (!projectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set")
}

export const config = createConfig({
  chains: [sepolia, baseSepolia, arbitrumSepolia],
  connectors: [
    // Injected wallets (MetaMask, Brave, etc.)
    injected({
      target: "metaMask",
    }),
  
    
    // Coinbase Wallet
    coinbaseWallet({
      appName: "SageFi",
      appLogoUrl: "/logo.png",
      darkMode: false,
    }),
    
    // WalletConnect
    ...(projectId ? [walletConnect({
      projectId,
      metadata: {
        name: "SageFi",
        description: "Advanced DeFi Trading Platform",
        url: typeof window !== "undefined" ? window.location.origin : "",
        icons: ["/logo.png"],
      },
      showQrModal: true,
    })] : []),
    

  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL),
  },
  ssr: true,
})

// Wallet options for the modal
export const walletOptions = [
  {
    id: "metaMask",
    name: "MetaMask",
    icon: "/images/metamask-logo.png",
    description: "Connect using browser wallet",
    installed: typeof window !== "undefined" && window.ethereum?.isMetaMask,
  },
  {
    id: "coinbaseWallet", 
    name: "Coinbase Wallet",
    icon: "/images/coinbase-logo.png",
    description: "Connect using Coinbase Wallet",
    installed: typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet,
  },
  {
    id: "walletConnect",
    name: "WalletConnect",
    icon: "/images/walletconnect-logo.png", 
    description: "Connect using WalletConnect",
    installed: true,
  }
]

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isCoinbaseWallet?: boolean
      request?: (...args: any[]) => Promise<any>
    }
  }
}