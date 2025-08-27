/**
 * Advanced Transaction Analytics and Monitoring Enhancement
 * Provides additional analytics and intelligent insights for transaction monitoring
 */

import { Transaction, TransactionAlert, AlertType, AlertSeverity, TransactionCategory } from './transaction-monitor'

export interface TransactionPattern {
  pattern: string
  confidence: number
  description: string
  risk: 'low' | 'medium' | 'high'
  frequency: number
  lastSeen: number
}

export interface WalletBehaviorAnalysis {
  walletAddress: string
  transactionVolume24h: number
  averageTransactionSize: number
  mostActiveHours: number[]
  preferredChains: { [chainId: number]: number }
  defiEngagement: number
  riskScore: number
  patterns: TransactionPattern[]
  liquidityMovements: {
    inflow: number
    outflow: number
    net: number
  }
}

export interface SecurityAlert {
  id: string
  type: 'suspicious_pattern' | 'new_authorization' | 'large_approval' | 'unusual_timing' | 'sandwich_attack'
  severity: AlertSeverity
  title: string
  description: string
  recommendation: string
  transaction?: Transaction
  relatedTransactions: string[]
  timestamp: number
}

export interface MonitoringStats {
  totalTransactionsMonitored: number
  alertsGenerated: number
  suspiciousActivitiesDetected: number
  averageResponseTime: number
  monitoredWallets: number
  uptime: number
}

export class TransactionAnalytics {
  private static instance: TransactionAnalytics
  private behaviorCache: Map<string, WalletBehaviorAnalysis> = new Map()
  private securityAlerts: SecurityAlert[] = []
  private stats: MonitoringStats = {
    totalTransactionsMonitored: 0,
    alertsGenerated: 0,
    suspiciousActivitiesDetected: 0,
    averageResponseTime: 0,
    monitoredWallets: 0,
    uptime: Date.now()
  }

  // Suspicious contract addresses (known scams, phishing, etc.)
  private suspiciousContracts = new Set([
    '0x0000000000000000000000000000000000000001', // Example suspicious address
    '0xScamContract123456789abcdef',  // Placeholder for actual scam addresses
    // Add more known suspicious addresses
  ])

  // High-value DeFi protocols for tracking
  private defiProtocols = new Map([
    ['0x6b175474e89094c44da98b954eedeac495271d0f', { name: 'MakerDAO DAI', tvl: 8000000000 }],
    ['0xa0b86a33e6417c4c6b8c4c6b8c4c6b8c4c6b8c4c', { name: 'USDC', tvl: 50000000000 }],
    ['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', { name: 'AAVE', tvl: 15000000000 }],
  ])

  static getInstance(): TransactionAnalytics {
    if (!TransactionAnalytics.instance) {
      TransactionAnalytics.instance = new TransactionAnalytics()
    }
    return TransactionAnalytics.instance
  }

  /**
   * Analyze wallet behavior based on transaction history
   */
  async analyzeWalletBehavior(walletAddress: string, transactions: Transaction[]): Promise<WalletBehaviorAnalysis> {
    const now = Date.now()
    const last24h = now - (24 * 60 * 60 * 1000)
    
    // Filter transactions from last 24 hours
    const recent24h = transactions.filter(tx => tx.timestamp > last24h)
    
    // Calculate transaction volume
    const transactionVolume24h = recent24h.reduce((sum, tx) => sum + tx.valueUSD, 0)
    
    // Calculate average transaction size
    const averageTransactionSize = transactions.length > 0 
      ? transactions.reduce((sum, tx) => sum + tx.valueUSD, 0) / transactions.length 
      : 0
    
    // Find most active hours
    const hourlyActivity = new Array(24).fill(0)
    transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours()
      hourlyActivity[hour]++
    })
    const mostActiveHours = hourlyActivity
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour)
    
    // Analyze chain preferences
    const chainActivity: { [chainId: number]: number } = {}
    transactions.forEach(tx => {
      chainActivity[tx.chainId] = (chainActivity[tx.chainId] || 0) + 1
    })
    
    // Calculate DeFi engagement score
    const defiTransactions = transactions.filter(tx => 
      tx.category !== TransactionCategory.TRANSFER && tx.defiProtocol
    )
    const defiEngagement = transactions.length > 0 
      ? (defiTransactions.length / transactions.length) * 100 
      : 0
    
    // Detect patterns
    const patterns = this.detectTransactionPatterns(transactions)
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(transactions, patterns)
    
    // Analyze liquidity movements
    const liquidityMovements = this.analyzeLiquidityMovements(transactions, walletAddress)
    
    const analysis: WalletBehaviorAnalysis = {
      walletAddress,
      transactionVolume24h,
      averageTransactionSize,
      mostActiveHours,
      preferredChains: chainActivity,
      defiEngagement,
      riskScore,
      patterns,
      liquidityMovements
    }
    
    // Cache the analysis
    this.behaviorCache.set(walletAddress.toLowerCase(), analysis)
    
    return analysis
  }

  /**
   * Detect suspicious transaction patterns
   */
  private detectTransactionPatterns(transactions: Transaction[]): TransactionPattern[] {
    const patterns: TransactionPattern[] = []
    
    // Pattern 1: Frequent small transactions (possible dusting attack)
    const smallTxs = transactions.filter(tx => tx.valueUSD < 1 && tx.valueUSD > 0)
    if (smallTxs.length > 10) {
      patterns.push({
        pattern: 'frequent_dust_transactions',
        confidence: Math.min(smallTxs.length / 20 * 100, 100),
        description: 'Multiple small-value transactions detected',
        risk: smallTxs.length > 50 ? 'high' : 'medium',
        frequency: smallTxs.length,
        lastSeen: Math.max(...smallTxs.map(tx => tx.timestamp))
      })
    }
    
    // Pattern 2: Rapid sequence transactions
    const sortedTxs = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
    let rapidSequences = 0
    for (let i = 1; i < sortedTxs.length; i++) {
      if (sortedTxs[i].timestamp - sortedTxs[i-1].timestamp < 60000) { // Less than 1 minute apart
        rapidSequences++
      }
    }
    
    if (rapidSequences > 5) {
      patterns.push({
        pattern: 'rapid_sequence_transactions',
        confidence: Math.min(rapidSequences / 10 * 100, 100),
        description: 'Rapid sequence of transactions detected',
        risk: rapidSequences > 20 ? 'high' : 'medium',
        frequency: rapidSequences,
        lastSeen: transactions.length > 0 ? Math.max(...transactions.map(tx => tx.timestamp)) : 0
      })
    }
    
    // Pattern 3: Large value transactions outside normal hours
    const nightTransactions = transactions.filter(tx => {
      const hour = new Date(tx.timestamp).getHours()
      return (hour < 6 || hour > 22) && tx.valueUSD > 10000
    })
    
    if (nightTransactions.length > 0) {
      patterns.push({
        pattern: 'large_night_transactions',
        confidence: nightTransactions.length * 25,
        description: 'Large transactions during unusual hours',
        risk: 'medium',
        frequency: nightTransactions.length,
        lastSeen: Math.max(...nightTransactions.map(tx => tx.timestamp))
      })
    }
    
    // Pattern 4: Contract interaction with unknown/new contracts
    const newContractInteractions = transactions.filter(tx => 
      tx.contractAddress && !this.defiProtocols.has(tx.contractAddress)
    )
    
    if (newContractInteractions.length > 0) {
      patterns.push({
        pattern: 'new_contract_interactions',
        confidence: 70,
        description: 'Interactions with unknown or new smart contracts',
        risk: 'low',
        frequency: newContractInteractions.length,
        lastSeen: Math.max(...newContractInteractions.map(tx => tx.timestamp))
      })
    }
    
    return patterns
  }

  /**
   * Calculate wallet risk score based on transaction history and patterns
   */
  private calculateRiskScore(transactions: Transaction[], patterns: TransactionPattern[]): number {
    let riskScore = 0
    
    // Base score from transaction characteristics
    const avgValue = transactions.reduce((sum, tx) => sum + tx.valueUSD, 0) / transactions.length
    if (avgValue > 100000) riskScore += 30 // High value transactions
    if (avgValue < 10) riskScore += 20 // Unusually small transactions
    
    // Failed transaction ratio
    const failedTxs = transactions.filter(tx => tx.status === 'failed')
    const failureRate = failedTxs.length / transactions.length
    if (failureRate > 0.1) riskScore += 25 // High failure rate
    
    // Pattern-based scoring
    patterns.forEach(pattern => {
      switch (pattern.risk) {
        case 'high':
          riskScore += 40
          break
        case 'medium':
          riskScore += 20
          break
        case 'low':
          riskScore += 10
          break
      }
    })
    
    // Suspicious contract interactions
    const suspiciousInteractions = transactions.filter(tx => 
      tx.contractAddress && this.suspiciousContracts.has(tx.contractAddress)
    )
    riskScore += suspiciousInteractions.length * 50
    
    return Math.min(riskScore, 100) // Cap at 100
  }

  /**
   * Analyze liquidity movements (inflow vs outflow)
   */
  private analyzeLiquidityMovements(transactions: Transaction[], walletAddress: string): {
    inflow: number
    outflow: number
    net: number
  } {
    let inflow = 0
    let outflow = 0
    
    transactions.forEach(tx => {
      if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
        inflow += tx.valueUSD
      } else if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
        outflow += tx.valueUSD
      }
    })
    
    return {
      inflow,
      outflow,
      net: inflow - outflow
    }
  }

  /**
   * Generate security alerts based on transaction analysis
   */
  async generateSecurityAlerts(walletAddress: string, transaction: Transaction): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = []
    
    // Check for interactions with suspicious contracts
    if (transaction.contractAddress && this.suspiciousContracts.has(transaction.contractAddress)) {
      alerts.push({
        id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'new_authorization',
        severity: AlertSeverity.CRITICAL,
        title: 'Suspicious Contract Interaction',
        description: `Transaction with potentially malicious contract ${transaction.contractAddress}`,
        recommendation: 'Revoke any approvals and avoid further interactions with this contract',
        transaction,
        relatedTransactions: [],
        timestamp: Date.now()
      })
    }
    
    // Check for large token approvals
    if (transaction.methodName === 'approve' && transaction.valueUSD > 50000) {
      alerts.push({
        id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'large_approval',
        severity: AlertSeverity.HIGH,
        title: 'Large Token Approval',
        description: `High-value token approval: ${transaction.valueUSD.toFixed(2)} USD`,
        recommendation: 'Review the approval amount and consider using a lower allowance',
        transaction,
        relatedTransactions: [],
        timestamp: Date.now()
      })
    }
    
    // Check for unusual timing patterns
    const hour = new Date(transaction.timestamp).getHours()
    if ((hour < 4 || hour > 23) && transaction.valueUSD > 10000) {
      alerts.push({
        id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'unusual_timing',
        severity: AlertSeverity.MEDIUM,
        title: 'Unusual Transaction Timing',
        description: `Large transaction during unusual hours (${hour}:00)`,
        recommendation: 'Verify this transaction was intended and authorized by you',
        transaction,
        relatedTransactions: [],
        timestamp: Date.now()
      })
    }
    
    // Store alerts
    alerts.forEach(alert => {
      this.securityAlerts.unshift(alert)
      this.stats.suspiciousActivitiesDetected++
    })
    
    // Keep only last 1000 alerts
    if (this.securityAlerts.length > 1000) {
      this.securityAlerts.splice(1000)
    }
    
    return alerts
  }

  /**
   * Get comprehensive monitoring statistics
   */
  getMonitoringStats(): MonitoringStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.uptime
    }
  }

  /**
   * Get cached behavior analysis for a wallet
   */
  getCachedBehaviorAnalysis(walletAddress: string): WalletBehaviorAnalysis | null {
    return this.behaviorCache.get(walletAddress.toLowerCase()) || null
  }

  /**
   * Get all security alerts for a wallet
   */
  getSecurityAlerts(walletAddress?: string): SecurityAlert[] {
    if (walletAddress) {
      return this.securityAlerts.filter(alert => 
        alert.transaction?.from.toLowerCase() === walletAddress.toLowerCase() ||
        alert.transaction?.to.toLowerCase() === walletAddress.toLowerCase()
      )
    }
    return this.securityAlerts
  }

  /**
   * Update monitoring statistics
   */
  updateStats(update: Partial<MonitoringStats>): void {
    this.stats = { ...this.stats, ...update }
  }

  /**
   * Generate transaction insights for dashboard
   */
  generateTransactionInsights(transactions: Transaction[]): {
    totalVolume: number
    transactionCount: number
    averageGasUsed: number
    mostActiveChain: string
    defiActivity: number
    riskLevel: 'low' | 'medium' | 'high'
  } {
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.valueUSD, 0)
    const transactionCount = transactions.length
    const averageGasUsed = transactions.reduce((sum, tx) => sum + parseFloat(tx.gasUsed), 0) / transactionCount
    
    // Find most active chain
    const chainActivity: { [key: string]: number } = {}
    transactions.forEach(tx => {
      chainActivity[tx.chainName] = (chainActivity[tx.chainName] || 0) + 1
    })
    const mostActiveChain = Object.entries(chainActivity)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown'
    
    // Calculate DeFi activity percentage
    const defiTxs = transactions.filter(tx => tx.defiProtocol)
    const defiActivity = transactionCount > 0 ? (defiTxs.length / transactionCount) * 100 : 0
    
    // Determine risk level
    const highValueTxs = transactions.filter(tx => tx.valueUSD > 10000)
    const failedTxs = transactions.filter(tx => tx.status === 'failed')
    const riskLevel = 
      highValueTxs.length > 5 || failedTxs.length / transactionCount > 0.1 ? 'high' :
      highValueTxs.length > 2 || failedTxs.length / transactionCount > 0.05 ? 'medium' : 'low'
    
    return {
      totalVolume,
      transactionCount,
      averageGasUsed,
      mostActiveChain,
      defiActivity,
      riskLevel
    }
  }
}

// Global analytics instance
export const transactionAnalytics = TransactionAnalytics.getInstance()