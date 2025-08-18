/**
 * NOWNodes Service - Unified Web3 Infrastructure
 * Provides RPC access and market data for 110+ blockchains
 */

import { ethers } from 'ethers'

export interface NOWNodesConfig {
  apiKey: string
  baseUrl: string
  marketDataUrl: string
}

export interface ChainConfig {
  chainId: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  isTestnet?: boolean
}

export interface TokenPrice {
  symbol: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  lastUpdated: string
}

export interface TokenBalance {
  contractAddress: string
  symbol: string
  name: string
  decimals: number
  balance: string
  balanceFormatted: string
  usdValue: number
}

export class NOWNodesService {
  private config: NOWNodesConfig
  private providers: Map<number, ethers.JsonRpcProvider> = new Map()

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://api.nownodes.io',
      marketDataUrl: 'https://market-data-nownodes.io/api/v1'
    }
  }

  /**
   * Supported blockchain configurations
   */
  public static readonly CHAINS: Record<number, ChainConfig> = {
    // Ethereum Mainnet
    1: {
      chainId: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: 'https://eth.nownodes.io',
      explorerUrl: 'https://etherscan.io'
    },
    // Binance Smart Chain
    56: {
      chainId: 56,
      name: 'BNB Smart Chain',
      symbol: 'BNB',
      rpcUrl: 'https://bsc.nownodes.io',
      explorerUrl: 'https://bscscan.com'
    },
    // Polygon
    137: {
      chainId: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      rpcUrl: 'https://matic.nownodes.io',
      explorerUrl: 'https://polygonscan.com'
    },
    // Arbitrum One
    42161: {
      chainId: 42161,
      name: 'Arbitrum One',
      symbol: 'ETH',
      rpcUrl: 'https://arb.nownodes.io',
      explorerUrl: 'https://arbiscan.io'
    },
    // Optimism
    10: {
      chainId: 10,
      name: 'Optimism',
      symbol: 'ETH',
      rpcUrl: 'https://op.nownodes.io',
      explorerUrl: 'https://optimistic.etherscan.io'
    },
    // Avalanche C-Chain
    43114: {
      chainId: 43114,
      name: 'Avalanche',
      symbol: 'AVAX',
      rpcUrl: 'https://avax.nownodes.io',
      explorerUrl: 'https://snowtrace.io'
    },
    // Fantom
    250: {
      chainId: 250,
      name: 'Fantom',
      symbol: 'FTM',
      rpcUrl: 'https://ftm.nownodes.io',
      explorerUrl: 'https://ftmscan.com'
    },
    // Base
    8453: {
      chainId: 8453,
      name: 'Base',
      symbol: 'ETH',
      rpcUrl: 'https://base.nownodes.io',
      explorerUrl: 'https://basescan.org'
    }
  }

  /**
   * Get RPC provider for a specific chain
   */
  public getProvider(chainId: number): ethers.JsonRpcProvider {
    if (!this.providers.has(chainId)) {
      const chain = NOWNodesService.CHAINS[chainId]
      if (!chain) {
        throw new Error(`Unsupported chain ID: ${chainId}`)
      }

      const rpcUrl = `${chain.rpcUrl}/${this.config.apiKey}`
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      this.providers.set(chainId, provider)
    }

    return this.providers.get(chainId)!
  }

  /**
   * Get native token balance for an address
   */
  public async getNativeBalance(address: string, chainId: number): Promise<string> {
    const provider = this.getProvider(chainId)
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  }

  /**
   * Get ERC-20 token balance
   */
  public async getTokenBalance(
    address: string,
    tokenAddress: string,
    chainId: number
  ): Promise<TokenBalance | null> {
    try {
      const provider = this.getProvider(chainId)
      
      // ERC-20 ABI for basic token operations
      const tokenABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
        'function name() view returns (string)'
      ]

      const contract = new ethers.Contract(tokenAddress, tokenABI, provider)
      
      const [balance, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
        contract.name()
      ])

      const balanceFormatted = ethers.formatUnits(balance, decimals)
      
      // Get USD value from market data
      const price = await this.getTokenPrice(symbol)
      const usdValue = parseFloat(balanceFormatted) * (price?.price || 0)

      return {
        contractAddress: tokenAddress,
        symbol,
        name,
        decimals,
        balance: balance.toString(),
        balanceFormatted,
        usdValue
      }
    } catch (error) {
      console.error(`Error getting token balance for ${tokenAddress}:`, error)
      return null
    }
  }

  /**
   * Get all token balances for an address (requires additional indexing service)
   */
  public async getAllTokenBalances(address: string, chainId: number): Promise<TokenBalance[]> {
    // This would typically require an indexing service or scanning known token contracts
    // For now, we'll return native balance and common tokens
    const balances: TokenBalance[] = []

    try {
      // Get native token balance
      const nativeBalance = await this.getNativeBalance(address, chainId)
      const chain = NOWNodesService.CHAINS[chainId]
      
      if (parseFloat(nativeBalance) > 0) {
        const nativePrice = await this.getTokenPrice(chain.symbol)
        balances.push({
          contractAddress: '0x0000000000000000000000000000000000000000',
          symbol: chain.symbol,
          name: chain.name,
          decimals: 18,
          balance: ethers.parseEther(nativeBalance).toString(),
          balanceFormatted: nativeBalance,
          usdValue: parseFloat(nativeBalance) * (nativePrice?.price || 0)
        })
      }

      // Add common tokens based on chain
      const commonTokens = this.getCommonTokens(chainId)
      for (const tokenAddress of commonTokens) {
        const tokenBalance = await this.getTokenBalance(address, tokenAddress, chainId)
        if (tokenBalance && parseFloat(tokenBalance.balanceFormatted) > 0) {
          balances.push(tokenBalance)
        }
      }

    } catch (error) {
      console.error(`Error getting balances for ${address} on chain ${chainId}:`, error)
    }

    return balances
  }

  /**
   * Get token price from CoinGecko API (fallback while NOWNodes market data is being configured)
   */
  public async getTokenPrice(symbol: string): Promise<TokenPrice | null> {
    try {
      // Map common symbols to CoinGecko IDs
      const symbolMap: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
        'MATIC': 'matic-network',
        'AVAX': 'avalanche-2',
        'FTM': 'fantom',
        'USDT': 'tether',
        'USDC': 'usd-coin',
        'DAI': 'dai'
      }

      const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase()
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data[coinId]) {
        console.warn(`No price data available for ${symbol}`)
        return null
      }

      const priceData = data[coinId]
      
      return {
        symbol: symbol.toUpperCase(),
        price: priceData.usd || 0,
        change24h: priceData.usd_24h_change || 0,
        marketCap: priceData.usd_market_cap || 0,
        volume24h: priceData.usd_24h_vol || 0,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error getting price for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Get multiple token prices at once
   */
  public async getMultipleTokenPrices(symbols: string[]): Promise<Record<string, TokenPrice>> {
    const prices: Record<string, TokenPrice> = {}
    
    try {
      // NOWNodes price API requires individual requests for each symbol
      // We'll make them in parallel for better performance
      const pricePromises = symbols.map(symbol => this.getTokenPrice(symbol))
      const priceResults = await Promise.all(pricePromises)
      
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i].toUpperCase()
        const price = priceResults[i]
        if (price) {
          prices[symbol] = price
        }
      }
    } catch (error) {
      console.error('Error getting multiple token prices:', error)
      
      // Fallback to sequential requests
      for (const symbol of symbols) {
        const price = await this.getTokenPrice(symbol)
        if (price) {
          prices[symbol.toUpperCase()] = price
        }
      }
    }

    return prices
  }

  /**
   * Get transaction by hash
   */
  public async getTransaction(txHash: string, chainId: number) {
    const provider = this.getProvider(chainId)
    return await provider.getTransaction(txHash)
  }

  /**
   * Get transaction receipt
   */
  public async getTransactionReceipt(txHash: string, chainId: number) {
    const provider = this.getProvider(chainId)
    return await provider.getTransactionReceipt(txHash)
  }

  /**
   * Get block information
   */
  public async getBlock(blockNumber: number | string, chainId: number) {
    const provider = this.getProvider(chainId)
    return await provider.getBlock(blockNumber)
  }

  /**
   * Get current gas price
   */
  public async getGasPrice(chainId: number): Promise<string> {
    const provider = this.getProvider(chainId)
    const gasPrice = await provider.getFeeData()
    return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')
  }

  /**
   * Get common token addresses for a chain
   */
  private getCommonTokens(chainId: number): string[] {
    const commonTokens: Record<number, string[]> = {
      // Ethereum
      1: [
        '0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'  // WETH
      ],
      // BSC
      56: [
        '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
        '0x55d398326f99059fF775485246999027B3197955', // USDT
        '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', // DAI
        '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'  // BTCB
      ],
      // Polygon
      137: [
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
        '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'  // WBTC
      ]
    }

    return commonTokens[chainId] || []
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Test Ethereum mainnet connection
      const provider = this.getProvider(1)
      const blockNumber = await provider.getBlockNumber()
      return blockNumber > 0
    } catch (error) {
      console.error('NOWNodes health check failed:', error)
      return false
    }
  }

  /**
   * Get supported chains
   */
  public static getSupportedChains(): ChainConfig[] {
    return Object.values(NOWNodesService.CHAINS)
  }

  /**
   * Check if a chain is supported
   */
  public static isChainSupported(chainId: number): boolean {
    return chainId in NOWNodesService.CHAINS
  }
}