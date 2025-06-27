// src/contexts/WalletContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { toast } from "react-toastify";
import { web3AuthSingleton } from "@/lib/web3auth-singleton";

// Import the unified chain data from crosschain.ts
import { SUPPORTED_CHAINS_BY_ID, Chain } from "@/data/crosschain"; // Use the new naming

interface WalletContextType {
  isConnected: boolean;
  address?: `0x${string}`;
  currentChainId?: number;
  currentChain?: Chain; // This will now be of our extended Chain type
  balance?: string;
  isWrongNetwork: boolean;
  isWeb3AuthConnected: boolean;
  isWeb3AuthInitialized: boolean;
  connectWeb3Auth: (loginProvider?: string) => Promise<void>;
  disconnectWeb3Auth: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>; // Added for explicit network switching
  switchToSupportedNetwork: () => Promise<void>;
  holdings: TokenHolding[];
  error: string | null;
  supportedNetworksList: Chain[]; // Explicitly export a list for dropdowns etc.
}

interface TokenHolding {
  symbol: string;
  balance: string;
  value: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId(); // This gives the numerical chainId from wagmi
  const { data: balance } = useBalance({ address });
  const { switchChainAsync } = useSwitchChain(); // Use switchChainAsync for better error handling

  const [isWeb3AuthConnected, setIsWeb3AuthConnected] = useState(false);
  const [isWeb3AuthInitialized, setIsWeb3AuthInitialized] = useState(false);
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive currentChain using the numerical chainId
  const currentChain = useMemo(() => {
    return chainId !== undefined ? SUPPORTED_CHAINS_BY_ID[chainId] : undefined;
  }, [chainId]);

  // Determine if the connected network is wrong (not in our SUPPORTED_CHAINS_BY_ID list)
  const isWrongNetwork = useMemo(() => {
    const wrongNetwork =
      isConnected && chainId !== undefined && !SUPPORTED_CHAINS_BY_ID[chainId];

    // Debug logging
    console.log("🔍 WalletContext Network Debug Info:", {
      currentChainId: chainId,
      currentChainName: currentChain?.name,
      isKnownSupportedChain: !!SUPPORTED_CHAINS_BY_ID[chainId!],
      isWrongNetwork: wrongNetwork,
      isConnected,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
    });

    return wrongNetwork;
  }, [chainId, isConnected, currentChain]);

  // List of all supported chains for UI components
  const supportedNetworksList = useMemo(() => {
    return Object.values(SUPPORTED_CHAINS_BY_ID).filter(
      (chain) => chain.isSupported
    );
  }, []);

  const fetchHoldings = useCallback(async () => {
    // This is mock data, integrate real balance fetching here
    const mockHoldings: TokenHolding[] = [
      { symbol: "ETH", balance: balance?.formatted || "0", value: "$0.00" },
      { symbol: "USDC", balance: "0", value: "$0.00" },
      { symbol: "USDT", balance: "0", value: "$0.00" },
    ];
    setHoldings(mockHoldings);
  }, [balance?.formatted]);

  useEffect(() => {
    initWeb3Auth();
  }, []);

  useEffect(() => {
    if (address && isConnected) {
      fetchHoldings();
    }
  }, [address, isConnected, chainId, fetchHoldings]); // Added chainId as dependency for refetching holdings if needed

  const initWeb3Auth = async () => {
    if (isInitializing || web3AuthSingleton.isInitialized) {
      setIsWeb3AuthInitialized(web3AuthSingleton.isInitialized);
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await web3AuthSingleton.init();
      setIsWeb3AuthInitialized(true);
      setIsWeb3AuthConnected(web3AuthSingleton.instance.connected);
      console.log("Web3Auth initialized successfully");
    } catch (error) {
      console.error("Web3Auth initialization failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to initialize Web3Auth"
      );
      setIsWeb3AuthInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const connectWeb3Auth = async (loginProvider: string = "google") => {
    if (!isWeb3AuthInitialized) {
      setError(
        "Web3Auth is not initialized. Please wait for initialization to complete."
      );
      return;
    }

    setError(null);

    try {
      const web3authProvider = await web3AuthSingleton.connect(loginProvider);
      if (web3authProvider) {
        setIsWeb3AuthConnected(true);
        console.log("Web3Auth connected successfully");
      }
    } catch (error) {
      console.error("Web3Auth connection failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to connect with Web3Auth"
      );
    }
  };

  const disconnectWeb3Auth = async () => {
    setError(null);

    try {
      await web3AuthSingleton.disconnect();
      setIsWeb3AuthConnected(false);
      console.log("Web3Auth disconnected successfully");
    } catch (error) {
      console.error("Web3Auth disconnection failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to disconnect Web3Auth"
      );
    }
  };

  // New function to switch network explicitly
  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      if (!isConnected) {
        toast.error("Please connect your wallet first to switch networks.");
        throw new Error("Wallet not connected.");
      }
      if (chainId === targetChainId) {
        toast.info("Already on the selected network.");
        return;
      }
      setError(null);
      try {
        await switchChainAsync({ chainId: targetChainId });
        toast.success(
          `Switching to ${
            SUPPORTED_CHAINS_BY_ID[targetChainId]?.name || "new network"
          }... Please confirm in your wallet.`
        );
      } catch (err: unknown) {
        console.error("Network switch failed:", err);

        // Type-safe error message extraction
        const errorMessage =
          err instanceof Error
            ? (err as any).shortMessage || err.message
            : "Network switch failed";

        toast.error(`Failed to switch network: ${errorMessage}`);
        throw err;
      }
    },
    [isConnected, chainId, switchChainAsync]
  );

  const switchToSupportedNetwork = useCallback(async () => {
    const defaultSupportedChain =
      supportedNetworksList.length > 0 ? supportedNetworksList[0] : undefined; // Get the first supported chain
    if (defaultSupportedChain) {
      try {
        await switchNetwork(defaultSupportedChain.chainId);
      } catch (error) {
        console.error("Failed to switch to default supported network:", error);
      }
    } else {
      toast.error("No default supported network found to switch to.");
    }
  }, [supportedNetworksList, switchNetwork]);

  const value: WalletContextType = {
    isConnected,
    address,
    currentChainId: chainId, // Expose wagmi's chainId directly
    currentChain, // Expose our custom Chain object
    balance: balance?.formatted,
    isWrongNetwork,
    isWeb3AuthConnected,
    isWeb3AuthInitialized,
    connectWeb3Auth,
    disconnectWeb3Auth,
    switchNetwork, // Include new switchNetwork
    switchToSupportedNetwork,
    holdings,
    error,
    supportedNetworksList, // Include the new list of supported networks
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
