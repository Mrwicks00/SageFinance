"use client"

import { createConfig, http } from "wagmi"
import { sepolia, baseSepolia, arbitrumSepolia } from "wagmi/chains"
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

export const config = createConfig({
  chains: [sepolia, baseSepolia, arbitrumSepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: "SageFi",
      appLogoUrl: "/logo.png",
    }),
    walletConnect({
      projectId,
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
})
