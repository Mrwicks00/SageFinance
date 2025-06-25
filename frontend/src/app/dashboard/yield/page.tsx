// src/app/dashboard/yield/page.tsx
"use client";

import { useState } from "react";
import { ChainSelector } from "@/components/dashboard/yield/ChainSelector";
import { ProtocolSelector } from "@/components/dashboard/yield/ProtocolSelector";
import { DepositForm } from "@/components/dashboard/yield/DepositForm";
import { PoolStats } from "@/components/dashboard/yield/PoolStats";
import { UserPositions } from "@/components/dashboard/yield/UserPositions";
import { WeeklyRewards } from "@/components/dashboard/yield/WeeklyRewards";
import { SUPPORTED_CHAINS, PROTOCOLS } from "@/data/yieldData";

export default function YieldPage() {
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);

  return (
    // This div will be rendered within the `main` tag of dashboard/layout.tsx
    // The `p-4 md:p-6` is for content padding relative to the main area
    <div className="text-white p-4 md:p-6"> 
      <div className="max-w-7xl mx-auto mb-8"> {/* Max width for content within this page */}
        {/* Page-specific Header (Deposit & Earn) */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Deposit & Earn
          </h1>
          <p className="text-gray-400">
            Deposit your assets to Aave or Compound and earn competitive yields
          </p>
        </div>

        {/* Weekly Rewards Banner */}
        <WeeklyRewards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Left Column - Deposit Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* Chain & Protocol Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChainSelector 
                selectedChain={selectedChain}
                onChainSelect={setSelectedChain}
              />
              <ProtocolSelector 
                selectedProtocol={selectedProtocol}
                selectedChain={selectedChain}
                onProtocolSelect={setSelectedProtocol}
              />
            </div>

            {/* Pool Statistics */}
            <PoolStats 
              selectedChain={selectedChain}
              selectedProtocol={selectedProtocol}
            />

            {/* Deposit Form */}
            <DepositForm 
              selectedChain={selectedChain}
              selectedProtocol={selectedProtocol}
            />
          </div>

          {/* Right Column - User Positions */}
          <div className="lg:col-span-4">
            <UserPositions />
          </div>
        </div>
      </div>
    </div>
  );
}