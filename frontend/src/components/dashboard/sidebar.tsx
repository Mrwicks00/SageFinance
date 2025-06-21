import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ArrowUpDown, 
  MessageSquare, 
  Layers, 
  Settings, 
  PieChart,
  Zap,
  User,
  ChevronRight,
  Wallet,
  BarChart3,
  Shield,
  HelpCircle
} from 'lucide-react';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart, badge: null },
  { id: 'staking', label: 'Staking', icon: Layers, badge: '4' },
  { id: 'crosschain', label: 'Cross-chain', icon: ArrowUpDown, badge: null },
  { id: 'ai-chat', label: 'AI Assistant', icon: MessageSquare, badge: 'New' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
];

const bottomItems = [
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ activeTab, setActiveTab } : any) => {
  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-gray-900/40 backdrop-blur-2xl border-r border-gray-800/50 z-50 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SageFi
            </h1>
            <p className="text-xs text-gray-400 font-medium">DeFi Protocol</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'hover:bg-gray-800/30 hover:border-gray-700/50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg' 
                      : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                  }`}>
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`} />
                  </div>
                  <span className={`font-medium transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.badge === 'New' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-6 border-t border-gray-800/50"></div>

        {/* Bottom Navigation */}
        <nav className="space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                    : 'hover:bg-gray-800/30 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                    : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                }`}>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`} />
                </div>
                <span className={`font-medium text-sm transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">0x1234...5678</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-xs text-gray-400">Connected</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-600/50 rounded-lg transition-colors">
              <Wallet className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};