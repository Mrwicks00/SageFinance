// src/data/yieldData.ts

export interface Chain {
  id: number;
  name: string;
  displayName: string;
  icon: string;
  explorer: string;
}

export interface Protocol {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
}

export interface PoolInfo {
  chainId: number;
  protocolId: string;
  token: Token;
  apy: number;
  totalDeposited: number;
  available: boolean;
  contractAddress?: string; // Optional: could be used for specific pool contract addresses
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 11155111, // Sepolia
    name: "sepolia",
    displayName: "Ethereum Sepolia",
    icon: "/icons/ethereum.svg",
    explorer: "https://sepolia.etherscan.io"
  },
  {
    id: 84532, // Base Sepolia
    name: "base-sepolia",
    displayName: "Base Sepolia",
    icon: "/icons/base.svg",
    explorer: "https://sepolia.basescan.org"
  },
  {
    id: 421614, // Arbitrum Sepolia
    name: "arbitrum-sepolia",
    displayName: "Arbitrum Sepolia",
    icon: "/icons/arbitrum.svg",
    explorer: "https://sepolia.arbiscan.io"
  }
];

export const PROTOCOLS: Protocol[] = [
  {
    id: "aave",
    name: "aave",
    displayName: "Aave",
    icon: "/icons/aave.svg",
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "compound",
    name: "compound",
    displayName: "Compound",
    icon: "/icons/compound.svg",
    color: "from-green-500 to-green-600"
  }
];

export const TOKEN_ADDRESSES = {
  usdc: {
    11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",   // Base Sepolia
    421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"   // Arbitrum Sepolia
  },
  link: {
    11155111: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5" // Sepolia only
  }
};

export const AVAILABLE_TOKENS: Record<number, Record<string, Token[]>> = {
  11155111: { // Sepolia
    aave: [
      {
        address: TOKEN_ADDRESSES.usdc[11155111],
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        icon: "/icons/usdc.svg"
      },
      {
        address: TOKEN_ADDRESSES.link[11155111],
        symbol: "LINK",
        name: "Chainlink Token",
        decimals: 18,
        icon: "/icons/link.svg"
      }
    ],
    compound: [
      {
        address: TOKEN_ADDRESSES.usdc[11155111],
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        icon: "/icons/usdc.svg"
      }
    ]
  },
  84532: { // Base Sepolia
    aave: [], // <<< Currently empty. If Aave on Base Sepolia is supported, add tokens here.
    compound: [
      {
        address: TOKEN_ADDRESSES.usdc[84532],
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        icon: "/icons/usdc.svg"
      }
    ]
  },
  421614: { // Arbitrum Sepolia
    aave: [
      {
        address: TOKEN_ADDRESSES.usdc[421614],
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        icon: "/icons/usdc.svg"
      }
    ],
    compound: [] // <<< Currently empty. If Compound on Arbitrum Sepolia is supported, add tokens here.
  }
};

export const POOL_DATA: PoolInfo[] = [
  {
    chainId: 11155111,
    protocolId: "aave",
    token: AVAILABLE_TOKENS[11155111].aave[0],
    apy: 4.2,
    totalDeposited: 125000,
    available: true
  },
  {
    chainId: 11155111,
    protocolId: "aave",
    token: AVAILABLE_TOKENS[11155111].aave[1],
    apy: 3.8,
    totalDeposited: 85000,
    available: true
  },
  {
    chainId: 11155111,
    protocolId: "compound",
    token: AVAILABLE_TOKENS[11155111].compound[0],
    apy: 4.5,
    totalDeposited: 98000,
    available: true
  },
  {
    chainId: 84532,
    protocolId: "compound",
    token: AVAILABLE_TOKENS[84532].compound[0],
    apy: 4.1,
    totalDeposited: 67000,
    available: true
  },
  {
    chainId: 421614,
    protocolId: "aave",
    token: AVAILABLE_TOKENS[421614].aave[0],
    apy: 4.7,
    totalDeposited: 54000,
    available: true
  }
];

export interface UserPosition {
  id: string;
  chainId: number;
  protocolId: string;
  token: Token;
  deposited: number;
  earned: number;
  apy: number;
  depositDate: string;
}

export const MOCK_USER_POSITIONS: UserPosition[] = [
  {
    id: "pos-1",
    chainId: 11155111,
    protocolId: "compound",
    token: AVAILABLE_TOKENS[11155111].compound[0],
    deposited: 1000,
    earned: 15.2,
    apy: 4.5,
    depositDate: "2024-12-01"
  },
  {
    id: "pos-2",
    chainId: 421614,
    protocolId: "aave",
    token: AVAILABLE_TOKENS[421614].aave[0],
    deposited: 500,
    earned: 8.7,
    apy: 4.7,
    depositDate: "2024-11-15"
  }
];

export interface WeeklyReward {
  week: string;
  totalParticipants: number;
  winners: string[];
  rewardAmount: number;
  status: "active" | "completed" | "upcoming";
}

export const WEEKLY_REWARDS: WeeklyReward[] = [
  {
    week: "Week 12",
    totalParticipants: 47,
    winners: [],
    rewardAmount: 500,
    status: "active"
  },
  {
    week: "Week 11", 
    totalParticipants: 42,
    winners: ["0x1234...5678", "0x9abc...def0", "0x2468...ace0", "0x1357...bdf9", "0x8642...cea1"],
    rewardAmount: 500,
    status: "completed"
  }
];

export function getPoolInfo(chainId: number, protocolId: string, tokenAddress: string): PoolInfo | undefined {
  return POOL_DATA.find(
    pool => pool.chainId === chainId &&
    pool.protocolId === protocolId &&
    pool.token.address.toLowerCase() === tokenAddress.toLowerCase()
  );
}

export function getAvailableTokens(chainId: number, protocolId: string): Token[] {
  return AVAILABLE_TOKENS[chainId]?.[protocolId] || [];
}

export function isProtocolAvailable(chainId: number, protocolId: string): boolean {
  const tokens = getAvailableTokens(chainId, protocolId);
  return tokens.length > 0;
}