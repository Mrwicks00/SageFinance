"use client"

import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Zap, Coins } from "lucide-react"
import { cn } from "../../lib/utils"
import { RewardsCalculator } from "./RewardsCalculator"

interface NetworkData {
  id: string
  name: string
  logo: string
  apy: number
  tvl: string
  userStake: string
  gasEstimate: string
  color: string
  chainId: number
}

interface StakingInterfaceProps {
  networks: NetworkData[]
  selectedNetwork: string
  stakeAmount: string
  stakeDuration: string
  expectedRewards: number
  onNetworkChange: (networkId: string) => void
  onAmountChange: (amount: string) => void
  onDurationChange: (duration: string) => void
  onStake: () => void
}

export function StakingInterface({
  networks,
  selectedNetwork,
  stakeAmount,
  stakeDuration,
  expectedRewards,
  onNetworkChange,
  onAmountChange,
  onDurationChange,
  onStake,
}: StakingInterfaceProps) {
  return (
    <Card className="bg-[#1A1A1A] border-[#F7B801]/20">
      <CardHeader>
        <CardTitle className="text-2xl text-[#F7B801] flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Stake USDC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Amount (USDC)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={stakeAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="bg-[#0A0A0A] border-[#F7B801]/30 text-white h-12 text-lg"
            />
            <div className="flex gap-2 mt-2">
              {["100", "500", "1000", "Max"].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => onAmountChange(amount === "Max" ? "5000" : amount)}
                  className="border-[#F7B801]/30 text-[#F7B801] hover:bg-[#F7B801]/10"
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Network</label>
            <Select value={selectedNetwork} onValueChange={onNetworkChange}>
              <SelectTrigger className="bg-[#0A0A0A] border-[#F7B801]/30 text-white h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#F7B801]/30">
                {networks.map((network) => (
                  <SelectItem key={network.id} value={network.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <span>{network.logo}</span>
                      <span>{network.name}</span>
                      <Badge className="bg-green-500/20 text-green-400 ml-2">{network.apy}% APY</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Staking Duration</label>
          <div className="grid grid-cols-4 gap-2">
            {["30", "60", "90", "180"].map((days) => (
              <Button
                key={days}
                variant={stakeDuration === days ? "primary" : "outline"}
                onClick={() => onDurationChange(days)}
                className={cn(
                  stakeDuration === days
                    ? "bg-[#F7B801] text-black"
                    : "border-[#F7B801]/30 text-[#F7B801] hover:bg-[#F7B801]/10",
                )}
              >
                {days} days
              </Button>
            ))}
          </div>
        </div>

        <RewardsCalculator expectedRewards={expectedRewards} stakeDuration={stakeDuration} />

        <Button
          onClick={onStake}
          className="w-full bg-[#F7B801] hover:bg-[#F7B801]/90 text-black h-12 text-lg font-semibold"
          disabled={!stakeAmount || Number.parseFloat(stakeAmount) <= 0}
        >
          <Coins className="h-5 w-5 mr-2" />
          Stake {stakeAmount || "0"} USDC
        </Button>
      </CardContent>
    </Card>
  )
}
