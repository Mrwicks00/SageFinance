"use client"

import type React from "react"

import { useState } from "react"
import { ChatSidebar } from "../../components/aichat/ChatSidebar"
import { ChatHeader } from "../../components/aichat/ChatHeader"
import { ChatArea } from "../../components/aichat/ChatArea"
import { ChatInput } from "../../components/aichat/ChatInput"

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

    setMessages((prev) => [...prev, userMessage])
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

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
      setIsTyping(false)
    }, 2000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-0">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 flex flex-col">
          <ChatArea messages={messages} isTyping={isTyping} transactionPreviews={mockTransactionPreviews} />

          <ChatInput
            input={input}
            isLoading={isLoading}
            quickSuggestions={quickSuggestions}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </div>
    </div>
  )
}
