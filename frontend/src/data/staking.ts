export const STAKING_FEATURES = [
    {
      id: "multi-chain",
      icon: "⛓️",
      title: "Multi-Chain Staking",
      description: "Stake SAGE tokens across Ethereum, Base, and Arbitrum",
      apy: "12-18%",
    },
    {
      id: "auto-compound",
      icon: "🔄",
      title: "Auto-Compounding",
      description: "Rewards automatically reinvested for maximum yield",
      apy: "Up to 22%",
    },
    {
      id: "flexible",
      icon: "⚡",
      title: "Flexible Terms",
      description: "No lock-up periods, unstake anytime",
      apy: "8-15%",
    },
  ] as const
  
  export const WEEKLY_REWARDS = {
    totalWinners: 5,
    rewardAmount: "1,000 SAGE",
    frequency: "Every Week",
    mechanism: "Chainlink VRF",
  } as const
  