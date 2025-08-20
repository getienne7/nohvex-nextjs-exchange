'use client'

import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import WalletConnection from '@/components/wallet/WalletConnection'
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  LinkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface WalletPortfolioOverviewProps {
  autoConnectWallet?: string | null
}

export default function WalletPortfolioOverview({ autoConnectWallet }: WalletPortfolioOverviewProps) {
  const {
    portfolio,
    isLoadingPortfolio,
    portfolioError,
    lastScanTime,
    refreshPortfolio,
    manualAddress
  } = useWallet()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'HIGH': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Show wallet connection if no address is set
  if (!manualAddress) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <WalletConnection showManualInput={true} autoConnectWallet={autoConnectWallet} />
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
              <h3 className="text-lg font-semibold text-white mb-2">Scanning Wallet</h3>
              <p className="text-gray-400">
                Analyzing {formatAddress(manualAddress)} across multiple chains...
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
              <h3 className="text-lg font-semibold text-red-400">Scan Failed</h3>
              <p className="text-red-300 text-sm">{portfolioError}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={refreshPortfolio}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Retry Scan</span>
            </button>
          </div>
        </motion.div>

        <WalletConnection showManualInput={true} />
      </div>
    )
  }

  // Show portfolio data
  if (!portfolio) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10 text-center"
        >
          <div className="py-8">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Portfolio Data</h3>
            <p className="text-gray-400 mb-4">
              No assets found for {formatAddress(manualAddress)}
            </p>
            <button
              onClick={refreshPortfolio}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-200"
            >
              Scan Again
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {formatAddress(manualAddress)}
              </h3>
              <p className="text-sm text-gray-400">
                Last scanned: {lastScanTime ? lastScanTime.toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>
          
          <button
            onClick={refreshPortfolio}
            disabled={isLoadingPortfolio}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoadingPortfolio ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</div>
            <div className="text-sm text-gray-400">Total Portfolio Value</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{portfolio.totalAssets}</div>
            <div className="text-sm text-gray-400">Total Assets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{portfolio.activeChains}</div>
            <div className="text-sm text-gray-400">Active Chains</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getRiskColor(portfolio.riskAnalysis.concentrationRisk)}`}>
              {portfolio.riskAnalysis.concentrationRisk}
            </div>
            <div className="text-sm text-gray-400">Risk Level</div>
          </div>
        </div>
      </motion.div>

      {/* Chain Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Chain Distribution</h2>
        <div className="space-y-3">
          {portfolio.chainDistribution.map((chain, index) => (
            <div key={chain.chainId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {chain.chainName.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{chain.chainName}</div>
                  <div className="text-gray-400 text-sm">{chain.assetCount} assets</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-medium">{formatCurrency(chain.value)}</div>
                <div className="text-gray-400 text-sm">{chain.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Assets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Top Assets</h2>
        <div className="space-y-3">
          {portfolio.assets.slice(0, 10).map((asset, index) => (
            <div key={`${asset.chainId}-${asset.contractAddress}`} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {asset.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{asset.name}</div>
                  <div className="text-gray-400 text-sm">
                    {asset.balance} {asset.symbol} • {asset.chainName}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-medium">{formatCurrency(asset.usdValue)}</div>
                <div className="text-gray-400 text-sm capitalize">{asset.type}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Risk Analysis</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{portfolio.riskAnalysis.diversificationScore}</div>
            <div className="text-sm text-gray-400">Diversification Score</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className={`text-2xl font-bold ${getRiskColor(portfolio.riskAnalysis.concentrationRisk)}`}>
              {portfolio.riskAnalysis.concentrationRisk}
            </div>
            <div className="text-sm text-gray-400">Concentration Risk</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className={`text-2xl font-bold ${getRiskColor(portfolio.riskAnalysis.chainRisk)}`}>
              {portfolio.riskAnalysis.chainRisk}
            </div>
            <div className="text-sm text-gray-400">Chain Risk</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}