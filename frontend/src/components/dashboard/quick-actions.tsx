import React from 'react';
import { 
  Send, 
  ArrowDownToLine, 
  Repeat, 
  Zap,
  Plus,
  TrendingUp,
  Shield,
  Coins,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const quickActions = [
  {
    title: 'Deposit',
    description: 'Add funds to your wallet',
    icon: ArrowDownToLine,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    hoverGradient: 'hover:from-green-500/20 hover:to-emerald-500/20',
    popular: false
  },
  {
    title: 'Withdraw',
    description: 'Transfer to external wallet',
    icon: Send,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    hoverGradient: 'hover:from-blue-500/20 hover:to-cyan-500/20',
    popular: false
  },
  {
    title: 'Swap',
    description: 'Exchange tokens instantly',
    icon: Repeat,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    hoverGradient: 'hover:from-purple-500/20 hover:to-pink-500/20',
    popular: true
  },
  {
    title: 'Stake',
    description: 'Earn rewards by staking',
    icon: Coins,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
    hoverGradient: 'hover:from-orange-500/20 hover:to-red-500/20',
    popular: true
  }
];

const advancedActions = [
  {
    title: 'Yield Farm',
    description: 'Maximize your returns',
    icon: TrendingUp,
    apy: '24.5%',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'Liquidity Pool',
    description: 'Provide liquidity & earn fees',
    icon: Plus,
    apy: '18.2%',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Auto-Compound',
    description: 'Set & forget strategy',
    icon: Zap,
    apy: '32.1%',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    title: 'Insurance',
    description: 'Protect your investments',
    icon: Shield,
    apy: '5.8%',
    gradient: 'from-gray-500 to-slate-500'
  }
];

export const QuickActions = () => {
  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              <p className="text-sm text-gray-400">Fast access to common operations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`relative group p-6 bg-gradient-to-br ${action.bgGradient} ${action.hoverGradient} border border-gray-700/50 rounded-xl transition-all duration-300 hover:border-gray-600/50 hover:transform hover:scale-[1.02]`}
              >
                {/* Popular Badge */}
                {action.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    HOT
                  </div>
                )}

                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                
                <div className="relative z-10 text-center">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${action.gradient} rounded-lg mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{action.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Strategies */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Advanced Strategies</h3>
              <p className="text-sm text-gray-400">AI-optimized DeFi strategies</p>
            </div>
          </div>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1 transition-colors">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advancedActions.map((strategy, index) => {
            const Icon = strategy.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-all duration-300 cursor-pointer"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${strategy.gradient} rounded-full blur-2xl`}></div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 bg-gradient-to-br ${strategy.gradient} rounded-lg shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{strategy.title}</h4>
                      <p className="text-gray-400 text-sm">{strategy.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400 mb-1">{strategy.apy}</div>
                    <div className="text-xs text-gray-500">APY</div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 text-sm font-medium">Gas Tracker</div>
              <div className="text-white text-lg font-bold">12 Gwei</div>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Zap className="h-4 w-4 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-400 text-sm font-medium">Network Status</div>
              <div className="text-white text-lg font-bold">Optimal</div>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="h-4 w-4 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-400 text-sm font-medium">AI Confidence</div>
              <div className="text-white text-lg font-bold">97%</div>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};