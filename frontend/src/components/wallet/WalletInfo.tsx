import React, { useState } from 'react';
import { useDisconnect } from "wagmi"
import {
  Copy,
  ExternalLink,
  LogOut,
  Wallet,
  RefreshCw,
  AlertTriangle,
  Coins,
  DollarSign,
  X
} from "lucide-react";
import { useWallet } from "../../contexts/WalletContext"
import { useWalletData } from "../../hooks/useWalletData"
// Import SUPPORTED_CHAINS_BY_ID from the new unified data source
// import { SUPPORTED_CHAINS_BY_ID } from '@/data/crosschain';
import Image from 'next/image';


interface WalletInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletInfo({ isOpen, onClose }: WalletInfoProps) {
  const { disconnect } = useDisconnect()
  const {
    address,
    currentChainId, // Use currentChainId from WalletContext
    isWrongNetwork,
    switchToSupportedNetwork,
    disconnectWeb3Auth,
    isWeb3AuthConnected,
    currentChain, // Directly use currentChain from WalletContext
  } = useWallet()

  const { walletData, loading, error, refetch } = useWalletData(address, currentChainId) // Pass currentChainId

  const [copied, setCopied] = useState(false)

  // Add this early return to prevent rendering when not open
  if (!isOpen) return null;

  const handleDisconnect = () => {
    disconnect()
    if (isWeb3AuthConnected) {
      disconnectWeb3Auth()
    }
    onClose()
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  const formatBalance = (balance: string, decimals: number = 4) => {
    const num = parseFloat(balance)
    if (num === 0) return "0"
    if (num < 0.0001) return "< 0.0001"
    return num.toFixed(decimals)
  }

  // Updated getExplorerUrl to use currentChain.blockExplorer or a fallback
  const getExplorerUrl = (addr: string, chain?: typeof currentChain) => {
    if (chain && chain.blockExplorer) {
      return `${chain.blockExplorer}/address/${addr}`;
    }
    // Fallback if chain or its blockExplorer is not available
    const defaultExplorer = 'https://etherscan.io'; // Fallback to a default
    return `${defaultExplorer}/address/${addr}`;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        className="fixed top-0 right-0 h-screen w-96 bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0"
        style={{ zIndex: 9999 }}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Wallet</h2>
                <p className="text-sm text-gray-400">Account details</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refetch}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Wrong Network Warning */}
            {isWrongNetwork && (
              <div className="border border-red-500 bg-red-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium text-sm">Unsupported Network</p>
                    <p className="text-red-300 text-xs mt-1">Please switch to a supported network</p>
                    <button
                      onClick={switchToSupportedNetwork}
                      className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                    >
                      Switch Network
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="border border-red-500 bg-red-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium text-sm">Failed to load wallet data</p>
                    <p className="text-red-300 text-xs mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Account</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-400">Address</label>
                  <div className="flex items-center justify-between mt-1 p-2 bg-gray-700 rounded border border-gray-600">
                    <span className="font-mono text-sm text-white">{address && formatAddress(address)}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={copyAddress}
                        className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <a
                        href={getExplorerUrl(address || '', currentChain)} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-400 mt-1">Address copied!</p>
                  )}
                </div>

                {/* Use currentChain directly */}
                {currentChain && (
                  <div>
                    <label className="text-xs font-medium text-gray-400">Network</label>
                    <div className="flex items-center space-x-2 mt-1 p-2 bg-gray-700 rounded border border-gray-600">
                       <Image src={currentChain.logo} alt={currentChain.name} className=' rounded-md' width={24} height={24} /> {/* Use .logo and .name */}
                      <span className="text-sm font-medium text-white">{currentChain.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Balance */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Balance</span>
              </div>

              <div className="text-center py-3">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-24 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-12 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl font-bold text-white">
                      {formatBalance(walletData?.nativeBalance || '0')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {currentChain?.nativeCurrency?.symbol || 'ETH'} {/* Use currentChain */}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Token Holdings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-white">Tokens</span>
                </div>
                {walletData?.tokenHoldings && (
                  <span className="text-xs text-gray-400">
                    {walletData.tokenHoldings.length}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                        <div>
                          <div className="h-3 bg-gray-700 rounded w-12 mb-1"></div>
                          <div className="h-2 bg-gray-700 rounded w-8"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-3 bg-gray-700 rounded w-16 mb-1"></div>
                        <div className="h-2 bg-gray-700 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : walletData?.tokenHoldings && walletData.tokenHoldings.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {walletData.tokenHoldings.map((holding) => (
                    <div
                      key={holding.contractAddress}
                      className="flex items-center justify-between py-2 px-3 bg-gray-700 rounded border border-gray-600 hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {holding.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{holding.symbol}</div>
                          <div className="text-xs text-gray-400">{holding.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {formatBalance(holding.balance)}
                        </div>
                        {holding.valueInUSD && (
                          <div className="text-xs text-gray-400">
                            ${holding.valueInUSD}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Coins className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No tokens found</p>
                  <p className="text-xs text-gray-500">Your tokens will appear here</p>
                </div>
              )}
            </div>

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-red-500 text-red-400 rounded-lg hover:bg-red-900/20 hover:border-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
