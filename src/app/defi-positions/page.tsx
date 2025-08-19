'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BeakerIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FireIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import DeFiPositionTracker from '@/components/DeFiPositionTracker'

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

export default function DeFiPositionsPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  // Your real wallet address
  const WALLET_ADDRESS = '0xa2232F6250c89Da64475Fd998d96995cf8828f5a'

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    try {
      const response = await fetch(`/api/wallet-dashboard?address=${WALLET_ADDRESS}`)
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
              <BeakerIcon className="w-12 h-12 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">DeFi Position Tracker</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Monitor active DeFi positions, track yield farming rewards, and get intelligent optimization recommendations
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <span className="text-sm font-medium text-gray-400">
                Tracking {WALLET_ADDRESS.slice(0, 6)}...{WALLET_ADDRESS.slice(-4)}
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
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center space-x-3 mb-2">
                <BeakerIcon className="w-8 h-8 text-purple-400" />
                <h3 className="font-semibold text-white">Position Tracking</h3>
              </div>
              <p className="text-purple-400 text-sm">Real-time monitoring across all major protocols</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                <h3 className="font-semibold text-white">Risk Monitoring</h3>
              </div>
              <p className="text-gray-400 text-sm">Liquidation alerts and impermanent loss tracking</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <FireIcon className="w-8 h-8 text-orange-400" />
                <h3 className="font-semibold text-white">Yield Optimization</h3>
              </div>
              <p className="text-gray-400 text-sm">Auto-compound and migration recommendations</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <LightBulbIcon className="w-8 h-8 text-yellow-400" />
                <h3 className="font-semibold text-white">Smart Insights</h3>
              </div>
              <p className="text-gray-400 text-sm">AI-powered position analysis and suggestions</p>
            </div>
          </motion.div>

          {/* Supported Protocols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Supported Protocols</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BanknotesIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Aave</h3>
                <p className="text-gray-400 text-xs">Lending & Borrowing</p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BanknotesIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Compound</h3>
                <p className="text-gray-400 text-xs">Money Markets</p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ArrowPathIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Uniswap</h3>
                <p className="text-gray-400 text-xs">Liquidity Pools</p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Lido</h3>
                <p className="text-gray-400 text-xs">ETH Staking</p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FireIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">PancakeSwap</h3>
                <p className="text-gray-400 text-xs">Yield Farming</p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ArrowPathIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Curve</h3>
                <p className="text-gray-400 text-xs">Stable Swaps</p>
              </div>
            </div>
          </motion.div>

          {/* Features Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Advanced Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Position Monitoring</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Real-time Tracking:</strong> Monitor all active DeFi positions across chains</li>
                  <li>• <strong>Health Factor Monitoring:</strong> Track liquidation risks for leveraged positions</li>
                  <li>• <strong>Reward Tracking:</strong> Monitor claimable rewards and auto-compound opportunities</li>
                  <li>• <strong>Impermanent Loss:</strong> Calculate and track IL for liquidity pool positions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Optimization & Alerts</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Yield Optimization:</strong> AI-powered recommendations for better returns</li>
                  <li>• <strong>Liquidation Alerts:</strong> Early warnings for at-risk positions</li>
                  <li>• <strong>Auto-compound Suggestions:</strong> Maximize yield through compounding</li>
                  <li>• <strong>Migration Opportunities:</strong> Find better yield opportunities</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* DeFi Position Tracker Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <DeFiPositionTracker walletAddress={WALLET_ADDRESS} />
          </motion.div>

          {/* Risk Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <InformationCircleIcon className="w-6 h-6 text-blue-400" />
              <span>DeFi Risk Considerations</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Position Risks</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Liquidation Risk:</strong> Leveraged positions can be liquidated if collateral value drops</li>
                  <li>• <strong>Impermanent Loss:</strong> LP positions may lose value relative to holding assets</li>
                  <li>• <strong>Smart Contract Risk:</strong> Bugs or exploits in protocol contracts</li>
                  <li>• <strong>Market Risk:</strong> Token price volatility affects position values</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Best Practices</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong>Diversify:</strong> Spread positions across multiple protocols and assets</li>
                  <li>• <strong>Monitor Health:</strong> Keep health factors above 2.0 for safety</li>
                  <li>• <strong>Claim Regularly:</strong> Harvest rewards to compound returns</li>
                  <li>• <strong>Stay Informed:</strong> Monitor protocol updates and market conditions</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <InformationCircleIcon className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm">
                DeFi positions involve significant risks. Always do your own research and never invest more than you can afford to lose.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}