/**
 * Advanced DeFi Yield Optimization Service
 * Enhanced cross-chain yield discovery with real-time APY tracking and intelligent recommendations
 */

import { WalletAsset } from './wallet-connector'
import { ethers } from 'ethers'

// Enhanced interfaces
export interface YieldOpportunity {
  id: string
  protocol: string
  protocolLogo: string
  asset: string
  apy: number
  apyHistory: APYHistoryPoint[]
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
      management?: number
    }
  }
  actions: {
    deposit: string // Contract address or action URL
    withdraw: string
    claim?: string // For claiming rewards
  }
  chainId: number
  updatedAt: Date
  additionalInfo: {
    auditStatus: 'audited' | 'unaudited' | 'partially_audited'
    launchDate: Date
    impermanentLossRisk?: number // 1-10 for LP positions
    autoCompounding: boolean
    governanceToken?: string
    slashingRisk?: number // For staking positions
  }
}

export interface APYHistoryPoint {
  timestamp: number
  apy: number
  tvl: number
}

export interface PortfolioOptimization {
  currentYield: number
  optimizedYield: number
  potentialGain: number
  recommendations: YieldRecommendation[]
  riskAssessment: RiskAssessment
  crossChainOpportunities: CrossChainArbitrage[]
  yieldStrategies: YieldStrategy[]
}

export interface YieldRecommendation {
  opportunity: YieldOpportunity
  suggestedAmount: number
  expectedReturn: number
  timeframe: number // days
  confidence: number // 0-1
  priority: 'low' | 'medium' | 'high' | 'critical'
  reasoning: string
  actions: RecommendationAction[]
}

export interface RecommendationAction {
  type: 'deposit' | 'withdraw' | 'swap' | 'bridge' | 'compound'
  description: string
  estimatedGas: number
  estimatedTime: number // minutes
  contractAddress?: string
  methodSignature?: string
}

export interface CrossChainArbitrage {
  id: string
  asset: string
  sourceChain: number
  targetChain: number
  sourceAPY: number
  targetAPY: number
  apyDifference: number
  potentialProfit: number
  bridgeCost: number
  netProfit: number
  timeToBreakEven: number // days
  risk: number
}

export interface YieldStrategy {
  id: string
  name: string
  description: string
  expectedAPY: number
  riskLevel: number
  timeHorizon: number // days
  steps: StrategyStep[]
  totalGasCost: number
  breakEvenTime: number
}

export interface StrategyStep {
  order: number
  action: string
  protocol: string
  chainId: number
  estimatedGas: number
  expectedOutcome: string
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
  PERPETUAL_FUNDING = 'perpetual_funding',
  SYNTHETIC_ASSETS = 'synthetic_assets',
  DELTA_NEUTRAL = 'delta_neutral',
  OPTIONS_STRATEGIES = 'options_strategies',
  ALGORITHMIC_TRADING = 'algorithmic_trading'
}

export interface OptimizationPreferences {
  maxRiskLevel?: number
  preferredProtocols?: string[]
  excludedProtocols?: string[]
  maxLockPeriod?: number
  minLiquidity?: number
  crossChainEnabled?: boolean
  autoCompoundPreference?: boolean
  gasCostSensitivity?: number // 1-10
}

export interface BridgeInfo {
  name: string
  fee: number
  timeMinutes: number
  maxAmount: number
}

export interface ProtocolData {
  protocol: string
  totalTVL: number
  averageAPY: number
  lastUpdate: Date
  isActive: boolean
  auditScore: number
}

export class YieldOptimizer {
  private static instance: YieldOptimizer
  private opportunities: Map<string, YieldOpportunity[]> = new Map()
  private apyHistory: Map<string, APYHistoryPoint[]> = new Map()
  private lastUpdate: Date = new Date(0)
  private updateInterval = 5 * 60 * 1000 // 5 minutes
  private protocolAPIs: Map<string, string> = new Map()
  private crossChainBridges: Map<string, BridgeInfo> = new Map()

  static getInstance(): YieldOptimizer {
    if (!YieldOptimizer.instance) {
      YieldOptimizer.instance = new YieldOptimizer()
      YieldOptimizer.instance.initializeProtocolAPIs()
      YieldOptimizer.instance.initializeBridgeInfo()
    }
    return YieldOptimizer.instance
  }

  private initializeProtocolAPIs(): void {
    // Real protocol API endpoints for dynamic data
    this.protocolAPIs.set('aave', 'https://aave-api-v2.aave.com/data/liquidity')
    this.protocolAPIs.set('compound', 'https://api.compound.finance/api/v2/ctoken')
    this.protocolAPIs.set('curve', 'https://api.curve.fi/api/getPools')
    this.protocolAPIs.set('uniswap', 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3')
    this.protocolAPIs.set('lido', 'https://stake.lido.fi/api/sma-steth-apr')
    this.protocolAPIs.set('yearn', 'https://api.yearn.finance/v1/chains/1/vaults/all')
    this.protocolAPIs.set('convex', 'https://www.convexfinance.com/api/curve-apys')
    this.protocolAPIs.set('balancer', 'https://api-v3.balancer.fi/')
  }

  private initializeBridgeInfo(): void {
    // Bridge information for cross-chain opportunities
    this.crossChainBridges.set('ethereum-polygon', {
      name: 'Polygon Bridge',
      fee: 0.001, // 0.1%
      timeMinutes: 30,
      maxAmount: 10000000
    })
    this.crossChainBridges.set('ethereum-arbitrum', {
      name: 'Arbitrum Bridge',
      fee: 0.0005,
      timeMinutes: 10,
      maxAmount: 5000000
    })
    this.crossChainBridges.set('ethereum-optimism', {
      name: 'Optimism Bridge',
      fee: 0.0005,
      timeMinutes: 10,
      maxAmount: 5000000
    })
  }

  // Enhanced yield opportunities fetching
  async getYieldOpportunities(chainId: number, forceRefresh = false): Promise<YieldOpportunity[]> {
    const now = new Date()
    const shouldUpdate = forceRefresh || 
      (now.getTime() - this.lastUpdate.getTime()) > this.updateInterval

    if (shouldUpdate) {
      await this.updateYieldData()
    }

    return this.opportunities.get(chainId.toString()) || []
  }

  // Advanced portfolio optimization with cross-chain analysis
  async optimizePortfolio(
    assets: WalletAsset[], 
    chainId: number,
    riskTolerance: number = 5, // 1-10 scale
    preferences: OptimizationPreferences = {}
  ): Promise<PortfolioOptimization> {
    const opportunities = await this.getYieldOpportunities(chainId)
    const currentYield = this.calculateCurrentYield(assets)
    
    // Generate base recommendations
    const recommendations = await this.generateAdvancedRecommendations(
      assets, 
      opportunities, 
      riskTolerance,
      preferences
    )

    // Analyze cross-chain opportunities
    const crossChainOpportunities = await this.analyzeCrossChainOpportunities(
      assets,
      chainId,
      riskTolerance
    )

    // Generate yield strategies
    const yieldStrategies = await this.generateYieldStrategies(
      assets,
      opportunities,
      crossChainOpportunities,
      riskTolerance
    )

    const optimizedYield = recommendations.reduce(
      (total, rec) => total + rec.expectedReturn, 
      0
    )

    const riskAssessment = this.assessAdvancedRisk(recommendations, riskTolerance)

    return {
      currentYield,
      optimizedYield,
      potentialGain: optimizedYield - currentYield,
      recommendations,
      riskAssessment,
      crossChainOpportunities,
      yieldStrategies
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
          apy: 4.2 + (Math.random() - 0.5) * 2,
          apyHistory: this.generateMockAPYHistory(4.2, 30),
          tvl: 1200000000,
          riskScore: 3,
          category: YieldCategory.LENDING,
          description: 'Supply USDC to Aave lending pool with variable APY',
          requirements: {
            minDeposit: 1,
            fees: { deposit: 0, withdrawal: 0, performance: 0 }
          },
          actions: {
            deposit: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
            withdraw: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
          },
          chainId,
          updatedAt: new Date(),
          additionalInfo: {
            auditStatus: 'audited' as const,
            launchDate: new Date('2020-01-01'),
            autoCompounding: false,
            governanceToken: 'AAVE'
          }
        },
        {
          id: `aave-eth-${chainId}`,
          protocol: 'Aave',
          protocolLogo: '/protocols/aave.svg',
          asset: 'ETH',
          apy: 2.8 + (Math.random() - 0.5) * 1.5,
          apyHistory: this.generateMockAPYHistory(2.8, 30),
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
          updatedAt: new Date(),
          additionalInfo: {
            auditStatus: 'audited' as const,
            launchDate: new Date('2020-01-01'),
            autoCompounding: false,
            governanceToken: 'AAVE'
          }
        }
      ]
      
      return [1, 137, 42161, 10].includes(chainId) ? mockAaveRates : []
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

  // Enhanced helper methods
  private updateAPYHistory(opportunity: YieldOpportunity): void {
    const historyKey = `${opportunity.protocol}-${opportunity.asset}-${opportunity.chainId}`
    const currentHistory = this.apyHistory.get(historyKey) || []
    
    const newPoint: APYHistoryPoint = {
      timestamp: Date.now(),
      apy: opportunity.apy,
      tvl: opportunity.tvl
    }
    
    currentHistory.unshift(newPoint)
    
    // Keep only last 100 data points
    if (currentHistory.length > 100) {
      currentHistory.splice(100)
    }
    
    this.apyHistory.set(historyKey, currentHistory)
  }

  private generateMockAPYHistory(baseAPY: number, days: number): APYHistoryPoint[] {
    const history: APYHistoryPoint[] = []
    const now = Date.now()
    
    for (let i = 0; i < days; i++) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000)
      const variance = (Math.random() - 0.5) * baseAPY * 0.3 // 30% variance
      const apy = Math.max(0, baseAPY + variance)
      
      history.push({
        timestamp,
        apy,
        tvl: 1000000000 + Math.random() * 500000000
      })
    }
    
    return history.reverse()
  }

  // New protocol integrations
  private async fetchYearnVaults(chainId: number): Promise<YieldOpportunity[]> {
    try {
      const mockYearnVaults = [
        {
          id: `yearn-usdc-${chainId}`,
          protocol: 'Yearn Finance',
          protocolLogo: '/protocols/yearn.svg',
          asset: 'USDC',
          apy: 6.8 + (Math.random() - 0.5) * 3,
          apyHistory: this.generateMockAPYHistory(6.8, 30),
          tvl: 250000000,
          riskScore: 5,
          category: YieldCategory.YIELD_FARMING,
          description: 'Auto-compounding USDC vault with yield optimization strategies',
          requirements: {
            minDeposit: 1,
            fees: { deposit: 0, withdrawal: 0, performance: 20, management: 2 }
          },
          actions: {
            deposit: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE',
            withdraw: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE'
          },
          chainId,
          updatedAt: new Date(),
          additionalInfo: {
            auditStatus: 'audited' as const,
            launchDate: new Date('2021-03-01'),
            autoCompounding: true,
            governanceToken: 'YFI'
          }
        }
      ]
      
      return chainId === 1 ? mockYearnVaults : []
    } catch (error) {
      console.error('Failed to fetch Yearn vaults:', error)
      return []
    }
  }

  private async fetchConvexPools(chainId: number): Promise<YieldOpportunity[]> {
    try {
      const mockConvexPools = [
        {
          id: `convex-3pool-${chainId}`,
          protocol: 'Convex Finance',
          protocolLogo: '/protocols/convex.svg',
          asset: '3Pool (USDC/USDT/DAI)',
          apy: 10.5 + (Math.random() - 0.5) * 4,
          apyHistory: this.generateMockAPYHistory(10.5, 30),
          tvl: 890000000,
          riskScore: 6,
          category: YieldCategory.YIELD_FARMING,
          description: 'Boosted Curve 3Pool farming with CRV and CVX rewards',
          requirements: {
            minDeposit: 10,
            fees: { deposit: 0, withdrawal: 0, performance: 17 }
          },
          actions: {
            deposit: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31',
            withdraw: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31',
            claim: '0x0A760466E1B4621579a82a39CB56Dda2F4E70f03'
          },
          chainId,
          updatedAt: new Date(),
          additionalInfo: {
            auditStatus: 'audited' as const,
            launchDate: new Date('2021-05-01'),
            autoCompounding: false,
            governanceToken: 'CVX'
          }
        }
      ]
      
      return chainId === 1 ? mockConvexPools : []
    } catch (error) {
      console.error('Failed to fetch Convex pools:', error)
      return []
    }
  }

  // Generate yield recommendations based on assets and risk tolerance
  private async generateAdvancedRecommendations(
    assets: WalletAsset[],
    opportunities: YieldOpportunity[],
    riskTolerance: number,
    preferences: OptimizationPreferences
  ): Promise<YieldRecommendation[]> {
    const recommendations: YieldRecommendation[] = []
    
    for (const asset of assets) {
      const assetValue = parseFloat(asset.balance) * (asset.usdValue || 0)
      if (assetValue < 10) continue // Skip small amounts
      
      // Filter opportunities based on preferences
      let filteredOpportunities = opportunities.filter(opp => {
        // Basic filters
        if (opp.riskScore > riskTolerance) return false
        if (preferences.excludedProtocols?.includes(opp.protocol)) return false
        if (preferences.preferredProtocols && !preferences.preferredProtocols.includes(opp.protocol)) return false
        if (preferences.maxLockPeriod && opp.requirements.lockPeriod && opp.requirements.lockPeriod > preferences.maxLockPeriod) return false
        if (preferences.minLiquidity && opp.tvl < preferences.minLiquidity) return false
        
        // Asset matching
        return opp.asset === asset.symbol || 
               opp.asset.includes(asset.symbol) ||
               (asset.symbol === 'ETH' && opp.asset === 'WETH')
      })
      
      // Sort by APY and risk-adjusted score
      filteredOpportunities = filteredOpportunities.sort((a, b) => {
        const scoreA = this.calculateOpportunityScore(a, preferences)
        const scoreB = this.calculateOpportunityScore(b, preferences)
        return scoreB - scoreA
      })
      
      if (filteredOpportunities.length > 0) {
        const bestOpportunity = filteredOpportunities[0]
        const suggestedAmount = this.calculateOptimalAmount(assetValue, bestOpportunity, preferences)
        
        if (suggestedAmount > bestOpportunity.requirements.minDeposit) {
          const expectedReturn = (suggestedAmount * bestOpportunity.apy) / 100
          const confidence = this.calculateEnhancedConfidence(bestOpportunity)
          const priority = this.determinePriority(expectedReturn, bestOpportunity.riskScore, confidence)
          
          recommendations.push({
            opportunity: bestOpportunity,
            suggestedAmount,
            expectedReturn,
            timeframe: 365,
            confidence,
            priority,
            reasoning: this.generateReasoning(bestOpportunity, assetValue, expectedReturn),
            actions: this.generateRecommendationActions(bestOpportunity, suggestedAmount)
          })
        }
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.expectedReturn - a.expectedReturn
    })
  }

  // Cross-chain arbitrage analysis
  private async analyzeCrossChainOpportunities(
    assets: WalletAsset[],
    sourceChainId: number,
    riskTolerance: number
  ): Promise<CrossChainArbitrage[]> {
    const arbitrageOpportunities: CrossChainArbitrage[] = []
    const targetChains = [1, 56, 137, 42161, 10, 43114]
    
    for (const asset of assets) {
      const assetValue = parseFloat(asset.balance) * (asset.usdValue || 0)
      if (assetValue < 100) continue // Only for larger amounts
      
      for (const targetChainId of targetChains) {
        if (targetChainId === sourceChainId) continue
        
        const sourceOpportunities = await this.getYieldOpportunities(sourceChainId)
        const targetOpportunities = await this.getYieldOpportunities(targetChainId)
        
        const sourceOpp = this.findBestOpportunityForAsset(sourceOpportunities, asset.symbol, riskTolerance)
        const targetOpp = this.findBestOpportunityForAsset(targetOpportunities, asset.symbol, riskTolerance)
        
        if (sourceOpp && targetOpp && targetOpp.apy > sourceOpp.apy + 2) { // At least 2% difference
          const bridgeKey = `${sourceChainId}-${targetChainId}`
          const bridgeInfo = this.getBridgeInfo(sourceChainId, targetChainId)
          
          if (bridgeInfo) {
            const bridgeCost = assetValue * bridgeInfo.fee
            const apyDifference = targetOpp.apy - sourceOpp.apy
            const annualProfit = (assetValue * apyDifference) / 100
            const netProfit = annualProfit - bridgeCost
            const timeToBreakEven = bridgeCost / (annualProfit / 365)
            
            if (netProfit > 0 && timeToBreakEven < 365) {
              arbitrageOpportunities.push({
                id: `arbitrage-${asset.symbol}-${sourceChainId}-${targetChainId}`,
                asset: asset.symbol,
                sourceChain: sourceChainId,
                targetChain: targetChainId,
                sourceAPY: sourceOpp.apy,
                targetAPY: targetOpp.apy,
                apyDifference,
                potentialProfit: annualProfit,
                bridgeCost,
                netProfit,
                timeToBreakEven,
                risk: Math.max(targetOpp.riskScore, 6) // Cross-chain adds risk
              })
            }
          }
        }
      }
    }
    
    return arbitrageOpportunities.sort((a, b) => b.netProfit - a.netProfit)
  }

  // Generate comprehensive yield strategies
  private async generateYieldStrategies(
    assets: WalletAsset[],
    opportunities: YieldOpportunity[],
    crossChainOpportunities: CrossChainArbitrage[],
    riskTolerance: number
  ): Promise<YieldStrategy[]> {
    const strategies: YieldStrategy[] = []
    
    // Strategy 1: Conservative Stablecoin Farming
    const stablecoinAssets = assets.filter(asset => 
      ['USDC', 'USDT', 'DAI', 'BUSD'].includes(asset.symbol)
    )
    
    if (stablecoinAssets.length > 0 && riskTolerance >= 3) {
      const totalStableValue = stablecoinAssets.reduce((sum, asset) => 
        sum + (parseFloat(asset.balance) * (asset.usdValue || 0)), 0
      )
      
      if (totalStableValue > 1000) {
        const conservativeOpps = opportunities.filter(opp => 
          opp.riskScore <= 4 && 
          ['USDC', 'USDT', 'DAI'].some(stable => opp.asset.includes(stable))
        ).sort((a, b) => b.apy - a.apy)
        
        if (conservativeOpps.length > 0) {
          strategies.push({
            id: 'conservative-stablecoin',
            name: 'Conservative Stablecoin Strategy',
            description: 'Low-risk yield farming with stablecoins across established protocols',
            expectedAPY: conservativeOpps[0].apy,
            riskLevel: 3,
            timeHorizon: 90,
            steps: [
              {
                order: 1,
                action: `Deposit ${totalStableValue.toFixed(0)} USD in stablecoins`,
                protocol: conservativeOpps[0].protocol,
                chainId: conservativeOpps[0].chainId,
                estimatedGas: 0.05,
                expectedOutcome: `${conservativeOpps[0].apy.toFixed(1)}% APY`
              }
            ],
            totalGasCost: 0.05,
            breakEvenTime: 1
          })
        }
      }
    }
    
    // Strategy 2: Aggressive DeFi Yield Farming
    if (riskTolerance >= 7) {
      const highYieldOpps = opportunities.filter(opp => 
        opp.apy > 15 && opp.riskScore <= riskTolerance
      ).sort((a, b) => b.apy - a.apy)
      
      if (highYieldOpps.length > 0) {
        strategies.push({
          id: 'aggressive-yield-farming',
          name: 'High-Yield DeFi Strategy',
          description: 'Maximize returns through high-APY opportunities with managed risk',
          expectedAPY: highYieldOpps[0].apy,
          riskLevel: 8,
          timeHorizon: 180,
          steps: [
            {
              order: 1,
              action: 'Provide liquidity to high-yield pools',
              protocol: highYieldOpps[0].protocol,
              chainId: highYieldOpps[0].chainId,
              estimatedGas: 0.1,
              expectedOutcome: `${highYieldOpps[0].apy.toFixed(1)}% APY with higher volatility`
            },
            {
              order: 2,
              action: 'Monitor and rebalance weekly',
              protocol: 'Portfolio Manager',
              chainId: highYieldOpps[0].chainId,
              estimatedGas: 0.02,
              expectedOutcome: 'Optimized risk-return profile'
            }
          ],
          totalGasCost: 0.12,
          breakEvenTime: 3
        })
      }
    }
    
    // Strategy 3: Cross-Chain Arbitrage
    if (crossChainOpportunities.length > 0 && riskTolerance >= 6) {
      const bestArbitrage = crossChainOpportunities[0]
      
      strategies.push({
        id: 'cross-chain-arbitrage',
        name: 'Cross-Chain Yield Arbitrage',
        description: 'Capture yield differentials across different blockchain networks',
        expectedAPY: bestArbitrage.targetAPY,
        riskLevel: bestArbitrage.risk,
        timeHorizon: Math.ceil(bestArbitrage.timeToBreakEven + 30),
        steps: [
          {
            order: 1,
            action: `Bridge ${bestArbitrage.asset} to target chain`,
            protocol: 'Bridge',
            chainId: bestArbitrage.targetChain,
            estimatedGas: 0.1,
            expectedOutcome: `Assets on chain ${bestArbitrage.targetChain}`
          },
          {
            order: 2,
            action: 'Deploy to high-yield opportunity',
            protocol: 'Target Protocol',
            chainId: bestArbitrage.targetChain,
            estimatedGas: 0.05,
            expectedOutcome: `${bestArbitrage.targetAPY.toFixed(1)}% APY`
          }
        ],
        totalGasCost: 0.15,
        breakEvenTime: bestArbitrage.timeToBreakEven
      })
    }
    
    return strategies.sort((a, b) => b.expectedAPY - a.expectedAPY)
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