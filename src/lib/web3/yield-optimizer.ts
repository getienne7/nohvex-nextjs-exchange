/**
 * DeFi Yield Optimization Service
 * Scans multiple protocols to find the best yield opportunities
 */

import { WalletAsset } from './wallet-connector'
import { ethers } from 'ethers'

export interface YieldOpportunity {
  id: string
  protocol: string
  protocolLogo: string
  asset: string
  apy: number
  tvl: number
  riskScore: number // 1-10 (1 = lowest risk)
  category: YieldCategory
  description: string
  requirements: {
    minDeposit: number
    lockPeriod?: number // in days
    fees: {
      deposit: number
      withdrawal: number
      performance: number
    }
  }
  actions: {
    deposit: string // Contract address or action URL
    withdraw: string
  }
  chainId: number
  updatedAt: Date
}

export interface PortfolioOptimization {
  currentYield: number
  optimizedYield: number
  potentialGain: number
  recommendations: YieldRecommendation[]
  riskAssessment: RiskAssessment
}

export interface YieldRecommendation {
  opportunity: YieldOpportunity
  suggestedAmount: number
  expectedReturn: number
  timeframe: number // days
  confidence: number // 0-1
}

export interface RiskAssessment {
  overallRisk: number // 1-10
  diversificationScore: number // 0-1
  liquidityRisk: number // 1-10
  smartContractRisk: number // 1-10
  recommendations: string[]
}

export enum YieldCategory {
  LENDING = 'lending',
  LIQUIDITY_MINING = 'liquidity_mining',
  STAKING = 'staking',
  YIELD_FARMING = 'yield_farming',
  LIQUID_STAKING = 'liquid_staking',
  PERPETUAL_FUNDING = 'perpetual_funding'
}

export class YieldOptimizer {
  private static instance: YieldOptimizer
  private opportunities: Map<string, YieldOpportunity[]> = new Map()
  private lastUpdate: Date = new Date(0)
  private updateInterval = 5 * 60 * 1000 // 5 minutes

  static getInstance(): YieldOptimizer {
    if (!YieldOptimizer.instance) {
      YieldOptimizer.instance = new YieldOptimizer()
    }
    return YieldOptimizer.instance
  }

  // Get all yield opportunities for a specific chain
  async getYieldOpportunities(chainId: number, forceRefresh = false): Promise<YieldOpportunity[]> {
    const now = new Date()
    const shouldUpdate = forceRefresh || 
      (now.getTime() - this.lastUpdate.getTime()) > this.updateInterval

    if (shouldUpdate) {
      await this.updateYieldData()
    }

    return this.opportunities.get(chainId.toString()) || []
  }

  // Optimize portfolio for maximum yield
  async optimizePortfolio(
    assets: WalletAsset[], 
    chainId: number,
    riskTolerance: number = 5 // 1-10 scale
  ): Promise<PortfolioOptimization> {
    const opportunities = await this.getYieldOpportunities(chainId)
    const currentYield = this.calculateCurrentYield(assets)
    
    const recommendations = this.generateRecommendations(
      assets, 
      opportunities, 
      riskTolerance
    )

    const optimizedYield = recommendations.reduce(
      (total, rec) => total + rec.expectedReturn, 
      0
    )

    const riskAssessment = this.assessRisk(recommendations, riskTolerance)

    return {
      currentYield,
      optimizedYield,
      potentialGain: optimizedYield - currentYield,
      recommendations,
      riskAssessment
    }
  }

  // Update yield data from various protocols
  private async updateYieldData(): Promise<void> {
    try {
      const chainIds = [1, 56, 137, 42161, 10] // ETH, BSC, Polygon, Arbitrum, Optimism
      
      for (const chainId of chainIds) {
        const opportunities: YieldOpportunity[] = []
        
        // Fetch from multiple sources
        opportunities.push(...await this.fetchAaveRates(chainId))
        opportunities.push(...await this.fetchCompoundRates(chainId))
        opportunities.push(...await this.fetchUniswapV3Pools(chainId))
        opportunities.push(...await this.fetchCurveRates(chainId))
        opportunities.push(...await this.fetchLidoRates(chainId))
        
        this.opportunities.set(chainId.toString(), opportunities)
      }
      
      this.lastUpdate = new Date()
    } catch (error) {
      console.error('Failed to update yield data:', error)
    }
  }

  // Fetch Aave lending rates
  private async fetchAaveRates(chainId: number): Promise<YieldOpportunity[]> {
    try {
      // In production, use Aave's subgraph or API
      const mockAaveRates = [
        {
          id: `aave-usdc-${chainId}`,
          protocol: 'Aave',
          protocolLogo: '/protocols/aave.svg',
          asset: 'USDC',
          apy: 4.2,
          tvl: 1200000000,
          riskScore: 3,
          category: YieldCategory.LENDING,
          description: 'Supply USDC to Aave lending pool',
          requirements: {
            minDeposit: 1,
            fees: { deposit: 0, withdrawal: 0, performance: 0 }
          },
          actions: {
            deposit: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
            withdraw: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
          },
          chainId,
          updatedAt: new Date()
        },
        {
          id: `aave-eth-${chainId}`,
          protocol: 'Aave',
          protocolLogo: '/protocols/aave.svg',
          asset: 'ETH',
          apy: 2.8,
          tvl: 800000000,
          riskScore: 3,
          category: YieldCategory.LENDING,
          description: 'Supply ETH to Aave lending pool',
          requirements: {
            minDeposit: 0.01,
            fees: { deposit: 0, withdrawal: 0, performance: 0 }
          },
          actions: {
            deposit: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
            withdraw: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
          },
          chainId,
          updatedAt: new Date()
        }
      ]
      
      return chainId === 1 ? mockAaveRates : []
    } catch (error) {
      console.error('Failed to fetch Aave rates:', error)
      return []
    }
  }

  // Fetch Compound rates
  private async fetchCompoundRates(chainId: number): Promise<YieldOpportunity[]> {
    try {
      const mockCompoundRates = [
        {
          id: `compound-usdc-${chainId}`,
          protocol: 'Compound',
          protocolLogo: '/protocols/compound.svg',
          asset: 'USDC',
          apy: 3.8,
          tvl: 900000000,
          riskScore: 4,
          category: YieldCategory.LENDING,
          description: 'Supply USDC to Compound',
          requirements: {
            minDeposit: 1,
            fees: { deposit: 0, withdrawal: 0, performance: 0 }
          },
          actions: {
            deposit: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
            withdraw: '0x39AA39c021dfbaE8faC545936693aC917d5E7563'
          },
          chainId,
          updatedAt: new Date()
        }
      ]
      
      return chainId === 1 ? mockCompoundRates : []
    } catch (error) {
      console.error('Failed to fetch Compound rates:', error)
      return []
    }
  }

  // Fetch Uniswap V3 pool APRs
  private async fetchUniswapV3Pools(chainId: number): Promise<YieldOpportunity[]> {
    try {
      const mockUniswapPools = [
        {
          id: `uniswap-eth-usdc-${chainId}`,
          protocol: 'Uniswap V3',
          protocolLogo: '/protocols/uniswap.svg',
          asset: 'ETH/USDC',
          apy: 12.5,
          tvl: 450000000,
          riskScore: 6,
          category: YieldCategory.LIQUIDITY_MINING,
          description: 'Provide liquidity to ETH/USDC 0.05% pool',
          requirements: {
            minDeposit: 100,
            fees: { deposit: 0, withdrawal: 0, performance: 0 }
          },
          actions: {
            deposit: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            withdraw: '0xE592427A0AEce92De3Edee1F18E0157C05861564'
          },
          chainId,
          updatedAt: new Date()
        }
      ]
      
      return [1, 137, 42161, 10].includes(chainId) ? mockUniswapPools : []
    } catch (error) {
      console.error('Failed to fetch Uniswap pools:', error)
      return []
    }
  }

  // Fetch Curve pool rates
  private async fetchCurveRates(chainId: number): Promise<YieldOpportunity[]> {
    try {
      const mockCurveRates = [
        {
          id: `curve-3pool-${chainId}`,
          protocol: 'Curve',
          protocolLogo: '/protocols/curve.svg',
          asset: '3Pool (USDC/USDT/DAI)',
          apy: 8.2,
          tvl: 1800000000,
          riskScore: 4,
          category: YieldCategory.YIELD_FARMING,
          description: 'Provide liquidity to Curve 3Pool',
          requirements: {
            minDeposit: 10,
            fees: { deposit: 0, withdrawal: 0.04, performance: 0 }
          },
          actions: {
            deposit: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
            withdraw: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'
          },
          chainId,
          updatedAt: new Date()
        }
      ]
      
      return chainId === 1 ? mockCurveRates : []
    } catch (error) {
      console.error('Failed to fetch Curve rates:', error)
      return []
    }
  }

  // Fetch Lido staking rates
  private async fetchLidoRates(chainId: number): Promise<YieldOpportunity[]> {
    try {
      const mockLidoRates = [
        {
          id: `lido-eth-${chainId}`,
          protocol: 'Lido',
          protocolLogo: '/protocols/lido.svg',
          asset: 'ETH',
          apy: 5.2,
          tvl: 32000000000,
          riskScore: 2,
          category: YieldCategory.LIQUID_STAKING,
          description: 'Stake ETH with Lido for stETH',
          requirements: {
            minDeposit: 0.001,
            fees: { deposit: 0, withdrawal: 0, performance: 10 }
          },
          actions: {
            deposit: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
            withdraw: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
          },
          chainId,
          updatedAt: new Date()
        }
      ]
      
      return chainId === 1 ? mockLidoRates : []
    } catch (error) {
      console.error('Failed to fetch Lido rates:', error)
      return []
    }
  }

  // Calculate current portfolio yield
  private calculateCurrentYield(assets: WalletAsset[]): number {
    // For now, assume 0% yield on idle assets
    // In production, check if assets are already deployed in yield-generating protocols
    return 0
  }

  // Generate yield recommendations based on assets and risk tolerance
  private generateRecommendations(
    assets: WalletAsset[],
    opportunities: YieldOpportunity[],
    riskTolerance: number
  ): YieldRecommendation[] {
    const recommendations: YieldRecommendation[] = []
    
    for (const asset of assets) {
      const assetValue = parseFloat(asset.balance) * (asset.usdValue || 0)
      if (assetValue < 10) continue // Skip small amounts
      
      // Find matching opportunities
      const matchingOpportunities = opportunities.filter(opp => 
        opp.asset === asset.symbol || 
        opp.asset.includes(asset.symbol) ||
        (asset.symbol === 'ETH' && opp.asset === 'WETH')
      ).filter(opp => 
        opp.riskScore <= riskTolerance
      ).sort((a, b) => b.apy - a.apy)
      
      if (matchingOpportunities.length > 0) {
        const bestOpportunity = matchingOpportunities[0]
        const suggestedAmount = Math.min(
          assetValue * 0.8, // Max 80% of holdings
          assetValue - bestOpportunity.requirements.minDeposit
        )
        
        if (suggestedAmount > bestOpportunity.requirements.minDeposit) {
          recommendations.push({
            opportunity: bestOpportunity,
            suggestedAmount,
            expectedReturn: (suggestedAmount * bestOpportunity.apy) / 100,
            timeframe: 365,
            confidence: this.calculateConfidence(bestOpportunity)
          })
        }
      }
    }
    
    return recommendations.sort((a, b) => b.expectedReturn - a.expectedReturn)
  }

  // Calculate confidence score for an opportunity
  private calculateConfidence(opportunity: YieldOpportunity): number {
    let confidence = 0.5 // Base confidence
    
    // Higher TVL = higher confidence
    if (opportunity.tvl > 1000000000) confidence += 0.2
    else if (opportunity.tvl > 100000000) confidence += 0.1
    
    // Lower risk = higher confidence
    confidence += (10 - opportunity.riskScore) * 0.03
    
    // Established protocols get bonus
    const establishedProtocols = ['Aave', 'Compound', 'Uniswap V3', 'Curve', 'Lido']
    if (establishedProtocols.includes(opportunity.protocol)) {
      confidence += 0.1
    }
    
    return Math.min(confidence, 1)
  }

  // Assess overall portfolio risk
  private assessRisk(
    recommendations: YieldRecommendation[],
    riskTolerance: number
  ): RiskAssessment {
    if (recommendations.length === 0) {
      return {
        overallRisk: 1,
        diversificationScore: 0,
        liquidityRisk: 1,
        smartContractRisk: 1,
        recommendations: ['No yield opportunities found for current risk tolerance']
      }
    }

    const avgRisk = recommendations.reduce(
      (sum, rec) => sum + rec.opportunity.riskScore, 0
    ) / recommendations.length

    const protocolCount = new Set(
      recommendations.map(rec => rec.opportunity.protocol)
    ).size

    const diversificationScore = Math.min(protocolCount / 5, 1)
    
    const liquidityRisk = recommendations.some(
      rec => rec.opportunity.requirements.lockPeriod && rec.opportunity.requirements.lockPeriod > 30
    ) ? 7 : 3

    const smartContractRisk = avgRisk

    const riskRecommendations: string[] = []
    
    if (diversificationScore < 0.5) {
      riskRecommendations.push('Consider diversifying across more protocols')
    }
    
    if (avgRisk > riskTolerance) {
      riskRecommendations.push('Some recommendations exceed your risk tolerance')
    }
    
    if (liquidityRisk > 5) {
      riskRecommendations.push('Be aware of lock-up periods that may affect liquidity')
    }

    return {
      overallRisk: avgRisk,
      diversificationScore,
      liquidityRisk,
      smartContractRisk,
      recommendations: riskRecommendations
    }
  }

  // Get top opportunities across all chains
  async getTopOpportunities(limit = 10): Promise<YieldOpportunity[]> {
    const allOpportunities: YieldOpportunity[] = []
    
    for (const chainOpportunities of this.opportunities.values()) {
      allOpportunities.push(...chainOpportunities)
    }
    
    return allOpportunities
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit)
  }

  // Get opportunities by category
  async getOpportunitiesByCategory(
    category: YieldCategory,
    chainId?: number
  ): Promise<YieldOpportunity[]> {
    let opportunities: YieldOpportunity[] = []
    
    if (chainId) {
      opportunities = this.opportunities.get(chainId.toString()) || []
    } else {
      for (const chainOpportunities of this.opportunities.values()) {
        opportunities.push(...chainOpportunities)
      }
    }
    
    return opportunities
      .filter(opp => opp.category === category)
      .sort((a, b) => b.apy - a.apy)
  }
}

// Global yield optimizer instance
export const yieldOptimizer = YieldOptimizer.getInstance()