"use client"

import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Progress } from "../../components/ui/progress"
import { ArrowUpRight } from "lucide-react"

interface PortfolioSummaryProps {
  totalUserStake: string
  totalRewards: string
  onClaimAll: () => void
}

export function PortfolioSummary({ totalUserStake, totalRewards, onClaimAll }: PortfolioSummaryProps) {
  return (
    <Card className="bg-[#1A1A1A] border-[#F7B801]/20">
      <CardHeader>
        <CardTitle className="text-xl text-[#F7B801]">Your Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Staked</span>
          <span className="text-xl font-bold text-[#F7B801]">{totalUserStake}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Claimable Rewards</span>
          <span className="text-lg font-semibold text-green-400">${totalRewards}</span>
        </div>
        <Progress value={65} className="h-2 bg-[#0A0A0A]" />
        <p className="text-xs text-gray-400">65% of positions are actively earning</p>

        <Button onClick={onClaimAll} className="w-full bg-green-600 hover:bg-green-700 text-white">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Claim All Rewards
        </Button>
      </CardContent>
    </Card>
  )
}
