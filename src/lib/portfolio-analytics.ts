/**
 * Advanced Portfolio Analytics Engine
 * Provides comprehensive portfolio analysis, performance attribution, and optimization recommendations
 */

import { nowNodesService } from './nownodes'

export interface PortfolioSnapshot {
  id: string
  walletAddress: string
  timestamp: number
  totalValue: number
  assets: AssetSnapshot[]
  chains: ChainSnapshot[]
  performance: PerformanceMetrics
  riskMetrics: RiskMetrics
}

export interface AssetSnapshot {
  symbol: string
  name: string
  balance: string
  usdValue: number
  price: number
  chainId: number
  chainName: string
  weight: number // Percentage of total portfolio
  change24h: number
  change7d: number
  change30d: number
  volatility: number
  sharpeRatio?: number
}

export interface ChainSnapshot {
  chainId: number
  name: string
  symbol: string
  totalValue: number
  weight: number
  assetCount: number
  performance24h: number
}

export interface PerformanceMetrics {
  totalReturn: number
  totalReturnPercent: number
  dailyReturn: number
  weeklyReturn: number
  monthlyReturn: number
  yearlyReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  bestDay: number
  worstDay: number
}

export interface RiskMetrics {
  portfolioVolatility: number
  valueAtRisk95: number // 95% VaR
  valueAtRisk99: number // 99% VaR
  beta: number // Relative to market
  correlation: CorrelationMatrix
  diversificationRatio: number
  concentrationRisk: number
  liquidityScore: number
}

export interface CorrelationMatrix {
  [assetPair: string]: number
}

export interface PerformanceAttribution {
  assetContributions: AssetContribution[]
  chainContributions: ChainContribution[]
  totalAttribution: number
  unexplainedReturn: number
}

export interface AssetContribution {
  symbol: string
  weight: number
  return: number
  contribution: number
  contributionPercent: number
}

export interface ChainContribution {
  chainName: string
  weight: number
  return: number
  contribution: number
  contributionPercent: number
}

export interface RebalancingRecommendation {
  id: string
  type: 'rebalance' | 'tax_loss_harvest' | 'risk_reduction' | 'opportunity'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  actions: RebalancingAction[]
  expectedImpact: {
    riskReduction: number
    returnImprovement: number
    taxSavings?: number
    costEstimate: number
  }
  confidence: number
}

export interface RebalancingAction {
  type: 'buy' | 'sell' | 'swap'
  fromAsset?: string
  toAsset: string
  amount: number
  amountUSD: number
  reason: string
  urgency: 'low' | 'medium' | 'high'
}

export interface HistoricalData {
  timestamps: number[]
  portfolioValues: number[]
  assetPrices: { [symbol: string]: number[] }
  returns: number[]
  volatility: number[]
  drawdowns: number[]
}

export class PortfolioAnalytics {
  private static instance: PortfolioAnalytics
  private snapshots: Map<string, PortfolioSnapshot[]> = new Map()
  private historicalData: Map<string, HistoricalData> = new Map()
  private marketData: Map<string, number[]> = new Map() // For beta calculation

  static getInstance(): PortfolioAnalytics {
    if (!PortfolioAnalytics.instance) {
      PortfolioAnalytics.instance = new PortfolioAnalytics()
    }
    return PortfolioAnalytics.instance
  }

  // Create portfolio snapshot
  async createSnapshot(walletAddress: string): Promise<PortfolioSnapshot> {
    try {
      // Get current portfolio data
      const portfolioData = await this.getPortfolioData(walletAddress)
      
      // Calculate performance metrics
      const performance = await this.calculatePerformanceMetrics(walletAddress, portfolioData)
      
      // Calculate risk metrics
      const riskMetrics = await this.calculateRiskMetrics(portfolioData)
      
      const snapshot: PortfolioSnapshot = {
        id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        walletAddress: walletAddress.toLowerCase(),
        timestamp: Date.now(),
        totalValue: portfolioData.totalValue,
        assets: portfolioData.assets,
        chains: portfolioData.chains,
        performance,
        riskMetrics
      }
      
      // Store snapshot
      const walletKey = walletAddress.toLowerCase()
      const existingSnapshots = this.snapshots.get(walletKey) || []
      existingSnapshots.unshift(snapshot)
      
      // Keep only last 1000 snapshots
      if (existingSnapshots.length > 1000) {
        existingSnapshots.splice(1000)
      }
      
      this.snapshots.set(walletKey, existingSnapshots)
      
      return snapshot
    } catch (error) {
      console.error('Failed to create portfolio snapshot:', error)
      throw error
    }
  }

  // Get portfolio data from NOWNodes
  private async getPortfolioData(walletAddress: string): Promise<{
    totalValue: number
    assets: AssetSnapshot[]
    chains: ChainSnapshot[]
  }> {
    try {
      // This would normally call your wallet-dashboard API
      // For now, using mock data based on your real portfolio
      const mockData = {
        totalValue: 63.88,
        assets: [
          {
            symbol: 'ETH',
            name: 'Ethereum',
            balance: '0.013220',
            usdValue: 57.75,
            price: 4368.07,
            chainId: 1,
            chainName: 'Ethereum',
            weight: 90.4,
            change24h: -2.5,
            change7d: -5.2,
            change30d: 12.8,
            volatility: 0.65,
            sharpeRatio: 1.2
          },
          {
            symbol: 'BNB',
            name: 'BNB',
            balance: '0.007100',
            usdValue: 6.03,
            price: 849.30,
            chainId: 56,
            chainName: 'BNB Smart Chain',
            weight: 9.4,
            change24h: -1.8,
            change7d: -3.1,
            change30d: 8.5,
            volatility: 0.58,
            sharpeRatio: 0.9
          },
          {
            symbol: 'MATIC',
            name: 'Polygon',
            balance: '1.551000',
            usdValue: 0.39,
            price: 0.25,
            chainId: 137,
            chainName: 'Polygon',
            weight: 0.6,
            change24h: -4.2,
            change7d: -8.1,
            change30d: -15.3,
            volatility: 0.82,
            sharpeRatio: 0.3
          }
        ],
        chains: [
          {
            chainId: 1,
            name: 'Ethereum',
            symbol: 'ETH',
            totalValue: 57.75,
            weight: 90.4,
            assetCount: 1,
            performance24h: -2.5
          },
          {
            chainId: 56,
            name: 'BNB Smart Chain',
            symbol: 'BNB',
            totalValue: 6.03,
            weight: 9.4,
            assetCount: 1,
            performance24h: -1.8
          },
          {
            chainId: 137,
            name: 'Polygon',
            symbol: 'MATIC',
            totalValue: 0.39,
            weight: 0.6,
            assetCount: 1,
            performance24h: -4.2
          }
        ]
      }
      
      return mockData
    } catch (error) {
      console.error('Failed to get portfolio data:', error)
      throw error
    }
  }

  // Calculate performance metrics
  private async calculatePerformanceMetrics(
    walletAddress: string, 
    portfolioData: any
  ): Promise<PerformanceMetrics> {
    const walletKey = walletAddress.toLowerCase()
    const historicalSnapshots = this.snapshots.get(walletKey) || []
    
    // If no historical data, return current metrics
    if (historicalSnapshots.length === 0) {
      return {
        totalReturn: 0,
        totalReturnPercent: 0,
        dailyReturn: -2.2, // Weighted average of current assets
        weeklyReturn: -4.8,
        monthlyReturn: 8.9,
        yearlyReturn: 0, // Not enough data
        volatility: 0.64, // Weighted average volatility
        sharpeRatio: 1.0, // Weighted average Sharpe ratio
        maxDrawdown: 0,
        winRate: 0,
        bestDay: 0,
        worstDay: 0
      }
    }
    
    // Calculate returns from historical data
    const returns = this.calculateReturns(historicalSnapshots)
    const volatility = this.calculateVolatility(returns)
    const sharpeRatio = this.calculateSharpeRatio(returns, volatility)
    const maxDrawdown = this.calculateMaxDrawdown(historicalSnapshots)
    
    return {
      totalReturn: returns.reduce((sum, r) => sum + r, 0),
      totalReturnPercent: (returns.reduce((sum, r) => sum + r, 0) / portfolioData.totalValue) * 100,
      dailyReturn: returns[0] || -2.2,
      weeklyReturn: returns.slice(0, 7).reduce((sum, r) => sum + r, 0) / 7,
      monthlyReturn: returns.slice(0, 30).reduce((sum, r) => sum + r, 0) / 30,
      yearlyReturn: returns.slice(0, 365).reduce((sum, r) => sum + r, 0) / 365,
      volatility,
      sharpeRatio,
      maxDrawdown,
      winRate: returns.filter(r => r > 0).length / returns.length,
      bestDay: Math.max(...returns, 0),
      worstDay: Math.min(...returns, 0)
    }
  }

  // Calculate risk metrics
  private async calculateRiskMetrics(portfolioData: any): Promise<RiskMetrics> {
    const assets = portfolioData.assets
    
    // Portfolio volatility (weighted average)
    const portfolioVolatility = assets.reduce((sum: number, asset: any) => 
      sum + (asset.weight / 100) * asset.volatility, 0
    )
    
    // Value at Risk calculations
    const portfolioValue = portfolioData.totalValue
    const valueAtRisk95 = portfolioValue * portfolioVolatility * 1.645 // 95% confidence
    const valueAtRisk99 = portfolioValue * portfolioVolatility * 2.326 // 99% confidence
    
    // Correlation matrix
    const correlation = this.calculateCorrelationMatrix(assets)
    
    // Diversification ratio
    const diversificationRatio = this.calculateDiversificationRatio(assets, correlation)
    
    // Concentration risk (Herfindahl index)
    const concentrationRisk = assets.reduce((sum: number, asset: any) => 
      sum + Math.pow(asset.weight / 100, 2), 0
    )
    
    return {
      portfolioVolatility,
      valueAtRisk95,
      valueAtRisk99,
      beta: 1.1, // Estimated relative to crypto market
      correlation,
      diversificationRatio,
      concentrationRisk,
      liquidityScore: 0.85 // High liquidity for major assets
    }
  }

  // Calculate correlation matrix
  private calculateCorrelationMatrix(assets: AssetSnapshot[]): CorrelationMatrix {
    const correlations: CorrelationMatrix = {}
    
    // Mock correlations based on typical crypto correlations
    const cryptoCorrelations: { [key: string]: { [key: string]: number } } = {
      'ETH': { 'BNB': 0.75, 'MATIC': 0.68 },
      'BNB': { 'ETH': 0.75, 'MATIC': 0.62 },
      'MATIC': { 'ETH': 0.68, 'BNB': 0.62 }
    }
    
    for (const asset1 of assets) {
      for (const asset2 of assets) {
        if (asset1.symbol !== asset2.symbol) {
          const key = `${asset1.symbol}-${asset2.symbol}`
          correlations[key] = cryptoCorrelations[asset1.symbol]?.[asset2.symbol] || 0.5
        }
      }
    }
    
    return correlations
  }

  // Calculate diversification ratio
  private calculateDiversificationRatio(assets: AssetSnapshot[], correlation: CorrelationMatrix): number {
    // Simplified diversification ratio calculation
    const weightedVolatility = assets.reduce((sum, asset) => 
      sum + (asset.weight / 100) * asset.volatility, 0
    )
    
    // Portfolio volatility considering correlations (simplified)
    let portfolioVariance = 0
    for (const asset1 of assets) {
      for (const asset2 of assets) {
        const weight1 = asset1.weight / 100
        const weight2 = asset2.weight / 100
        const corr = asset1.symbol === asset2.symbol ? 1 : 
          (correlation[`${asset1.symbol}-${asset2.symbol}`] || 0.5)
        
        portfolioVariance += weight1 * weight2 * asset1.volatility * asset2.volatility * corr
      }
    }
    
    const portfolioVolatility = Math.sqrt(portfolioVariance)
    return weightedVolatility / portfolioVolatility
  }

  // Performance attribution analysis
  async calculatePerformanceAttribution(walletAddress: string): Promise<PerformanceAttribution> {
    const walletKey = walletAddress.toLowerCase()
    const snapshots = this.snapshots.get(walletKey) || []
    
    if (snapshots.length < 2) {
      // Return current attribution based on weights and returns
      const currentSnapshot = snapshots[0]
      if (!currentSnapshot) {
        throw new Error('No portfolio data available')
      }
      
      const assetContributions: AssetContribution[] = currentSnapshot.assets.map(asset => ({
        symbol: asset.symbol,
        weight: asset.weight,
        return: asset.change24h,
        contribution: (asset.weight / 100) * asset.change24h,
        contributionPercent: ((asset.weight / 100) * asset.change24h) / currentSnapshot.performance.dailyReturn * 100
      }))
      
      const chainContributions: ChainContribution[] = currentSnapshot.chains.map(chain => ({
        chainName: chain.name,
        weight: chain.weight,
        return: chain.performance24h,
        contribution: (chain.weight / 100) * chain.performance24h,
        contributionPercent: ((chain.weight / 100) * chain.performance24h) / currentSnapshot.performance.dailyReturn * 100
      }))
      
      return {
        assetContributions,
        chainContributions,
        totalAttribution: assetContributions.reduce((sum, contrib) => sum + contrib.contribution, 0),
        unexplainedReturn: 0
      }
    }
    
    // Calculate attribution from historical data
    const latestSnapshot = snapshots[0]
    const previousSnapshot = snapshots[1]
    
    const totalReturn = ((latestSnapshot.totalValue - previousSnapshot.totalValue) / previousSnapshot.totalValue) * 100
    
    const assetContributions: AssetContribution[] = latestSnapshot.assets.map(asset => {
      const prevAsset = previousSnapshot.assets.find(a => a.symbol === asset.symbol)
      const assetReturn = prevAsset ? 
        ((asset.usdValue - prevAsset.usdValue) / prevAsset.usdValue) * 100 : 0
      
      return {
        symbol: asset.symbol,
        weight: asset.weight,
        return: assetReturn,
        contribution: (asset.weight / 100) * assetReturn,
        contributionPercent: ((asset.weight / 100) * assetReturn) / totalReturn * 100
      }
    })
    
    const chainContributions: ChainContribution[] = latestSnapshot.chains.map(chain => {
      const prevChain = previousSnapshot.chains.find(c => c.chainId === chain.chainId)
      const chainReturn = prevChain ? 
        ((chain.totalValue - prevChain.totalValue) / prevChain.totalValue) * 100 : 0
      
      return {
        chainName: chain.name,
        weight: chain.weight,
        return: chainReturn,
        contribution: (chain.weight / 100) * chainReturn,
        contributionPercent: ((chain.weight / 100) * chainReturn) / totalReturn * 100
      }
    })
    
    const totalAttribution = assetContributions.reduce((sum, contrib) => sum + contrib.contribution, 0)
    
    return {
      assetContributions,
      chainContributions,
      totalAttribution,
      unexplainedReturn: totalReturn - totalAttribution
    }
  }

  // Generate rebalancing recommendations
  async generateRebalancingRecommendations(walletAddress: string): Promise<RebalancingRecommendation[]> {
    const walletKey = walletAddress.toLowerCase()
    const snapshots = this.snapshots.get(walletKey) || []
    
    if (snapshots.length === 0) {
      return []
    }
    
    const currentSnapshot = snapshots[0]
    const recommendations: RebalancingRecommendation[] = []
    
    // Risk reduction recommendation
    if (currentSnapshot.riskMetrics.concentrationRisk > 0.5) {
      recommendations.push({
        id: `rebalance_${Date.now()}_1`,
        type: 'risk_reduction',
        priority: 'high',
        title: 'Reduce Concentration Risk',
        description: `Your portfolio is heavily concentrated in ${currentSnapshot.assets[0].symbol} (${currentSnapshot.assets[0].weight.toFixed(1)}%). Consider diversifying to reduce risk.`,
        actions: [
          {
            type: 'sell',
            fromAsset: currentSnapshot.assets[0].symbol,
            toAsset: 'USDC',
            amount: currentSnapshot.assets[0].usdValue * 0.2,
            amountUSD: currentSnapshot.assets[0].usdValue * 0.2,
            reason: 'Reduce concentration risk',
            urgency: 'medium'
          }
        ],
        expectedImpact: {
          riskReduction: 15,
          returnImprovement: -2,
          costEstimate: 25
        },
        confidence: 0.8
      })
    }
    
    // Volatility reduction recommendation
    const highVolAssets = currentSnapshot.assets.filter(asset => asset.volatility > 0.7)
    if (highVolAssets.length > 0) {
      recommendations.push({
        id: `rebalance_${Date.now()}_2`,
        type: 'risk_reduction',
        priority: 'medium',
        title: 'Reduce Portfolio Volatility',
        description: `Consider reducing exposure to high-volatility assets like ${highVolAssets.map(a => a.symbol).join(', ')}.`,
        actions: highVolAssets.map(asset => ({
          type: 'sell' as const,
          fromAsset: asset.symbol,
          toAsset: 'ETH',
          amount: asset.usdValue * 0.3,
          amountUSD: asset.usdValue * 0.3,
          reason: 'Reduce volatility',
          urgency: 'low' as const
        })),
        expectedImpact: {
          riskReduction: 20,
          returnImprovement: -5,
          costEstimate: 15
        },
        confidence: 0.7
      })
    }
    
    // Opportunity recommendation
    if (currentSnapshot.performance.sharpeRatio < 1.0) {
      recommendations.push({
        id: `rebalance_${Date.now()}_3`,
        type: 'opportunity',
        priority: 'medium',
        title: 'Improve Risk-Adjusted Returns',
        description: 'Your portfolio\'s Sharpe ratio could be improved by rebalancing towards higher-performing assets.',
        actions: [
          {
            type: 'buy',
            toAsset: 'ETH',
            amount: 100,
            amountUSD: 100,
            reason: 'Improve Sharpe ratio',
            urgency: 'low'
          }
        ],
        expectedImpact: {
          riskReduction: 5,
          returnImprovement: 8,
          costEstimate: 20
        },
        confidence: 0.6
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Helper methods
  private calculateReturns(snapshots: PortfolioSnapshot[]): number[] {
    const returns: number[] = []
    
    for (let i = 0; i < snapshots.length - 1; i++) {
      const current = snapshots[i]
      const previous = snapshots[i + 1]
      const returnPct = ((current.totalValue - previous.totalValue) / previous.totalValue) * 100
      returns.push(returnPct)
    }
    
    return returns
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    return Math.sqrt(variance)
  }

  private calculateSharpeRatio(returns: number[], volatility: number): number {
    if (volatility === 0) return 0
    
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const riskFreeRate = 0.05 // 5% annual risk-free rate
    return (meanReturn - riskFreeRate) / volatility
  }

  private calculateMaxDrawdown(snapshots: PortfolioSnapshot[]): number {
    if (snapshots.length < 2) return 0
    
    let maxDrawdown = 0
    let peak = snapshots[snapshots.length - 1].totalValue
    
    for (let i = snapshots.length - 2; i >= 0; i--) {
      const current = snapshots[i].totalValue
      if (current > peak) {
        peak = current
      } else {
        const drawdown = ((peak - current) / peak) * 100
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }
    
    return maxDrawdown
  }

  // Public methods
  getSnapshots(walletAddress: string, limit = 100): PortfolioSnapshot[] {
    const walletKey = walletAddress.toLowerCase()
    const snapshots = this.snapshots.get(walletKey) || []
    return snapshots.slice(0, limit)
  }

  getHistoricalData(walletAddress: string): HistoricalData | null {
    const walletKey = walletAddress.toLowerCase()
    return this.historicalData.get(walletKey) || null
  }

  async getPortfolioSummary(walletAddress: string): Promise<{
    currentSnapshot: PortfolioSnapshot
    performanceAttribution: PerformanceAttribution
    recommendations: RebalancingRecommendation[]
  }> {
    // Create current snapshot
    const currentSnapshot = await this.createSnapshot(walletAddress)
    
    // Calculate performance attribution
    const performanceAttribution = await this.calculatePerformanceAttribution(walletAddress)
    
    // Generate recommendations
    const recommendations = await this.generateRebalancingRecommendations(walletAddress)
    
    return {
      currentSnapshot,
      performanceAttribution,
      recommendations
    }
  }
}

// Global portfolio analytics instance
export const portfolioAnalytics = PortfolioAnalytics.getInstance()