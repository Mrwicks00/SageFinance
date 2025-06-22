"use client";

import Link from "next/link";
import { 
  ArrowLeftRight, 
  MessageSquare, 
  Coins, 
  TrendingUp,
  Zap,
  Target
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    title: "Cross-Chain Transfer",
    description: "Move assets between chains",
    icon: ArrowLeftRight,
    href: "/dashboard/crosschain",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    title: "AI Yield Optimizer",
    description: "Find best yields automatically",
    icon: MessageSquare,
    href: "/dashboard/ai-chat",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    title: "Stake SAGE",
    description: "Earn rewards & win prizes",
    icon: Coins,
    href: "/dashboard/staking",
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-400/10 hover:bg-yellow-400/20",
    borderColor: "border-yellow-400/30",
  },
  {
    title: "Deposit & Earn",
    description: "Aave & Compound pools",
    icon: TrendingUp,
    href: "/dashboard/yield",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10 hover:bg-green-500/20",
    borderColor: "border-green-500/30",
  },
];

export function QuickActions() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          Quick Actions
        </h2>
        <Target className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`group ${action.bgColor} ${action.borderColor} border rounded-lg p-4 transition-all duration-200 hover:scale-105`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Featured Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          <div>
            <div className="text-yellow-400 font-medium text-sm">
              Weekly Selection Active
            </div>
            <div className="text-gray-300 text-xs">
              Deposit to any pool for a chance to win SAGE tokens
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}