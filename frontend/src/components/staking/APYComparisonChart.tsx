"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Progress } from "../../components/ui/progress"
import { BarChart3 } from "lucide-react"

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

interface APYComparisonChartProps {
  networks: NetworkData[]
}

export function APYComparisonChart({ networks }: APYComparisonChartProps) {
  return (
    <Card className="bg-[#1A1A1A] border-[#F7B801]/20">
      <CardHeader>
        <CardTitle className="text-lg text-[#F7B801] flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          APY Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {networks.map((network) => (
          <div key={network.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <span>{network.logo}</span>
                {network.name.split(" ")[0]}
              </span>
              <span className="font-semibold text-green-400">{network.apy}%</span>
            </div>
            <Progress value={(network.apy / 15) * 100} className="h-2 bg-[#0A0A0A]" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
