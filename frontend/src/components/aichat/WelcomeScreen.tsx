"use client"

import { Card, CardContent } from "../../components/ui/Card"
import { TrendingUp, Zap, Shield, BarChart3 } from "lucide-react"

export function WelcomeScreen() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-[#F7B801]/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Zap className="h-8 w-8 text-[#F7B801]" />
      </div>
      <h2 className="text-2xl font-bold text-[#F7B801] mb-2">Welcome to SageFi AI</h2>
      <p className="text-gray-400 mb-8">Your intelligent DeFi assistant is ready to help you optimize your portfolio</p>

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
  )
}
