/**
 * DEX Aggregator
 * Finds the best prices across multiple DEXs and executes trades
 */

import { ethers } from 'ethers'
import { BaseDEX, TradeParams, QuoteResult, TradeResult, SUPPORTED_CHAINS, Token } from './index'
import { UniswapV3DEX } from './uniswap-v3'
import { PancakeSwapV3DEX } from './pancakeswap-v3'
import { BridgeAggregator, BridgeParams, AggregatedBridgeQuote } from './bridge-aggregator'

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
  isCrossChain?: boolean
  bridgeQuote?: AggregatedBridgeQuote
}

export interface CrossChainSwapParams {
  fromChain: number
  toChain: number
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  slippageTolerance: number
  recipient: string
  prioritizeSpeed?: boolean
}

export interface CrossChainSwapResult {
  sourceSwap?: TradeResult & { dexUsed: string }
  bridge: any // BridgeResult from bridge-aggregator
  destSwap?: TradeResult & { dexUsed: string }
  totalGasEstimate: string
  estimatedTime: number
  steps: SwapStep[]
}

export interface SwapStep {
  step: number
  action: string
  chain: number
  protocol: string
  txHash?: string
  status: 'pending' | 'completed' | 'failed'
  estimatedTime: number
}

export class DEXAggregator {
  private dexes: BaseDEX[] = []
  private providers: Map<number, ethers.Provider> = new Map()
  private bridgeAggregator: BridgeAggregator

  constructor() {
    this.initializeProviders()
    this.initializeDEXes()
    this.bridgeAggregator = new BridgeAggregator()
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
   * Find the best route across all DEXs (enhanced for cross-chain awareness)
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
      savingsPercentage,
      isCrossChain: false
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
   * Get cross-chain swap quote with optimal routing
   */
  async getCrossChainQuote(params: CrossChainSwapParams): Promise<CrossChainSwapResult> {
    const { fromChain, toChain, tokenIn, tokenOut, amountIn, slippageTolerance, recipient, prioritizeSpeed = false } = params

    if (fromChain === toChain) {
      throw new Error('Use regular swap for same-chain trades')
    }

    const steps: SwapStep[] = []
    let totalGasEstimate = '0'
    let estimatedTime = 0

    // Step 1: Find best intermediate token for bridging (usually USDC, USDT, or native token)
    const bridgeToken = this.findOptimalBridgeToken(fromChain, toChain)
    
    // Step 2: Get swap quote on source chain (if needed)
    let sourceSwapQuote: AggregatedQuote | null = null
    if (tokenIn.address.toLowerCase() !== bridgeToken.address.toLowerCase()) {
      const sourceSwapParams: TradeParams = {
        tokenIn,
        tokenOut: bridgeToken,
        amountIn,
        slippageTolerance
      }
      const sourceRoute = await this.findBestRoute(sourceSwapParams)
      sourceSwapQuote = sourceRoute.bestQuote
      
      totalGasEstimate = (parseFloat(totalGasEstimate) + parseFloat(sourceSwapQuote.gasEstimate)).toString()
      estimatedTime += 3 // 3 minutes for source swap
      
      steps.push({
        step: 1,
        action: `Swap ${tokenIn.symbol} to ${bridgeToken.symbol} on ${this.getChainName(fromChain)}`,
        chain: fromChain,
        protocol: sourceSwapQuote.dexName,
        status: 'pending',
        estimatedTime: 3
      })
    }

    // Step 3: Get bridge quote
    const bridgeAmount = sourceSwapQuote ? sourceSwapQuote.amountOut : amountIn
    const bridgeParams: BridgeParams = {
      fromChain,
      toChain,
      fromToken: bridgeToken.address,
      toToken: bridgeToken.address, // Same token on destination
      amount: bridgeAmount,
      recipient,
      slippage: slippageTolerance
    }
    
    const bridgeQuote = await this.bridgeAggregator.findBestBridgeRoute(bridgeParams, prioritizeSpeed)
    totalGasEstimate = (parseFloat(totalGasEstimate) + parseFloat(bridgeQuote.gasEstimate)).toString()
    estimatedTime += bridgeQuote.estimatedTime
    
    steps.push({
      step: steps.length + 1,
      action: `Bridge ${bridgeToken.symbol} from ${this.getChainName(fromChain)} to ${this.getChainName(toChain)}`,
      chain: 0, // Cross-chain
      protocol: bridgeQuote.provider,
      status: 'pending',
      estimatedTime: bridgeQuote.estimatedTime
    })

    // Step 4: Get swap quote on destination chain (if needed)
    let destSwapQuote: AggregatedQuote | null = null
    if (tokenOut.address.toLowerCase() !== bridgeToken.address.toLowerCase()) {
      const destBridgeToken = { ...bridgeToken, chainId: toChain }
      const destSwapParams: TradeParams = {
        tokenIn: destBridgeToken,
        tokenOut: tokenOut,
        amountIn: bridgeQuote.toAmount,
        slippageTolerance
      }
      const destRoute = await this.findBestRoute(destSwapParams)
      destSwapQuote = destRoute.bestQuote
      
      totalGasEstimate = (parseFloat(totalGasEstimate) + parseFloat(destSwapQuote.gasEstimate)).toString()
      estimatedTime += 3 // 3 minutes for dest swap
      
      steps.push({
        step: steps.length + 1,
        action: `Swap ${bridgeToken.symbol} to ${tokenOut.symbol} on ${this.getChainName(toChain)}`,
        chain: toChain,
        protocol: destSwapQuote.dexName,
        status: 'pending',
        estimatedTime: 3
      })
    }

    return {
      sourceSwap: undefined, // Will be filled during execution
      bridge: undefined, // Will be filled during execution
      destSwap: undefined, // Will be filled during execution
      totalGasEstimate,
      estimatedTime,
      steps
    }
  }

  /**
   * Execute cross-chain swap with automatic step progression
   */
  async executeCrossChainSwap(params: CrossChainSwapParams, signer: ethers.Signer): Promise<CrossChainSwapResult> {
    const quote = await this.getCrossChainQuote(params)
    const result: CrossChainSwapResult = { ...quote }
    
    try {
      const { fromChain, toChain, tokenIn, tokenOut, amountIn, slippageTolerance } = params
      const bridgeToken = this.findOptimalBridgeToken(fromChain, toChain)
      
      // Step 1: Execute source swap if needed
      if (tokenIn.address.toLowerCase() !== bridgeToken.address.toLowerCase()) {
        const sourceSwapParams: TradeParams = {
          tokenIn,
          tokenOut: bridgeToken,
          amountIn,
          slippageTolerance
        }
        
        result.sourceSwap = await this.executeBestTrade(sourceSwapParams, signer)
        result.steps[0].status = 'completed'
        result.steps[0].txHash = result.sourceSwap.hash
      }
      
      // Step 2: Execute bridge
      const bridgeAmount = result.sourceSwap ? result.sourceSwap.amountOut : amountIn
      const bridgeParams: BridgeParams = {
        fromChain,
        toChain,
        fromToken: bridgeToken.address,
        toToken: bridgeToken.address,
        amount: bridgeAmount,
        recipient: params.recipient,
        slippage: slippageTolerance
      }
      
      result.bridge = await this.bridgeAggregator.executeBestBridge(bridgeParams, signer, params.prioritizeSpeed)
      const bridgeStepIndex = result.steps.findIndex(step => step.chain === 0)
      if (bridgeStepIndex >= 0) {
        result.steps[bridgeStepIndex].status = 'completed'
        result.steps[bridgeStepIndex].txHash = result.bridge.txHash
      }
      
      // Note: Destination swap would need to be executed with a signer on the destination chain
      // This is typically handled by the user or a relayer service
      
      return result
    } catch (error) {
      console.error('Cross-chain swap execution failed:', error)
      throw error
    }
  }

  /**
   * Get all available cross-chain routes
   */
  getCrossChainRoutes(): { from: number, to: number, bridgeTokens: Token[] }[] {
    const routes: { from: number, to: number, bridgeTokens: Token[] }[] = []
    const supportedChains = Array.from(this.providers.keys())
    
    for (const fromChain of supportedChains) {
      for (const toChain of supportedChains) {
        if (fromChain === toChain) continue
        
        const bridgeTokens = this.getBridgeTokensForRoute(fromChain, toChain)
        if (bridgeTokens.length > 0) {
          routes.push({ from: fromChain, to: toChain, bridgeTokens })
        }
      }
    }
    
    return routes
  }

  /**
   * Track cross-chain swap progress
   */
  async trackCrossChainSwap(swapResult: CrossChainSwapResult): Promise<CrossChainSwapResult> {
    const updatedResult = { ...swapResult }
    
    // Track bridge status
    if (swapResult.bridge && swapResult.bridge.trackingId) {
      const bridgeStatus = await this.bridgeAggregator.trackBridgeStatus(swapResult.bridge.trackingId)
      updatedResult.bridge = { ...swapResult.bridge, ...bridgeStatus }
      
      // Update step status
      const bridgeStepIndex = updatedResult.steps.findIndex(step => step.chain === 0)
      if (bridgeStepIndex >= 0) {
        updatedResult.steps[bridgeStepIndex].status = bridgeStatus.status
      }
    }
    
    return updatedResult
  }

  /**
   * Find optimal bridge token for a route
   */
  private findOptimalBridgeToken(fromChain: number, toChain: number): Token {
    // Priority: USDC > USDT > Native token
    const bridgeTokenPreferences = [
      { symbol: 'USDC', addresses: {
        1: '0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c', // Ethereum
        56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // BSC
        137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
        42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // Arbitrum
        10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' // Optimism
      } as { [key: number]: string }},
      { symbol: 'USDT', addresses: {
        1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        56: '0x55d398326f99059fF775485246999027B3197955',
        137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
      } as { [key: number]: string }}
    ]
    
    for (const token of bridgeTokenPreferences) {
      if (token.addresses[fromChain] && token.addresses[toChain]) {
        return {
          address: token.addresses[fromChain],
          symbol: token.symbol,
          name: token.symbol === 'USDC' ? 'USD Coin' : 'Tether USD',
          decimals: token.symbol === 'USDC' ? 6 : 6,
          chainId: fromChain
        }
      }
    }
    
    throw new Error(`No suitable bridge token found for route ${fromChain} -> ${toChain}`)
  }

  /**
   * Get bridge tokens available for a specific route
   */
  private getBridgeTokensForRoute(fromChain: number, toChain: number): Token[] {
    const bridgeTokens: Token[] = []
    
    try {
      const usdcToken = this.findOptimalBridgeToken(fromChain, toChain)
      bridgeTokens.push(usdcToken)
    } catch {
      // USDC not available
    }
    
    // Add more bridge tokens as needed
    
    return bridgeTokens
  }

  /**
   * Get chain name for display
   */
  private getChainName(chainId: number): string {
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      56: 'BSC',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      43114: 'Avalanche',
      250: 'Fantom'
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  /**
   * Estimate gas costs for a trade (enhanced with cross-chain support)
   */
  async estimateGasCosts(params: TradeParams): Promise<{ [dexName: string]: string }> {
    const quotes = await this.getAllQuotes(params)
    const gasCosts: { [dexName: string]: string } = {}

    quotes.forEach(quote => {
      gasCosts[quote.dexName] = quote.gasEstimate
    })

    return gasCosts
  }

  /**
   * Estimate cross-chain swap costs
   */
  async estimateCrossChainCosts(params: CrossChainSwapParams): Promise<{ 
    totalGasCost: string
    bridgeFees: string
    totalCostUSD: string
    breakdown: { step: string, cost: string }[]
  }> {
    const quote = await this.getCrossChainQuote(params)
    const bridgeCosts = await this.bridgeAggregator.estimateTotalCost({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: this.findOptimalBridgeToken(params.fromChain, params.toChain).address,
      toToken: this.findOptimalBridgeToken(params.fromChain, params.toChain).address,
      amount: params.amountIn,
      recipient: params.recipient
    })

    const breakdown: { step: string, cost: string }[] = []
    let totalGasCost = 0
    let totalBridgeFees = 0

    quote.steps.forEach((step, index) => {
      if (step.chain === 0) {
        // Bridge step
        const bridgeProvider = Object.keys(bridgeCosts)[0] || 'Unknown'
        const bridgeCost = parseFloat(bridgeCosts[bridgeProvider] || '0')
        totalBridgeFees += bridgeCost
        breakdown.push({
          step: step.action,
          cost: `${bridgeCost.toFixed(6)} ETH (bridge fees)`
        })
      } else {
        // Swap step
        const gasCost = parseFloat(quote.totalGasEstimate) / quote.steps.length
        totalGasCost += gasCost
        breakdown.push({
          step: step.action,
          cost: `${gasCost.toFixed(6)} ETH (gas)`
        })
      }
    })

    const totalCostUSD = (totalGasCost * 2000 + totalBridgeFees * 2000).toFixed(2) // Estimate ETH price at $2000

    return {
      totalGasCost: totalGasCost.toString(),
      bridgeFees: totalBridgeFees.toString(),
      totalCostUSD,
      breakdown
    }
  }

  /**
   * Compare same-chain vs cross-chain options
   */
  async compareSwapOptions(params: CrossChainSwapParams): Promise<{
    crossChain: CrossChainSwapResult
    sameChainAlternatives: { chain: number, quote: BestRouteResult }[]
    recommendation: 'cross-chain' | 'same-chain'
    reasoning: string
  }> {
    const crossChainQuote = await this.getCrossChainQuote(params)
    const sameChainAlternatives: { chain: number, quote: BestRouteResult }[] = []

    // Check if tokens exist on the same chains
    const commonChains = [params.fromChain, params.toChain]
    
    for (const chainId of commonChains) {
      try {
        const sameChainParams: TradeParams = {
          tokenIn: { ...params.tokenIn, chainId },
          tokenOut: { ...params.tokenOut, chainId },
          amountIn: params.amountIn,
          slippageTolerance: params.slippageTolerance
        }
        
        const quote = await this.findBestRoute(sameChainParams)
        sameChainAlternatives.push({ chain: chainId, quote })
      } catch {
        // Token pair not available on this chain
      }
    }

    // Simple recommendation logic
    let recommendation: 'cross-chain' | 'same-chain' = 'cross-chain'
    let reasoning = 'Cross-chain swap provides access to desired token pair'

    if (sameChainAlternatives.length > 0) {
      const bestSameChain = sameChainAlternatives.reduce((best, current) => 
        parseFloat(current.quote.bestQuote.amountOut) > parseFloat(best.quote.bestQuote.amountOut) ? current : best
      )

      const crossChainOutput = crossChainQuote.steps.length > 0 ? '0' : params.amountIn // Simplified
      
      if (parseFloat(bestSameChain.quote.bestQuote.amountOut) > parseFloat(crossChainOutput) * 0.95) {
        recommendation = 'same-chain'
        reasoning = `Same-chain swap on ${this.getChainName(bestSameChain.chain)} offers better value with lower fees`
      }
    }

    return {
      crossChain: crossChainQuote,
      sameChainAlternatives,
      recommendation,
      reasoning
    }
  }
}