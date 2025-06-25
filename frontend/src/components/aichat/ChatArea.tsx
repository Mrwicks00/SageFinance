"use client"

import { ScrollArea } from "../../components/ui/scroll-area"
import { WelcomeScreen } from "./WelcomeScreen"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"

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

interface ChatAreaProps {
  messages: Message[]
  isTyping: boolean
  transactionPreviews: TransactionPreview[]
}

export function ChatArea({ messages, isTyping, transactionPreviews }: ChatAreaProps) {
  return (
    <ScrollArea className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 && <WelcomeScreen />}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} transactionPreviews={transactionPreviews} />
        ))}

        {isTyping && <TypingIndicator />}
      </div>
    </ScrollArea>
  )
}
