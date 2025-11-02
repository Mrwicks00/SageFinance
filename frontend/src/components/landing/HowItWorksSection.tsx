"use client"

import { MessageCircle, Sparkles, Zap, CheckCircle, ArrowRight } from "lucide-react"
import { useScrollAnimation, useStaggeredAnimation } from "../../hooks/use-scroll-animation"

const STEPS = [
  {
    id: 1,
    icon: MessageCircle,
    title: "Chat with Eliza",
    description: "Simply tell our AI agent what you want to achieve in plain English",
    color: "yellow",
    example: "Find me the best USDC yield"
  },
  {
    id: 2,
    icon: Sparkles,
    title: "AI Analyzes",
    description: "Eliza scans multiple protocols and chains to find optimal opportunities",
    color: "purple",
    example: "Analyzing 50+ protocols..."
  },
  {
    id: 3,
    icon: Zap,
    title: "Execute Instantly",
    description: "Approve the strategy and watch it execute across multiple chains",
    color: "yellow",
    example: "Depositing to Aave on Base"
  },
  {
    id: 4,
    icon: CheckCircle,
    title: "Earn & Track",
    description: "Monitor your positions and earnings in real-time from one dashboard",
    color: "purple",
    example: "Earning 12.3% APY"
  }
]

export function HowItWorksSection() {
  const headerAnimation = useScrollAnimation({ animation: "slide-up", duration: 800 })
  const stepAnimations = useStaggeredAnimation(STEPS.length, {
    animation: "slide-up",
    stagger: 200,
    duration: 600,
  })

  return (
    <section className="py-32 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,223,0,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div ref={headerAnimation.ref} className={`text-center mb-20 ${headerAnimation.className}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Simple Process
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            How It <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From conversation to execution in seconds. No technical knowledge required.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                ref={stepAnimations[index].ref}
                className={`relative ${stepAnimations[index].className}`}
              >
                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-yellow-500/50 to-transparent -translate-x-4 z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                      <ArrowRight className="w-5 h-5 text-yellow-500/50" />
                    </div>
                  </div>
                )}

                {/* Card */}
                <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 group h-full">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
                      {step.id}
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-${step.color}-500/20 to-${step.color}-600/20 rounded-2xl flex items-center justify-center border border-${step.color}-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <step.icon className={`w-8 h-8 text-${step.color}-400`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-3 text-center group-hover:text-yellow-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-center mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Example */}
                    <div className="bg-black/40 border border-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-yellow-400 text-sm font-mono">{step.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">Ready to get started?</p>
          <button className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 group inline-flex items-center">
            Try It Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  )
}