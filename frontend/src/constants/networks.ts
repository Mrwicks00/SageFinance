import { sepolia, baseSepolia, arbitrumSepolia } from "wagmi/chains"

export const SUPPORTED_NETWORKS = [sepolia, baseSepolia, arbitrumSepolia]

export const getChainById = (chainId: number) => {
  return SUPPORTED_NETWORKS.find(chain => chain.id === chainId)
}

export const NETWORK_CONFIGS = {
  [sepolia.id]: {
    name: "Ethereum Sepolia",
    color: "#627EEA",
    icon: "images/ethereum-logo.png",
  },
  [baseSepolia.id]: {
    name: "Base Sepolia",
    color: "#0052FF",
    icon: "images/base-logo.png",
  },
  [arbitrumSepolia.id]: {
    name: "Arbitrum Sepolia",
    color: "#28A0F0",
    icon: "images/arbitrum-logo.png",
  },
}