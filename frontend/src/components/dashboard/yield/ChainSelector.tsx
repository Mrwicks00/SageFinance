"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Chain, SUPPORTED_CHAINS } from "@/data/yieldData";

interface ChainSelectorProps {
  selectedChain: Chain;
  onChainSelect: (chain: Chain) => void;
}

export function ChainSelector({ selectedChain, onChainSelect }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Chain
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gray-900/50 border border-yellow-400/20 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-yellow-400/40 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">
                {selectedChain.displayName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="text-white font-medium">{selectedChain.displayName}</div>
              <div className="text-gray-400 text-sm">ID: {selectedChain.id}</div>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-yellow-400/20 rounded-lg shadow-xl z-50">
            <div className="py-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    onChainSelect(chain);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-800 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">
                        {chain.displayName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                        {chain.displayName}
                      </div>
                      <div className="text-gray-400 text-sm">ID: {chain.id}</div>
                    </div>
                  </div>
                  {selectedChain.id === chain.id && (
                    <Check className="w-5 h-5 text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Network Status Indicator */}
      <div className="mt-2 flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Network Active</span>
      </div>
    </div>
  );
}