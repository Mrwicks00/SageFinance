// src/components/crosschain/TransferSummary.tsx

import React from 'react'
import { Info, Clock, DollarSign, Zap } from 'lucide-react'
import { Chain } from '@/data/crosschain'

interface TransferSummaryProps {
  fromChain: Chain
  toChain: Chain
  amount: string
  estimatedFee: string // Now dynamic from hook
  estimatedTime: string
  isVisible: boolean
}

export const TransferSummary: React.FC<TransferSummaryProps> = ({
  fromChain,
  toChain,
  amount,
  estimatedFee,
  estimatedTime,
  isVisible
}) => {
  if (!isVisible) return null

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 space-y-4">
      <div className="flex items-center space-x-2">
        <Info className="w-4 h-4 text-yellow-500" />
        <h3 className="text-white font-semibold">Transfer Summary</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 flex items-center space-x-2">
            <span>From:</span>
          </span>
          <span className="text-white font-medium">{fromChain.name}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">To:</span>
          <span className="text-white font-medium">{toChain.name}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount:</span>
          <span className="text-white font-medium">{amount} USDC</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 flex items-center space-x-1">
            <DollarSign className="w-3 h-3" />
            <span>Bridge Fee:</span>
          </span>
          {/* Display actual estimated fee */}
          <span className="text-white font-medium">~{estimatedFee} ETH</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Est. Time:</span>
          </span>
          <span className="text-white font-medium">{estimatedTime}</span>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-3">
        <div className="flex items-start space-x-2">
          <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-yellow-500">Auto-Yield Deposit</p>
            <p>Your USDC will be automatically deposited into Compound yield farming on {toChain.name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
