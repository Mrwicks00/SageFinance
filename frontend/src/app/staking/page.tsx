"use client"

import { useState, useEffect } from "react"
import { StakingHeader } from "../../components/staking/StakingHeader"
import { NetworkSelection } from "../../components/staking/NetworkSelection"
import { StakingInterface } from "../../components/staking/StakingInterface"
import { PortfolioSummary } from "../../components/staking/PortfolioSummary"
import { APYComparisonChart } from "../../components/staking/APYComparisonChart"
import { InformationSection } from "../../components/staking/InformationSection"
import { ActiveStakesTable } from "../../components/staking/ActiveStakesTable"

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

  const handleStake = () => {
    console.log("Staking:", { selectedNetwork, stakeAmount, stakeDuration })
  }

  const handleClaimAll = () => {
    console.log("Claiming all rewards")
  }

  const handleClaim = (positionId: string) => {
    console.log("Claiming position:", positionId)
  }

  const handleUnstake = (positionId: string) => {
    console.log("Unstaking position:", positionId)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <StakingHeader totalTVL={totalTVL} totalStakers={totalStakers} />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Network Cards & Staking Interface */}
          <div className="xl:col-span-2 space-y-8">
            <NetworkSelection
              networks={networks}
              selectedNetwork={selectedNetwork}
              onNetworkSelect={setSelectedNetwork}
            />

            <StakingInterface
              networks={networks}
              selectedNetwork={selectedNetwork}
              stakeAmount={stakeAmount}
              stakeDuration={stakeDuration}
              expectedRewards={expectedRewards}
              onNetworkChange={setSelectedNetwork}
              onAmountChange={setStakeAmount}
              onDurationChange={setStakeDuration}
              onStake={handleStake}
            />
          </div>

          {/* Right Column - Your Positions & Info */}
          <div className="space-y-8">
            <PortfolioSummary totalUserStake={totalUserStake} totalRewards={totalRewards} onClaimAll={handleClaimAll} />

            <APYComparisonChart networks={networks} />

            <InformationSection />
          </div>
        </div>

        <div className="mt-8">
          <ActiveStakesTable positions={userPositions} onClaim={handleClaim} onUnstake={handleUnstake} />
        </div>
      </div>
    </div>
  )
}
