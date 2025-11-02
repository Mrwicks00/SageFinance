"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  MessageSquare,
  Coins,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NAVIGATION_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Portfolio overview",
  },
  {
    label: "Cross-Chain",
    href: "/dashboard/crosschain",
    icon: ArrowLeftRight,
    description: "Transfer & deposit",
  },
  {
    label: "AI Assistant",
    href: "/aichat",
    icon: MessageSquare,
    description: "Best yield finder",
  },
  {
    label: "Staking",
    href: "/staking",
    icon: Coins,
    description: "Stake SAGE tokens",
  },
  {
    label: "Yield Farming",
    href: "/dashboard/yield",
    icon: TrendingUp,
    description: "Aave & Compound pools",
  },
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-gray-900/50 backdrop-blur-sm border-r border-yellow-400/20 transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      } ${className} relative overflow-hidden`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 via-transparent to-purple-500/5 opacity-50" />
      
      <div className="relative z-10 h-full">
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 rounded-lg hover:bg-yellow-400/10 hover:scale-110"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 animate-pulse" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4">
            <div className="space-y-2">
              {NAVIGATION_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30 shadow-lg shadow-yellow-400/10"
                        : "text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 hover:scale-105"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Hover shimmer effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                    
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-yellow-400/20' : 'group-hover:bg-yellow-400/10'} transition-all duration-300`}>
                      <Icon
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActive ? "text-yellow-400 animate-pulse" : "text-gray-400 group-hover:text-yellow-400 group-hover:scale-110"
                        }`}
                      />
                    </div>
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                          {item.description}
                        </div>
                      </div>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="w-1 h-8 bg-yellow-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-700/50">
              <div className="relative bg-gradient-to-r from-yellow-400/20 via-yellow-500/20 to-yellow-600/20 p-4 rounded-xl border border-yellow-400/30 overflow-hidden group hover:border-yellow-400/50 transition-all duration-300">
                {/* Animated shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <div className="text-sm font-semibold text-yellow-400">
                      Weekly Selection
                    </div>
                  </div>
                  <div className="text-xs text-gray-300">
                    5 lucky depositors win SAGE tokens every week!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}