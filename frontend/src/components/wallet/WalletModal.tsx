"use client"
import { useConnect } from "wagmi"
import { Connector } from "wagmi"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { useWallet } from "@/contexts/WalletContext"
import Image from "next/image"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

// Wallet configuration with proper icons and descriptions
const walletConfig = {
  "MetaMask": {
    icon: "/images/metamask-logo.png",
    emoji: "🦊",
    description: "Connect using browser wallet",
    installed: typeof window !== "undefined" && window.ethereum?.isMetaMask,
  },
  "Coinbase Wallet": {
    icon: "/images/coinbase-logo.png", 
    emoji: "🔵",
    description: "Connect using Coinbase Wallet",
    installed: typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet,
  },
  "WalletConnect": {
    icon: "/images/walletconnect-logo.png",
    emoji: "🔗", 
    description: "Scan with WalletConnect to connect",
    installed: true,
  },
  "Safe": {
    icon: "/images/safe-logo.png",
    emoji: "🛡️",
    description: "Connect to Safe multisig",
    installed: true,
  },
  "Ledger Live": {
    icon: "/images/ledger-logo.png",
    emoji: "🔐",
    description: "Connect using Ledger hardware wallet", 
    installed: true,
  },
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connect, isPending } = useConnect()
  const { connectWeb3Auth } = useWallet()

  const handleConnect = (connector: Connector) => {
    connect({ connector })
    onClose()
  }

  const handleWeb3AuthConnect = async () => {
    try {
      await connectWeb3Auth()
      onClose()
    } catch (error) {
      console.error("Web3Auth connection failed:", error)
    }
  }

  const getWalletInfo = (name: string) => {
    return walletConfig[name as keyof typeof walletConfig] || {
      icon: null,
      emoji: "💼",
      description: "Connect with wallet",
      installed: true,
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Connect Wallet"
      subtitle="Choose how you want to connect"
      className="max-w-md"
    >
      <div className="p-6 space-y-4">
        {/* Main Wallet Options */}
        <div className="space-y-3">
          {connectors.map((connector) => {
            const walletInfo = getWalletInfo(connector.name)
            
            return (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                    {walletInfo.icon ? (
                      <Image
                        src={walletInfo.icon}
                        alt={connector.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{walletInfo.emoji}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{connector.name}</span>
                      {connector.name === "MetaMask" && walletInfo.installed && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Installed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{walletInfo.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!walletInfo.installed && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Install
                    </span>
                  )}
                  <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Web3Auth Option */}
        <button
          onClick={handleWeb3AuthConnect}
          disabled={isPending}
          className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-2xl">🔐</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Sign in with Google</div>
              <p className="text-sm text-gray-600 mt-0.5">Easy onboarding with social login</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              New to Ethereum wallets?
            </p>
            <button 
              className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
              onClick={() => window.open('https://ethereum.org/en/wallets/', '_blank')}
            >
              Learn more about wallets →
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isPending && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Connecting...</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// Optional: Add this CSS to your global styles for the loading spinner
/* 
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
*/