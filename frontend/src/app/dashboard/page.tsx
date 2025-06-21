"use client"

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/Header';
import { PortfolioSummary } from '@/components/dashboard/portfolio-summary';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { YieldOpportunities } from '@/components/dashboard/yield-opportunities';
import { RecentActivity } from '@/components/dashboard/recent-transactions';
import { ActivePositions } from '@/components/dashboard/active-positions';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-72 min-h-screen">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="p-8 space-y-8">
          {/* Portfolio Summary Cards */}
          <PortfolioSummary isBalanceHidden={isBalanceHidden} setIsBalanceHidden={setIsBalanceHidden} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width */}
            <div className="xl:col-span-2 space-y-8">
              <ActivePositions />
              <RecentActivity />
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              <YieldOpportunities />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;