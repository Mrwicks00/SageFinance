"use client"

import type React from "react"
import { ArrowUpDown, ArrowRight } from "lucide-react"
import type { Chain } from "@/data/crosschain"
import Image from "next/image"

interface TransferFormProps {
  fromChain: Chain
  toChain: Chain
  amount: string
  setAmount: (amount: string) => void
  balance: string
  onMaxClick: () => void
  onSwapChains: () => void
  canSwapChains: boolean
  isLoadingBalance: boolean
}

export const TransferForm: React.FC<TransferFormProps> = ({
  fromChain,
  toChain,
  amount,
  setAmount,
  balance,
  onMaxClick,
  onSwapChains,
  canSwapChains,
  isLoadingBalance,
}) => {
  return (
    <div className="space-y-6">
      {/* Amount Input */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 text-sm font-medium">Amount</span>
          <span className="text-gray-400 text-sm">
            Balance:{" "}
            {isLoadingBalance ? (
              <span className="inline-flex items-center">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                Loading...
              </span>
            ) : (
              `${balance} USDC`
            )}
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-white text-xl sm:text-2xl font-semibold placeholder-gray-500 outline-none min-w-0"
            min="0"
          />

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={onMaxClick}
              className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoadingBalance || Number.parseFloat(balance) <= 0}
            >
              MAX
            </button>

            <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-xl px-3 py-2 border border-gray-600/50">
              <span className="text-lg sm:text-xl">💰</span>
              <span className="text-white font-medium text-sm sm:text-base">USDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chain Direction Swap Button */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700/50"></div>
        </div>
        <div className="relative">
          <button
            onClick={onSwapChains}
            disabled={!canSwapChains}
            className={`
              p-3 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm
              ${
                canSwapChains
                  ? "bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 hover:border-yellow-500/50 hover:bg-gray-800/60 hover:scale-110 hover:rotate-180"
                  : "bg-gray-800/50 border-gray-600/50 cursor-not-allowed opacity-50"
              }
            `}
          >
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Transfer Direction Visual */}
      <div className="flex items-center justify-between bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
              <Image
                src={fromChain.logo || "/placeholder.svg"}
                alt={fromChain.name}
                className="rounded-lg"
                width={24}
                height={24}
              />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          <div className="min-w-0">
            <div className="text-white font-medium text-sm sm:text-base truncate">{fromChain.name}</div>
            <div className="text-gray-400 text-xs sm:text-sm">From</div>
          </div>
        </div>

        <div className="flex-shrink-0 mx-4">
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" />
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1 justify-end">
          <div className="min-w-0 text-right">
            <div className="text-white font-medium text-sm sm:text-base truncate">{toChain.name}</div>
            <div className="text-gray-400 text-xs sm:text-sm">To</div>
          </div>

          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <Image
                src={toChain.logo || "/placeholder.svg"}
                alt={toChain.name}
                className="rounded-lg"
                width={24}
                height={24}
              />
            </div>
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
