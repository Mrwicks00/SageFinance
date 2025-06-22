"use client";

import { useState } from "react";
import Link from "next/link";
import { WalletButton } from "@/components/wallet/WalletButton";
import { Menu, X, Bell, Settings } from "lucide-react";

const NETWORK_OPTIONS = [
  { name: "Ethereum Sepolia", chainId: 11155111, icon: "⚡" },
  { name: "Base Sepolia", chainId: 84532, icon: "🔵" },
  { name: "Arbitrum Sepolia", chainId: 421614, icon: "🔺" },
];

export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORK_OPTIONS[0]);

  return (
    <header className="bg-black/90 backdrop-blur-md border-b border-yellow-400/20 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <img
                src="/images/sage-logo.png"
                alt="sage-logo"
                className="w-6 h-6 rounded-lg"
              />
            </div>
            <span className="text-white font-bold text-xl">SageFi</span>
          </Link>

          {/* Network Selector */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedNetwork.chainId}
                onChange={(e) => {
                  const network = NETWORK_OPTIONS.find(
                    (n) => n.chainId === parseInt(e.target.value)
                  );
                  if (network) setSelectedNetwork(network);
                }}
                className="bg-gray-900 border border-yellow-400/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none pr-8"
              >
                {NETWORK_OPTIONS.map((network) => (
                  <option key={network.chainId} value={network.chainId}>
                    {network.icon} {network.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-yellow-400/20">
            <div className="flex flex-col space-y-4">
              <div className="px-2">
                <select
                  value={selectedNetwork.chainId}
                  onChange={(e) => {
                    const network = NETWORK_OPTIONS.find(
                      (n) => n.chainId === parseInt(e.target.value)
                    );
                    if (network) setSelectedNetwork(network);
                  }}
                  className="w-full bg-gray-900 border border-yellow-400/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {NETWORK_OPTIONS.map((network) => (
                    <option key={network.chainId} value={network.chainId}>
                      {network.icon} {network.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-4 px-2">
                <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <WalletButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}