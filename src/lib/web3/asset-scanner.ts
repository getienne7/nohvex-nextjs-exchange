/**
 * Multi-Chain Asset Scanner
 * Scans wallet addresses across different chains to discover assets
 */

import { WalletAsset } from './wallet-connector'

export interface ChainConfig {
  chainId: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  coingeckoId: string
}

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  logoUrl?: string
}

export class AssetScanner {
  private static instance: AssetScanner
  private chainConfigs: Map<number, ChainConfig> = new Map()

  static getInstance(): AssetScanner {
    if (!AssetScanner.instance) {
      AssetScanner.instance = new AssetScanner()
    }
    return AssetScanner.instance
  }

  constructor() {
    this.initializeChainConfigs()
  }

  private initializeChainConfigs(): void {
    const configs: ChainConfig[] = [
      {
        chainId: 1,
        name: 'Ethereum',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
        explorerUrl: 'https://etherscan.io',
        coingeckoId: 'ethereum'
      },
      {
        chainId: 56,
        name: 'BNB Smart Chain',
        symbol: 'BNB',
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        explorerUrl: 'https://bscscan.com',
        coingeckoId: 'binancecoin'
      },
      {
        chainId: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        rpcUrl: 'https://polygon-rpc.com/',
        explorerUrl: 'https://polygonscan.com',
        coingeckoId: 'matic-network'
      },
      {
        chainId: 42161,
        name: 'Arbitrum One',
        symbol: 'ETH',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
        coingeckoId: 'ethereum'
      },
      {
        chainId: 10,
        name: 'Optimism',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.optimism.io',
        explorerUrl: 'https://optimistic.etherscan.io',
        coingeckoId: 'ethereum'
      }
    ]

    configs.forEach(config => {
      this.chainConfigs.set(config.chainId, config)
    })
  }

  // Scan all assets for a wallet address across all supported chains
  async scanAllAssets(walletAddress: string): Promise<Map<number, WalletAsset[]>> {
    const allAssets = new Map<number, WalletAsset[]>()
    
    const scanPromises = Array.from(this.chainConfigs.keys()).map(async (chainId) => {
      try {
        const assets = await this.scanChainAssets(walletAddress, chainId)
        if (assets.length > 0) {
          allAssets.set(chainId, assets)
        }
      } catch (error) {
        console.error(`Failed to scan assets on chain ${chainId}:`, error)
      }
    })

    await Promise.allSettled(scanPromises)
    return allAssets
  }

  // Scan assets on a specific chain
  async scanChainAssets(walletAddress: string, chainId: number): Promise<WalletAsset[]> {
    const chainConfig = this.chainConfigs.get(chainId)
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chainId}`)
    }

    const assets: WalletAsset[] = []

    try {
      // Get native token balance
      const nativeBalance = await this.getNativeBalance(walletAddress, chainId)
      if (parseFloat(nativeBalance) > 0) {
        assets.push({
          address: '0x0000000000000000000000000000000000000000', // Native token
          symbol: chainConfig.symbol,
          name: chainConfig.name,
          balance: nativeBalance,
          decimals: 18,
          usdValue: await this.getTokenPrice(chainConfig.coingeckoId)
        })
      }

      // Get ERC-20 token balances
      const tokenAssets = await this.getTokenBalances(walletAddress, chainId)
      assets.push(...tokenAssets)

    } catch (error) {
      console.error(`Error scanning chain ${chainId}:`, error)
    }

    return assets
  }

  // Get native token balance using RPC
  private async getNativeBalance(walletAddress: string, chainId: number): Promise<string> {
    const chainConfig = this.chainConfigs.get(chainId)
    if (!chainConfig) throw new Error(`Chain ${chainId} not configured`)

    try {
      const response = await fetch(chainConfig.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [walletAddress, 'latest'],
          id: 1
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error.message)

      // Convert from wei to ether
      const balanceWei = BigInt(data.result)
      const balanceEth = Number(balanceWei) / Math.pow(10, 18)
      return balanceEth.toString()
    } catch (error) {
      console.error(`Failed to get native balance for ${walletAddress} on chain ${chainId}:`, error)
      return '0'
    }
  }

  // Get ERC-20 token balances using multiple data sources
  private async getTokenBalances(walletAddress: string, chainId: number): Promise<WalletAsset[]> {
    const assets: WalletAsset[] = []
    
    try {
      // Try Moralis first
      const moralisAssets = await this.getMoralisTokenBalances(walletAddress, chainId)
      if (moralisAssets.length > 0) {
        assets.push(...moralisAssets)
      } else {
        // Fallback to Alchemy
        const alchemyAssets = await this.getAlchemyTokenBalances(walletAddress, chainId)
        assets.push(...alchemyAssets)
      }
      
      // Filter out zero balances and add USD values
      const filteredAssets = assets.filter(asset => parseFloat(asset.balance) > 0)
      
      // Add USD values
      for (const asset of filteredAssets) {
        if (!asset.usdValue) {
          asset.usdValue = await this.getTokenPriceByContract(asset.address, chainId)
        }
      }
      
      return filteredAssets
    } catch (error) {
      console.error(`Failed to get token balances for ${walletAddress} on chain ${chainId}:`, error)
      return []
    }
  }

  // Get token balances from Moralis
  private async getMoralisTokenBalances(walletAddress: string, chainId: number): Promise<WalletAsset[]> {
    try {
      const moralisChainMap: Record<number, string> = {
        1: 'eth',
        56: 'bsc',
        137: 'polygon',
        42161: 'arbitrum',
        10: 'optimism'
      }
      
      const chain = moralisChainMap[chainId]
      if (!chain) return []
      
      const apiKey = process.env.MORALIS_API_KEY
      if (!apiKey) {
        console.warn('Moralis API key not configured')
        return []
      }
      
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2/${walletAddress}/erc20?chain=${chain}`,
        {
          headers: {
            'X-API-Key': apiKey
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      return data.map((token: any) => ({
        address: token.token_address,
        symbol: token.symbol,
        name: token.name,
        balance: ethers.formatUnits(token.balance, token.decimals),
        decimals: token.decimals,
        logoUrl: token.logo
      }))
    } catch (error) {
      console.error('Moralis token balance fetch failed:', error)
      return []
    }
  }

  // Get token balances from Alchemy
  private async getAlchemyTokenBalances(walletAddress: string, chainId: number): Promise<WalletAsset[]> {
    try {
      const alchemyNetworks: Record<number, string> = {
        1: 'eth-mainnet',
        137: 'polygon-mainnet',
        42161: 'arb-mainnet',
        10: 'opt-mainnet'
      }
      
      const network = alchemyNetworks[chainId]
      if (!network) return []
      
      const apiKey = process.env.ALCHEMY_API_KEY
      if (!apiKey) {
        console.warn('Alchemy API key not configured')
        return []
      }
      
      const response = await fetch(
        `https://${network}.g.alchemy.com/v2/${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'alchemy_getTokenBalances',
            params: [walletAddress]
          })
        }
      )
      
      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.status}`)
      }
      
      const data = await response.json()
      const assets: WalletAsset[] = []
      
      for (const token of data.result.tokenBalances) {
        if (token.tokenBalance === '0x0') continue
        
        // Get token metadata
        const metadataResponse = await fetch(
          `https://${network}.g.alchemy.com/v2/${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: 1,
              jsonrpc: '2.0',
              method: 'alchemy_getTokenMetadata',
              params: [token.contractAddress]
            })
          }
        )
        
        const metadata = await metadataResponse.json()
        const tokenInfo = metadata.result
        
        if (tokenInfo) {
          assets.push({
            address: token.contractAddress,
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            balance: ethers.formatUnits(token.tokenBalance, tokenInfo.decimals),
            decimals: tokenInfo.decimals,
            logoUrl: tokenInfo.logo
          })
        }
      }
      
      return assets
    } catch (error) {
      console.error('Alchemy token balance fetch failed:', error)
      return []
    }
  }

  // Get token price by contract address
  private async getTokenPriceByContract(contractAddress: string, chainId: number): Promise<number> {
    try {
      const platformMap: Record<number, string> = {
        1: 'ethereum',
        56: 'binance-smart-chain',
        137: 'polygon-pos',
        42161: 'arbitrum-one',
        10: 'optimistic-ethereum'
      }
      
      const platform = platformMap[chainId]
      if (!platform) return 0
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd`
      )
      
      if (!response.ok) return 0
      
      const data = await response.json()
      return data[contractAddress.toLowerCase()]?.usd || 0
    } catch (error) {
      console.error(`Failed to get price for ${contractAddress}:`, error)
      return 0
    }
  }

  // Get token price from CoinGecko
  private async getTokenPrice(coingeckoId: string): Promise<number> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`
      )
      const data = await response.json()
      return data[coingeckoId]?.usd || 0
    } catch (error) {
      console.error(`Failed to get price for ${coingeckoId}:`, error)
      return 0
    }
  }

  // Get supported chains
  getSupportedChains(): ChainConfig[] {
    return Array.from(this.chainConfigs.values())
  }

  // Get chain config
  getChainConfig(chainId: number): ChainConfig | undefined {
    return this.chainConfigs.get(chainId)
  }

  // Calculate total portfolio value across all chains
  calculateTotalValue(assetsMap: Map<number, WalletAsset[]>): number {
    let totalValue = 0
    
    for (const assets of assetsMap.values()) {
      for (const asset of assets) {
        if (asset.usdValue) {
          totalValue += parseFloat(asset.balance) * asset.usdValue
        }
      }
    }
    
    return totalValue
  }

  // Get portfolio distribution by chain
  getChainDistribution(assetsMap: Map<number, WalletAsset[]>): Array<{
    chainId: number
    chainName: string
    value: number
    percentage: number
  }> {
    const totalValue = this.calculateTotalValue(assetsMap)
    const distribution: Array<{
      chainId: number
      chainName: string
      value: number
      percentage: number
    }> = []

    for (const [chainId, assets] of assetsMap.entries()) {
      const chainConfig = this.chainConfigs.get(chainId)
      if (!chainConfig) continue

      let chainValue = 0
      for (const asset of assets) {
        if (asset.usdValue) {
          chainValue += parseFloat(asset.balance) * asset.usdValue
        }
      }

      distribution.push({
        chainId,
        chainName: chainConfig.name,
        value: chainValue,
        percentage: totalValue > 0 ? (chainValue / totalValue) * 100 : 0
      })
    }

    return distribution.sort((a, b) => b.value - a.value)
  }
}

// Global asset scanner instance
export const assetScanner = AssetScanner.getInstance()