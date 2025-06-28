"use client"

import type React from "react"
import { X, CheckCircle } from "lucide-react"
import type { Chain } from "@/data/crosschain"
import Image from "next/image"

interface ChainSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  chains: Chain[]
  onSelectChain: (chain: Chain) => void
  currentChain?: Chain
  title: string
  excludeChain?: Chain
}

export const ChainSelectionModal: React.FC<ChainSelectionModalProps> = ({
  isOpen,
  onClose,
  chains,
  onSelectChain,
  currentChain,
  title,
  excludeChain,
}) => {
  if (!isOpen) return null

  const filteredChains = chains.filter((chain) => !excludeChain || chain.chainId !== excludeChain.chainId)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl max-w-md w-full border border-gray-700/50 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 p-4 sm:p-6 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chain List */}
        <div className="p-4 sm:p-6 max-h-96 overflow-y-auto space-y-3">
          {filteredChains.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <p className="text-gray-400">No supported networks available.</p>
            </div>
          )}

          {filteredChains.map((chain) => (
            <button
              key={chain.chainId}
              onClick={() => onSelectChain(chain)}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group
                ${
                  currentChain?.chainId === chain.chainId
                    ? "bg-gradient-to-r from-yellow-600/90 to-yellow-500/90 border-2 border-yellow-400/50 text-white shadow-lg shadow-yellow-500/20"
                    : "bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-gray-700/80 hover:to-gray-600/80 border-2 border-gray-700/50 hover:border-yellow-500/30 text-gray-200 hover:scale-[1.02]"
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                      currentChain?.chainId === chain.chainId
                        ? "bg-white/20 border-white/30"
                        : "bg-gradient-to-br from-yellow-500/20 to-purple-500/20 border-yellow-500/30 group-hover:border-yellow-400/50"
                    }`}
                  >
                    <Image
                      src={chain.logo || "/placeholder.svg"}
                      alt={chain.name}
                      className="rounded-lg"
                      width={24}
                      height={24}
                    />
                  </div>
                  {currentChain?.chainId === chain.chainId && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-yellow-600" />
                    </div>
                  )}
                </div>

                <div className="text-left">
                  <span className="font-medium text-sm sm:text-base block">{chain.name}</span>
                  <span className="text-xs opacity-75">Chain ID: {chain.chainId}</span>
                </div>
              </div>

              {currentChain?.chainId === chain.chainId && <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
