import React, { useState } from 'react';
import { 
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Clock,
  ExternalLink,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader,
  Calendar
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'deposit',
    protocol: 'Aave',
    asset: 'ETH',
    amount: '2.5 ETH',
    value: '$3,920.00',
    status: 'completed',
    timestamp: '2 hours ago',
    txHash: '0x1a2b3c...',
    icon: ArrowDownLeft,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  {
    id: 2,
    type: 'swap',
    protocol: 'Uniswap',
    asset: 'USDC → ETH',
    amount: '1,000 USDC',
    value: '$1,000.00',
    status: 'completed',
    timestamp: '4 hours ago',
    txHash: '0x4d5e6f...',
    icon: ArrowLeftRight,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  {
    id: 3,
    type: 'withdraw',
    protocol: 'Compound',
    asset: 'USDC',
    amount: '5,000 USDC',
    value: '$5,000.00',
    status: 'pending',
    timestamp: '6 hours ago',
    txHash: '0x7g8h9i...',
    icon: ArrowUpRight,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  },
  {
    id: 4,
    type: 'stake',
    protocol: 'Lido',
    asset: 'ETH',
    amount: '10.0 ETH',
    value: '$15,680.00',
    status: 'completed',
    timestamp: '1 day ago',
    txHash: '0xa1b2c3...',
    icon: ArrowDownLeft,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  {
    id: 5,
    type: 'claim',
    protocol: 'PancakeSwap',
    asset: 'CAKE',
    amount: '125.5 CAKE',
    value: '$485.20',
    status: 'failed',
    timestamp: '2 days ago',
    txHash: '0xd4e5f6...',
    icon: ArrowUpRight,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  }
];

const getStatusIcon = (status : any) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'pending': return Loader;
    case 'failed': return AlertCircle;
    default: return Clock;
  }
};

const getStatusColor = (status: any) => {
  switch (status) {
    case 'completed': return 'text-green-400';
    case 'pending': return 'text-yellow-400';
    case 'failed': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const RecentActivity = () => {
  const [filter, setFilter] = useState('all');

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <p className="text-sm text-gray-400">Your latest transactions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          >
            <option value="all">All</option>
            <option value="deposit">Deposits</option>
            <option value="withdraw">Withdrawals</option>
            <option value="swap">Swaps</option>
            <option value="stake">Stakes</option>
            <option value="claim">Claims</option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => {
          const ActivityIcon = activity.icon;
          const StatusIcon = getStatusIcon(activity.status);

          return (
            <div
              key={activity.id}
              className="group flex items-center justify-between p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-600/20 hover:border-gray-600/40"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 ${activity.bgColor} rounded-lg`}>
                  <ActivityIcon className={`h-4 w-4 ${activity.color}`} />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium capitalize">{activity.type}</span>
                    <span className="text-gray-400 text-sm">on {activity.protocol}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span>{activity.asset}</span>
                    <span>•</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white font-semibold">{activity.amount}</div>
                  <div className="text-gray-400 text-sm">{activity.value}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-4 w-4 ${getStatusColor(activity.status)} ${activity.status === 'pending' ? 'animate-spin' : ''}`} />
                  <button className="p-1 hover:bg-gray-600/50 rounded transition-colors opacity-0 group-hover:opacity-100">
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="mt-6 text-center">
        <button className="px-4 py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View All Transactions
        </button>
      </div>
    </div>
  );
};