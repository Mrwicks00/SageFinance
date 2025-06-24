"use client";

import { TrendingUp, DollarSign, Users, Zap } from "lucide-react";
import { Chain, Protocol, POOL_DATA, getAvailableTokens } from "@/data/yieldData";

interface PoolStatsProps {
  selectedChain: Chain;
  selectedProtocol: Protocol;
}

export function PoolStats({ selectedChain, selectedProtocol }: PoolStatsProps) {
  // Get pools for selected chain and protocol
  const availablePools = POOL_DATA.filter(
    pool => pool.chainId === selectedChain.id && pool.protocolId === selectedProtocol.id
  );

  const totalDeposited = availablePools.reduce((sum, pool) => sum + pool.totalDeposited, 0);
  const avgApy = availablePools.length > 0 
    ? availablePools.reduce((sum, pool) => sum + pool.apy, 0) / availablePools.length 
    : 0;
  const poolCount = availablePools.length;

  const stats = [
    {
      title: "Total Value Locked",
      value: `$${totalDeposited.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      change: "+12.5%"
    },
    {
      title: "Average APY",
      value: `${avgApy.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      change: "+0.3%"
    },
    {
      title: "Active Pools",
      value: poolCount.toString(),
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      change: "Available"
    },
    {
      title: "Depositors",
      value: "156",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      change: "+8 this week"
    }
  ];

  if (poolCount === 0) {
    return (
      <div className="bg-gray-900/50 border border-yellow-400/20 rounded-xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Pools Available</h3>
          <p className="text-gray-400">
            {selectedProtocol.displayName} is not available on {selectedChain.displayName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-yellow-400/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {selectedProtocol.displayName} on {selectedChain.displayName}
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={index}
              className="bg-black/30 border border-gray-800 rounded-lg p-4 hover:border-yellow-400/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>
              
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pool Breakdown */}
      {availablePools.length > 0 && (
        <div className="mt-6 border-t border-gray-800 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Available Pools</h3>
          <div className="space-y-3">
            {availablePools.map((pool, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">
                      {pool.token.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{pool.token.symbol}</div>
                    <div className="text-gray-400 text-sm">{pool.token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">{pool.apy}% APY</div>
                  <div className="text-gray-400 text-sm">
                    ${pool.totalDeposited.toLocaleString()} TVL
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}