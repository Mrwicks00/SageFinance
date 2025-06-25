"use client"

import { Card, CardContent } from "../../components/ui/Card"
import { Calculator } from "lucide-react"

interface RewardsCalculatorProps {
  expectedRewards: number
  stakeDuration: string
}

export function RewardsCalculator({ expectedRewards, stakeDuration }: RewardsCalculatorProps) {
  return (
    <Card className="bg-[#F7B801]/10 border-[#F7B801]/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-5 w-5 text-[#F7B801]" />
          <span className="font-semibold text-[#F7B801]">Expected Rewards</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Daily Rewards:</span>
            <p className="font-semibold">${(expectedRewards / Number.parseInt(stakeDuration)).toFixed(4)} USDC</p>
          </div>
          <div>
            <span className="text-gray-400">Total Rewards:</span>
            <p className="font-semibold text-green-400">${expectedRewards.toFixed(2)} USDC</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
