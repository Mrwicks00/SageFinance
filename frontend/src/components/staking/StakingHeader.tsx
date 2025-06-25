"use client"

import { Card, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/badge"
import { Coins, Users, Gift, Star } from "lucide-react"

interface StakingHeaderProps {
  totalTVL: string
  totalStakers: string
}

export function StakingHeader({ totalTVL, totalStakers }: StakingHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#1A1A1A] to-[#0A0A0A] border-b border-[#F7B801]/20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#F7B801] mb-2">USDC Staking</h1>
            <p className="text-gray-400 text-lg">Earn rewards across multiple chains with cross-chain USDC staking</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="bg-[#F7B801]/10 border-[#F7B801]/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Coins className="h-5 w-5 text-[#F7B801]" />
                  <span className="text-sm font-medium">Total TVL</span>
                </div>
                <p className="text-2xl font-bold text-[#F7B801]">{totalTVL}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#F7B801]/10 border-[#F7B801]/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-[#F7B801]" />
                  <span className="text-sm font-medium">Total Stakers</span>
                </div>
                <p className="text-2xl font-bold text-[#F7B801]">{totalStakers}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Selection Banner */}
        <Card className="mt-6 bg-gradient-to-r from-[#F7B801]/20 to-[#F7B801]/10 border-[#F7B801]/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-[#F7B801]" />
              <div>
                <h3 className="font-semibold text-[#F7B801]">Weekly Selection: 5 Lucky Stakers</h3>
                <p className="text-sm text-gray-300">
                  Stake any amount to be eligible for weekly bonus rewards. Next draw in 3 days.
                </p>
              </div>
              <Badge className="bg-[#F7B801] text-black ml-auto">
                <Star className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
