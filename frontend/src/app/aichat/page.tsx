"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link";
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent } from "../../components/ui/Card"
import { ScrollArea } from "../../components/ui/scroll-area"
import { ArrowLeft, HelpCircle, Send, Mic, Menu, X, TrendingUp, Zap, Shield, BarChart3, Wallet } from "lucide-react"
import { cn } from "../../lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface TransactionPreview {
  id: string
  protocol: string
  action: string
  amount: string
  token: string
  apy: string
  gasEstimate: string
  logo: string
}

const quickSuggestions = [
  "Show me best USDC yields",
  "Bridge to Base network",
  "Stake 1000 USDC",
  "Rebalance my portfolio",
]

const mockTransactionPreviews: TransactionPreview[] = [
  {
    id: "1",
    protocol: "Aave",
    action: "Supply USDC",
    amount: "1,000",
    token: "USDC",
    apy: "4.2%",
    gasEstimate: "$12.50",
    logo: "🏦",
  },
]

// Mock responses for demo purposes
const mockResponses = [
  "I can help you find the best USDC yields across different DeFi protocols. Let me analyze the current market conditions.",
  "Based on current market data, here are some high-yield USDC opportunities I found for you.",
  "I've found several bridging options to Base network. Here are the most cost-effective routes.",
  "Let me help you rebalance your portfolio based on your risk tolerance and market conditions.",
]

export default function AIPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setIsTyping(true)
    setInput("")

    // Simulate AI response delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
      setIsTyping(false)
    }, 2000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-[#1A1A1A] border-r border-[#F7B801]/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#F7B801]/20">
          <h2 className="text-lg font-semibold text-[#F7B801]">Chat History</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-[#F7B801]/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#F7B801]/10 border border-[#F7B801]/20 cursor-pointer hover:bg-[#F7B801]/20 transition-colors">
              <p className="text-sm font-medium text-[#F7B801]">USDC Yield Strategy</p>
              <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
            </div>
            <div className="p-3 rounded-lg hover:bg-[#F7B801]/10 transition-colors cursor-pointer">
              <p className="text-sm">Portfolio Rebalancing</p>
              <p className="text-xs text-gray-400 mt-1">1 day ago</p>
            </div>
            <div className="p-3 rounded-lg hover:bg-[#F7B801]/10 transition-colors cursor-pointer">
              <p className="text-sm">Bridge to Arbitrum</p>
              <p className="text-xs text-gray-400 mt-1">3 days ago</p>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#F7B801]/20">
          <Card className="bg-[#F7B801]/10 border-[#F7B801]/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="h-5 w-5 text-[#F7B801]" />
                <span className="text-sm font-medium">Portfolio Value</span>
              </div>
              <p className="text-2xl font-bold text-[#F7B801]">$24,567.89</p>
              <p className="text-xs text-green-400 mt-1">+2.4% (24h)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-[#1A1A1A] border-b border-[#F7B801]/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:bg-[#F7B801]/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#F7B801]/10">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-[#F7B801]/20" />
              <h1 className="text-xl font-bold text-[#F7B801]">SageFi AI Assistant</h1>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#F7B801]/10">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#F7B801]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-[#F7B801]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F7B801] mb-2">Welcome to SageFi AI</h2>
                  <p className="text-gray-400 mb-8">
                    Your intelligent DeFi assistant is ready to help you optimize your portfolio
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <Card className="bg-[#1A1A1A] border-[#F7B801]/20 hover:border-[#F7B801]/40 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-left">
                        <TrendingUp className="h-6 w-6 text-[#F7B801] mb-2" />
                        <h3 className="font-semibold mb-1">Yield Optimization</h3>
                        <p className="text-sm text-gray-400">Find the best yields across protocols</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A1A] border-[#F7B801]/20 hover:border-[#F7B801]/40 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-left">
                        <Shield className="h-6 w-6 text-[#F7B801] mb-2" />
                        <h3 className="font-semibold mb-1">Risk Management</h3>
                        <p className="text-sm text-gray-400">Analyze and mitigate portfolio risks</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A1A] border-[#F7B801]/20 hover:border-[#F7B801]/40 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-left">
                        <BarChart3 className="h-6 w-6 text-[#F7B801] mb-2" />
                        <h3 className="font-semibold mb-1">Portfolio Analytics</h3>
                        <p className="text-sm text-gray-400">Deep insights into your positions</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A1A] border-[#F7B801]/20 hover:border-[#F7B801]/40 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-left">
                        <Zap className="h-6 w-6 text-[#F7B801] mb-2" />
                        <h3 className="font-semibold mb-1">Smart Execution</h3>
                        <p className="text-sm text-gray-400">Automated transaction optimization</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-[#F7B801] rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-black" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-2xl rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-[#F7B801] text-black ml-12"
                        : "bg-[#1A1A1A] border border-[#F7B801]/20",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {/* Transaction Preview Cards */}
                    {message.role === "assistant" && message.content.includes("USDC") && (
                      <div className="mt-4 space-y-3">
                        {mockTransactionPreviews.map((tx) => (
                          <Card key={tx.id} className="bg-[#0A0A0A] border-[#F7B801]/30">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{tx.logo}</span>
                                  <div>
                                    <p className="font-semibold text-[#F7B801]">{tx.protocol}</p>
                                    <p className="text-sm text-gray-400">{tx.action}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">
                                    {tx.amount} {tx.token}
                                  </p>
                                  <p className="text-sm text-green-400">{tx.apy} APY</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                                <span>Gas Estimate: {tx.gasEstimate}</span>
                                <span>Expected Return: ~$42/month</span>
                              </div>

                              <div className="flex gap-2">
                                <Button className="flex-1 bg-[#F7B801] hover:bg-[#F7B801]/90 text-black">
                                  Confirm Transaction
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-[#F7B801]/30 text-[#F7B801] hover:bg-[#F7B801]/10"
                                >
                                  Simulate
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-semibold text-sm">U</span>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="w-8 h-8 bg-[#F7B801] rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-black" />
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#F7B801]/20 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#F7B801] rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-[#F7B801] rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-[#F7B801] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Section */}
          <div className="border-t border-[#F7B801]/20 bg-[#1A1A1A] p-6">
            <div className="max-w-4xl mx-auto">
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="border-[#F7B801]/30 text-[#F7B801] hover:bg-[#F7B801]/10 hover:border-[#F7B801]/50"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me anything about DeFi..."
                    className="bg-[#0A0A0A] border-[#F7B801]/30 text-white placeholder:text-gray-500 pr-12 h-12 text-base focus:border-[#F7B801] focus:ring-[#F7B801]/20"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F7B801] hover:bg-[#F7B801]/10"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-[#F7B801] hover:bg-[#F7B801]/90 text-black h-12 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}