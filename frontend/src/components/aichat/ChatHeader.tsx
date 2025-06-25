"use client"

import Link from "next/link"
import { Button } from "../../components/ui/Button"
import { ArrowLeft, HelpCircle, Menu } from "lucide-react"

interface ChatHeaderProps {
  onMenuClick: () => void
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  return (
    <header className="bg-[#1A1A1A] border-b border-[#F7B801]/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-white hover:bg-[#F7B801]/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#F7B801]/10">
            <Link href="/dashboard" className="flex items-center">
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
  )
}
