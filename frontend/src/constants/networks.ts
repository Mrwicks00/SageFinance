// src/constants/networks.ts

// This file is being simplified as network configurations are now primarily
// managed in src/data/crosschain.ts for a single source of truth.

// You can re-export the wagmi chains if needed by other parts of your app
import { sepolia, baseSepolia, arbitrumSepolia } from "wagmi/chains";

export const SUPPORTED_NETWORKS = [sepolia, baseSepolia, arbitrumSepolia];

// All other detailed network configurations should now come from src/data/crosschain.ts
// Remove NETWORK_CONFIGS and getChainById if no longer used directly outside WalletContext
// or if WalletContext is updated to use SUPPORTED_CHAINS_BY_ID.
