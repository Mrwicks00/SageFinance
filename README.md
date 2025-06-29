# SageFi - Your AI Financial Navigator for DeFi

![alt text](image.png)


## 🚀 Overview

SageFi is a revolutionary AI-powered financial platform that makes complex multi-chain finance accessible through natural language interactions. By combining ElizaOS AI agents with Chainlink's robust oracle infrastructure, SageFi eliminates the technical barriers that prevent mainstream adoption of decentralized finance.

Think of SageFi as your personal financial navigator - an intelligent assistant that understands your goals and executes sophisticated financial strategies across multiple blockchain networks, all through simple conversations.

## 🎯 Problem Statement

Current DeFi platforms suffer from:

- **Complexity Barrier**: Users need deep technical knowledge to navigate protocols
- **Fragmented Experience**: Assets scattered across multiple chains with no unified view
- **Decision Paralysis**: Too many yield options without guidance
- **Manual Management**: Constant monitoring required for optimal returns
- **High Learning Curve**: New users overwhelmed by DeFi terminology and processes

## 💡 Solution

SageFi introduces the world's first **Conversational Finance Platform** where users can:

### 🤖 Chat with AI for DeFi Operations
- *"Show me the best yield farming opportunities across all chains"*
- *"Swap 1000 USDC for ETH and stake it for maximum returns"*
- *"Rebalance my portfolio to reduce risk"*
- Natural language commands executed as blockchain transactions

### 🌉 Seamless Cross-Chain Operations
- **Chainlink CCIP Integration**: Instant cross-chain swaps and transfers
- **Multi-Chain Portfolio View**: Unified dashboard across Ethereum, Base, Arbitrum
- **Automated Bridge Selection**: AI chooses optimal routes for lowest fees

### 📊 Intelligent Yield Optimization
- **Chainlink Price Feeds**: Real-time market data for informed decisions
- **VRF-Powered Selection**: Fair, random allocation for diversified strategies
- **Automated Rebalancing**: Chainlink Keepers execute optimal portfolio adjustments

### 🎯 Smart Onboarding & Education
- **Social Login Integration**: Web2-style authentication with Web3 capabilities
- **Gasless First Transactions**: Sponsored transactions for new users
- **Interactive Tutorials**: AI guide walks users through DeFi concepts

## 🏗️ Architecture

### Smart Contracts (Chainlink-Powered)
- **YieldOptimizer.sol**: VRF for random strategy selection, Price Feeds for APY calculations
- **CrossChainManager.sol**: CCIP for multi-chain operations
- **AITreasury.sol**: Automated portfolio management with Chainlink Keepers
- **StablecoinVault.sol**: Dynamic rebalancing between USDC, USDT, DAI

### AI Agent Layer (ElizaOS)
- **DeFi Knowledge Base**: Comprehensive understanding of protocols and strategies
- **Transaction Executor**: Converts natural language to smart contract calls
- **Risk Assessor**: Evaluates user requests for safety and optimal outcomes
- **Educational Assistant**: Explains complex DeFi concepts in simple terms

### Frontend (React + TypeScript)
- **Conversational Interface**: Chat-first design with rich transaction previews
- **Portfolio Dashboard**: Real-time multi-chain asset tracking
- **Strategy Marketplace**: AI-curated yield opportunities
- **Mobile-Responsive**: Full functionality on all devices

## 🔧 Technology Stack

### Core Infrastructure
- **ElizaOS Framework** - Complete AI agent runtime and conversation management
- **Chainlink Oracle Network** (5 integrated products):
  - Price Feeds for real-time market data
  - VRF for verifiable randomness in yield selection
  - CCIP for cross-chain interoperability
  - Automation (Keepers) for scheduled portfolio rebalancing
  - Functions for external API calls and off-chain computation

### Blockchain Integration
- **Multi-Chain Support**: Ethereum, Base, Arbitrum networks
- **Wallet Infrastructure**: MetaMask, WalletConnect, Coinbase Wallet integration
- **DeFi Protocol Integrations**:
  - **DEX Aggregators**: 1inch, Paraswap for optimal swap routing
  - **Lending Protocols**: Aave, Compound for yield generation
  - **Decentralized Exchanges**: Uniswap V3 for liquidity provision
  - **Cross-Chain Bridges**: Chainlink CCIP for secure asset transfers

### Development Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Wagmi, Viem
- **Backend**: Node.js, Express, WebSocket servers for real-time data
- **Database**: PostgreSQL for user preferences and transaction history
- **RPC Providers**: Alchemy, Infura, QuickNode for blockchain connectivity

## 🌐 Supported Networks

### Mainnet (Production)
- Ethereum Mainnet
- Base
- Arbitrum One

### Testnet (Development)
- Ethereum Sepolia (Chain ID: 11155111)
- Base Sepolia (Chain ID: 84532)
- Arbitrum Sepolia (Chain ID: 421614)

## 📋 Smart Contract Addresses

### Yield Optimizer Contracts
```solidity
Sepolia:    0x543aeA3ad17fE0a4cfc8546f958d15BB2828e68B
Base:       0x2fE627AD81358FC3a8ccC197869ad347E487c3C0
Arbitrum:   0xA939e5f884f46a281Eac2c438a7337b890644b8C
```

### Protocol Integration Addresses

#### Aave Pools
```solidity
Sepolia:    0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
Base:       0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27
```

#### Compound Comet
```solidity
Sepolia:    0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e
Base:       0x571621Ce60Cebb0c1D442B5afb38B1663C6Bf017
```

### Supported USDC Addresses
- **Sepolia**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (Compound support)
- **Base Sepolia**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Compound support)
- **Arbitrum Sepolia**: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` (Aave support)

## 🎨 Design System

### Color Palette
- **Sage Gold**: `#F7B801` (main accent)
- **Deep Black**: `#0A0A0A` (backgrounds)
- **Pure White**: `#FFFFFF` (text & cards)
- **Dark Gray**: `#1A1A1A` (secondary backgrounds)
- **Success Green**: `#10B981` (positive actions)
- **Warning Orange**: `#F59E0B` (alerts)

### Design Principles
- Clean, modern glassmorphism effects
- Bold typography with excellent hierarchy
- Subtle animations and micro-interactions
- Mobile-first responsive design
- High contrast for accessibility
- Professional, trustworthy aesthetic

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- Testnet ETH for gas fees

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mrwicks00/SageFinance.git
cd sagefi
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Smart Contracts
cd ../contracts
npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp .env.example .env.local

# Configure your environment variables
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
CHAINLINK_VRF_SUBSCRIPTION_ID=your_subscription_id
ALCHEMY_API_KEY=your_alchemy_key
```

4. **Start Development Servers**

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend with ElizaOS
cd backend
npm run dev

# Terminal 3: Smart Contract Deployment (if needed)
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

### Quick Test

1. Visit `http://localhost:3000`
2. Connect your MetaMask wallet
3. Switch to Sepolia testnet
4. Get testnet USDC from faucet
5. Chat with SageFi: *"Show me yield opportunities for 1000 USDC"*

## 💬 User Experience

### Sample Conversation Flow

**User**: *"I want to put $10,000 to work but keep it safe"*

**🤖 SageFi**: *"Perfect! Let me analyze safe options across all chains..."*

*[Chainlink Price Feeds checking rates...]*

*"Found 3 excellent safe strategies:
1. Aave Multi-Chain: 4.5% APY across ETH/ARB/BASE
2. Stablecoin Farming: 5.2% APY with auto-rebalancing  
3. Conservative LP: 6.1% APY with lower risk pairs

Want details on any of these?"*

**User**: *"Tell me about the multi-chain option"*

**🤖 SageFi**: *"Great choice! Here's the breakdown:
• $4,000 → Ethereum Aave (4.2% APY)
• $3,000 → Arbitrum Aave (4.6% APY)  
• $3,000 → Base Moonwell (4.8% APY)

Diversified across 3 chains for safety
Monthly rebalancing with Chainlink automation
Easy exit anytime, no lock-up period

Ready to execute? I'll handle all the cross-chain setup."*

### Key AI Capabilities

1. **"Find yield for my tokens"** → AI shows best opportunities
2. **"Swap X for Y"** → Executes optimal route across chains
3. **"Stake my ETH"** → Chooses best staking option
4. **"Bridge to cheaper network"** → CCIP handles cross-chain
5. **"Rebalance my portfolio"** → AI rebalances based on risk
6. **"Set up automatic investing"** → Chainlink Keepers automation
7. **"Show me what I earned"** → Portfolio performance tracking
8. **"Explain this strategy"** → Educational AI explanations

## 🔐 Security Features

### Smart Contract Security
- **Non-custodial Architecture**: Users maintain control of funds
- **Chainlink Oracle Integration**: Battle-tested price data
- **Rate Limiting**: Prevents abuse with transfer limits
- **Reentrancy Protection**: Guards against common attack vectors
- **Multi-signature Controls**: Admin functions require multiple approvals

### AI Safety Measures
- **Transaction Preview**: All operations shown before execution
- **Risk Assessment**: AI evaluates safety of user requests
- **Spending Limits**: Configurable daily/weekly limits
- **Emergency Stops**: Immediate halt capability for suspicious activity

## 📈 Roadmap

### Phase 1: Hackathon MVP (2 Weeks) ✅
- [x] Core AI agent with basic DeFi operations
- [x] Chainlink Price Feeds and VRF integration
- [x] Simple cross-chain swaps via CCIP
- [x] Basic portfolio dashboard
- [x] Proof of concept with core Chainlink integrations

### Phase 2: Beta Launch (Month 1-3)
- [ ] Full yield optimization suite
- [ ] Mobile application
- [ ] Community features and gamification
- [ ] Advanced Chainlink integrations (Automation, Functions)
- [ ] Complete DeFi protocol integrations and user onboarding

### Phase 3: Scale (Month 4-6)
- [ ] Institutional features
- [ ] Additional chain support (10+ networks)
- [ ] Advanced AI capabilities and learning
- [ ] Partnership integrations with major DeFi protocols
- [ ] Enterprise features and mainstream adoption

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write comprehensive tests for new features
- Document all public APIs
- Follow conventional commit messages



## 🙏 Acknowledgments

- **Chainlink Team** for providing the robust oracle infrastructure
- **ElizaOS Community** for the powerful AI agent framework
- **DeFi Protocols** (Aave, Compound, Uniswap) for their open-source innovations
- **Web3 Community** for continuous feedback and support

## 📞 Contact & Support

- **Website**: https://sage-finance.vercel.app/
- **Twitter**: coming soon

## 🔗 Links

- [Chainlink Documentation](https://docs.chain.link/)
- [ElizaOS Framework](https://elizaos.ai/)
- [Aave Protocol](https://aave.com/)
- [Compound Protocol](https://compound.finance/)
- [CCIP Explorer](https://ccip.chain.link/)

---

**Built with ❤️ for the future of decentralized finance**

*SageFi - Making DeFi as easy as having a conversation*