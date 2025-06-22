// Mock data for dashboard components

export interface PoolData {
    protocol: "aave" | "compound";
    asset: string;
    apy: number;
    chain: "ethereum" | "base" | "arbitrum";
    chainIcon: string;
    tvl: string;
    userDeposit?: number;
    logo: string;
  }
  
  export interface Portfolio {
    totalValue: number;
    change24h: number;
    changePercentage: number;
    assets: {
      name: string;
      symbol: string;
      amount: number;
      value: number;
      chain: string;
      protocol?: string;
      logo?: string;
    }[];
  }
  
  export interface Transaction {
    id: string;
    type: "deposit" | "withdraw" | "transfer" | "stake";
    asset: string;
    amount: number;
    chain: string;
    protocol?: string;
    timestamp: Date;
    status: "completed" | "pending" | "failed";
    hash?: string;
  }
  
  // Mock portfolio data
  export const mockPortfolio: Portfolio = {
    totalValue: 12540.67,
    change24h: 234.56,
    changePercentage: 1.91,
    assets: [
      {
        name: "USD Coin",
        symbol: "USDC",
        amount: 8500,
        value: 8500,
        chain: "ethereum",
        protocol: "aave",
        logo: "images/usdc-logo.png"
      },
      {
        name: "USD Coin",
        symbol: "USDC",
        amount: 3200,
        value: 3200,
        chain: "base",
        protocol: "compound",
        logo: "images/usdc-logo.png"

      },
      {
        name: "SAGE Token",
        symbol: "SAGE",
        amount: 1540,
        value: 840.67,
        chain: "ethereum",
        protocol: "staking",
        logo: "images/sage-logo.png"
      },
    ],
  };
  
  // Mock pool data
  export const mockPools: PoolData[] = [
    {
      protocol: "aave",
      asset: "USDC",
      apy: 4.25,
      chain: "ethereum",
      chainIcon: "⚡",
      tvl: "$45.2M",
      userDeposit: 8500,
      logo: "/images/aave-logo.png",
    },
    {
      protocol: "compound",
      asset: "USDC",
      apy: 3.89,
      chain: "base",
      chainIcon: "🔵",
      tvl: "$23.7M",
      userDeposit: 3200,
      logo: "/images/compound-logo.png",
    },
    {
      protocol: "aave",
      asset: "USDC",
      apy: 4.12,
      chain: "arbitrum",
      chainIcon: "🔺",
      tvl: "$18.9M",
      logo: "/images/aave-logo.png",
    },
    {
      protocol: "compound",
      asset: "USDC",
      apy: 3.76,
      chain: "ethereum",
      chainIcon: "⚡",
      tvl: "$67.3M",
      logo: "/images/compound-logo.png",
    },
  ];
  
  // Mock transaction data
  export const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "deposit",
      asset: "USDC",
      amount: 5000,
      chain: "ethereum",
      protocol: "aave",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "completed",
      hash: "0x1234...5678",
    },
    {
      id: "2",
      type: "transfer",
      asset: "USDC",
      amount: 3000,
      chain: "base",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      status: "completed",
      hash: "0x5678...9012",
    },
    {
      id: "3",
      type: "stake",
      asset: "SAGE",
      amount: 1000,
      chain: "ethereum",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: "completed",
      hash: "0x9012...3456",
    },
    {
      id: "4",
      type: "deposit",
      asset: "USDC",
      amount: 2000,
      chain: "arbitrum",
      protocol: "compound",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: "pending",
    },
  ];
  
  // Mock AI suggestions
  export const mockAISuggestions = [
    {
      id: "1",
      title: "Optimize Your Yield",
      description: "Move 2,000 USDC from Compound Base to Aave Ethereum for +0.36% APY",
      potentialGain: "$72/year",
      action: "rebalance",
    },
    {
      id: "2",
      title: "Cross-Chain Opportunity",
      description: "Bridge to Arbitrum for lower gas fees on your next deposit",
      potentialGain: "Save ~$15 in gas",
      action: "bridge",
    },
    {
      id: "3",
      title: "Staking Rewards",
      description: "Stake your earned SAGE tokens to boost your weekly selection chances",
      potentialGain: "2x selection odds",
      action: "stake",
    },
  ];
  
  // Mock staking data
  export const mockStakingData = {
    totalStaked: 125000,
    yourStake: 1540,
    apy: 12.5,
    weeklySelection: {
      nextDraw: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      eligibleUsers: 1247,
      yourOdds: "1 in 249",
    },
    rewards: {
      earned: 45.67,
      claimable: 23.45,
    },
  };