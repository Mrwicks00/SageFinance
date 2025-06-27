// src/components/crosschain/ChainSelector.tsx

import React from 'react'
import { Chain } from '@/data/crosschain'
import Image from 'next/image';


interface ChainSelectorProps {
  chain: Chain
  onClick?: () => void // Make onClick optional as it might not always be clickable
  disabled?: boolean
  label: string
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  chain,
  onClick,
  disabled = false,
  label
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-400">{label}</label>
      <div
        className={`
          p-4 rounded-xl border-2 transition-all duration-200
          ${disabled
            ? 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
            : 'border-gray-700 bg-gray-900 hover:border-yellow-500/60 hover:bg-gray-800 cursor-pointer' // Added cursor-pointer
          }
        `}
        onClick={!disabled ? onClick : undefined} // Only allow click if not disabled
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={chain.logo}
              alt={chain.name}
              className=" rounded-full object-cover"
              width={24}
              height={24}
              onError={(e) => {
                // Fallback: hide image and show colored circle if image fails to load
                e.currentTarget.style.display = 'none';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm';
                fallbackDiv.style.backgroundColor = chain.color;
                fallbackDiv.textContent = chain.name.charAt(0);
                e.currentTarget.parentNode?.insertBefore(fallbackDiv, e.currentTarget);
              }}
            />
            <div>
              <div className="text-white font-semibold">{chain.name}</div>
              <div className="text-gray-400 text-sm">Chain ID: {chain.chainId}</div>
            </div>
          </div>
          {!chain.isSupported && (
            <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
