import type React from "react"
import { Info, Clock, DollarSign, Zap } from "lucide-react"
import type { Chain } from "@/data/crosschain"

interface TransferSummaryProps {
  fromChain: Chain
  toChain: Chain
  amount: string
  estimatedFee: string
  estimatedTime: string
  isVisible: boolean
}

export const TransferSummary: React.FC<TransferSummaryProps> = ({
  fromChain,
  toChain,
  amount,
  estimatedFee,
  estimatedTime,
  isVisible,
}) => {
  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50 space-y-4 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
          <Info className="w-4 h-4 text-yellow-500" />
        </div>
        <h3 className="text-white font-semibold text-base sm:text-lg">Transfer Summary</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
            <span className="text-gray-400 text-sm">From:</span>
            <span className="text-white font-medium text-sm">{fromChain.name}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
            <span className="text-gray-400 text-sm">To:</span>
            <span className="text-white font-medium text-sm">{toChain.name}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
            <span className="text-gray-400 text-sm">Amount:</span>
            <span className="text-white font-medium text-sm">{amount} USDC</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
            <span className="text-gray-400 flex items-center space-x-1 text-sm">
              <DollarSign className="w-3 h-3" />
              <span>Bridge Fee:</span>
            </span>
            <span className="text-white font-medium text-sm">~{estimatedFee} ETH</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400 flex items-center space-x-1 text-sm">
              <Clock className="w-3 h-3" />
              <span>Est. Time:</span>
            </span>
            <span className="text-white font-medium text-sm">{estimatedTime}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700/50 pt-4">
        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 rounded-xl border border-yellow-500/20">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-500/30 to-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap className="w-3 h-3 text-yellow-400" />
          </div>
          <div className="text-sm text-gray-300 min-w-0">
            <p className="font-medium text-yellow-400 mb-1">Auto-Yield Deposit</p>
            <p className="text-xs leading-relaxed">
              Your USDC will be automatically deposited into Compound yield farming on {toChain.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
