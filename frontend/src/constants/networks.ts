import { sepolia, baseSepolia, arbitrumSepolia } from "wagmi/chains"

export const SUPPORTED_NETWORKS = [sepolia, baseSepolia, arbitrumSepolia]

export const NETWORK_CONFIGS = {
  [sepolia.id]: {
    name: "Ethereum Sepolia",
    color: "#627EEA",
    icon: "🔷",
  },
  [baseSepolia.id]: {
    name: "Base Sepolia",
    color: "#0052FF",
    icon: "🔵",
  },
  [arbitrumSepolia.id]: {
    name: "Arbitrum Sepolia",
    color: "#28A0F0",
    icon: "🔺",
  },
}
