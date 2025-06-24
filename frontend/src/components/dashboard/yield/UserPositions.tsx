"use client";

import { useState } from "react";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, MoreVertical } from "lucide-react";
import { MOCK_USER_POSITIONS, SUPPORTED_CHAINS, PROTOCOLS } from "@/data/yieldData";

export function UserPositions() {
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");

  const totalDeposited = MOCK_USER_POSITIONS.reduce((sum, pos) => sum + pos.deposited, 0);
  const totalEarned = MOCK_USER_POSITIONS.reduce((sum, pos) => sum + pos.earned, 0);
  const avgApy = MOCK_USER_POSITIONS.length > 0 
    ? MOCK_USER_POSITIONS.reduce((sum, pos) => sum + pos.apy, 0) / MOCK_USER_POSITIONS.length 
    : 0;

  return (
    <div className="bg-gray-900/50 border border-yellow-400/20 rounded-xl p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-yellow-400" />
          My Positions
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Total Deposited</div>
              <div className="text-2xl font-bold text-white">
                ${totalDeposited.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Total Earned</div>
              <div className="text-xl font-bold text-green-400">
                +${totalEarned.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Portfolio Value</div>
              <div className="text-xl font-bold text-white">
                ${(totalDeposited + totalEarned).toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Avg APY</div>
              <div className="text-lg font-bold text-yellow-400">
                {avgApy.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-black/30 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("positions")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "positions"
              ? "bg-yellow-400 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Active Positions
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-yellow-400 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          History
        </button>
      </div>

      {/* Positions List */}
      {activeTab === "positions" && (
        <div className="space-y-4">
          {MOCK_USER_POSITIONS.length > 0 ? (
            MOCK_USER_POSITIONS.map((position) => {
              const chain = SUPPORTED_CHAINS.find(c => c.id === position.chainId);
              const protocol = PROTOCOLS.find(p => p.id === position.protocolId);
              const roi = (position.earned / position.deposited) * 100;
              
              return (
                <div
                  key={position.id}
                  className="bg-black/30 border border-gray-800 rounded-lg p-4 hover:border-yellow-400/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">
                          {position.token.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {position.token.symbol}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {protocol?.displayName} • {chain?.displayName}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-gray-400 text-xs">Deposited</div>
                      <div className="text-white font-medium">
                        ${position.deposited.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Earned</div>
                      <div className="text-green-400 font-medium">
                        +${position.earned.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400">
                        APY: <span className="text-yellow-400">{position.apy}%</span>
                      </span>
                      <span className="text-gray-400">
                        ROI: <span className="text-green-400">+{roi.toFixed(2)}%</span>
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors">
                        Withdraw
                      </button>
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs transition-colors">
                        Add More
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Active Positions</h3>
              <p className="text-gray-400 text-sm">
                Start depositing to see your positions here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Transaction History */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {/* Mock history data */}
          {[
            { type: "deposit", amount: 1000, token: "USDC", date: "2024-12-01", hash: "0x1234...5678" },
            { type: "earned", amount: 15.2, token: "USDC", date: "2024-12-15", hash: "0x9abc...def0" },
            { type: "deposit", amount: 500, token: "USDC", date: "2024-11-15", hash: "0x2468...ace0" }
          ].map((tx, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-800"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  tx.type === "deposit" 
                    ? "bg-blue-400/10 text-blue-400" 
                    : "bg-green-400/10 text-green-400"
                }`}>
                  {tx.type === "deposit" ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-white font-medium capitalize">
                    {tx.type} {tx.token}
                  </div>
                  <div className="text-gray-400 text-sm">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  tx.type === "deposit" ? "text-white" : "text-green-400"
                }`}>
                  {tx.type === "deposit" ? "-" : "+"}${tx.amount}
                </div>
                <div className="text-gray-400 text-xs">{tx.hash}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}