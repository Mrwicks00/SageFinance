import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  Target,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Sparkles,
  Flame,
  Shield,
  MoreHorizontal,
  ExternalLink,
  Bot
} from 'lucide-react';

const opportunities = [
  {
    id: 1,
    protocol: 'Lido',
    asset: 'stETH',
    strategy: 'Liquid Staking',
    apy: '4.8%',
    tvl: '$32.5B',
    minDeposit: '0.01 ETH',
    risk: 'low',
    timelock: 'Flexible',
    aiScore: 95,
    trending: true,
    new: false,
    featured: true,
    description: 'Stake ETH and receive stETH while maintaining liquidity',
    tags: ['Ethereum 2.0', 'Liquid Staking', 'Blue Chip'],
    logo: '🔥',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    change: '+0.3%',
    positive: true,
    volume24h: '$125M'
  },
  {
    id: 2,
    protocol: 'Convex',
    asset: 'CVX-ETH',
    strategy: 'LP Boosting',
    apy: '28.7%',
    tvl: '$2.1B',
    minDeposit: '100 USDC',
    risk: 'medium',
    timelock: '16 weeks',
    aiScore: 88,
    trending: true,
    new: false,
    featured: false,
    description: 'Boost Curve LP rewards through Convex protocol',
    tags: ['Curve Wars', 'Vote Locking', 'High APY'],
    logo: '⚡',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    change: '+15.2%',
    positive: true,
    volume24h: '$45M'
  },
  {
    id: 3,
    protocol: 'GMX',
    asset: 'GLP',
    strategy: 'Delta Neutral',
    apy: '18.3%',
    tvl: '$450M',
    minDeposit: '50 USDC',
    risk: 'medium',
    timelock: '15 min cooldown',
    aiScore: 82,
    trending: false,
    new: true,
    featured: false,
    description: 'Provide liquidity for perpetual trading with fee sharing',
    tags: ['Perp DEX', 'Fee Sharing', 'Arbitrum'],
    logo: '📈',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    change: '+5.7%',
    positive: true,
    volume24h: '$28M'
  },
  {
    id: 4,
    protocol: 'Pendle',
    asset: 'PT-stETH',
    strategy: 'Yield Trading',
    apy: '12.4%',
    tvl: '$180M',
    minDeposit: '0.1 ETH',
    risk: 'high',
    timelock: 'Dec 2024',
    aiScore: 76,
    trending: true,
    new: true,
    featured: false,
    description: 'Trade future yield of stETH for fixed returns',
    tags: ['Yield Trading', 'Fixed Rate', 'Advanced'],
    logo: '🎯',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
    change: '-2.1%',
    positive: false,
    volume24h: '$8M'
  },
  {
    id: 5,
    protocol: 'Yearn',
    asset: 'yvUSDC',
    strategy: 'Auto-Yield',
    apy: '9.8%',
    tvl: '$890M',
    minDeposit: '1 USDC',
    risk: 'low',
    timelock: 'Flexible',
    aiScore: 91,
    trending: false,
    new: false,
    featured: true,
    description: 'Automated yield farming strategies for USDC',
    tags: ['Auto-Compound', 'Stable Yield', 'Set & Forget'],
    logo: '🏦',
    gradient: 'from-teal-500 to-cyan-500',
    bgGradient: 'from-teal-500/10 to-cyan-500/10',
    change: '+1.2%',
    positive: true,
    volume24h: '$67M'
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

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-400 bg-green-500/20';
  if (score >= 80) return 'text-blue-400 bg-blue-500/20';
  if (score >= 70) return 'text-yellow-400 bg-yellow-500/20';
  return 'text-red-400 bg-red-500/20';
};

export const YieldOpportunities = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('ai-score');

  const filteredOpportunities = opportunities
    .filter(opp => {
      const matchesFilter = filter === 'all' || 
        (filter === 'trending' && opp.trending) ||
        (filter === 'new' && opp.new) ||
        (filter === 'featured' && opp.featured) ||
        opp.risk === filter;
      
      const matchesSearch = opp.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.strategy.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'ai-score': return b.aiScore - a.aiScore;
        case 'apy': return parseFloat(b.apy) - parseFloat(a.apy);
        case 'tvl': return parseFloat(b.tvl.replace(/[$BM]/g, '')) - parseFloat(a.tvl.replace(/[$BM]/g, ''));
        default: return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <span>AI Yield Opportunities</span>
                <Bot className="h-4 w-4 text-blue-400" />
              </h3>
              <p className="text-sm text-gray-400">Discover optimized DeFi strategies</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
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
                <option value="all">All</option>
                <option value="featured">Featured</option>
                <option value="trending">Trending</option>
                <option value="new">New</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="ai-score">AI Score</option>
              <option value="apy">APY</option>
              <option value="tvl">TVL</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-400 text-sm font-medium">Avg APY</div>
                <div className="text-white text-xl font-bold">14.8%</div>
              </div>
              <Percent className="h-5 w-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-400 text-sm font-medium">Total TVL</div>
                <div className="text-white text-xl font-bold">$36.1B</div>
              </div>
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-400 text-sm font-medium">Opportunities</div>
                <div className="text-white text-xl font-bold">{opportunities.length}</div>
              </div>
              <Target className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => {
          const TrendIcon = opportunity.positive ? ArrowUpRight : ArrowDownRight;

          return (
            <div
              key={opportunity.id}
              className={`relative group overflow-hidden bg-gradient-to-br ${opportunity.bgGradient} backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute top-4 right-4 w-24 h-24 bg-gradient-to-br ${opportunity.gradient} rounded-full blur-2xl`}></div>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Opportunity Info */}
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{opportunity.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-white font-semibold text-lg">{opportunity.protocol}</h4>
                        
                        {/* Badges */}
                        <div className="flex items-center space-x-2">
                          {opportunity.featured && (
                            <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-xs font-medium text-yellow-400 flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>FEATURED</span>
                            </span>
                          )}
                          {opportunity.new && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full text-xs font-medium text-green-400">
                              NEW
                            </span>
                          )}
                          {opportunity.trending && (
                            <span className="px-2 py-1 bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-full text-xs font-medium text-pink-400 flex items-center space-x-1">
                              <Flame className="h-3 w-3" />
                              <span>HOT</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                        <span>{opportunity.asset} • {opportunity.strategy}</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{opportunity.timelock}</span>
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-2">{opportunity.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {opportunity.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700/50 rounded-lg text-xs text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 min-w-0 lg:min-w-[600px]">
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">APY</div>
                      <div className="text-green-400 font-bold text-lg">{opportunity.apy}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">TVL</div>
                      <div className="text-white font-semibold">{opportunity.tvl}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">Min Deposit</div>
                      <div className="text-white font-semibold text-sm">{opportunity.minDeposit}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">Risk</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.risk)}`}>
                        {opportunity.risk.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-gray-400 text-xs mb-1">AI Score</div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(opportunity.aiScore)}`}>
                          {opportunity.aiScore}
                        </span>
                        <Bot className="h-3 w-3 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-1 ${
                      opportunity.positive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">{opportunity.change}</span>
                    </div>
                    
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 group">
                      <span>Invest</span>
                      <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                    
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Additional Info Row */}
                <div className="mt-4 pt-4 border-t border-gray-700/30 flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-6">
                    <span>24h Volume: {opportunity.volume24h}</span>
                    <span className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Audited</span>
                    </span>
                  </div>
                  <div className="text-xs">
                    Last updated: 5 min ago
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-12 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No opportunities found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};