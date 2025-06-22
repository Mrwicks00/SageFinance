"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { PortfolioOverview } from "@/components/dashboard/PortfolioOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AISuggestions } from "@/components/dashboard/AISuggestions";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)]" />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back to SageFi
              </h1>
              <p className="text-gray-400">
                Your AI-powered DeFi dashboard for cross-chain yield optimization
              </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Portfolio Overview - Takes full width on mobile, 2 columns on desktop */}
              <div className="lg:col-span-2">
                <PortfolioOverview />
              </div>
              
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <QuickActions />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Suggestions */}
              <AISuggestions />
              
              {/* Recent Activity */}
              <RecentActivity />
            </div>

            {/* Mobile Sidebar Toggle */}
            <div className="lg:hidden fixed bottom-4 right-4">
              <button className="bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}