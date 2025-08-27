/**
 * Institutional Portfolio Management System
 * Advanced portfolio management features for institutional investors
 */

export interface InstitutionalPortfolio {
  id: string
  institutionId: string
  name: string
  description: string
  totalValue: number
  totalInvested: number
  pnl: number
  pnlPercentage: number
  currency: string
  riskLevel: 'conservative' | 'moderate' | 'aggressive' | 'high-risk'
  benchmark: string
  createdAt: number
  updatedAt: number
  assets: InstitutionalAsset[]
  allocations: AllocationTarget[]
  riskMetrics: PortfolioRiskMetrics
  performance: PerformanceMetrics
  compliance: ComplianceStatus
  rebalancing: RebalancingConfig
}

export interface InstitutionalAsset {
  id: string
  symbol: string
  name: string
  type: 'crypto' | 'defi' | 'nft' | 'derivative' | 'fund'
  allocation: number // percentage
  targetAllocation: number
  currentValue: number
  invested: number
  pnl: number
  pnlPercentage: number
  riskScore: number
  liquidityScore: number
  chains: string[]
  protocols: string[]
  lastUpdated: number
}

export interface AllocationTarget {
  category: string
  targetPercentage: number
  currentPercentage: number
  minPercentage: number
  maxPercentage: number
  tolerance: number
  priority: 'high' | 'medium' | 'low'
}

export interface PortfolioRiskMetrics {
  var95: number // Value at Risk 95%
  var99: number // Value at Risk 99%
  cvar95: number // Conditional VaR 95%
  beta: number
  alpha: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  volatility: number
  correlation: Record<string, number>
  concentrationRisk: number
  liquidityRisk: number
  counterpartyRisk: number
}

export interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  benchmarkReturn: number
  trackingError: number
  informationRatio: number
  calmarRatio: number
  omega: number
  sterling: number
  treynor: number
  jensen: number
  periods: {
    period: string
    return: number
    benchmark: number
    excess: number
    volatility: number
  }[]
}

export interface ComplianceStatus {
  isCompliant: boolean
  violations: ComplianceViolation[]
  limits: ComplianceLimit[]
  reports: ComplianceReport[]
  lastCheck: number
}

export interface ComplianceViolation {
  id: string
  type: 'allocation' | 'concentration' | 'leverage' | 'liquidity' | 'exposure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  currentValue: number
  limitValue: number
  detected: number
  resolved?: number
  action: string
}

export interface ComplianceLimit {
  id: string
  type: string
  description: string
  limit: number
  current: number
  warning: number
  breach: number
  isActive: boolean
}

export interface ComplianceReport {
  id: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  generatedAt: number
  status: 'compliant' | 'warnings' | 'violations'
  summary: string
  details: any
}

export interface RebalancingConfig {
  isEnabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'threshold'
  threshold: number // percentage deviation
  method: 'equal-weight' | 'market-cap' | 'risk-parity' | 'factor-based'
  constraints: {
    maxTurnover: number
    minTradeSize: number
    maxTradeSize: number
    allowedSlippage: number
  }
  lastRebalance: number
  nextRebalance: number
}

export interface InstitutionalUser {
  id: string
  institutionId: string
  email: string
  name: string
  role: 'admin' | 'portfolio-manager' | 'trader' | 'analyst' | 'compliance' | 'read-only'
  permissions: Permission[]
  portfolios: string[]
  createdAt: number
  lastLogin: number
}

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute')[]
}

export interface RebalancingProposal {
  id: string
  portfolioId: string
  createdBy: string
  createdAt: number
  status: 'pending' | 'approved' | 'rejected' | 'executed'
  trades: ProposedTrade[]
  expectedCost: number
  expectedSlippage: number
  riskImpact: RiskImpact
  complianceCheck: boolean
  approvals: Approval[]
}

export interface ProposedTrade {
  id: string
  symbol: string
  action: 'buy' | 'sell'
  quantity: number
  currentPrice: number
  targetPrice: number
  estimatedCost: number
  estimatedSlippage: number
  priority: number
}

export interface RiskImpact {
  varChange: number
  sharpeChange: number
  trackingErrorChange: number
  concentrationChange: number
}

export interface Approval {
  userId: string
  userName: string
  status: 'pending' | 'approved' | 'rejected'
  timestamp: number
  comments?: string
}

export interface InstitutionalReport {
  id: string
  portfolioId: string
  type: 'performance' | 'risk' | 'compliance' | 'allocation' | 'attribution'
  period: string
  generatedAt: number
  generatedBy: string
  data: any
  format: 'pdf' | 'excel' | 'json'
  status: 'generating' | 'completed' | 'failed'
  downloadUrl?: string
}

export class InstitutionalPortfolioManager {
  private portfolios: Map<string, InstitutionalPortfolio> = new Map()
  private users: Map<string, InstitutionalUser> = new Map()
  private rebalancingProposals: Map<string, RebalancingProposal> = new Map()
  private reports: Map<string, InstitutionalReport> = new Map()

  constructor() {
    this.initializeDemo()
  }

  /**
   * Create a new institutional portfolio
   */
  async createPortfolio(
    institutionId: string,
    config: Omit<InstitutionalPortfolio, 'id' | 'createdAt' | 'updatedAt' | 'assets' | 'riskMetrics' | 'performance' | 'compliance'>
  ): Promise<InstitutionalPortfolio> {
    const portfolio: InstitutionalPortfolio = {
      ...config,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      assets: [],
      riskMetrics: this.generateDefaultRiskMetrics(),
      performance: this.generateDefaultPerformance(),
      compliance: this.generateDefaultCompliance()
    }

    this.portfolios.set(portfolio.id, portfolio)
    return portfolio
  }

  /**
   * Get portfolio with risk analytics
   */
  async getPortfolioAnalytics(portfolioId: string): Promise<InstitutionalPortfolio | null> {
    const portfolio = this.portfolios.get(portfolioId)
    if (!portfolio) return null

    // Update real-time metrics
    portfolio.riskMetrics = await this.calculateRiskMetrics(portfolio)
    portfolio.performance = await this.calculatePerformance(portfolio)
    portfolio.compliance = await this.checkCompliance(portfolio)

    return portfolio
  }

  /**
   * Generate rebalancing proposal
   */
  async generateRebalancingProposal(
    portfolioId: string,
    userId: string,
    method?: string
  ): Promise<RebalancingProposal> {
    const portfolio = this.portfolios.get(portfolioId)
    if (!portfolio) {
      throw new Error('Portfolio not found')
    }

    const trades = await this.calculateRebalancingTrades(portfolio, method)
    const riskImpact = await this.calculateRiskImpact(portfolio, trades)

    const proposal: RebalancingProposal = {
      id: this.generateId(),
      portfolioId,
      createdBy: userId,
      createdAt: Date.now(),
      status: 'pending',
      trades,
      expectedCost: trades.reduce((sum, trade) => sum + trade.estimatedCost, 0),
      expectedSlippage: trades.reduce((sum, trade) => sum + trade.estimatedSlippage, 0) / trades.length,
      riskImpact,
      complianceCheck: await this.checkRebalancingCompliance(portfolio, trades),
      approvals: []
    }

    this.rebalancingProposals.set(proposal.id, proposal)
    return proposal
  }

  /**
   * Execute rebalancing proposal
   */
  async executeRebalancing(proposalId: string, userId: string): Promise<{
    success: boolean
    executedTrades: number
    totalCost: number
    errors: string[]
  }> {
    const proposal = this.rebalancingProposals.get(proposalId)
    if (!proposal || proposal.status !== 'approved') {
      throw new Error('Proposal not found or not approved')
    }

    // Simulate execution
    const results = {
      success: true,
      executedTrades: proposal.trades.length,
      totalCost: proposal.expectedCost * (1 + Math.random() * 0.1), // Add some variance
      errors: []
    }

    proposal.status = 'executed'
    return results
  }

  /**
   * Generate institutional report
   */
  async generateReport(
    portfolioId: string,
    type: InstitutionalReport['type'],
    period: string,
    userId: string
  ): Promise<InstitutionalReport> {
    const report: InstitutionalReport = {
      id: this.generateId(),
      portfolioId,
      type,
      period,
      generatedAt: Date.now(),
      generatedBy: userId,
      data: await this.generateReportData(portfolioId, type, period),
      format: 'pdf',
      status: 'generating'
    }

    this.reports.set(report.id, report)

    // Simulate report generation
    setTimeout(() => {
      report.status = 'completed'
      report.downloadUrl = `/api/reports/${report.id}/download`
    }, 3000)

    return report
  }

  /**
   * Get compliance dashboard
   */
  async getComplianceDashboard(institutionId: string): Promise<{
    portfolios: number
    compliantPortfolios: number
    totalViolations: number
    criticalViolations: number
    recentReports: ComplianceReport[]
    riskSummary: any
  }> {
    const institutionPortfolios = Array.from(this.portfolios.values())
      .filter(p => p.institutionId === institutionId)

    const compliantPortfolios = institutionPortfolios.filter(p => p.compliance.isCompliant).length
    const allViolations = institutionPortfolios.flatMap(p => p.compliance.violations)
    const criticalViolations = allViolations.filter(v => v.severity === 'critical').length

    return {
      portfolios: institutionPortfolios.length,
      compliantPortfolios,
      totalViolations: allViolations.length,
      criticalViolations,
      recentReports: this.getRecentComplianceReports(institutionId),
      riskSummary: this.calculateInstitutionRiskSummary(institutionPortfolios)
    }
  }

  /**
   * Get performance attribution analysis
   */
  async getPerformanceAttribution(portfolioId: string, period: string): Promise<{
    totalReturn: number
    benchmarkReturn: number
    excess: number
    attribution: {
      assetSelection: number
      allocation: number
      interaction: number
      currency: number
      other: number
    }
    breakdown: {
      asset: string
      weight: number
      return: number
      contribution: number
      excess: number
    }[]
  }> {
    // Simulate performance attribution analysis
    return {
      totalReturn: 12.5,
      benchmarkReturn: 8.3,
      excess: 4.2,
      attribution: {
        assetSelection: 2.8,
        allocation: 1.1,
        interaction: 0.2,
        currency: 0.1,
        other: 0.0
      },
      breakdown: [
        { asset: 'ETH', weight: 35, return: 15.2, contribution: 5.32, excess: 2.1 },
        { asset: 'BTC', weight: 25, return: 8.7, contribution: 2.18, excess: -0.5 },
        { asset: 'DEFI', weight: 20, return: 22.1, contribution: 4.42, excess: 4.8 },
        { asset: 'STABLES', weight: 20, return: 4.5, contribution: 0.90, excess: 0.2 }
      ]
    }
  }

  // Private helper methods
  private async calculateRiskMetrics(portfolio: InstitutionalPortfolio): Promise<PortfolioRiskMetrics> {
    // Simulate complex risk calculations
    return {
      var95: portfolio.totalValue * 0.05,
      var99: portfolio.totalValue * 0.08,
      cvar95: portfolio.totalValue * 0.12,
      beta: 1.2 + Math.random() * 0.4,
      alpha: Math.random() * 0.08 - 0.02,
      sharpeRatio: 1.5 + Math.random() * 0.8,
      sortinoRatio: 2.1 + Math.random() * 0.6,
      maxDrawdown: Math.random() * 0.25,
      volatility: 0.15 + Math.random() * 0.15,
      correlation: { BTC: 0.7, ETH: 0.65, SPY: 0.3 },
      concentrationRisk: Math.random() * 0.4,
      liquidityRisk: Math.random() * 0.3,
      counterpartyRisk: Math.random() * 0.2
    }
  }

  private async calculatePerformance(portfolio: InstitutionalPortfolio): Promise<PerformanceMetrics> {
    const totalReturn = portfolio.pnlPercentage
    const benchmarkReturn = 8.5 // Mock benchmark
    
    return {
      totalReturn,
      annualizedReturn: totalReturn * (365 / 30), // Simplified
      benchmarkReturn,
      trackingError: Math.abs(totalReturn - benchmarkReturn) * 1.2,
      informationRatio: (totalReturn - benchmarkReturn) / 0.08,
      calmarRatio: totalReturn / 0.15,
      omega: 1.3 + Math.random() * 0.5,
      sterling: 1.1 + Math.random() * 0.4,
      treynor: totalReturn / 1.2,
      jensen: totalReturn - benchmarkReturn,
      periods: [
        { period: '1D', return: 0.2, benchmark: 0.1, excess: 0.1, volatility: 2.1 },
        { period: '1W', return: 1.5, benchmark: 0.8, excess: 0.7, volatility: 4.2 },
        { period: '1M', return: totalReturn, benchmark: benchmarkReturn, excess: totalReturn - benchmarkReturn, volatility: 8.5 },
        { period: '3M', return: totalReturn * 2.8, benchmark: benchmarkReturn * 2.5, excess: (totalReturn - benchmarkReturn) * 2.8, volatility: 12.3 }
      ]
    }
  }

  private async checkCompliance(portfolio: InstitutionalPortfolio): Promise<ComplianceStatus> {
    const violations: ComplianceViolation[] = []
    
    // Check concentration limits
    portfolio.assets.forEach(asset => {
      if (asset.allocation > 40) {
        violations.push({
          id: this.generateId(),
          type: 'concentration',
          severity: 'high',
          description: `${asset.symbol} allocation exceeds 40% limit`,
          currentValue: asset.allocation,
          limitValue: 40,
          detected: Date.now(),
          action: 'Reduce allocation through rebalancing'
        })
      }
    })

    return {
      isCompliant: violations.length === 0,
      violations,
      limits: [
        { id: '1', type: 'Single Asset Limit', description: 'Max 40% in any single asset', limit: 40, current: 35, warning: 35, breach: 40, isActive: true },
        { id: '2', type: 'Leverage Limit', description: 'Max 2x leverage', limit: 200, current: 100, warning: 180, breach: 200, isActive: true },
        { id: '3', type: 'VaR Limit', description: 'Max 5% daily VaR', limit: 5, current: 3.2, warning: 4, breach: 5, isActive: true }
      ],
      reports: [],
      lastCheck: Date.now()
    }
  }

  private async calculateRebalancingTrades(portfolio: InstitutionalPortfolio, method?: string): Promise<ProposedTrade[]> {
    const trades: ProposedTrade[] = []
    
    portfolio.allocations.forEach((allocation, index) => {
      const deviation = Math.abs(allocation.currentPercentage - allocation.targetPercentage)
      
      if (deviation > allocation.tolerance) {
        const action = allocation.currentPercentage > allocation.targetPercentage ? 'sell' : 'buy'
        const quantity = Math.abs(allocation.currentPercentage - allocation.targetPercentage) * portfolio.totalValue / 100
        
        trades.push({
          id: this.generateId(),
          symbol: `ASSET_${index}`,
          action,
          quantity,
          currentPrice: 100 + Math.random() * 200,
          targetPrice: 100 + Math.random() * 200,
          estimatedCost: quantity * 0.002, // 0.2% transaction cost
          estimatedSlippage: Math.random() * 0.5,
          priority: deviation > allocation.tolerance * 2 ? 1 : 2
        })
      }
    })

    return trades.sort((a, b) => a.priority - b.priority)
  }

  private async calculateRiskImpact(portfolio: InstitutionalPortfolio, trades: ProposedTrade[]): Promise<RiskImpact> {
    return {
      varChange: Math.random() * 0.02 - 0.01, // ±1%
      sharpeChange: Math.random() * 0.1 - 0.05,
      trackingErrorChange: Math.random() * 0.01 - 0.005,
      concentrationChange: Math.random() * 0.05 - 0.025
    }
  }

  private async checkRebalancingCompliance(portfolio: InstitutionalPortfolio, trades: ProposedTrade[]): Promise<boolean> {
    // Simulate compliance check
    return trades.every(trade => trade.estimatedSlippage < 2.0) // Max 2% slippage
  }

  private async generateReportData(portfolioId: string, type: string, period: string): Promise<any> {
    // Generate mock report data based on type
    const baseData = {
      portfolioId,
      period,
      generatedAt: Date.now(),
      summary: `${type} report for period ${period}`
    }

    switch (type) {
      case 'performance':
        return { ...baseData, returns: { total: 12.5, benchmark: 8.3 }, metrics: {} }
      case 'risk':
        return { ...baseData, var95: 250000, maxDrawdown: 0.15, sharpe: 1.8 }
      case 'compliance':
        return { ...baseData, violations: 0, limits: 12, status: 'compliant' }
      default:
        return baseData
    }
  }

  private getRecentComplianceReports(institutionId: string): ComplianceReport[] {
    return [
      {
        id: '1',
        type: 'daily',
        generatedAt: Date.now() - 86400000,
        status: 'compliant',
        summary: 'All portfolios compliant',
        details: {}
      }
    ]
  }

  private calculateInstitutionRiskSummary(portfolios: InstitutionalPortfolio[]): any {
    return {
      totalAUM: portfolios.reduce((sum, p) => sum + p.totalValue, 0),
      averageVaR: 3.2,
      worstDrawdown: 0.18,
      averageSharpe: 1.6
    }
  }

  private generateDefaultRiskMetrics(): PortfolioRiskMetrics {
    return {
      var95: 0,
      var99: 0,
      cvar95: 0,
      beta: 1.0,
      alpha: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      volatility: 0,
      correlation: {},
      concentrationRisk: 0,
      liquidityRisk: 0,
      counterpartyRisk: 0
    }
  }

  private generateDefaultPerformance(): PerformanceMetrics {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      benchmarkReturn: 0,
      trackingError: 0,
      informationRatio: 0,
      calmarRatio: 0,
      omega: 0,
      sterling: 0,
      treynor: 0,
      jensen: 0,
      periods: []
    }
  }

  private generateDefaultCompliance(): ComplianceStatus {
    return {
      isCompliant: true,
      violations: [],
      limits: [],
      reports: [],
      lastCheck: Date.now()
    }
  }

  private initializeDemo(): void {
    // Initialize with demo data
    const demoPortfolio: InstitutionalPortfolio = {
      id: 'demo-institutional-portfolio',
      institutionId: 'demo-institution',
      name: 'Diversified Crypto Fund',
      description: 'Multi-strategy institutional cryptocurrency portfolio',
      totalValue: 50000000, // $50M
      totalInvested: 45000000,
      pnl: 5000000,
      pnlPercentage: 11.11,
      currency: 'USD',
      riskLevel: 'moderate',
      benchmark: 'CRYPTO_INDEX',
      createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
      updatedAt: Date.now(),
      assets: [
        {
          id: '1', symbol: 'BTC', name: 'Bitcoin', type: 'crypto', allocation: 35, targetAllocation: 30,
          currentValue: 17500000, invested: 15000000, pnl: 2500000, pnlPercentage: 16.67, riskScore: 75,
          liquidityScore: 95, chains: ['bitcoin'], protocols: [], lastUpdated: Date.now()
        },
        {
          id: '2', symbol: 'ETH', name: 'Ethereum', type: 'crypto', allocation: 25, targetAllocation: 25,
          currentValue: 12500000, invested: 11250000, pnl: 1250000, pnlPercentage: 11.11, riskScore: 80,
          liquidityScore: 90, chains: ['ethereum'], protocols: [], lastUpdated: Date.now()
        },
        {
          id: '3', symbol: 'DEFI', name: 'DeFi Basket', type: 'defi', allocation: 20, targetAllocation: 25,
          currentValue: 10000000, invested: 9000000, pnl: 1000000, pnlPercentage: 11.11, riskScore: 85,
          liquidityScore: 75, chains: ['ethereum', 'polygon'], protocols: ['uniswap', 'aave'], lastUpdated: Date.now()
        }
      ],
      allocations: [
        { category: 'Bitcoin', targetPercentage: 30, currentPercentage: 35, minPercentage: 25, maxPercentage: 40, tolerance: 5, priority: 'high' },
        { category: 'Ethereum', targetPercentage: 25, currentPercentage: 25, minPercentage: 20, maxPercentage: 30, tolerance: 3, priority: 'high' },
        { category: 'DeFi', targetPercentage: 25, currentPercentage: 20, minPercentage: 15, maxPercentage: 30, tolerance: 5, priority: 'medium' },
        { category: 'Stablecoins', targetPercentage: 20, currentPercentage: 20, minPercentage: 15, maxPercentage: 25, tolerance: 3, priority: 'low' }
      ],
      riskMetrics: this.generateDefaultRiskMetrics(),
      performance: this.generateDefaultPerformance(),
      compliance: this.generateDefaultCompliance(),
      rebalancing: {
        isEnabled: true,
        frequency: 'weekly',
        threshold: 5,
        method: 'risk-parity',
        constraints: {
          maxTurnover: 20,
          minTradeSize: 10000,
          maxTradeSize: 5000000,
          allowedSlippage: 1.0
        },
        lastRebalance: Date.now() - 7 * 24 * 60 * 60 * 1000,
        nextRebalance: Date.now() + 24 * 60 * 60 * 1000
      }
    }

    this.portfolios.set(demoPortfolio.id, demoPortfolio)
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Singleton instance
export const institutionalPortfolioManager = new InstitutionalPortfolioManager()