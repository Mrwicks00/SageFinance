"use client"

import { Zap } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 bg-[#F7B801] rounded-full flex items-center justify-center flex-shrink-0">
        <Zap className="h-4 w-4 text-black" />
      </div>
      <div className="bg-[#1A1A1A] border border-[#F7B801]/20 rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-[#F7B801] rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-[#F7B801] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-[#F7B801] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    </div>
  )
}
