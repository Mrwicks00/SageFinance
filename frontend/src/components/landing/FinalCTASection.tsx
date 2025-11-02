"use client"

import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useScrollAnimation } from "../../hooks/use-scroll-animation"

export function FinalCTASection() {
  const animation = useScrollAnimation({ animation: "scale-up", duration: 800 })

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-purple-500/5 to-yellow-500/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,223,0,0.1),transparent_70%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={animation.ref}
          className={`max-w-5xl mx-auto ${animation.className}`}
        >
          <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl border-2 border-yellow-500/30 rounded-3xl p-12 lg:p-16 overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              {/* Content */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Your DeFi Journey
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Ready to Experience
                  <br />
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                    Smart DeFi?
                  </span>
                </h2>

                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                  Join thousands of users earning more with AI-powered strategies. No coding, no complexity, just results.
                </p>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-6 mb-10">
                  {[
                    { icon: Shield, text: "Non-Custodial" },
                    { icon: Zap, text: "Instant Execution" },
                    { icon: Sparkles, text: "AI-Powered" }
                  ].map((feature) => (
                    <div key={feature.text} className="flex items-center space-x-2 text-gray-300">
                      <feature.icon className="w-5 h-5 text-yellow-400" />
                      <span className="font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <button className="group bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-bold px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/40 inline-flex items-center text-lg">
                      <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                      Launch App Now
                      <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link href="/aichat">
                    <button className="group bg-gray-800/50 hover:bg-gray-700/50 border-2 border-gray-700 hover:border-yellow-500/50 text-white font-bold px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm inline-flex items-center text-lg">
                      Chat with Eliza
                      <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-800/50">
                {[
                  { value: "$2.1M+", label: "Volume" },
                  { value: "1,200+", label: "Users" },
                  { value: "99.9%", label: "Uptime" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}