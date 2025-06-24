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
      className={`bg-gray-900/50 backdrop-blur-sm border-r border-yellow-400/20 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } ${className}`}
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-yellow-400/10"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4">
          <div className="space-y-2">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                      : "text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-yellow-400" : "text-gray-400 group-hover:text-yellow-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 p-3 rounded-lg border border-yellow-400/30">
              <div className="text-sm font-medium text-yellow-400 mb-1">
                Weekly Selection
              </div>
              <div className="text-xs text-gray-300">
                5 lucky depositors win SAGE tokens every week!
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}