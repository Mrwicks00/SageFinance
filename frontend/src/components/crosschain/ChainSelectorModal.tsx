// src/components/crosschain/ChainSelectionModal.tsx

import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Chain } from '@/data/crosschain'; // Import Chain interface
import Image from 'next/image';


interface ChainSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  chains: Chain[]; // Array of Chain objects (all supported chains)
  onSelectChain: (chain: Chain) => void; // Callback when a chain is selected
  currentChain?: Chain; // The chain object that is currently selected in the parent form (e.g., fromChain or toChain)
  title: string; // Title for the modal (e.g., "Select Source Network")
  excludeChain?: Chain; // Optional chain to exclude from the list (e.g., prevent source from being same as destination)
}

export const ChainSelectionModal: React.FC<ChainSelectionModalProps> = ({
  isOpen,
  onClose,
  chains,
  onSelectChain,
  currentChain,
  title,
  excludeChain
}) => {
  if (!isOpen) return null;

  const filteredChains = chains.filter(chain => 
    !excludeChain || chain.chainId !== excludeChain.chainId
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chain List */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          {filteredChains.length === 0 && (
            <p className="text-gray-400 text-center py-4">No supported networks available.</p>
          )}
          {filteredChains.map((chain) => (
            <button
              key={chain.chainId}
              onClick={() => onSelectChain(chain)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-colors
                ${currentChain?.chainId === chain.chainId
                  ? 'bg-yellow-600 border border-yellow-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Image src={chain.logo} alt={chain.name} className="rounded-full"width={24} height={24} />
                <span className="font-medium">{chain.name}</span>
              </div>
              {currentChain?.chainId === chain.chainId && (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
