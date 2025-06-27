// services/walletDataService.ts
import { formatUnits } from 'viem'
// import { useWalletData } from "@/hooks/useWalletData"

export interface TokenHolding {
  symbol: string
  name: string
  balance: string
  decimals: number
  contractAddress: string
  logoURI?: string
  valueInUSD?: string
}

export interface WalletData {
  address: string
  chainId: number
  nativeBalance: string
  tokenHoldings: TokenHolding[]
  totalValueUSD?: string
}

class WalletDataService {
  private readonly ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  private readonly MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY

  // Get native balance using Alchemy
  async getNativeBalance(address: string, chainId: number): Promise<string> {
    try {
      const alchemyUrl = this.getAlchemyUrl(chainId)
      if (!alchemyUrl) throw new Error('Unsupported chain')

      const response = await fetch(alchemyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      })

      const data = await response.json()
      const balanceWei = data.result
      const balanceEth = formatUnits(BigInt(balanceWei), 18)
      
      return balanceEth
    } catch (error) {
      console.error('Error fetching native balance:', error)
      return '0'
    }
  }

  // Get token holdings using Alchemy
  async getTokenHoldings(address: string, chainId: number): Promise<TokenHolding[]> {
    try {
      const alchemyUrl = this.getAlchemyUrl(chainId)
      if (!alchemyUrl) return []

      const response = await fetch(`${alchemyUrl}/getTokenBalances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getTokenBalances',
          params: [address],
          id: 1,
        }),
      })

      const data = await response.json()
      const tokenBalances = data.result?.tokenBalances || []

      // Filter out zero balances and get token metadata
      const nonZeroBalances = tokenBalances.filter(
        (token: { tokenBalance: string }) => parseInt(token.tokenBalance, 16) > 0
      )

      const tokensWithMetadata = await Promise.all(
        nonZeroBalances.map(async (token: { contractAddress: string; tokenBalance: string }) => {
          const metadata = await this.getTokenMetadata(token.contractAddress, chainId)
          const balance = formatUnits(BigInt(token.tokenBalance), metadata.decimals)
          
          return {
            symbol: metadata.symbol,
            name: metadata.name,
            balance,
            decimals: metadata.decimals,
            contractAddress: token.contractAddress,
            logoURI: metadata.logoURI,
          }
        })
      )

      return tokensWithMetadata
    } catch (error) {
      console.error('Error fetching token holdings:', error)
      return []
    }
  }

  // Alternative: Get token holdings using Moralis
  async getTokenHoldingsMoralis(address: string, chainId: number): Promise<TokenHolding[]> {
    try {
      if (!this.MORALIS_API_KEY) {
        throw new Error('Moralis API key not configured')
      }

      const chainName = this.getChainName(chainId)
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2/${address}/erc20?chain=${chainName}&exclude_spam=true`,
        {
          headers: {
            'X-API-Key': this.MORALIS_API_KEY,
          },
        }
      )

      const data = await response.json()
      
      return data.map((token: { symbol: string; name: string; balance: string; decimals: number; token_address: string; logo?: string; usd_value?: number }) => ({
        symbol: token.symbol,
        name: token.name,
        balance: formatUnits(BigInt(token.balance), token.decimals),
        decimals: token.decimals,
        contractAddress: token.token_address,
        logoURI: token.logo,
        valueInUSD: token.usd_value?.toFixed(2),
      }))
    } catch (error) {
      console.error('Error fetching token holdings from Moralis:', error)
      return []
    }
  }

  // Get token metadata
  async getTokenMetadata(contractAddress: string, chainId: number) {
    try {
      const alchemyUrl = this.getAlchemyUrl(chainId)
      if (!alchemyUrl) throw new Error('Unsupported chain')

      const response = await fetch(`${alchemyUrl}/getTokenMetadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getTokenMetadata',
          params: [contractAddress],
          id: 1,
        }),
      })

      const data = await response.json()
      return {
        symbol: data.result?.symbol || 'UNKNOWN',
        name: data.result?.name || 'Unknown Token',
        decimals: data.result?.decimals || 18,
        logoURI: data.result?.logo,
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error)
      return {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
      }
    }
  }

  // Get complete wallet data
  async getWalletData(address: string, chainId: number): Promise<WalletData> {
    try {
      const [nativeBalance, tokenHoldings] = await Promise.all([
        this.getNativeBalance(address, chainId),
        this.getTokenHoldings(address, chainId),
      ])

      return {
        address,
        chainId,
        nativeBalance,
        tokenHoldings,
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      return {
        address,
        chainId,
        nativeBalance: '0',
        tokenHoldings: [],
      }
    }
  }

  // Helper methods
  private getAlchemyUrl(chainId: number): string | null {
    if (!this.ALCHEMY_API_KEY) return null
    
    const networks: Record<number, string> = {
      1: `https://eth-mainnet.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`,
      11155111: `https://eth-sepolia.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`,
      137: `https://polygon-mainnet.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`,
      80001: `https://polygon-mumbai.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`,
    }
    
    return networks[chainId] || null
  }

  private getChainName(chainId: number): string {
    const chains: Record<number, string> = {
      1: 'eth',
      11155111: 'sepolia',
      137: 'polygon',
      80001: 'mumbai',
      56: 'bsc',
      43114: 'avalanche',
    }
    
    return chains[chainId] || 'eth'
  }
}

export const walletDataService = new WalletDataService()

