"use client"

import type React from "react"

import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Send, Mic } from "lucide-react"

interface ChatInputProps {
  input: string
  isLoading: boolean
  quickSuggestions: string[]
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onSuggestionClick: (suggestion: string) => void
}

export function ChatInput({
  input,
  isLoading,
  quickSuggestions,
  onInputChange,
  onSubmit,
  onSuggestionClick,
}: ChatInputProps) {
  return (
    <div className="border-t border-[#F7B801]/20 bg-[#1A1A1A] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick(suggestion)}
              className="border-[#F7B801]/30 text-[#F7B801] hover:bg-[#F7B801]/10 hover:border-[#F7B801]/50"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={onSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={onInputChange}
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
  )
}
