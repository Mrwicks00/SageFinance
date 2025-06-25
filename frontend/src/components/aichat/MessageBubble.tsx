"use client"

import { Zap } from "lucide-react"
import { cn } from "../../lib/utils"
import { TransactionPreviewCard } from "./TransactionPreviewCard"

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

interface MessageBubbleProps {
  message: Message
  transactionPreviews?: TransactionPreview[]
}

export function MessageBubble({ message, transactionPreviews = [] }: MessageBubbleProps) {
  return (
    <div
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
          message.role === "user" ? "bg-[#F7B801] text-black ml-12" : "bg-[#1A1A1A] border border-[#F7B801]/20",
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Transaction Preview Cards */}
        {message.role === "assistant" && message.content.includes("USDC") && transactionPreviews.length > 0 && (
          <div className="mt-4 space-y-3">
            {transactionPreviews.map((tx) => (
              <TransactionPreviewCard key={tx.id} transaction={tx} />
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
  )
}
