"use client"

import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { ScrollArea } from "../../components/ui/scroll-area"
import { X, Wallet } from "lucide-react"
import { cn } from "../../lib/utils"

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-[#1A1A1A] border-r border-[#F7B801]/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#F7B801]/20">
          <h2 className="text-lg font-semibold text-[#F7B801]">Chat History</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-white hover:bg-[#F7B801]/10">
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

      {/* Sidebar Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
    </>
  )
}
