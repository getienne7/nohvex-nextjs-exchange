'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EyeIcon,
  EyeSlashIcon,
  BellIcon,
  BellSlashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  FireIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Transaction, TransactionAlert, AlertType, AlertSeverity, TransactionCategory } from '@/lib/transaction-monitor'

interface TransactionMonitorProps {
  walletAddress: string
  onStartMonitoring?: () => void
  onStopMonitoring?: () => void
}

export default function TransactionMonitor({ walletAddress, onStartMonitoring, onStopMonitoring }: TransactionMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [alerts, setAlerts] = useState<TransactionAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'transactions' | 'alerts'>('transactions')

  // Monitoring settings
  const [settings, setSettings] = useState({
    chainIds: [1, 56, 137], // ETH, BSC, Polygon
    largeTransactionUSD: 100,
    portfolioPercentage: 10,
    gasThresholdUSD: 50,
    enabledAlerts: [AlertType.LARGE_TRANSACTION, AlertType.DEFI_POSITION_CHANGE, AlertType.UNUSUAL_GAS],
    notificationMethods: ['browser' as const]
  })

  const supportedChains = [
    { id: 1, name: 'Ethereum', symbol: 'ETH', icon: '⟠' },
    { id: 56, name: 'BNB Smart Chain', symbol: 'BNB', icon: '🟡' },
    { id: 137, name: 'Polygon', symbol: 'MATIC', icon: '🟣' },
    { id: 42161, name: 'Arbitrum', symbol: 'ETH', icon: '🔵' },
    { id: 10, name: 'Optimism', symbol: 'ETH', icon: '🔴' }
  ]

  useEffect(() => {
    loadMonitoringStatus()
    loadTransactionHistory()
    loadAlerts()
  }, [walletAddress])

  const loadMonitoringStatus = async () => {
    try {
      const response = await fetch(`/api/transaction-monitor?action=status&walletAddress=${walletAddress}`)
      const result = await response.json()
      
      if (result.success) {
        setIsMonitoring(result.isMonitoring)
      }
    } catch (error) {
      console.error('Failed to load monitoring status:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTransactionHistory = async () => {
    try {
      const response = await fetch(`/api/transaction-monitor?action=history&walletAddress=${walletAddress}&limit=50`)
      const result = await response.json()
      
      if (result.success) {
        setTransactions(result.transactions)
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error)
    }
  }

  const loadAlerts = async () => {
    try {
      const response = await fetch(`/api/transaction-monitor?action=alerts&walletAddress=${walletAddress}`)
      const result = await response.json()
      
      if (result.success) {
        setAlerts(result.alerts)
      }
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  const startMonitoring = async () => {
    try {
      const response = await fetch('/api/transaction-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          chainIds: settings.chainIds,
          alertThresholds: {
            largeTransactionUSD: settings.largeTransactionUSD,
            portfolioPercentage: settings.portfolioPercentage,
            gasThresholdUSD: settings.gasThresholdUSD
          },
          enabledAlerts: settings.enabledAlerts,
          notificationMethods: settings.notificationMethods
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setIsMonitoring(true)
        onStartMonitoring?.()
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission()
        }
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error)
    }
  }

  const stopMonitoring = async () => {
    try {
      const response = await fetch(`/api/transaction-monitor?action=stop&walletAddress=${walletAddress}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        setIsMonitoring(false)
        onStopMonitoring?.()
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/transaction-monitor?action=acknowledge&alertId=${alertId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ))
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getCategoryIcon = (category: TransactionCategory) => {
    switch (category) {
      case TransactionCategory.TRANSFER:
        return <ArrowUpIcon className="w-4 h-4" />
      case TransactionCategory.DEFI_DEPOSIT:
        return <ArrowDownIcon className="w-4 h-4 text-green-500" />
      case TransactionCategory.DEFI_WITHDRAWAL:
        return <ArrowUpIcon className="w-4 h-4 text-red-500" />
      case TransactionCategory.SWAP:
        return <ArrowUpIcon className="w-4 h-4 text-blue-500" />
      default:
        return <CurrencyDollarIcon className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.LOW:
        return 'text-blue-600 bg-blue-100'
      case AlertSeverity.MEDIUM:
        return 'text-yellow-600 bg-yellow-100'
      case AlertSeverity.HIGH:
        return 'text-orange-600 bg-orange-100'
      case AlertSeverity.CRITICAL:
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.LARGE_TRANSACTION:
        return <CurrencyDollarIcon className="w-5 h-5" />
      case AlertType.DEFI_POSITION_CHANGE:
        return <FireIcon className="w-5 h-5" />
      case AlertType.UNUSUAL_GAS:
        return <ExclamationTriangleIcon className="w-5 h-5" />
      default:
        return <BellIcon className="w-5 h-5" />
    }
  }

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <h2 className="text-xl font-semibold text-gray-900">Transaction Monitor</h2>
            {unacknowledgedAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            
            {isMonitoring ? (
              <button
                onClick={stopMonitoring}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <EyeSlashIcon className="w-4 h-4" />
                <span>Stop Monitoring</span>
              </button>
            ) : (
              <button
                onClick={startMonitoring}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Start Monitoring</span>
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="font-medium text-gray-900 mb-4">Monitoring Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monitored Chains
                  </label>
                  <div className="space-y-2">
                    {supportedChains.map((chain) => (
                      <label key={chain.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.chainIds.includes(chain.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings(prev => ({
                                ...prev,
                                chainIds: [...prev.chainIds, chain.id]
                              }))
                            } else {
                              setSettings(prev => ({
                                ...prev,
                                chainIds: prev.chainIds.filter(id => id !== chain.id)
                              }))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{chain.icon} {chain.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Thresholds
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600">Large Transaction (USD)</label>
                      <input
                        type="number"
                        value={settings.largeTransactionUSD}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          largeTransactionUSD: Number(e.target.value)
                        }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">High Gas Fee (USD)</label>
                      <input
                        type="number"
                        value={settings.gasThresholdUSD}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          gasThresholdUSD: Number(e.target.value)
                        }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <span>Chains: {settings.chainIds.length}</span>
            <span>Status: {isMonitoring ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Transactions: {transactions.length}</span>
            <span>Alerts: {alerts.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setSelectedTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setSelectedTab('alerts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alerts ({alerts.length})
            {unacknowledgedAlerts.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'transactions' ? (
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <motion.div
                  key={tx.hash}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {tx.category.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {tx.chainName}
                        </span>
                        {tx.defiProtocol && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tx.defiProtocol}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(tx.timestamp)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(tx.valueUSD)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {parseFloat(tx.value).toFixed(6)} ETH
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
                <p className="text-gray-600">
                  {isMonitoring 
                    ? 'Monitoring is active. New transactions will appear here.'
                    : 'Start monitoring to track transactions in real-time.'
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.acknowledged 
                      ? 'bg-gray-50 border-gray-300' 
                      : 'bg-white border-orange-400 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{alert.message}</p>
                        <div className="text-sm text-gray-500">
                          {formatTime(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {alert.acknowledged ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <BellSlashIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h3>
                <p className="text-gray-600">
                  {isMonitoring 
                    ? 'No alerts have been triggered yet. You\'ll be notified of any suspicious activity.'
                    : 'Start monitoring to receive real-time alerts for your wallet activity.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}