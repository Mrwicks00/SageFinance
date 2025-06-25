"use client"

import { NetworkCard } from "./NetworkCard"

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

interface NetworkSelectionProps {
  networks: NetworkData[]
  selectedNetwork: string
  onNetworkSelect: (networkId: string) => void
}

export function NetworkSelection({ networks, selectedNetwork, onNetworkSelect }: NetworkSelectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#F7B801] mb-6">Choose Your Network</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {networks.map((network) => (
          <NetworkCard
            key={network.id}
            network={network}
            isSelected={selectedNetwork === network.id}
            onSelect={onNetworkSelect}
          />
        ))}
      </div>
    </div>
  )
}
