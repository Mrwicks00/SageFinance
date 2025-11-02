"use client"

import { Button } from "../ui/Button"
import { Play, ArrowRight, Shield, Zap, Globe, Sparkles, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useScrollAnimation } from "../../hooks/use-scroll-animation"

export function EnhancedHeroSection() {
  const titleAnimation = useScrollAnimation({ animation: "slide-up", duration: 800 })
  const subtitleAnimation = useScrollAnimation({ animation: "slide-up", delay: 200, duration: 800 })
  const buttonsAnimation = useScrollAnimation({ animation: "slide-up", delay: 400, duration: 600 })
  const statsAnimation = useScrollAnimation({ animation: "fade-in", delay: 600, duration: 600 })
  const visualAnimation = useScrollAnimation({ animation: "scale-up", delay: 300, duration: 1000 })

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,223,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,223,0,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div
              ref={subtitleAnimation.ref}
              className={`inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-full px-5 py-2.5 ${subtitleAnimation.className}`}
            >
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-yellow-300 text-sm font-semibold">AI-Powered DeFi Platform</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>

            {/* Main Heading */}
            <div ref={titleAnimation.ref} className={`space-y-4 ${titleAnimation.className}`}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Your Gateway to</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-gradient">
                  Smart DeFi
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-xl">
                Execute complex cross-chain strategies through simple conversations. 
                <span className="text-yellow-400 font-semibold"> No coding required.</span>
              </p>
            </div>

            {/* Feature Pills */}
            <div className={`flex flex-wrap gap-3 ${subtitleAnimation.className}`} style={{ transitionDelay: '300ms' }}>
              {[
                { icon: Shield, text: 'Bank-Grade Security', color: 'yellow' },
                { icon: Zap, text: 'Lightning Fast', color: 'purple' },
                { icon: Globe, text: 'Multi-Chain', color: 'yellow' }
              ].map((feature, idx) => (
                <div 
                  key={feature.text}
                  className="group flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-full px-4 py-2.5 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105"
                >
                  <feature.icon className={`w-4 h-4 text-${feature.color}-400 group-hover:scale-110 transition-transform`} />
                  <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div ref={buttonsAnimation.ref} className={`flex flex-col sm:flex-row gap-4 pt-4 ${buttonsAnimation.className}`}>
              <Link href="/dashboard" className="group">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black border-0 font-bold w-full sm:w-auto transform hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Launch App
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-yellow-500/50 transform hover:scale-105 transition-all duration-300 bg-transparent backdrop-blur-sm group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div ref={statsAnimation.ref} className={`grid grid-cols-3 gap-6 pt-8 ${statsAnimation.className}`}>
              {[
                { value: '$2.1M+', label: 'Total Volume', icon: TrendingUp },
                { value: '1,200+', label: 'Active Users', icon: Sparkles },
                { value: '99.9%', label: 'Uptime', icon: Shield }
              ].map((stat, idx) => (
                <div key={stat.label} className="group">
                  <div className="flex items-center space-x-2 mb-1">
                    <stat.icon className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                    <span className="text-2xl sm:text-3xl font-bold text-white group-hover:text-yellow-400 transition-colors">{stat.value}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Visual Element */}
          <div className="relative lg:pl-8">
            <div
              ref={visualAnimation.ref}
              className={`relative ${visualAnimation.className}`}
            >
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-black/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 lg:p-12 shadow-2xl">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-yellow-500/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative">
                  {/* Logo */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                      <Image
                        src="/images/sage-logo.png"
                        alt="SageFi Logo"
                        width={200}
                        height={200}
                        className="relative w-48 h-48 lg:w-64 lg:h-64 object-contain"
                        priority
                      />
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'AI Agents', value: '24/7', color: 'yellow' },
                      { label: 'Networks', value: '3+', color: 'purple' },
                      { label: 'Avg APY', value: '12.3%', color: 'yellow' },
                      { label: 'Gas Saved', value: '40%', color: 'purple' }
                    ].map((item, idx) => (
                      <div 
                        key={item.label}
                        className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 group"
                      >
                        <div className={`text-2xl font-bold text-${item.color}-400 mb-1 group-hover:scale-110 transition-transform`}>{item.value}</div>
                        <div className="text-gray-400 text-sm">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Floating Cards */}
              <div className="absolute -top-8 -left-8 bg-gray-900/90 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 shadow-xl animate-float hidden lg:block">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-white font-semibold text-sm">Live Trading</p>
                    <p className="text-gray-400 text-xs">Active Now</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -right-8 bg-gray-900/90 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 shadow-xl animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-semibold text-sm">+18.7%</p>
                    <p className="text-gray-400 text-xs">This Week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  )
}