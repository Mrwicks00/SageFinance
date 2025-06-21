"use client"

import { useState } from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

const suggestedActions = ["Show my portfolio", "Find best yields", "Rebalance assets", "Cross-chain opportunities"]

const initialMessages: Message[] = [
  {
    id: "1",
    type: "ai",
    content:
      "Hello! I'm SageFi AI, your DeFi assistant. I can help you optimize your portfolio, find the best yields, and execute complex DeFi strategies. What would you like to do today?",
    timestamp: new Date(),
  },
]

export function AiChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `I understand you want to "${inputValue}". Let me analyze your portfolio and current market conditions to provide the best recommendations. Based on your holdings, I suggest considering these optimized strategies...`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSuggestedAction = (action: string) => {
    setInputValue(action)
  }

  return (
    <div className="h-full">
      <div className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F7B801] to-[#F59E0B] rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Ask SageFi AI</h2>
            <p className="text-sm text-gray-400">Your intelligent DeFi assistant</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user" ? "bg-[#F7B801]" : "bg-gradient-to-br from-purple-500 to-pink-500"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4 text-black" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === "user" ? "bg-[#F7B801] text-black" : "bg-gray-800 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Actions */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Suggested actions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="bg-[#0A0A0A] border-gray-700 text-gray-300 hover:border-[#F7B801] hover:text-[#F7B801] text-xs"
                onClick={() => handleSuggestedAction(action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What would you like to do?"
            className="bg-[#0A0A0A] border-gray-700 text-white placeholder-gray-500 focus:border-[#F7B801]"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-[#F7B801] hover:bg-[#F7B801]/90 text-black"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
