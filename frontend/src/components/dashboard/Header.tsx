import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  WifiOff,
  Wifi
} from 'lucide-react';

export const Header = () => {
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum');
  const [searchValue, setSearchValue] = useState('');

  const networks = [
    { name: 'Ethereum', icon: '🔷', status: 'connected' },
    { name: 'Polygon', icon: '🟣', status: 'connected' },
    { name: 'Arbitrum', icon: '🔵', status: 'connected' },
    { name: 'Optimism', icon: '🔴', status: 'disconnected' },
    { name: 'BSC', icon: '🟡', status: 'connected' },
  ];

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <header className="sticky top-0 bg-gray-900/30 backdrop-blur-2xl border-b border-gray-800/50 z-40">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-gray-400 text-sm">Welcome back! Here's your DeFi overview</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live • {currentTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search protocols, tokens..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/80 w-72 transition-all duration-300 placeholder-gray-500"
              />
              {searchValue && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-blue-400 font-medium">{searchValue.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Network Selector */}
            <div className="relative">
              <button
                onClick={() => setIsNetworkOpen(!isNetworkOpen)}
                className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5 hover:bg-gray-700/50 transition-all duration-300"
              >
                <span className="text-lg">🔷</span>
                <span className="text-sm font-medium text-gray-300">{selectedNetwork}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isNetworkOpen ? 'rotate-180' : ''}`} />
              </button>

              {isNetworkOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-2">
                    <div className="text-xs text-gray-400 font-medium px-3 py-2 border-b border-gray-700/50">
                      Select Network
                    </div>
                    {networks.map((network) => (
                      <button
                        key={network.name}
                        onClick={() => {
                          setSelectedNetwork(network.name);
                          setIsNetworkOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{network.icon}</span>
                          <span className="text-sm font-medium text-gray-300">{network.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {network.status === 'connected' ? (
                            <>
                              <Wifi className="h-3 w-3 text-green-400" />
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </>
                          ) : (
                            <>
                              <WifiOff className="h-3 w-3 text-red-400" />
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gas Tracker */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <div className="text-sm">
                  <span className="text-gray-400">Gas:</span>
                  <span className="text-green-400 font-medium ml-1">23</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group">
              <Bell className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs text-white font-bold">3</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-20"></div>
            </button>

            {/* Security Status */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <div className="text-sm">
                  <span className="text-green-400 font-medium">Secure</span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <button className="p-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group">
              <Settings className="h-5 w-5 text-gray-400 group-hover:text-gray-300 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};