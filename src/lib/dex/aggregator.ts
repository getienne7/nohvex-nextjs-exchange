/**
 * DEX Aggregator
 * Finds the best prices across multiple DEXs and executes trades
 */

import { ethers } from 'ethers'
import { BaseDEX, TradeParams, QuoteResult, TradeResult, SUPPORTED_CHAINS, Token } from './index'
import { UniswapV3DEX } from './uniswap-v3'
import { PancakeSwapV3DEX } from './pancakeswap-v3'

export interface AggregatedQuote extends QuoteResult {
  dexName: string
  dex: BaseDEX
  confidence: number // 0-100, based on liquidity and reliability
}

export interface BestRouteResult {
  bestQuote: AggregatedQuote
  allQuotes: AggregatedQuote[]
  savings: string // Amount saved compared to worst quote
  savingsPercentage: number
}

export class DEXAggregator {
  private dexes: BaseDEX[] = []
  private providers: Map<number, ethers.Provider> = new Map()

  constructor() {
    this.initializeProviders()
    this.initializeDEXes()
  }

  private initializeProviders() {
    // Initialize providers for each supported chain
    Object.values(SUPPORTED_CHAINS).forEach(chain => {
      const provider = new ethers.JsonRpcProvider(chain.rpcUrl)
      this.providers.set(chain.chainId, provider)
    })
  }

  private initializeDEXes() {
    // Initialize all supported DEXs
    this.providers.forEach((provider, chainId) => {
      // Uniswap V3 (Ethereum)
      if (chainId === 1) {
        this.dexes.push(new UniswapV3DEX(provider, chainId))
      }
      
      // PancakeSwap V3 (BSC)
      if (chainId === 56) {
        this.dexes.push(new PancakeSwapV3DEX(provider, chainId))
      }
      
      // Add more DEXs as needed
    })
  }

  /**
   * Get quotes from all supported DEXs for a given trade
   */
  async getAllQuotes(params: TradeParams): Promise<AggregatedQuote[]> {
    const quotes: AggregatedQuote[] = []
    
    // Get quotes from all compatible DEXs
    const quotePromises = this.dexes
      .filter(dex => dex.isSupported(params.tokenIn.chainId))
      .map(async (dex) => {
        try {
          const quote = await dex.getQuote(params)
          const confidence = this.calculateConfidence(quote, dex)
          
          return {
            ...quote,
            dexName: dex.getName(),
            dex,
            confidence
          } as AggregatedQuote
        } catch (error) {
          console.warn(`Failed to get quote from ${dex.getName()}:`, error)
          return null
        }
      })

    const results = await Promise.allSettled(quotePromises)
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        quotes.push(result.value)
      }
    })

    return quotes.sort((a, b) => parseFloat(b.amountOut) - parseFloat(a.amountOut))
  }

  /**
   * Find the best route across all DEXs
   */
  async findBestRoute(params: TradeParams): Promise<BestRouteResult> {
    const allQuotes = await this.getAllQuotes(params)
    
    if (allQuotes.length === 0) {
      throw new Error('No quotes available for this trade')
    }

    const bestQuote = allQuotes[0] // Already sorted by amount out
    const worstQuote = allQuotes[allQuotes.length - 1]
    
    const savings = (parseFloat(bestQuote.amountOut) - parseFloat(worstQuote.amountOut)).toString()
    const savingsPercentage = allQuotes.length > 1 
      ? ((parseFloat(bestQuote.amountOut) - parseFloat(worstQuote.amountOut)) / parseFloat(worstQuote.amountOut)) * 100
      : 0

    return {
      bestQuote,
      allQuotes,
      savings,
      savingsPercentage
    }
  }

  /**
   * Execute trade using the best available DEX
   */
  async executeBestTrade(params: TradeParams, signer: ethers.Signer): Promise<TradeResult & { dexUsed: string }> {
    const bestRoute = await this.findBestRoute(params)
    const result = await bestRoute.bestQuote.dex.executeTrade(params, signer)
    
    return {
      ...result,
      dexUsed: bestRoute.bestQuote.dexName
    }
  }

  /**
   * Get supported tokens for a specific chain
   */
  getSupportedTokens(chainId: number): Token[] {
    // This would typically come from a token list API
    // For now, return common tokens based on chain
    const commonTokens: { [key: number]: Token[] } = {
      1: [ // Ethereum
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'WETH',
          name: 'Wrapped Ether',
          decimals: 18,
          chainId: 1
        },
        {
          address: '0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chainId: 1
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          chainId: 1
        }
      ],
      56: [ // BSC
        {
          address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          symbol: 'WBNB',
          name: 'Wrapped BNB',
          decimals: 18,
          chainId: 56
        },
        {
          address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 18,
          chainId: 56
        },
        {
          address: '0x55d398326f99059fF775485246999027B3197955',
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 18,
          chainId: 56
        }
      ]
    }

    return commonTokens[chainId] || []
  }

  /**
   * Calculate confidence score for a quote
   */
  private calculateConfidence(quote: QuoteResult, dex: BaseDEX): number {
    let confidence = 100

    // Reduce confidence based on price impact
    if (quote.priceImpact > 5) confidence -= 30
    else if (quote.priceImpact > 2) confidence -= 15
    else if (quote.priceImpact > 1) confidence -= 5

    // Adjust based on DEX reputation (simplified)
    const dexName = dex.getName().toLowerCase()
    if (dexName.includes('uniswap')) confidence += 10
    else if (dexName.includes('pancakeswap')) confidence += 5

    // Ensure confidence is between 0 and 100
    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * Get real-time price for a token pair
   */
  async getTokenPrice(tokenA: Token, tokenB: Token): Promise<number> {
    try {
      const params: TradeParams = {
        tokenIn: tokenA,
        tokenOut: tokenB,
        amountIn: '1',
        slippageTolerance: 100 // 1%
      }

      const bestRoute = await this.findBestRoute(params)
      return parseFloat(bestRoute.bestQuote.amountOut)
    } catch (error) {
      console.error('Failed to get token price:', error)
      return 0
    }
  }

  /**
   * Estimate gas costs for a trade
   */
  async estimateGasCosts(params: TradeParams): Promise<{ [dexName: string]: string }> {
    const quotes = await this.getAllQuotes(params)
    const gasCosts: { [dexName: string]: string } = {}

    quotes.forEach(quote => {
      gasCosts[quote.dexName] = quote.gasEstimate
    })

    return gasCosts
  }
}