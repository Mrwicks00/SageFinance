"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi"
import { web3AuthSingleton } from "@/lib/web3auth-singleton"
import { SUPPORTED_NETWORKS } from "@/constants/networks"

interface WalletContextType {
  isConnected: boolean
  address?: string
  chainId?: number
  balance?: string
  isWrongNetwork: boolean
  isWeb3AuthConnected: boolean
  isWeb3AuthInitialized: boolean
  connectWeb3Auth: (loginProvider?: string) => Promise<void>
  disconnectWeb3Auth: () => Promise<void>
  switchToSupportedNetwork: () => Promise<void>
  holdings: TokenHolding[]
  error: string | null
}

interface TokenHolding {
  symbol: string
  balance: string
  value: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const { switchChain } = useSwitchChain()

  const [isWeb3AuthConnected, setIsWeb3AuthConnected] = useState(false)
  const [isWeb3AuthInitialized, setIsWeb3AuthInitialized] = useState(false)
  const [holdings, setHoldings] = useState<TokenHolding[]>([])
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isWrongNetwork = chainId ? !SUPPORTED_NETWORKS.some((network) => network.id === chainId) : false

  const fetchHoldings = useCallback(async () => {
    const mockHoldings: TokenHolding[] = [
      { symbol: "ETH", balance: balance?.formatted || "0", value: "$0.00" },
      { symbol: "USDC", balance: "0", value: "$0.00" },
      { symbol: "USDT", balance: "0", value: "$0.00" },
    ]
    setHoldings(mockHoldings)
  }, [balance?.formatted])

  useEffect(() => {
    initWeb3Auth()
  }, [])

  useEffect(() => {
    if (address && isConnected) {
      fetchHoldings()
    }
  }, [address, isConnected, chainId, fetchHoldings])

  const initWeb3Auth = async () => {
    if (isInitializing || web3AuthSingleton.isInitialized) {
      setIsWeb3AuthInitialized(web3AuthSingleton.isInitialized)
      return
    }

    setIsInitializing(true)
    setError(null)
    
    try {
      await web3AuthSingleton.init()
      setIsWeb3AuthInitialized(true)
      setIsWeb3AuthConnected(web3AuthSingleton.instance.connected)
      console.log("Web3Auth initialized successfully")
    } catch (error) {
      console.error("Web3Auth initialization failed:", error)
      setError(error instanceof Error ? error.message : "Failed to initialize Web3Auth")
      setIsWeb3AuthInitialized(false)
    } finally {
      setIsInitializing(false)
    }
  }

  const connectWeb3Auth = async (loginProvider: string = "google") => {
    if (!isWeb3AuthInitialized) {
      setError("Web3Auth is not initialized. Please wait for initialization to complete.")
      return
    }

    setError(null)
    
    try {
      const web3authProvider = await web3AuthSingleton.connect(loginProvider)
      if (web3authProvider) {
        setIsWeb3AuthConnected(true)
        console.log("Web3Auth connected successfully")
      }
    } catch (error) {
      console.error("Web3Auth connection failed:", error)
      setError(error instanceof Error ? error.message : "Failed to connect with Web3Auth")
    }
  }

  const disconnectWeb3Auth = async () => {
    setError(null)
    
    try {
      await web3AuthSingleton.disconnect()
      setIsWeb3AuthConnected(false)
      console.log("Web3Auth disconnected successfully")
    } catch (error) {
      console.error("Web3Auth disconnection failed:", error)
      setError(error instanceof Error ? error.message : "Failed to disconnect Web3Auth")
    }
  }

  const switchToSupportedNetwork = async () => {
    if (switchChain) {
      setError(null)
      
      try {
        await switchChain({ chainId: SUPPORTED_NETWORKS[0].id })
      } catch (error) {
        console.error("Network switch failed:", error)
        setError(error instanceof Error ? error.message : "Failed to switch network")
      }
    }
  }

  const value: WalletContextType = {
    isConnected,
    address,
    chainId,
    balance: balance?.formatted,
    isWrongNetwork,
    isWeb3AuthConnected,
    isWeb3AuthInitialized,
    connectWeb3Auth,
    disconnectWeb3Auth,
    switchToSupportedNetwork,
    holdings,
    error,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}