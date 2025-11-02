"use client";

import Image from "next/image";
import { mockPortfolio } from "../../data/mockData";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Eye } from "lucide-react";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { Sparkline } from "../ui/Sparkline";
import { ProgressRing } from "../ui/ProgressRing";
import { useState } from "react";

// Mock 7-day trend data
const mockTrendData = [12100, 12250, 12180, 12350, 12420, 12380, 12540.67];

export function PortfolioOverview() {
  const { totalValue, change24h, changePercentage, assets } = mockPortfolio;
  const isPositive = change24h >= 0;
  const [showDetails, setShowDetails] = useState(true);

  // Calculate asset allocation for simple visualization
  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="relative bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 overflow-hidden group hover:border-yellow-400/40 transition-all duration-300">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            Portfolio Overview
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-yellow-400/10"
            >
              <Eye className="w-5 h-5" />
            </button>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Total Value with Animation */}
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400/10 to-transparent rounded-lg border border-yellow-400/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">Total Portfolio Value</div>
              <div className="text-4xl font-bold text-white mb-2 animate-count-up">
                <AnimatedCounter
                  value={totalValue}
                  duration={2000}
                  decimals={2}
                  prefix="$"
                />
              </div>
              <div
                className={`flex items-center gap-2 text-sm ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 animate-bounce" />
                ) : (
                  <TrendingDown className="w-4 h-4 animate-bounce" />
                )}
                <span className="font-medium">
                  {isPositive ? "+" : ""}${Math.abs(change24h).toFixed(2)}
                </span>
                <span className="text-gray-400">
                  ({isPositive ? "+" : ""}
                  {changePercentage.toFixed(2)}%)
                </span>
                <span className="text-gray-500">24h</span>
              </div>
            </div>
            
            {/* Sparkline Chart */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-gray-400">7-day trend</div>
              <Sparkline
                data={mockTrendData}
                width={120}
                height={40}
                color={isPositive ? "#10b981" : "#ef4444"}
              />
            </div>
          </div>
        </div>

        {/* Asset Breakdown */}
        {showDetails && (
          <div className="space-y-4 animate-slide-in-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Asset Distribution</h3>
              <div className="text-xs text-gray-400">{assets.length} positions</div>
            </div>

            {assets.map((asset, index) => {
              const percentage = (asset.value / totalAssetValue) * 100;

              return (
                <div
                  key={index}
                  className={`group p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-yellow-400/30 transition-all duration-300 hover:bg-gray-800/50 animate-slide-in-up stagger-${index + 1}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-400/30 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                          <Image
                            src={asset.logo || ""}
                            alt={asset.symbol}
                            className="object-contain"
                            width={28}
                            height={28}
                          />
                        </div>
                        <ProgressRing
                          percentage={percentage}
                          size={44}
                          strokeWidth={2}
                          color="#fbbf24"
                          className="absolute -top-1 -left-1"
                        />
                      </div>

                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          {asset.symbol}
                          <span className="text-xs px-2 py-0.5 bg-yellow-400/10 text-yellow-400 rounded-full">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {asset.chain} • {asset.protocol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ${asset.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {asset.amount.toLocaleString()} {asset.symbol}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Progress bar */}
                  <div className="relative w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-yellow-400/30 transition-all duration-300 group">
              <div className="text-3xl font-bold text-yellow-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                <AnimatedCounter value={assets.length} duration={1500} decimals={0} />
              </div>
              <div className="text-xs text-gray-400">Active Positions</div>
            </div>
            <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="text-3xl font-bold text-purple-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                <AnimatedCounter value={3} duration={1500} decimals={0} />
              </div>
              <div className="text-xs text-gray-400">Chains</div>
            </div>
            <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="text-3xl font-bold text-blue-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                <AnimatedCounter value={2} duration={1500} decimals={0} />
              </div>
              <div className="text-xs text-gray-400">Protocols</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
