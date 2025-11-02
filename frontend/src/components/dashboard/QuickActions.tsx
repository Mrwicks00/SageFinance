"use client";

import Link from "next/link";
import { 
  ArrowLeftRight, 
  MessageSquare, 
  Coins, 
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useState } from "react";

const QUICK_ACTIONS = [
  {
    title: "Cross-Chain Transfer",
    description: "Move assets between chains",
    icon: ArrowLeftRight,
    href: "/dashboard/crosschain",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    stat: "3 chains",
    badge: null,
  },
  {
    title: "AI Yield Optimizer",
    description: "Find best yields automatically",
    icon: MessageSquare,
    href: "/aichat",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    borderColor: "border-purple-500/30",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]",
    stat: "AI-powered",
    badge: "New",
  },
  {
    title: "Stake SAGE",
    description: "Earn rewards & win prizes",
    icon: Coins,
    href: "/staking",
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-400/10 hover:bg-yellow-400/20",
    borderColor: "border-yellow-400/30",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]",
    stat: "12.5% APY",
    badge: "Hot",
  },
  {
    title: "Deposit & Earn",
    description: "Aave & Compound pools",
    icon: TrendingUp,
    href: "/dashboard/yield",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10 hover:bg-green-500/20",
    borderColor: "border-green-500/30",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    stat: "Up to 4.25%",
    badge: null,
  },
];

export function QuickActions() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <div className="p-2 bg-yellow-400/10 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          Quick Actions
        </h2>
        <Target className="w-5 h-5 text-gray-400 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredIndex === index;
          
          return (
            <Link
              key={action.title}
              href={action.href}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative ${action.bgColor} ${action.borderColor} ${action.hoverGlow} border rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:-translate-y-1 card-tilt overflow-hidden animate-slide-in-up stagger-${index + 1}`}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Badge */}
              {action.badge && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full animate-pulse">
                  {action.badge}
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 text-white ${isHovered ? 'animate-bounce' : ''}`} />
                  </div>
                  <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white font-semibold group-hover:text-yellow-400 transition-colors text-lg">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {action.description}
                  </p>
                  
                  {/* Stat badge */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className={`px-2 py-1 bg-gradient-to-r ${action.color} bg-opacity-20 rounded-full text-xs font-medium text-white border border-white/20`}>
                      {action.stat}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Featured Action - Enhanced */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400/10 via-yellow-500/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl hover:border-yellow-400/50 transition-all duration-300 group animate-slide-in-up stagger-5 relative overflow-hidden">
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="relative">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <div className="text-yellow-400 font-semibold text-sm">
                Weekly Selection Active
              </div>
            </div>
            <div className="text-gray-300 text-xs mt-1">
              Deposit to any pool for a chance to win SAGE tokens
            </div>
          </div>
          <div className="text-yellow-400 font-bold text-lg animate-bounce">
            🎁
          </div>
        </div>
      </div>
    </div>
  );
}