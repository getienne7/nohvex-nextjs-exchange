'use client'

import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import WalletConnection from '@/components/wallet/WalletConnection'
import { 
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function WalletBasedTransactionHistory() {
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
          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Transaction History</h3>
          <p className="text-gray-400 mb-6">
            Connect your wallet or enter an address to view transaction history across all chains
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
              <h3 className="text-lg font-semibold text-white mb-2">Loading Transaction History</h3>
              <p className="text-gray-400">
                Fetching transaction data for {manualAddress.slice(0, 6)}...{manualAddress.slice(-4)}
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
              <h3 className="text-lg font-semibold text-red-400">Failed to Load Transactions</h3>
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

  // Show transaction history (placeholder for now)
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
          <div className="text-sm text-gray-400">
            {manualAddress.slice(0, 6)}...{manualAddress.slice(-4)}
          </div>
        </div>

        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Transaction History Coming Soon</h3>
          <p className="text-gray-400 mb-4">
            We're working on bringing you comprehensive transaction history across all chains.
          </p>
          <div className="text-sm text-gray-500">
            Portfolio loaded with {portfolio?.totalAssets || 0} assets across {portfolio?.activeChains || 0} chains
          </div>
        </div>
      </motion.div>
    </div>
  )
}