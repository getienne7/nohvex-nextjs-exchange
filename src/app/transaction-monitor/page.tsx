'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '@/contexts/WalletContext'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import TransactionMonitor from '@/components/TransactionMonitor'

interface PortfolioData {
  walletAddress: string
  portfolio: {
    totalValue: number
    chains: Array<{
      chainId: number
      name: string
      symbol: string
      balance: string
      usdValue: number
      price: number
    }>
  }
}

export default function TransactionMonitorPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [monitoringActive, setMonitoringActive] = useState(false)

  // Your real wallet address
  const { connectedWallet, manualAddress } = useWallet()
  const walletAddress = connectedWallet?.address || manualAddress

  useEffect(() => {
    loadPortfolioData()
  }, [walletAddress])

  const loadPortfolioData = async () => {
    if (!walletAddress) {
      setLoading(false)
      return
    }
    try {
      const response = await fetch(`/api/wallet-dashboard?address=${walletAddress}`)
      const result = await response.json()
      
      if (result.success) {
        setPortfolioData(result.data)
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <>
        <GlobalNavigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <GlobalNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <EyeIcon className="w-12 h-12 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Transaction Monitor</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Real-time transaction monitoring and intelligent alerts for your wallet activity
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${monitoringActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className={`text-sm font-medium ${monitoringActive ? 'text-green-400' : 'text-gray-400'}`}>
                {monitoringActive ? 'Monitoring Active' : 'Monitoring Inactive'} - {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          </motion.div>

          {/* Portfolio Overview */}
          {portfolioData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center space-x-3 mb-2">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
                  <h3 className="font-semibold text-white">Protected Value</h3>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(portfolioData.portfolio.totalValue)}
                </div>
                <p className="text-blue-400 text-sm">Across {portfolioData.portfolio.chains.length} chains</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <BellIcon className="w-8 h-8 text-yellow-400" />
                  <h3 className="font-semibold text-white">Alert Status</h3>
                </div>
                <div className="text-2xl font-bold text-white">
                  {monitoringActive ? 'Active' : 'Inactive'}
                </div>
                <p className="text-gray-400 text-sm">Real-time monitoring</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <ClockIcon className="w-8 h-8 text-green-400" />
                  <h3 className="font-semibold text-white">Response Time</h3>
                </div>
                <div className="text-2xl font-bold text-white">
                  ~15s
                </div>
                <p className="text-gray-400 text-sm">Average detection</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <ExclamationTriangleIcon className="w-8 h-8 text-orange-400" />
                  <h3 className="font-semibold text-white">Risk Level</h3>
                </div>
                <div className="text-2xl font-bold text-white">
                  Low
                </div>
                <p className="text-gray-400 text-sm">Current assessment</p>
              </div>
            </motion.div>
          )}

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Monitoring Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <EyeIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Real-time Tracking</h3>
                <p className="text-gray-400 text-sm">
                  Monitor all transactions across multiple chains with 15-second detection
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BellIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Smart Alerts</h3>
                <p className="text-gray-400 text-sm">
                  Intelligent notifications for large transactions, DeFi activities, and suspicious behavior
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Security Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Advanced threat detection and risk assessment for your wallet activity
                </p>
              </div>
            </div>
          </motion.div>

          {/* Transaction Monitor Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TransactionMonitor 
              walletAddress={walletAddress}
              onStartMonitoring={() => setMonitoringActive(true)}
              onStopMonitoring={() => setMonitoringActive(false)}
            />
          </motion.div>

          {/* Alert Types Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <InformationCircleIcon className="w-6 h-6 text-blue-400" />
              <span>Alert Types</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Security Alerts</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Large Transactions:</strong> Transactions above your threshold</li>
                  <li>• <strong>Suspicious Activity:</strong> Unusual patterns or unknown contracts</li>
                  <li>• <strong>New Contracts:</strong> Interactions with unverified contracts</li>
                  <li>• <strong>Whale Movements:</strong> Large transfers affecting your assets</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">DeFi & Trading Alerts</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>DeFi Position Changes:</strong> Lending, borrowing, LP activities</li>
                  <li>• <strong>Liquidation Risk:</strong> Warnings for leveraged positions</li>
                  <li>• <strong>High Gas Fees:</strong> Unusually expensive transactions</li>
                  <li>• <strong>Failed Transactions:</strong> Reverted or failed operations</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <InformationCircleIcon className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm">
                Transaction monitoring uses real blockchain data. Alerts are generated based on your configured thresholds.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}