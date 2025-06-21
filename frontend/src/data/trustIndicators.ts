export const TRUST_INDICATORS = [
  {
    id: "chainlink",
    text: "Powered by Chainlink Oracles",
    description: "Cross-Chain Transfers, reliable price feeds",
    image: "/images/chainlink-logo.png", // Add chainlink logo to public/images/
    category: "oracle"
  },
  {
    id: "security",
    text: "Non-Custodial & Secure",
    description: "Your keys, your crypto",
    image: "/images/security-shield.png", // Add security icon to public/images/
    category: "security"
  },
] as const

export const SUPPORTED_CHAINS = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    image: "/images/ethereum-logo.png", // Add to public/images/
    color: "#627EEA"
  },
  {
    id: "base",
    name: "Base",
    symbol: "BASE",
    image: "/images/base-logo.png", // Add to public/images/
    color: "#0052FF"
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    image: "/images/arbitrum-logo.png", // Add to public/images/
    color: "#28A0F0"
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    image: "/images/polygon-logo.png", // Add to public/images/
    color: "#8247E5"
  }
] as const

export const DEFI_PROTOCOLS = [
  {
    id: "aave",
    name: "Aave",
    description: "Lending & Borrowing",
    image: "/images/aave-logo.png", // Add to public/images/
    color: "#B6509E"
  },
  {
    id: "compound",
    name: "Compound",
    description: "Money Markets",
    image: "/images/compound-logo.png", // Add to public/images/
    color: "#00D395"
  },
  {
    id: "uniswap",
    name: "Uniswap",
    description: "DEX Trading",
    image: "/images/uniswap-logo.png", // Add to public/images/
    color: "#FF007A"
  },
  {
    id: "curve",
    name: "Curve",
    description: "Stable Swaps",
    image: "/images/curve-logo.jpeg", // Add to public/images/
    color: "#40E0D0"
  }
] as const