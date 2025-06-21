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
  connectWeb3Auth: () => Promise<void>
  disconnectWeb3Auth: () => Promise<void>
  switchToSupportedNetwork: () => Promise<void>
  holdings: TokenHolding[]
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
  const [holdings, setHoldings] = useState<TokenHolding[]>([])
  const [isInitializing, setIsInitializing] = useState(false)

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
      return
    }

    setIsInitializing(true)
    try {
      await web3AuthSingleton.init()
      setIsWeb3AuthConnected(web3AuthSingleton.instance.connected)
    } catch (error) {
      console.error("Web3Auth initialization failed:", error)
    } finally {
      setIsInitializing(false)
    }
  }

  const connectWeb3Auth = async () => {
    try {
      const web3authProvider = await web3AuthSingleton.instance.connectTo("openlogin", {
        loginProvider: "google",
      })
      if (web3authProvider) {
        setIsWeb3AuthConnected(true)
      }
    } catch (error) {
      console.error("Web3Auth connection failed:", error)
    }
  }

  const disconnectWeb3Auth = async () => {
    try {
      await web3AuthSingleton.instance.logout()
      setIsWeb3AuthConnected(false)
    } catch (error) {
      console.error("Web3Auth disconnection failed:", error)
    }
  }

  const switchToSupportedNetwork = async () => {
    if (switchChain) {
      try {
        await switchChain({ chainId: SUPPORTED_NETWORKS[0].id })
      } catch (error) {
        console.error("Network switch failed:", error)
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
    connectWeb3Auth,
    disconnectWeb3Auth,
    switchToSupportedNetwork,
    holdings,
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