'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  RocketLaunchIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  SignalIcon,
  InformationCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '@/contexts/WalletContext'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import AdvancedTrading from '@/components/AdvancedTrading'

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

export default function AdvancedTradingPage() {
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
              <RocketLaunchIcon className="w-12 h-12 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Advanced Trading</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional trading tools with advanced order types, algorithmic trading, and intelligent market analysis
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <span className="text-sm font-medium text-gray-400">
                Trading with {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              {portfolioData && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm font-medium text-green-400">
                    {formatCurrency(portfolioData.portfolio.totalValue)} Portfolio Value
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
            <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center space-x-3 mb-2">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-400" />
                <h3 className="font-semibold text-white">Advanced Orders</h3>
              </div>
              <p className="text-blue-400 text-sm">Stop-loss, trailing stops, bracket orders, and more</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <BoltIcon className="w-8 h-8 text-purple-400" />
                <h3 className="font-semibold text-white">Algo Trading</h3>
              </div>
              <p className="text-gray-400 text-sm">DCA, grid trading, TWAP, and custom algorithms</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <SignalIcon className="w-8 h-8 text-green-400" />
                <h3 className="font-semibold text-white">Trading Signals</h3>
              </div>
              <p className="text-gray-400 text-sm">AI-powered technical analysis and market insights</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <ChartBarIcon className="w-8 h-8 text-yellow-400" />
                <h3 className="font-semibold text-white">Analytics</h3>
              </div>
              <p className="text-gray-400 text-sm">Performance tracking and risk management</p>
            </div>
          </motion.div>

          {/* Advanced Order Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Advanced Order Types</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Market & Limit</h3>
                <p className="text-gray-400 text-sm">
                  Execute immediately at market price or wait for your target price
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Stop Orders</h3>
                <p className="text-gray-400 text-sm">
                  Stop-loss and stop-limit orders for risk management
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <AdjustmentsHorizontalIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Trailing Stop</h3>
                <p className="text-gray-400 text-sm">
                  Dynamic stop orders that follow price movements
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Bracket Orders</h3>
                <p className="text-gray-400 text-sm">
                  Combine entry, stop-loss, and take-profit in one order
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">TWAP/VWAP</h3>
                <p className="text-gray-400 text-sm">
                  Time and volume weighted average price execution
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CogIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">OCO Orders</h3>
                <p className="text-gray-400 text-sm">
                  One-cancels-other for advanced position management
                </p>
              </div>
            </div>
          </motion.div>

          {/* Trading Algorithms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Algorithmic Trading Strategies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Systematic Strategies</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Dollar Cost Averaging (DCA):</strong> Automated periodic buying to reduce volatility impact</li>
                  <li>• <strong>Grid Trading:</strong> Place buy/sell orders at regular intervals around current price</li>
                  <li>• <strong>TWAP Execution:</strong> Break large orders into smaller time-weighted slices</li>
                  <li>• <strong>Market Making:</strong> Provide liquidity by placing orders on both sides</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Technical Strategies</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Momentum Trading:</strong> Follow price trends with configurable indicators</li>
                  <li>• <strong>Mean Reversion:</strong> Trade against extreme price movements</li>
                  <li>• <strong>Arbitrage:</strong> Exploit price differences across exchanges</li>
                  <li>• <strong>Custom Algorithms:</strong> Build your own strategies with our framework</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Risk Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Risk Management Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Position Limits</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Maximum position size controls</li>
                  <li>• Daily loss limits</li>
                  <li>• Portfolio exposure limits</li>
                  <li>• Leverage restrictions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Automated Protection</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Automatic stop-loss orders</li>
                  <li>• Take-profit targets</li>
                  <li>• Trailing stop adjustments</li>
                  <li>• Emergency position closure</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Performance Monitoring</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Real-time P&L tracking</li>
                  <li>• Drawdown analysis</li>
                  <li>• Win/loss ratios</li>
                  <li>• Risk-adjusted returns</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Advanced Trading Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AdvancedTrading walletAddress={walletAddress} />
          </motion.div>

          {/* Trading Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <InformationCircleIcon className="w-6 h-6 text-blue-400" />
              <span>Advanced Trading Risks</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Trading Risks</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Market Risk:</strong> Prices can move against your positions rapidly</li>
                  <li>• <strong>Liquidity Risk:</strong> Orders may not execute at expected prices</li>
                  <li>• <strong>Slippage:</strong> Execution prices may differ from quoted prices</li>
                  <li>• <strong>Algorithm Risk:</strong> Automated strategies may malfunction</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Best Practices</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Start Small:</strong> Test strategies with small position sizes</li>
                  <li>• <strong>Use Stop Losses:</strong> Always define your maximum acceptable loss</li>
                  <li>• <strong>Monitor Actively:</strong> Keep track of your positions and algorithms</li>
                  <li>• <strong>Diversify:</strong> Don&apos;t put all capital into a single strategy</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-lg">
              <InformationCircleIcon className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">
                Advanced trading involves substantial risk of loss. Only trade with capital you can afford to lose.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}