"use client"

import { TrendingUp, Users, Zap, Shield, DollarSign, Globe } from "lucide-react"
import { useScrollAnimation, useStaggeredAnimation } from "../../hooks/use-scroll-animation"

const METRICS = [
  {
    id: "volume",
    icon: DollarSign,
    value: "$2.1M+",
    label: "Total Volume",
    description: "Processed across all chains",
    color: "yellow",
    trend: "+127%"
  },
  {
    id: "users",
    icon: Users,
    value: "1,200+",
    label: "Active Users",
    description: "Growing community",
    color: "purple",
    trend: "+89%"
  },
  {
    id: "transactions",
    icon: Zap,
    value: "50K+",
    label: "Transactions",
    description: "Executed successfully",
    color: "yellow",
    trend: "+156%"
  },
  {
    id: "chains",
    icon: Globe,
    value: "3",
    label: "Testnets",
    description: "Sepolia, Base, Arbitrum",
    color: "purple",
    trend: "Live"
  },
  {
    id: "apy",
    icon: TrendingUp,
    value: "12.3%",
    label: "Avg APY",
    description: "Across all strategies",
    color: "yellow",
    trend: "+2.1%"
  },
  {
    id: "uptime",
    icon: Shield,
    value: "99.9%",
    label: "Uptime",
    description: "Always available",
    color: "purple",
    trend: "24/7"
  }
]

export function MetricsSection() {
  const headerAnimation = useScrollAnimation({ animation: "slide-up", duration: 800 })
  const metricAnimations = useStaggeredAnimation(METRICS.length, {
    animation: "scale-up",
    stagger: 100,
    duration: 600,
  })

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,223,0,0.08),transparent_50%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div ref={headerAnimation.ref} className={`text-center mb-16 ${headerAnimation.className}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Trusted by <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">Thousands</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real numbers from real users building the future of DeFi
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {METRICS.map((metric, index) => (
            <div
              key={metric.id}
              ref={metricAnimations[index].ref}
              className={`group relative ${metricAnimations[index].className}`}
            >
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 h-full">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  {/* Icon & Trend */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-br from-${metric.color}-500/20 to-${metric.color}-600/20 rounded-xl flex items-center justify-center border border-${metric.color}-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <metric.icon className={`w-7 h-7 text-${metric.color}-400`} />
                    </div>
                    <div className={`px-3 py-1 bg-${metric.color}-500/10 border border-${metric.color}-500/30 rounded-full`}>
                      <span className={`text-${metric.color}-400 text-xs font-semibold`}>{metric.trend}</span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="mb-2">
                    <div className="text-4xl font-bold text-white group-hover:text-yellow-300 transition-colors mb-1">
                      {metric.value}
                    </div>
                    <div className="text-lg font-semibold text-gray-300 group-hover:text-white transition-colors">
                      {metric.label}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                    {metric.description}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}