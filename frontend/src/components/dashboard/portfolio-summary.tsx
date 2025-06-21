import React from 'react';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Percent,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Zap
} from 'lucide-react';

const portfolioStats = [
  {
    title: 'Total Portfolio Value',
    value: '$124,850.00',
    change: '+12.5%',
    changeValue: '+$13,890',
    positive: true,
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    period: '24h'
  },
  {
    title: 'Total Yield Earned',
    value: '$8,240.50',
    change: '+8.2%',
    changeValue: '+$620.30',
    positive: true,
    icon: Percent,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    period: '7d'
  },
  {
    title: 'Active Positions',
    value: '12',
    change: '+2',
    changeValue: 'New positions',
    positive: true,
    icon: PieChart,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    period: 'Total'
  },
  {
    title: 'APY Average',
    value: '14.2%',
    change: '+2.1%',
    changeValue: 'Optimized',
    positive: true,
    icon: Target,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
    period: 'Weighted'
  }
];

export const PortfolioSummary = ({ isBalanceHidden, setIsBalanceHidden }: any) => {
  const formatValue = (value: any) => {
    return isBalanceHidden ? '••••••' : value;
  };

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-300">Total Portfolio Balance</h3>
                <button
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                  className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  {isBalanceHidden ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex items-end space-x-4">
                <h2 className="text-4xl font-bold text-white">
                  {formatValue('$124,850.00')}
                </h2>
                <div className="flex items-center space-x-2 pb-1">
                  <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium text-sm">+12.5%</span>
                  </div>
                  <span className="text-gray-400 text-sm">24h</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-gray-400 text-sm mb-1">24h Change</div>
              <div className="text-2xl font-bold text-green-400">{formatValue('+$13,890')}</div>
              <div className="text-gray-500 text-sm">Last updated: 2 min ago</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Available</div>
              <div className="text-xl font-semibold text-white">{formatValue('$45,230')}</div>
              <div className="text-green-400 text-xs">+5.2%</div>
            </div>
            <div className="text-center border-x border-gray-700/50">
              <div className="text-gray-400 text-sm mb-1">Staked</div>
              <div className="text-xl font-semibold text-white">{formatValue('$62,150')}</div>
              <div className="text-blue-400 text-xs">Earning 14.2%</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Rewards</div>
              <div className="text-xl font-semibold text-white">{formatValue('$17,470')}</div>
              <div className="text-purple-400 text-xs">Claimable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioStats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.positive ? ArrowUpRight : ArrowDownRight;
          
          return (
            <div
              key={index}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300 group`}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{stat.period}</div>
                </div>

                {/* Value */}
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {formatValue(stat.value)}
                  </h3>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                </div>

                {/* Change */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-1 ${
                    stat.positive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendIcon className="h-4 w-4" />
                    <span className="font-medium text-sm">{stat.change}</span>
                  </div>
                  <div className="text-xs text-gray-500">{stat.changeValue}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Chart Preview */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
          </div>
          <div className="flex items-center space-x-2">
            {['1D', '7D', '1M', '3M', '1Y'].map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  period === '7D'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        {/* Simple Chart Placeholder */}
        <div className="h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-gray-700/30">
          <div className="text-center">
            <Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Interactive chart coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};