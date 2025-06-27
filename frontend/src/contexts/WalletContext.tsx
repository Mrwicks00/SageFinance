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

// Import the unified chain data from crosschain.ts
import { SUPPORTED_CHAINS_BY_ID, Chain } from "@/data/crosschain";

interface WalletContextType {
  isConnected: boolean;
  address?: `0x${string}`;
  currentChainId?: number;
  currentChain?: Chain;
  balance?: string;
  isWrongNetwork: boolean;
  switchNetwork: (chainId: number) => Promise<void>;
  switchToSupportedNetwork: () => Promise<void>;
  holdings: TokenHolding[];
  error: string | null;
  supportedNetworksList: Chain[];
  isLoading: boolean;
}

interface TokenHolding {
  symbol: string;
  balance: string;
  value: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { switchChainAsync } = useSwitchChain();

  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Loading state based on wagmi's connection status
  const isLoading = useMemo(() => {
    return status === "connecting" || status === "reconnecting";
  }, [status]);

  // Derive currentChain using the numerical chainId
  const currentChain = useMemo(() => {
    return chainId !== undefined ? SUPPORTED_CHAINS_BY_ID[chainId] : undefined;
  }, [chainId]);

  // Determine if the connected network is wrong
  const isWrongNetwork = useMemo(() => {
    const wrongNetwork =
      isConnected && chainId !== undefined && !SUPPORTED_CHAINS_BY_ID[chainId];

    console.log("🔍 WalletContext Network Debug Info:", {
      currentChainId: chainId,
      currentChainName: currentChain?.name,
      isKnownSupportedChain: !!SUPPORTED_CHAINS_BY_ID[chainId!],
      isWrongNetwork: wrongNetwork,
      isConnected,
      status,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
    });

    return wrongNetwork;
  }, [chainId, isConnected, currentChain, status]);

  // List of all supported chains for UI components
  const supportedNetworksList = useMemo(() => {
    return Object.values(SUPPORTED_CHAINS_BY_ID).filter(
      (chain) => chain.isSupported
    );
  }, []);

  const fetchHoldings = useCallback(async () => {
    const mockHoldings: TokenHolding[] = [
      { symbol: "ETH", balance: balance?.formatted || "0", value: "$0.00" },
      { symbol: "USDC", balance: "0", value: "$0.00" },
      { symbol: "USDT", balance: "0", value: "$0.00" },
    ];
    setHoldings(mockHoldings);
  }, [balance?.formatted]);

  useEffect(() => {
    if (address && isConnected) {
      fetchHoldings();
    } else {
      setHoldings([]); // Clear holdings when disconnected
    }
  }, [address, isConnected, chainId, fetchHoldings]);

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
          }...`
        );
      } catch (err: unknown) {
        console.error("Network switch failed:", err);

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
      supportedNetworksList.length > 0 ? supportedNetworksList[0] : undefined;
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
    currentChainId: chainId,
    currentChain,
    balance: balance?.formatted,
    isWrongNetwork,
    switchNetwork,
    switchToSupportedNetwork,
    holdings,
    error,
    supportedNetworksList,
    isLoading,
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