"use client"

import type React from "react"
import type { Chain } from "@/data/crosschain"
import Image from "next/image"

interface ChainSelectorProps {
  chain: Chain
  onClick?: () => void // Make onClick optional as it might not always be clickable
  disabled?: boolean
  label: string
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ chain, onClick, disabled = false, label }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-400 block">{label}</label>
      <div
        className={`
          relative p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm
          ${
            disabled
              ? "border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50"
              : "border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:border-yellow-500/60 hover:bg-gray-800/60 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10"
          }
        `}
        onClick={!disabled ? onClick : undefined}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-purple-500/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                <Image
                  src={chain.logo || "/placeholder.svg"}
                  alt={chain.name}
                  className="rounded-lg object-cover"
                  width={24}
                  height={24}
                  onError={(e) => {
                    // Fallback: hide image and show colored circle if image fails to load
                    e.currentTarget.style.display = "none"
                    const fallbackDiv = document.createElement("div")
                    fallbackDiv.className =
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    fallbackDiv.style.backgroundColor = chain.color
                    fallbackDiv.textContent = chain.name.charAt(0)
                    e.currentTarget.parentNode?.insertBefore(fallbackDiv, e.currentTarget)
                  }}
                />
              </div>
              {/* Pulse indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400/60 rounded-full animate-pulse"></div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-base sm:text-lg truncate">{chain.name}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Chain ID: {chain.chainId}</div>
            </div>
          </div>

          {!chain.isSupported && (
            <span className="px-2 py-1 text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 rounded-lg border border-gray-600/50 whitespace-nowrap">
              Coming Soon
            </span>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  )
}
