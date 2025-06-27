"use client";

import Image from "next/image";
import { mockPortfolio } from "../../data/mockData";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export function PortfolioOverview() {
  const { totalValue, change24h, changePercentage, assets } = mockPortfolio;
  const isPositive = change24h >= 0;

  // Calculate asset allocation for simple visualization
  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
          Portfolio Overview
        </h2>
        <PieChart className="w-5 h-5 text-gray-400" />
      </div>

      {/* Total Value */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-white mb-2">
          $
          {totalValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <div
          className={`flex items-center text-sm ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          <span>
            {isPositive ? "+" : ""}${Math.abs(change24h).toFixed(2)} (
            {isPositive ? "+" : ""}
            {changePercentage.toFixed(2)}%) 24h
          </span>
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Asset Distribution</h3>

        {assets.map((asset, index) => {
          const percentage = (asset.value / totalAssetValue) * 100;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center border overflow-hidden">
                    <Image
                      src={asset.logo}
                      alt="USDC"
                      className=" object-contain"
                      width={24}
                      height={24}
                    />
                  </div>

                  <div>
                    <div className="text-white font-medium">{asset.symbol}</div>
                    <div className="text-xs text-gray-400 capitalize">
                      {asset.chain} • {asset.protocol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    ${asset.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {asset.amount.toLocaleString()} {asset.symbol}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 text-right">
                {percentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {assets.length}
            </div>
            <div className="text-xs text-gray-400">Active Positions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">3</div>
            <div className="text-xs text-gray-400">Chains</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">2</div>
            <div className="text-xs text-gray-400">Protocols</div>
          </div>
        </div>
      </div>
    </div>
  );
}
