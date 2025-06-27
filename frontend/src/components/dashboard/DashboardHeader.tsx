// src/app/dashboard/DashboardHeader.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletButton } from "../../components/wallet/WalletButton";
import { Menu, X, Bell, Settings } from "lucide-react";
import { useWallet } from '@/contexts/WalletContext'; // Import useWallet from your context
import { toast } from 'react-toastify'; 
import Image from 'next/image';
import { Chain } from '@/data/crosschain';


export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use the WalletContext to get all necessary wallet and network info
  const { 
    isConnected, 
    currentChainId, 
    currentChain, // This is already the correct Chain object
    switchNetwork, 
    supportedNetworksList // Use the unified list from WalletContext
  } = useWallet();

  // selectedNetworkDisplay should primarily reflect the actual connected network.
  // It can also show a placeholder for unknown networks.
  const [selectedNetworkDisplay, setSelectedNetworkDisplay] = useState(
    currentChain || supportedNetworksList[0] || { name: "Select Network", chainId: 0, logo: 'https://placehold.co/24x24/1a202c/ffffff?text=?' } 
  );

  // Effect to update `selectedNetworkDisplay` whenever the connected chain changes
  // This ensures the dropdown reflects the wallet's actual network
  useEffect(() => {
    if (isConnected && currentChainId !== undefined) {
      // Check if the current connected chain is one of our supported ones
      const network = supportedNetworksList.find(n => n.chainId === currentChainId);
      if (network) {
        setSelectedNetworkDisplay(network);
      } else {
        // If connected to an unsupported network, create a temporary display object
        // and notify the user.
        const unknownNetwork: Chain = {
          id: currentChainId,
          name: `Unknown Network (${currentChainId})`,
          chainId: currentChainId,
          selector: `0x${currentChainId.toString(16)}`,
          color: '#6b7280', // gray color for unknown networks
          logo: 'https://placehold.co/24x24/1a202c/ffffff?text=?',
          rpcUrl: '', // empty for unknown networks
          rpcUrls: {
            default: { http: [''] },
            public: { http: [''] }
          },
          blockExplorer: '',
          nativeCurrency: { name: 'Unknown', symbol: 'UNK', decimals: 18 },
          isSupported: false,
          isTestnet: false
        };
        setSelectedNetworkDisplay(unknownNetwork);
        toast.warn(`Connected to an unsupported network (${currentChainId}). Please switch or add it.`);

      }
    } else if (!isConnected) {
      // If disconnected, reset to a default or first supported network
      setSelectedNetworkDisplay(supportedNetworksList[0] || { name: "Select Network", chainId: 0, logo: 'https://placehold.co/24x24/1a202c/ffffff?text=?' }); 
    }
  }, [currentChainId, isConnected, supportedNetworksList, currentChain]); // Added currentChain to deps

  // Handler for network selection change
  const handleNetworkChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChainId = parseInt(e.target.value);
    const networkToSwitchTo = supportedNetworksList.find((n) => n.chainId === newChainId);

    if (networkToSwitchTo) {
      // Attempt to switch the chain using the context's function
      try {
        await switchNetwork(newChainId);
        // The useEffect above will handle updating selectedNetworkDisplay on successful switch confirmation from wagmi
      } catch (error: unknown) {
        // Error is already handled by toast in WalletContext, but for debug:
        console.error("Network switch initiated but failed or cancelled by user:", error);
        // Do not revert display immediately here, let useEffect handle it based on actual chainId change
      }
    }
  };

  return (
    <header className="bg-black/90 backdrop-blur-md border-b border-yellow-400/20 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <Image
  src="/images/sage-logo.png"
  alt="sage-logo"
  width={24}
  height={24}
  className="rounded-lg"
  onError={(e) => {
    e.currentTarget.src = 'https://placehold.co/24x24/1a202c/ffffff?text=Logo';
  }} 
/>

            </div>
            <span className="text-white font-bold text-xl">SageFi</span>
          </Link>

          {/* Network Selector (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            {selectedNetworkDisplay.logo && ( 
              <Image
                src={selectedNetworkDisplay.logo} 
                alt={selectedNetworkDisplay.name}
                className="rounded-full"
                width={24}
                height={24}
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/1a202c/ffffff?text=?'; }} 
              />
            )}
            <div className="relative">
              <select
                value={selectedNetworkDisplay.chainId}
                onChange={handleNetworkChange}
                className="bg-gray-900 border border-yellow-400/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none pr-8"
                disabled={!isConnected} // Disable if wallet not connected
              >
                {supportedNetworksList.map((network) => ( // Use the context list
                  <option key={network.chainId} value={network.chainId}>
                    {network.name}
                  </option>
                ))}
                {/* Add "Unknown" option if currently on an unsupported network and connected */}
                {currentChainId !== undefined && !supportedNetworksList.find(n => n.chainId === currentChainId) && isConnected && (
                    <option key={currentChainId} value={currentChainId}>
                        {`Unknown Network (${currentChainId})`}
                    </option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
              </div>
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
              {/* Mobile Network Selector */}
              <div className="px-2 flex items-center space-x-2">
                {selectedNetworkDisplay.logo && ( 
                    <Image
                        src={selectedNetworkDisplay.logo} 
                        alt={selectedNetworkDisplay.name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/1a202c/ffffff?text=?'; }} 
                    />
                )}
                <select
                  value={selectedNetworkDisplay.chainId}
                  onChange={handleNetworkChange}
                  className="w-full bg-gray-900 border border-yellow-400/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none pr-8"
                  disabled={!isConnected} // Disable if wallet not connected
                >
                  {supportedNetworksList.map((network) => ( // Use the context list
                    <option key={network.chainId} value={network.chainId}>
                      {network.name}
                    </option>
                  ))}
                  {currentChainId !== undefined && !supportedNetworksList.find(n => n.chainId === currentChainId) && isConnected && (
                      <option key={currentChainId} value={currentChainId}>
                          {`Unknown Network (${currentChainId})`}
                      </option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                </div>
              </div>
              {/* Mobile Actions */}
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
