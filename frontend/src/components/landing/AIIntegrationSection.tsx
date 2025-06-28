"use client"

import { useState, useEffect } from "react"
import { MessageCircle, ArrowRight, Sparkles, TrendingUp, Zap, Shield, Brain, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useScrollAnimation, useStaggeredAnimation } from "../../hooks/use-scroll-animation"

export function AIIntegrationSection() {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  const headerAnimation = useScrollAnimation({ animation: "slide-up", duration: 800 })
  const chatAnimation = useScrollAnimation({ animation: "slide-left", duration: 800, delay: 200 })
  const contentAnimation = useScrollAnimation({ animation: "slide-right", duration: 800, delay: 400 })
  const featureAnimations = useStaggeredAnimation(4, {
    animation: "scale-up",
    stagger: 100,
    duration: 500,
    delay: 600,
  })
  const statsAnimation = useScrollAnimation({ animation: "fade-in", duration: 600, delay: 800 })

  const chatMessages = [
    {
      user: "Find me the best USDC yield across testnets",
      ai: "Analyzing yields across Sepolia, Base Sepolia, and Arbitrum Sepolia... Found 12.3% APY on Aave V3 Base Sepolia. Ready to deposit?",
      highlight: "12.3% APY",
    },
    {
      user: "What's the safest protocol for staking ETH?",
      ai: "Based on TVL and audit scores, Lido offers the best risk-adjusted returns at 4.2% APY with $32B TVL. Shall I proceed?",
      highlight: "4.2% APY",
    },
    {
      user: "Bridge 100 USDC to the highest yield",
      ai: "Optimal route: Ethereum → Base via Stargate (0.05% fee) → Compound V3 (8.7% APY). Total gas: ~$12. Confirm?",
      highlight: "8.7% APY",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true)
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % chatMessages.length)
        setIsTyping(false)
      }, 1000)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,223,0,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.06),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div ref={headerAnimation.ref} className={`text-center mb-20 ${headerAnimation.className}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-6">
            <Brain className="w-4 h-4 mr-2" />
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
            Powered by Eliza OS
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            DeFi Made{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-purple-400 to-yellow-300 bg-clip-text text-transparent">
              Conversational
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Just tell Eliza what you want to achieve. Our AI agent finds the best yields, executes cross-chain
            strategies, and manages your DeFi portfolio through simple conversations.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left Side - Chat Interface */}
          <div ref={chatAnimation.ref} className={`relative ${chatAnimation.className}`}>
            {/* Chat Window */}
            <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800/50">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-yellow-500 rounded-full p-0.5">
                      <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                        <Image
                          src="/images/eliza2.avif"
                          alt="Eliza AI"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Eliza DeFi Agent</h3>
                    <p className="text-gray-400 text-sm">Your AI DeFi Assistant</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Online</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-6 h-80 overflow-hidden">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black rounded-2xl rounded-tr-md px-6 py-4 max-w-xs transform hover:scale-105 transition-transform duration-300">
                    <p className="font-medium text-sm">{chatMessages[currentMessage].user}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-2xl rounded-tl-md px-6 py-4 max-w-sm transform hover:scale-105 transition-transform duration-300">
                    {isTyping ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-sm">Eliza is thinking...</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm leading-relaxed">{chatMessages[currentMessage].ai}</p>
                        <div className="mt-3 inline-flex items-center px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                          <TrendingUp className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-yellow-400 text-xs font-semibold">
                            {chatMessages[currentMessage].highlight}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3">
                    <p className="text-gray-400 text-sm">Ask Eliza anything about DeFi...</p>
                  </div>
                  <Link href="/aichat">
                    <button className="bg-yellow-500 hover:bg-yellow-400 text-black p-3 rounded-xl transition-all duration-200 hover:scale-105 group">
                      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-500/15 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Right Side - Features & CTA */}
          <div ref={contentAnimation.ref} className={`space-y-8 ${contentAnimation.className}`}>
            {/* Main Content */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">AI-Powered DeFi</h3>
                  <p className="text-gray-400">Intelligent yield optimization</p>
                </div>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                Eliza understands your DeFi goals and executes complex strategies across multiple chains. No more manual
                research or complicated interfaces - just tell Eliza what you want to achieve.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  title: "Instant Execution",
                  desc: "Execute trades and deposits across Sepolia, Base Sepolia, and Arbitrum Sepolia instantly",
                  color: "yellow",
                },
                {
                  icon: Shield,
                  title: "Risk Analysis",
                  desc: "AI-powered risk assessment and protocol safety scoring for informed decisions",
                  color: "purple",
                },
                {
                  icon: TrendingUp,
                  title: "Yield Optimization",
                  desc: "Automatically find and switch to the highest yielding opportunities",
                  color: "yellow",
                },
                {
                  icon: Brain,
                  title: "Smart Routing",
                  desc: "Cross-chain bridging and optimal routing for maximum efficiency",
                  color: "purple",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  ref={featureAnimations[index].ref}
                  className={`bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 hover:border-${feature.color}-500/30 transition-all duration-300 group ${featureAnimations[index].className}`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <feature.icon
                      className={`w-5 h-5 text-${feature.color}-400 group-hover:scale-110 transition-transform`}
                    />
                    <h4 className="text-white font-semibold">{feature.title}</h4>
                  </div>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/aichat" className="flex-1">
                <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 group flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Chat with Eliza
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-purple-500/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 group flex items-center justify-center">
                <ExternalLink className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                View Demo
              </button>
            </div>

            {/* Stats */}
            <div
              ref={statsAnimation.ref}
              className={`bg-gradient-to-r from-gray-900/80 to-black/80 border border-gray-800/50 rounded-xl p-6 mt-8 ${statsAnimation.className}`}
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">50K+</div>
                  <div className="text-gray-400 text-sm">AI Transactions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">3</div>
                  <div className="text-gray-400 text-sm">Testnets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-gray-400 text-sm">AI Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
