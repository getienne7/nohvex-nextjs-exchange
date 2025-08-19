/**
 * Real-time Transaction Monitoring System
 * Tracks wallet transactions across multiple chains and provides intelligent alerts
 */

import { EventEmitter } from 'events'
import { nowNodesService } from './nownodes'

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  valueUSD: number
  gasUsed: string
  gasPrice: string
  blockNumber: number
  timestamp: number
  chainId: number
  chainName: string
  status: 'success' | 'failed' | 'pending'
  category: TransactionCategory
  contractAddress?: string
  tokenSymbol?: string
  tokenAmount?: string
  methodName?: string
  defiProtocol?: string
}

export interface TransactionAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  transaction: Transaction
  timestamp: number
  acknowledged: boolean
  walletAddress: string
}

export enum TransactionCategory {
  TRANSFER = 'transfer',
  DEFI_DEPOSIT = 'defi_deposit',
  DEFI_WITHDRAWAL = 'defi_withdrawal',
  SWAP = 'swap',
  NFT = 'nft',
  CONTRACT_INTERACTION = 'contract_interaction',
  UNKNOWN = 'unknown'
}

export enum AlertType {
  LARGE_TRANSACTION = 'large_transaction',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DEFI_POSITION_CHANGE = 'defi_position_change',
  LIQUIDATION_RISK = 'liquidation_risk',
  UNUSUAL_GAS = 'unusual_gas',
  NEW_CONTRACT = 'new_contract',
  WHALE_MOVEMENT = 'whale_movement'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface MonitoringConfig {
  walletAddress: string
  chainIds: number[]
  alertThresholds: {
    largeTransactionUSD: number
    portfolioPercentage: number
    gasThresholdUSD: number
  }
  enabledAlerts: AlertType[]
  notificationMethods: ('browser' | 'email' | 'webhook')[]
}

export class TransactionMonitor extends EventEmitter {
  private static instance: TransactionMonitor
  private monitoredWallets: Map<string, MonitoringConfig> = new Map()
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map()
  private transactionHistory: Map<string, Transaction[]> = new Map()
  private lastProcessedBlock: Map<string, number> = new Map()
  private alertHistory: TransactionAlert[] = []

  // Known DeFi contract addresses for categorization
  private defiContracts = new Map([
    // Ethereum
    ['0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', { protocol: 'Aave', name: 'Lending Pool' }],
    ['0x39aa39c021dfbae8fac545936693ac917d5e7563', { protocol: 'Compound', name: 'cUSDC' }],
    ['0xe592427a0aece92de3edee1f18e0157c05861564', { protocol: 'Uniswap V3', name: 'Router' }],
    ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84', { protocol: 'Lido', name: 'stETH' }],
    ['0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7', { protocol: 'Curve', name: '3Pool' }],
    
    // BSC
    ['0x10ed43c718714eb63d5aa57b78b54704e256024e', { protocol: 'PancakeSwap', name: 'Router' }],
    ['0x73feaa1ee314f8c655e354234017be2193c9e24e', { protocol: 'PancakeSwap', name: 'MasterChef' }],
    
    // Polygon
    ['0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4', { protocol: 'Aave', name: 'Polygon Pool' }],
  ])

  static getInstance(): TransactionMonitor {
    if (!TransactionMonitor.instance) {
      TransactionMonitor.instance = new TransactionMonitor()
    }
    return TransactionMonitor.instance
  }

  // Start monitoring a wallet
  async startMonitoring(config: MonitoringConfig): Promise<void> {
    const walletKey = `${config.walletAddress.toLowerCase()}`
    
    // Stop existing monitoring if any
    this.stopMonitoring(config.walletAddress)
    
    // Store config
    this.monitoredWallets.set(walletKey, config)
    
    // Initialize transaction history
    if (!this.transactionHistory.has(walletKey)) {
      this.transactionHistory.set(walletKey, [])
    }
    
    // Start monitoring each chain
    for (const chainId of config.chainIds) {
      await this.startChainMonitoring(config.walletAddress, chainId)
    }
    
    console.log(`Started monitoring wallet ${config.walletAddress} on chains:`, config.chainIds)
  }

  // Stop monitoring a wallet
  stopMonitoring(walletAddress: string): void {
    const walletKey = walletAddress.toLowerCase()
    
    // Clear active monitors
    for (const [key, timeout] of this.activeMonitors.entries()) {
      if (key.startsWith(walletKey)) {
        clearInterval(timeout)
        this.activeMonitors.delete(key)
      }
    }
    
    // Remove from monitored wallets
    this.monitoredWallets.delete(walletKey)
    
    console.log(`Stopped monitoring wallet ${walletAddress}`)
  }

  // Start monitoring a specific chain for a wallet
  private async startChainMonitoring(walletAddress: string, chainId: number): Promise<void> {
    const monitorKey = `${walletAddress.toLowerCase()}_${chainId}`
    
    // Get initial block number
    try {
      const latestBlock = await this.getLatestBlockNumber(chainId)
      this.lastProcessedBlock.set(monitorKey, latestBlock)
    } catch (error) {
      console.error(`Failed to get latest block for chain ${chainId}:`, error)
      return
    }
    
    // Set up polling interval (every 15 seconds)
    const interval = setInterval(async () => {
      try {
        await this.checkForNewTransactions(walletAddress, chainId)
      } catch (error) {
        console.error(`Error checking transactions for ${walletAddress} on chain ${chainId}:`, error)
      }
    }, 15000)
    
    this.activeMonitors.set(monitorKey, interval)
  }

  // Check for new transactions
  private async checkForNewTransactions(walletAddress: string, chainId: number): Promise<void> {
    const monitorKey = `${walletAddress.toLowerCase()}_${chainId}`
    const lastBlock = this.lastProcessedBlock.get(monitorKey) || 0
    
    try {
      // Get latest block
      const latestBlock = await this.getLatestBlockNumber(chainId)
      
      if (latestBlock <= lastBlock) {
        return // No new blocks
      }
      
      // Get transactions from last processed block to latest
      const transactions = await this.getTransactionHistory(
        walletAddress, 
        chainId, 
        lastBlock + 1, 
        latestBlock
      )
      
      // Process each transaction
      for (const tx of transactions) {
        await this.processTransaction(tx, walletAddress)
      }
      
      // Update last processed block
      this.lastProcessedBlock.set(monitorKey, latestBlock)
      
    } catch (error) {
      console.error(`Error checking new transactions:`, error)
    }
  }

  // Get latest block number for a chain
  private async getLatestBlockNumber(chainId: number): Promise<number> {
    try {
      const response = await nowNodesService.makeRequest(chainId, 'eth_blockNumber', [])
      return parseInt(response.result, 16)
    } catch (error) {
      console.error(`Failed to get latest block for chain ${chainId}:`, error)
      throw error
    }
  }

  // Get transaction history for a wallet
  private async getTransactionHistory(
    walletAddress: string, 
    chainId: number, 
    fromBlock: number, 
    toBlock: number
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = []
    
    try {
      // Get regular transactions
      const txResponse = await nowNodesService.makeRequest(chainId, 'eth_getLogs', [{
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: `0x${toBlock.toString(16)}`,
        address: walletAddress
      }])
      
      // Process transaction logs
      if (txResponse.result && Array.isArray(txResponse.result)) {
        for (const log of txResponse.result) {
          const tx = await this.parseTransaction(log, chainId)
          if (tx) {
            transactions.push(tx)
          }
        }
      }
      
    } catch (error) {
      console.error(`Error fetching transaction history:`, error)
    }
    
    return transactions
  }

  // Parse raw transaction data
  private async parseTransaction(rawTx: any, chainId: number): Promise<Transaction | null> {
    try {
      const chainName = this.getChainName(chainId)
      const valueWei = parseInt(rawTx.value || '0', 16)
      const valueETH = valueWei / 1e18
      
      // Get current ETH price for USD conversion (simplified)
      const ethPriceUSD = 4350 // This should come from a price API
      const valueUSD = valueETH * ethPriceUSD
      
      const transaction: Transaction = {
        hash: rawTx.transactionHash || rawTx.hash,
        from: rawTx.from,
        to: rawTx.to,
        value: valueETH.toString(),
        valueUSD,
        gasUsed: rawTx.gasUsed || '0',
        gasPrice: rawTx.gasPrice || '0',
        blockNumber: parseInt(rawTx.blockNumber, 16),
        timestamp: Date.now(), // Should get actual block timestamp
        chainId,
        chainName,
        status: rawTx.status === '0x1' ? 'success' : 'failed',
        category: this.categorizeTransaction(rawTx),
        contractAddress: rawTx.to,
        methodName: this.extractMethodName(rawTx.input)
      }
      
      // Add DeFi protocol info if applicable
      const defiInfo = this.defiContracts.get(rawTx.to?.toLowerCase())
      if (defiInfo) {
        transaction.defiProtocol = defiInfo.protocol
      }
      
      return transaction
    } catch (error) {
      console.error('Error parsing transaction:', error)
      return null
    }
  }

  // Categorize transaction based on data
  private categorizeTransaction(rawTx: any): TransactionCategory {
    const to = rawTx.to?.toLowerCase()
    const input = rawTx.input || '0x'
    
    // Check if it's a DeFi interaction
    if (this.defiContracts.has(to)) {
      if (input.startsWith('0xa9059cbb') || input.startsWith('0x23b872dd')) {
        return TransactionCategory.DEFI_DEPOSIT
      }
      return TransactionCategory.DEFI_WITHDRAWAL
    }
    
    // Check for swap signatures
    if (input.includes('swapExactTokensForTokens') || input.includes('swapTokensForExactTokens')) {
      return TransactionCategory.SWAP
    }
    
    // Simple transfer
    if (input === '0x' || input.length <= 10) {
      return TransactionCategory.TRANSFER
    }
    
    return TransactionCategory.CONTRACT_INTERACTION
  }

  // Extract method name from transaction input
  private extractMethodName(input: string): string | undefined {
    if (!input || input.length < 10) return undefined
    
    const methodSignature = input.slice(0, 10)
    const knownMethods: { [key: string]: string } = {
      '0xa9059cbb': 'transfer',
      '0x23b872dd': 'transferFrom',
      '0x095ea7b3': 'approve',
      '0x38ed1739': 'swapExactTokensForTokens',
      '0x8803dbee': 'swapTokensForExactTokens',
      '0xe8e33700': 'deposit',
      '0x2e1a7d4d': 'withdraw'
    }
    
    return knownMethods[methodSignature]
  }

  // Process transaction and generate alerts
  private async processTransaction(transaction: Transaction, walletAddress: string): Promise<void> {
    const walletKey = walletAddress.toLowerCase()
    const config = this.monitoredWallets.get(walletKey)
    
    if (!config) return
    
    // Add to transaction history
    const history = this.transactionHistory.get(walletKey) || []
    history.unshift(transaction)
    
    // Keep only last 1000 transactions
    if (history.length > 1000) {
      history.splice(1000)
    }
    
    this.transactionHistory.set(walletKey, history)
    
    // Generate alerts
    const alerts = await this.generateAlerts(transaction, config)
    
    // Process each alert
    for (const alert of alerts) {
      this.alertHistory.unshift(alert)
      this.emit('alert', alert)
      
      // Send notifications
      await this.sendNotifications(alert, config)
    }
    
    // Emit transaction event
    this.emit('transaction', transaction)
  }

  // Generate alerts based on transaction
  private async generateAlerts(transaction: Transaction, config: MonitoringConfig): Promise<TransactionAlert[]> {
    const alerts: TransactionAlert[] = []
    
    // Large transaction alert
    if (config.enabledAlerts.includes(AlertType.LARGE_TRANSACTION) && 
        transaction.valueUSD > config.alertThresholds.largeTransactionUSD) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: AlertType.LARGE_TRANSACTION,
        severity: transaction.valueUSD > config.alertThresholds.largeTransactionUSD * 5 
          ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        title: 'Large Transaction Detected',
        message: `${transaction.valueUSD.toFixed(2)} USD transaction on ${transaction.chainName}`,
        transaction,
        timestamp: Date.now(),
        acknowledged: false,
        walletAddress: config.walletAddress
      })
    }
    
    // DeFi position change alert
    if (config.enabledAlerts.includes(AlertType.DEFI_POSITION_CHANGE) && 
        transaction.defiProtocol) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: AlertType.DEFI_POSITION_CHANGE,
        severity: AlertSeverity.MEDIUM,
        title: 'DeFi Position Updated',
        message: `${transaction.category} on ${transaction.defiProtocol}`,
        transaction,
        timestamp: Date.now(),
        acknowledged: false,
        walletAddress: config.walletAddress
      })
    }
    
    // Unusual gas alert
    const gasUsedUSD = (parseInt(transaction.gasUsed) * parseInt(transaction.gasPrice)) / 1e18 * 4350
    if (config.enabledAlerts.includes(AlertType.UNUSUAL_GAS) && 
        gasUsedUSD > config.alertThresholds.gasThresholdUSD) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: AlertType.UNUSUAL_GAS,
        severity: AlertSeverity.LOW,
        title: 'High Gas Fee',
        message: `Gas fee: $${gasUsedUSD.toFixed(2)} for transaction`,
        transaction,
        timestamp: Date.now(),
        acknowledged: false,
        walletAddress: config.walletAddress
      })
    }
    
    return alerts
  }

  // Send notifications
  private async sendNotifications(alert: TransactionAlert, config: MonitoringConfig): Promise<void> {
    for (const method of config.notificationMethods) {
      try {
        switch (method) {
          case 'browser':
            await this.sendBrowserNotification(alert)
            break
          case 'email':
            await this.sendEmailNotification(alert, config)
            break
          case 'webhook':
            await this.sendWebhookNotification(alert, config)
            break
        }
      } catch (error) {
        console.error(`Failed to send ${method} notification:`, error)
      }
    }
  }

  // Send browser notification
  private async sendBrowserNotification(alert: TransactionAlert): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id
      })
    }
  }

  // Send email notification (placeholder)
  private async sendEmailNotification(alert: TransactionAlert, config: MonitoringConfig): Promise<void> {
    // This would integrate with your email service
    console.log('Email notification:', alert.title, alert.message)
  }

  // Send webhook notification (placeholder)
  private async sendWebhookNotification(alert: TransactionAlert, config: MonitoringConfig): Promise<void> {
    // This would send to a webhook URL
    console.log('Webhook notification:', alert.title, alert.message)
  }

  // Get chain name
  private getChainName(chainId: number): string {
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      56: 'BNB Smart Chain',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism'
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  // Public methods for getting data
  getTransactionHistory(walletAddress: string): Transaction[] {
    return this.transactionHistory.get(walletAddress.toLowerCase()) || []
  }

  getAlertHistory(walletAddress?: string): TransactionAlert[] {
    if (walletAddress) {
      return this.alertHistory.filter(alert => 
        alert.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      )
    }
    return this.alertHistory
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alertHistory.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      this.emit('alertAcknowledged', alert)
    }
  }

  getMonitoringStatus(walletAddress: string): boolean {
    return this.monitoredWallets.has(walletAddress.toLowerCase())
  }
}

// Global transaction monitor instance
export const transactionMonitor = TransactionMonitor.getInstance()