"use client";

import { PortfolioOverview } from "@/components/dashboard/PortfolioOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AISuggestions } from "@/components/dashboard/AISuggestions";

export default function DashboardOverviewPage() { 
  return (
    <div className="animate-fade-in-up"> 
      <div>
        {/* Welcome Section with enhanced styling */}
        <div className="mb-8 animate-slide-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent mb-3">
            Welcome back to SageFi
          </h1>
          <p className="text-gray-400 text-lg">
            Your AI-powered DeFi dashboard for cross-chain yield optimization
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400 font-medium">All systems operational</span>
          </div>
        </div>

        {/* Dashboard Grid with staggered animations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Overview - Takes full width on mobile, 2 columns on desktop */}
          <div className="lg:col-span-2 animate-slide-in-left">
            <PortfolioOverview />
          </div>
          
          {/* Quick Actions */}
          <div className="lg:col-span-1 animate-slide-in-right">
            <QuickActions />
          </div>
        </div>

        {/* Second Row with staggered animations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Suggestions */}
          <div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            <AISuggestions />
          </div>
          
          {/* Recent Activity */}
          <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <RecentActivity />
          </div>
        </div>

        {/* Mobile Sidebar Toggle Button - Moved to the layout */}
        {/* <div className="lg:hidden fixed bottom-4 right-4">
          <button className="bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div> */}
      </div>
    </div>
  );
}