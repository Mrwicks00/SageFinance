"use client"
import { Button } from "@/components/ui/Button"
import { Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(247,184,1,0.1),transparent_50%)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Your AI Financial Navigator for{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">DeFi</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Execute sophisticated cross-chain strategies through simple conversations. No technical knowledge required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="w-full sm:w-auto">
              Launch App
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* AI Chat Demo */}
          <div className="relative">
            <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4">SageFi AI Assistant</span>
                </div>
              </div>

              <div className="p-6 h-80 overflow-y-auto">
                <div className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg max-w-xs">
                      I want to earn yield on my USDC across multiple chains
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white px-4 py-2 rounded-lg max-w-xs">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-300">AI analyzing...</span>
                      </div>
                      I found optimal yield opportunities:
                      <br />• Ethereum: 8.2% APY
                      <br />• Base: 9.1% APY
                      <br />• Arbitrum: 8.7% APY
                      <br />
                      <br />
                      Shall I execute the strategy?
                    </div>
                  </div>

                  {/* User Response */}
                  <div className="flex justify-end">
                    <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg max-w-xs">
                      Yes, split $1000 across all three
                    </div>
                  </div>

                  {/* AI Confirmation */}
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white px-4 py-2 rounded-lg max-w-xs">
                      ✅ Strategy executed successfully!
                      <br />• $350 → Ethereum (8.2% APY)
                      <br />• $350 → Base (9.1% APY)
                      <br />• $300 → Arbitrum (8.7% APY)
                      <br />
                      <br />
                      <span className="text-green-400">Estimated annual return: $85.50</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 px-4 py-3 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Ask me anything about DeFi..."
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    disabled
                  />
                  <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}