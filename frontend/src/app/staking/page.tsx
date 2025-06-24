"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TrendingUp, Coins, Users, Gift, ArrowUpRight, Shield, Zap, Star, Calculator, BarChart3 } from "lucide-react"
import { cn } from "../../lib/utils";

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

interface StakePosition {
  id: string
  network: string
  amount: string
  apy: number
  rewards: string
  duration: string
  status: "active" | "unstaking" | "completed"
  startDate: string
}

const networks: NetworkData[] = [
  {
    id: "ethereum",
    name: "Ethereum Sepolia",
    logo: "⟠",
    apy: 8.5,
    tvl: "$2.4M",
    userStake: "$1,250.00",
    gasEstimate: "$15.20",
    color: "from-blue-500 to-purple-600",
    chainId: 11155111,
  },
  {
    id: "base",
    name: "Base Sepolia",
    logo: "🔵",
    apy: 12.3,
    tvl: "$890K",
    userStake: "$750.00",
    gasEstimate: "$0.85",
    color: "from-blue-400 to-cyan-500",
    chainId: 84532,
  },
  {
    id: "arbitrum",
    name: "Arbitrum Sepolia",
    logo: "🔷",
    apy: 10.7,
    tvl: "$1.8M",
    userStake: "$2,100.00",
    gasEstimate: "$2.40",
    color: "from-blue-600 to-indigo-600",
    chainId: 421614,
  },
]

const userPositions: StakePosition[] = [
  {
    id: "1",
    network: "Ethereum Sepolia",
    amount: "1,250.00",
    apy: 8.5,
    rewards: "12.45",
    duration: "30 days",
    status: "active",
    startDate: "2024-01-15",
  },
  {
    id: "2",
    network: "Base Sepolia",
    amount: "750.00",
    apy: 12.3,
    rewards: "8.92",
    duration: "60 days",
    status: "active",
    startDate: "2024-01-10",
  },
]

export default function StakingPage() {
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum")
  const [stakeAmount, setStakeAmount] = useState("")
  const [stakeDuration, setStakeDuration] = useState("30")
  const [expectedRewards, setExpectedRewards] = useState(0)

  useEffect(() => {
    if (stakeAmount && selectedNetwork) {
      const network = networks.find((n) => n.id === selectedNetwork)
      if (network) {
        const amount = Number.parseFloat(stakeAmount) || 0
        const duration = Number.parseInt(stakeDuration) || 30
        const dailyRate = network.apy / 365 / 100
        const rewards = amount * dailyRate * duration
        setExpectedRewards(rewards)
      }
    }
  }, [stakeAmount, selectedNetwork, stakeDuration])

  const totalTVL = "$5.09M"
  const totalStakers = "2,847"
  const totalUserStake = "$4,100.00"
  const totalRewards = "$21.37"

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header Section */}
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

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Network Cards & Staking Interface */}
          <div className="xl:col-span-2 space-y-8">
            {/* Network Selection Cards */}
            <div>
              <h2 className="text-2xl font-bold text-[#F7B801] mb-6">Choose Your Network</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {networks.map((network) => (
                  <Card
                    key={network.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:scale-105",
                      selectedNetwork === network.id
                        ? "bg-[#F7B801]/20 border-[#F7B801] shadow-lg shadow-[#F7B801]/20"
                        : "bg-[#1A1A1A] border-[#F7B801]/20 hover:border-[#F7B801]/40",
                    )}
                    onClick={() => setSelectedNetwork(network.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-r ${network.color} flex items-center justify-center text-white font-bold`}
                        >
                          {network.logo}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{network.name}</CardTitle>
                          <Badge variant="outline" className="text-xs border-[#F7B801]/30 text-[#F7B801]">
                            Chain ID: {network.chainId}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">APY</span>
                        <span className="text-xl font-bold text-green-400">{network.apy}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">TVL</span>
                        <span className="font-semibold">{network.tvl}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Your Stake</span>
                        <span className="font-semibold text-[#F7B801]">{network.userStake}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Gas Est.</span>
                        <span className="text-sm">{network.gasEstimate}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Staking Interface */}
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
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-[#0A0A0A] border-[#F7B801]/30 text-white h-12 text-lg"
                    />
                    <div className="flex gap-2 mt-2">
                      {["100", "500", "1000", "Max"].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setStakeAmount(amount === "Max" ? "5000" : amount)}
                          className="border-[#F7B801]/30 text-[#F7B801] hover:bg-[#F7B801]/10"
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Network</label>
                    <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
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
                        onClick={() => setStakeDuration(days)}
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

                {/* Expected Rewards Calculator */}
                <Card className="bg-[#F7B801]/10 border-[#F7B801]/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-5 w-5 text-[#F7B801]" />
                      <span className="font-semibold text-[#F7B801]">Expected Rewards</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Daily Rewards:</span>
                        <p className="font-semibold">
                          ${(expectedRewards / Number.parseInt(stakeDuration)).toFixed(4)} USDC
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Total Rewards:</span>
                        <p className="font-semibold text-green-400">${expectedRewards.toFixed(2)} USDC</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  className="w-full bg-[#F7B801] hover:bg-[#F7B801]/90 text-black h-12 text-lg font-semibold"
                  disabled={!stakeAmount || Number.parseFloat(stakeAmount) <= 0}
                >
                  <Coins className="h-5 w-5 mr-2" />
                  Stake {stakeAmount || "0"} USDC
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Your Positions & Info */}
          <div className="space-y-8">
            {/* Your Staking Position Summary */}
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

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Claim All Rewards
                </Button>
              </CardContent>
            </Card>

            {/* APY Comparison Chart */}
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

            {/* Information Section */}
            <Card className="bg-[#1A1A1A] border-[#F7B801]/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#F7B801]">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-[#F7B801] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Secure Staking</h4>
                    <p className="text-gray-400">
                      Your USDC is secured by battle-tested smart contracts across multiple chains.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <TrendingUp className="h-5 w-5 text-[#F7B801] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Cross-Chain Benefits</h4>
                    <p className="text-gray-400">
                      Diversify across networks to optimize yields and reduce single-chain risk.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Gift className="h-5 w-5 text-[#F7B801] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Weekly Selection</h4>
                    <p className="text-gray-400">
                      5 random stakers receive bonus rewards every week. Minimum stake: 100 USDC.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Stakes Table */}
        <Card className="mt-8 bg-[#1A1A1A] border-[#F7B801]/20">
          <CardHeader>
            <CardTitle className="text-xl text-[#F7B801]">Your Active Stakes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#F7B801]/20">
                  <TableHead className="text-gray-400">Network</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">APY</TableHead>
                  <TableHead className="text-gray-400">Rewards</TableHead>
                  <TableHead className="text-gray-400">Duration</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPositions.map((position) => (
                  <TableRow key={position.id} className="border-[#F7B801]/10">
                    <TableCell className="font-medium">{position.network}</TableCell>
                    <TableCell>${position.amount}</TableCell>
                    <TableCell className="text-green-400">{position.apy}%</TableCell>
                    <TableCell className="text-[#F7B801]">${position.rewards}</TableCell>
                    <TableCell>{position.duration}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          position.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400",
                        )}
                      >
                        {position.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#F7B801]/30 text-[#F7B801] hover:bg-[#F7B801]/10"
                        >
                          Claim
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Unstake
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
