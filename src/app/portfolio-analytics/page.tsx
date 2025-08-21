'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ScaleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '@/contexts/WalletContext'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import PortfolioAnalytics from '@/components/PortfolioAnalytics'

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

export default function PortfolioAnalyticsPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

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
              <ChartBarIcon className="w-12 h-12 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Portfolio Analytics</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Advanced performance attribution, risk analysis, and intelligent rebalancing recommendations
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <span className="text-sm font-medium text-gray-400">
                Analyzing {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              {portfolioData && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm font-medium text-green-400">
                    {formatCurrency(portfolioData.portfolio.totalValue)} Total Value
                  </span>
                </>
              )}
            </div>
          </motion.div>

          {/* Key Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center space-x-3 mb-2">
                <ArrowTrendingUpIcon className="w-8 h-8 text-blue-400" />
                <h3 className="font-semibold text-white">Performance</h3>
              </div>
              <p className="text-blue-400 text-sm">Attribution analysis and historical tracking</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <ScaleIcon className="w-8 h-8 text-green-400" />
                <h3 className="font-semibold text-white">Risk Analysis</h3>
              </div>
              <p className="text-gray-400 text-sm">VaR, volatility, and correlation metrics</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <LightBulbIcon className="w-8 h-8 text-yellow-400" />
                <h3 className="font-semibold text-white">Recommendations</h3>
              </div>
              <p className="text-gray-400 text-sm">AI-powered rebalancing suggestions</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <ShieldCheckIcon className="w-8 h-8 text-orange-400" />
                <h3 className="font-semibold text-white">Optimization</h3>
              </div>
              <p className="text-gray-400 text-sm">Tax-loss harvesting and efficiency</p>
            </div>
          </motion.div>

          {/* Analytics Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Analytics Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Performance Attribution</h3>
                <p className="text-gray-400 text-sm">
                  Understand which assets and chains contribute most to your returns
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Risk Metrics</h3>
                <p className="text-gray-400 text-sm">
                  Comprehensive risk analysis including VaR, volatility, and correlations
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <LightBulbIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Smart Recommendations</h3>
                <p className="text-gray-400 text-sm">
                  AI-powered suggestions for portfolio optimization and rebalancing
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ScaleIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Diversification Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Measure portfolio diversification and concentration risk
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Risk Management</h3>
                <p className="text-gray-400 text-sm">
                  Advanced risk metrics and portfolio protection strategies
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Tax Optimization</h3>
                <p className="text-gray-400 text-sm">
                  Tax-loss harvesting and efficiency optimization recommendations
                </p>
              </div>
            </div>
          </motion.div>

          {/* Portfolio Analytics Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PortfolioAnalytics walletAddress={walletAddress} />
          </motion.div>

          {/* Metrics Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <InformationCircleIcon className="w-6 h-6 text-blue-400" />
              <span>Key Metrics Explained</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Performance Metrics</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Sharpe Ratio:</strong> Risk-adjusted return measure (higher is better)</li>
                  <li>• <strong>Volatility:</strong> Standard deviation of returns (lower is less risky)</li>
                  <li>• <strong>Max Drawdown:</strong> Largest peak-to-trough decline</li>
                  <li>• <strong>Attribution:</strong> How much each asset contributes to returns</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Risk Metrics</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Value at Risk (VaR):</strong> Potential loss at given confidence level</li>
                  <li>• <strong>Concentration Risk:</strong> How concentrated your holdings are</li>
                  <li>• <strong>Diversification Ratio:</strong> How well diversified your portfolio is</li>
                  <li>• <strong>Liquidity Score:</strong> How easily you can exit positions</li>
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
                Analytics are based on historical data and current market conditions. Past performance does not guarantee future results.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}