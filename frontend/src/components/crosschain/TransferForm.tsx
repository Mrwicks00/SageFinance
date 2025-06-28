// src/components/crosschain/TransferForm.tsx

import React from "react";
import { ArrowUpDown, ArrowRight } from "lucide-react";
import { Chain } from "@/data/crosschain";

interface TransferFormProps {
  fromChain: Chain;
  toChain: Chain;
  amount: string;
  setAmount: (amount: string) => void;
  balance: string; // Now expects formatted string
  onMaxClick: () => void;
  onSwapChains: () => void;
  canSwapChains: boolean;
  isLoadingBalance: boolean; // New prop to indicate balance loading
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
    <div className="space-y-4">
      {/* Amount Input */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Amount</span>
          <span className="text-gray-400 text-sm">
            Balance: {isLoadingBalance ? 'Loading...' : `${balance} USDC`}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-white text-2xl font-semibold placeholder-gray-500 outline-none"
            min="0" // Prevent negative input
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={onMaxClick}
              className="px-3 py-1 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors"
              disabled={isLoadingBalance || parseFloat(balance) <= 0} // Disable if balance is loading or zero
            >
              MAX
            </button>
            <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-xl">💰</span> {/* USDC Icon */}
              <span className="text-white font-medium">USDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chain Direction Swap Button */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative">
          <button
            onClick={onSwapChains}
            disabled={!canSwapChains}
            className={`
              p-2 rounded-xl border-2 transition-all duration-200
              ${
                canSwapChains
                  ? "bg-gray-900 border-gray-700 hover:border-yellow-500 hover:bg-gray-800"
                  : "bg-gray-800 border-gray-600 cursor-not-allowed opacity-50"
              }
            `}
          >
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Transfer Direction Visual */}
      <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={fromChain.logo}
            alt={fromChain.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="text-white font-medium">{fromChain.name}</div>
            <div className="text-gray-400 text-sm">From</div>
          </div>
        </div>

        <ArrowRight className="w-6 h-6 text-yellow-500" />

        <div className="flex items-center space-x-3">
          <img
            src={toChain.logo}
            alt={toChain.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="text-white font-medium">{toChain.name}</div>
            <div className="text-gray-400 text-sm">To</div>
          </div>
        </div>
      </div>
    </div>
  );
};
