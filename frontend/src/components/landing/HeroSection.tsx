"use client"

import { Button } from "../../components/ui/Button"
import { Play, ArrowRight, Shield, Zap, Globe } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useScrollAnimation } from "../../hooks/use-scroll-animation"

export function HeroSection() {
  const titleAnimation = useScrollAnimation({ animation: "slide-up", duration: 800 })
  const subtitleAnimation = useScrollAnimation({ animation: "slide-up", delay: 200, duration: 800 })
  const pillsAnimation = useScrollAnimation({ animation: "slide-up", delay: 400, duration: 600 })
  const buttonsAnimation = useScrollAnimation({ animation: "slide-up", delay: 600, duration: 600 })
  const statsAnimation = useScrollAnimation({ animation: "fade-in", delay: 800, duration: 600 })
  const logoAnimation = useScrollAnimation({ animation: "scale-up", delay: 300, duration: 1000 })
  const floatingAnimation1 = useScrollAnimation({ animation: "bounce-in", delay: 1200, duration: 800 })
  const floatingAnimation2 = useScrollAnimation({ animation: "bounce-in", delay: 1400, duration: 800 })

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,223,0,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.02),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-screen py-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div
                ref={subtitleAnimation.ref}
                className={`inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2 ${subtitleAnimation.className}`}
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm font-medium">Now Live on Testnet</span>
              </div>

              <h1
                ref={titleAnimation.ref}
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight ${titleAnimation.className}`}
              >
                DeFi Made
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  Simple & Secure
                </span>
              </h1>

              <p
                ref={subtitleAnimation.ref}
                className={`text-lg sm:text-xl text-gray-300 leading-relaxed max-w-lg ${subtitleAnimation.className}`}
                style={{ transitionDelay: "100ms" }}
              >
                Execute complex cross-chain DeFi strategies through intuitive conversations. Professional-grade yields
                without the complexity.
              </p>
            </div>

            {/* Feature Pills */}
            <div ref={pillsAnimation.ref} className={`flex flex-wrap gap-3 ${pillsAnimation.className}`}>
              <div className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Secure</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-full px-4 py-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Fast</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-full px-4 py-2">
                <Globe className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Multi-Chain</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div ref={buttonsAnimation.ref} className={`flex flex-col sm:flex-row gap-4 ${buttonsAnimation.className}`}>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black border-0 group font-semibold w-full sm:w-auto transform hover:scale-105 transition-all duration-300"
                >
                  Launch App
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white transform hover:scale-105 transition-all duration-300 bg-transparent"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div ref={statsAnimation.ref} className={`space-y-3 pt-4 ${statsAnimation.className}`}>
              <p className="text-gray-400 text-sm">Trusted by DeFi professionals</p>
              <div className="flex items-center space-x-6">
                <div className="text-gray-300">
                  <span className="text-2xl font-bold text-white">$2.1M+</span>
                  <p className="text-xs text-gray-400">Total Volume</p>
                </div>
                <div className="text-gray-300">
                  <span className="text-2xl font-bold text-white">1,200+</span>
                  <p className="text-xs text-gray-400">Active Users</p>
                </div>
                <div className="text-gray-300">
                  <span className="text-2xl font-bold text-white">99.9%</span>
                  <p className="text-xs text-gray-400">Uptime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Logo & Visual */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-400/15 to-yellow-500/10 rounded-full blur-3xl"></div>

              {/* Logo Container */}
              <div
                ref={logoAnimation.ref}
                className={`relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12 lg:p-16 ${logoAnimation.className}`}
              >
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/sage-logo-remove.png"
                    alt="SageFi Logo"
                    width={300}
                    height={300}
                    className="w-full h-auto max-w-sm lg:max-w-md"
                    priority
                  />
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/20 rounded-full animate-pulse"></div>
                <div
                  className="absolute -bottom-6 -left-6 w-12 h-12 bg-white/5 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute top-1/2 -left-8 w-6 h-6 bg-yellow-400/10 rounded-full animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>
              </div>

              {/* Stats Cards */}
              <div
                ref={floatingAnimation1.ref}
                className={`absolute -bottom-6 -left-6 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-2xl ${floatingAnimation1.className}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-white font-semibold">8.7% APY</p>
                    <p className="text-gray-400 text-xs">Average Yield</p>
                  </div>
                </div>
              </div>

              <div
                ref={floatingAnimation2.ref}
                className={`absolute -top-6 -right-6 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-2xl ${floatingAnimation2.className}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-white font-semibold">3 Chains</p>
                    <p className="text-gray-400 text-xs">Supported</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  )
}
