'use client'

import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import WalletConnection from '@/components/wallet/WalletConnection'
import { 
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function WalletBasedCryptoChart() {
  const {
    portfolio,
    isLoadingPortfolio,
    portfolioError,
    manualAddress,
    refreshPortfolio
  } = useWallet()

  // Show wallet connection if no address is set
  if (!manualAddress) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm ring-1 ring-white/10 text-center"
        >
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Advanced Charts</h3>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view personalized charts and analytics for your portfolio assets
          </p>
          <WalletConnection showManualInput={true} />
        </motion.div>
      </div>
    )
  }

  // Show loading state
  if (isLoadingPortfolio) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
        >
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ArrowPathIcon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Loading Portfolio Charts</h3>
              <p className="text-gray-400">
                Preparing charts for {manualAddress.slice(0, 6)}...{manualAddress.slice(-4)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show error state
  if (portfolioError) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-400">Failed to Load Charts</h3>
              <p className="text-red-300 text-sm">{portfolioError}</p>
            </div>
          </div>
          
          <button
            onClick={refreshPortfolio}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </motion.div>
      </div>
    )
  }

  // Show charts (placeholder for now)
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Advanced Charts</h2>
          <div className="text-sm text-gray-400">
            {manualAddress.slice(0, 6)}...{manualAddress.slice(-4)}
          </div>
        </div>

        {/* Portfolio Asset Charts */}
        {portfolio && portfolio.assets.length > 0 ? (
          <div className="space-y-6">
            {/* Portfolio Distribution Chart */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Portfolio Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.chainDistribution.map((chain) => (
                  <div key={chain.chainId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                      <span className="text-white">{chain.chainName}</span>
                    </div>
                    <span className="text-gray-400">{chain.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Assets Performance */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Top Assets</h3>
              <div className="space-y-3">
                {portfolio.assets.slice(0, 5).map((asset, index) => (
                  <div key={`${asset.chainId}-${asset.contractAddress}`} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {asset.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{asset.symbol}</div>
                        <div className="text-gray-400 text-sm">{asset.chainName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        ${asset.usdValue.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {asset.balance} {asset.symbol}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Interactive Charts Coming Soon</h3>
              <p className="text-gray-400">
                We're building advanced charting tools for your portfolio analysis
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Assets to Chart</h3>
            <p className="text-gray-400">
              No assets found in the connected wallet to display charts for
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}