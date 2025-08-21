'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ArrowPathIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface ChainData {
  chainId: number
  name: string
  symbol: string
  balance: string
  usdValue: number
  price: number
  transactionCount: number
  isActive: boolean
  change24h: number
}

interface PortfolioData {
  walletAddress: string
  timestamp: string
  portfolio: {
    totalValue: number
    chains: ChainData[]
    topAssets: any[]
    performance: {
      change24h: number
      changePercent: number
      isPositive: boolean
    }
  }
  activity: {
    totalTransactions: number
    activeChains: number
  }
  analytics: {
    diversification: number
    riskLevel: string
    chainDistribution: any[]
  }
}

export default function RealTimePortfolioOverview() {
  const { connectedWallet, manualAddress, isConnected } = useWallet()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get current wallet address from context
  const walletAddress = connectedWallet?.address || manualAddress

  const fetchPortfolioData = async () => {
    if (!walletAddress) {
      setError('No wallet address available')
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/wallet-dashboard?address=${walletAddress}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setPortfolioData(result.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(result.error || 'Failed to fetch portfolio data')
      }
    } catch (error) {
      console.error('Portfolio fetch error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolioData()
    
    // Update every 30 seconds
    const interval = setInterval(fetchPortfolioData, 30000)
    return () => clearInterval(interval)
  }, [walletAddress])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getChainIcon = (chainName: string) => {
    const icons: { [key: string]: string } = {
      'Ethereum': '⟠',
      'BNB Smart Chain': '🟡',
      'Polygon': '🟣'
    }
    return icons[chainName] || '⛓️'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <div className="text-red-400">⚠️</div>
          <div>
            <h3 className="text-red-400 font-semibold">Error Loading Portfolio</h3>
            <p className="text-red-300 text-sm mt-1">{error}</p>
            <button
              onClick={fetchPortfolioData}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!portfolioData) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <p className="text-gray-400">No portfolio data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Real Data Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-white">Live Portfolio</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">LIVE DATA</span>
          </div>
        </div>
        <button
          onClick={fetchPortfolioData}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Total Portfolio Value</h3>
              <p className="text-gray-400 text-sm">
                Wallet: {portfolioData.walletAddress.slice(0, 6)}...{portfolioData.walletAddress.slice(-4)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatCurrency(portfolioData.portfolio.totalValue)}
            </div>
            <div className={`flex items-center space-x-1 ${
              portfolioData.portfolio.performance.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {portfolioData.portfolio.performance.isPositive ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
              <span className="font-medium">
                {formatPercentage(portfolioData.portfolio.performance.changePercent)} (24h)
              </span>
            </div>
          </div>
        </div>
        
        {lastUpdated && (
          <p className="text-gray-400 text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-3">
            <LinkIcon className="w-6 h-6 text-purple-400" />
            <h4 className="font-semibold text-white">Active Chains</h4>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {portfolioData.activity.activeChains}
          </div>
          <p className="text-gray-400 text-sm">
            {portfolioData.activity.totalTransactions} total transactions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-3">
            <ChartBarIcon className="w-6 h-6 text-green-400" />
            <h4 className="font-semibold text-white">Diversification</h4>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {portfolioData.analytics.diversification}%
          </div>
          <p className={`text-sm font-medium ${
            portfolioData.analytics.riskLevel === 'LOW' ? 'text-green-400' :
            portfolioData.analytics.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {portfolioData.analytics.riskLevel} Risk
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-2xl">🏆</div>
            <h4 className="font-semibold text-white">Top Asset</h4>
          </div>
          {portfolioData.portfolio.topAssets[0] && (
            <>
              <div className="text-2xl font-bold text-white mb-1">
                {portfolioData.portfolio.topAssets[0].symbol}
              </div>
              <p className="text-gray-400 text-sm">
                {formatCurrency(portfolioData.portfolio.topAssets[0].usdValue)}
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Chain Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
          <span>Chain Breakdown</span>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded">REAL-TIME</span>
        </h4>
        
        <div className="space-y-4">
          {portfolioData.portfolio.chains.map((chain, index) => (
            <motion.div
              key={chain.chainId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getChainIcon(chain.name)}</div>
                <div>
                  <h5 className="font-medium text-white">{chain.name}</h5>
                  <p className="text-gray-400 text-sm">
                    {parseFloat(chain.balance).toFixed(6)} {chain.symbol}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {chain.transactionCount} transactions
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-white">
                  {formatCurrency(chain.usdValue)}
                </div>
                <div className={`text-sm ${
                  chain.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatPercentage(chain.change24h)}
                </div>
                <div className="text-xs text-gray-400">
                  @ {formatCurrency(chain.price)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Data Source */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-green-400 text-sm font-medium">
            Powered by NOWNodes Enterprise API
          </span>
        </div>
      </motion.div>
    </div>
  )
}