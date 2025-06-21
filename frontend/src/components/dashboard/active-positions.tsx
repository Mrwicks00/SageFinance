import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Zap,
  DollarSign,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';

const positions = [
  {
    id: 1,
    protocol: 'Aave',
    asset: 'ETH',
    type: 'Lending',
    amount: '15.45 ETH',
    value: '$24,320.00',
    apy: '4.2%',
    earned: '$1,024.50',
    status: 'active',
    risk: 'low',
    timeLeft: '12 days',
    change: '+5.2%',
    positive: true,
    logo: '🔷',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10'
  },
  {
    id: 2,
    protocol: 'Compound',
    asset: 'USDC',
    type: 'Lending',
    amount: '50,000 USDC',
    value: '$50,000.00',
    apy: '8.7%',
    earned: '$4,350.00',
    status: 'active',
    risk: 'low',
    timeLeft: 'Flexible',
    change: '+2.1%',
    positive: true,
    logo: '🟢',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10'
  },
  {
    id: 3,
    protocol: 'PancakeSwap',
    asset: 'CAKE-BNB',
    type: 'LP Farming',
    amount: '245.67 LP',
    value: '$18,750.00',
    apy: '24.5%',
    earned: '$4,593.75',
    status: 'active',
    risk: 'medium',
    timeLeft: '8 days',
    change: '+12.8%',
    positive: true,
    logo: '🥞',
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-500/10 to-orange-500/10'
  },
  {
    id: 4,
    protocol: 'Yearn',
    asset: 'YFI',
    type: 'Vault',
    amount: '2.15 YFI',
    value: '$15,480.00',
    apy: '32.1%',
    earned: '$4,969.68',
    status: 'active',
    risk: 'high',
    timeLeft: 'Auto-compound',
    change: '-2.4%',
    positive: false,
    logo: '💎',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10'
  },
  {
    id: 5,
    protocol: 'Curve',
    asset: '3CRV',
    type: 'Liquidity Pool',
    amount: '125,000 3CRV',
    value: '$31,250.00',
    apy: '12.3%',
    earned: '$3,843.75',
    status: 'expiring',
    risk: 'low',
    timeLeft: '2 days',
    change: '+1.8%',
    positive: true,
    logo: '🌊',
    gradient: 'from-teal-500 to-cyan-500',
    bgGradient: 'from-teal-500/10 to-cyan-500/10'
  }
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'text-green-400 bg-green-500/20';
    case 'medium': return 'text-yellow-400 bg-yellow-500/20';
    case 'high': return 'text-red-400 bg-red-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-green-400';
    case 'expiring': return 'text-yellow-400';
    case 'expired': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const ActivePositions = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPositions = positions.filter(position => {
    const matchesFilter = filter === 'all' || position.type.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = position.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.asset.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Active Positions</h3>
              <p className="text-sm text-gray-400">Manage your DeFi investments</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="lending">Lending</option>
                <option value="farming">LP Farming</option>
                <option value="vault">Vault</option>
                <option value="liquidity">Liquidity Pool</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-400 text-sm font-medium">Total Value</div>
                <div className="text-white text-xl font-bold">$139,800</div>
              </div>
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-400 text-sm font-medium">Total Earned</div>
                <div className="text-white text-xl font-bold">$18,782</div>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-400 text-sm font-medium">Avg APY</div>
                <div className="text-white text-xl font-bold">16.36%</div>
              </div>
              <Percent className="h-5 w-5 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-400 text-sm font-medium">Active</div>
                <div className="text-white text-xl font-bold">{positions.length}</div>
              </div>
              <Target className="h-5 w-5 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="space-y-4">
        {filteredPositions.map((position) => {
          const TrendIcon = position.positive ? ArrowUpRight : ArrowDownRight;
          const StatusIcon = position.status === 'active' ? CheckCircle : 
                           position.status === 'expiring' ? AlertTriangle : Clock;

          return (
            <div
              key={position.id}
              className={`relative group overflow-hidden bg-gradient-to-br ${position.bgGradient} backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute top-4 right-4 w-24 h-24 bg-gradient-to-br ${position.gradient} rounded-full blur-2xl`}></div>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Position Info */}
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{position.logo}</div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-white font-semibold text-lg">{position.protocol}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(position.risk)}`}>
                          {position.risk.toUpperCase()}
                        </span>
                        <div className={`flex items-center space-x-1 ${getStatusColor(position.status)}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-xs font-medium">{position.status.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{position.asset} • {position.type}</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{position.timeLeft}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Position Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">Amount</div>
                      <div className="text-white font-semibold">{position.amount}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">Value</div>
                      <div className="text-white font-semibold">{position.value}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">APY</div>
                      <div className="text-green-400 font-bold">{position.apy}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">Earned</div>
                      <div className="text-white font-semibold">{position.earned}</div>
                    </div>
                  </div>

                  {/* Change & Actions */}
                  <div className="flex items-center justify-between lg:justify-end space-x-4">
                    <div className={`flex items-center space-x-1 ${
                      position.positive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">{position.change}</span>
                    </div>
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar for time-based positions */}
                {position.timeLeft !== 'Flexible' && position.timeLeft !== 'Auto-compound' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>Time remaining</span>
                      <span>{position.timeLeft}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${position.gradient} h-2 rounded-full transition-all duration-300`}
                        style={{ 
                          width: position.timeLeft.includes('2 days') ? '20%' : 
                              position.timeLeft.includes('8 days') ? '60%' : 
                              '80%' 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPositions.length === 0 && (
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-12 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No positions found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};