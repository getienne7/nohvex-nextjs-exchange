'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowsRightLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface AssetData {
  symbol: string
  name: string
  balance: string
  usdValue: number
  price: number
  change24h: number
  chainName: string
}

interface TradingData {
  portfolio: {
    totalValue: number
    topAssets: AssetData[]
  }
  walletAddress: string
}

export default function RealTimeTrading() {
  const [tradingData, setTradingData] = useState<TradingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFromAsset, setSelectedFromAsset] = useState<AssetData | null>(null)
  const [selectedToAsset, setSelectedToAsset] = useState<AssetData | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Your real wallet address
  const WALLET_ADDRESS = '0xa2232F6250c89Da64475Fd998d96995cf8828f5a'

  const fetchTradingData = async () => {
    try {
      const response = await fetch(`/api/wallet-dashboard?address=${WALLET_ADDRESS}`)
      const result = await response.json()
      
      if (result.success) {
        setTradingData(result.data)
        setLastUpdated(new Date())
        
        // Auto-select first asset if none selected
        if (!selectedFromAsset && result.data.portfolio.topAssets.length > 0) {
          setSelectedFromAsset(result.data.portfolio.topAssets[0])
        }
      }
    } catch (error) {
      console.error('Trading data fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTradingData()
    const interval = setInterval(fetchTradingData, 30000)
    return () => clearInterval(interval)
  }, [])

  const calculateToAmount = (amount: string) => {
    if (!selectedFromAsset || !selectedToAsset || !amount) return ''
    
    const fromValue = parseFloat(amount) * selectedFromAsset.price
    const toTokens = fromValue / selectedToAsset.price
    return toTokens.toFixed(6)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    setToAmount(calculateToAmount(value))
  }

  const swapAssets = () => {
    const temp = selectedFromAsset
    setSelectedFromAsset(selectedToAsset)
    setSelectedToAsset(temp)
    setFromAmount('')
    setToAmount('')
  }

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
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!tradingData) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <p className="text-gray-400">No trading data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-white">Live Trading</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">REAL PORTFOLIO</span>
          </div>
        </div>
        <button
          onClick={fetchTradingData}
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
        className="bg-gradient-to-r from-green-900/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Available for Trading</h3>
              <p className="text-gray-400 text-sm">
                From wallet: {tradingData.walletAddress.slice(0, 6)}...{tradingData.walletAddress.slice(-4)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatCurrency(tradingData.portfolio.totalValue)}
            </div>
            <p className="text-gray-400 text-sm">
              {tradingData.portfolio.topAssets.length} assets available
            </p>
          </div>
        </div>
      </motion.div>

      {/* Trading Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <ArrowsRightLeftIcon className="w-6 h-6 text-blue-400" />
          <span>Asset Exchange</span>
        </h3>

        <div className="space-y-4">
          {/* From Asset */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">From</label>
            <div className="flex space-x-4">
              <select
                value={selectedFromAsset?.symbol || ''}
                onChange={(e) => {
                  const asset = tradingData.portfolio.topAssets.find(a => a.symbol === e.target.value)
                  setSelectedFromAsset(asset || null)
                  setFromAmount('')
                  setToAmount('')
                }}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select asset to sell</option>
                {tradingData.portfolio.topAssets.map((asset) => (
                  <option key={asset.symbol} value={asset.symbol}>
                    {getChainIcon(asset.chainName)} {asset.symbol} - {parseFloat(asset.balance).toFixed(6)} ({formatCurrency(asset.usdValue)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                max={selectedFromAsset ? parseFloat(selectedFromAsset.balance) : undefined}
                className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {selectedFromAsset && (
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Available: {parseFloat(selectedFromAsset.balance).toFixed(6)} {selectedFromAsset.symbol}</span>
                <span className={selectedFromAsset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatPercentage(selectedFromAsset.change24h)} (24h)
                </span>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapAssets}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            >
              <ArrowsRightLeftIcon className="w-5 h-5 rotate-90" />
            </button>
          </div>

          {/* To Asset */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">To</label>
            <div className="flex space-x-4">
              <select
                value={selectedToAsset?.symbol || ''}
                onChange={(e) => {
                  const asset = tradingData.portfolio.topAssets.find(a => a.symbol === e.target.value)
                  setSelectedToAsset(asset || null)
                  setToAmount(calculateToAmount(fromAmount))
                }}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select asset to buy</option>
                {tradingData.portfolio.topAssets
                  .filter(asset => asset.symbol !== selectedFromAsset?.symbol)
                  .map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {getChainIcon(asset.chainName)} {asset.symbol} - {formatCurrency(asset.price)}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={toAmount}
                readOnly
                className="w-32 bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-gray-300"
              />
            </div>
            {selectedToAsset && (
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Price: {formatCurrency(selectedToAsset.price)}</span>
                <span className={selectedToAsset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatPercentage(selectedToAsset.change24h)} (24h)
                </span>
              </div>
            )}
          </div>

          {/* Trade Summary */}
          {fromAmount && selectedFromAsset && selectedToAsset && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
            >
              <h4 className="font-medium text-white mb-2">Trade Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>You sell:</span>
                  <span>{fromAmount} {selectedFromAsset.symbol} ≈ {formatCurrency(parseFloat(fromAmount) * selectedFromAsset.price)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>You receive:</span>
                  <span>{toAmount} {selectedToAsset.symbol} ≈ {formatCurrency(parseFloat(toAmount) * selectedToAsset.price)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs pt-2 border-t border-gray-600">
                  <span>Exchange rate:</span>
                  <span>1 {selectedFromAsset.symbol} = {(selectedFromAsset.price / selectedToAsset.price).toFixed(6)} {selectedToAsset.symbol}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Trade Button */}
          <button
            disabled={!fromAmount || !selectedFromAsset || !selectedToAsset}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {!selectedFromAsset || !selectedToAsset ? 'Select assets to trade' : 
             !fromAmount ? 'Enter amount to trade' : 
             'Execute Trade (Demo)'}
          </button>

          {/* Disclaimer */}
          <div className="flex items-start space-x-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium">Demo Trading Interface</p>
              <p className="text-yellow-300 mt-1">
                This interface shows your real portfolio data from NOWNodes. 
                Actual trading would require integration with a DEX or CEX API.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Your Assets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <ChartBarIcon className="w-6 h-6 text-green-400" />
          <span>Your Assets</span>
          <span className="text-xs bg-green-600 px-2 py-1 rounded">LIVE</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tradingData.portfolio.topAssets.map((asset, index) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => setSelectedFromAsset(asset)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getChainIcon(asset.chainName)}</span>
                  <span className="font-semibold text-white">{asset.symbol}</span>
                </div>
                <span className={`text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(asset.change24h)}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-gray-300">
                  {parseFloat(asset.balance).toFixed(6)} {asset.symbol}
                </div>
                <div className="text-gray-400 text-sm">
                  {formatCurrency(asset.usdValue)}
                </div>
                <div className="text-gray-500 text-xs">
                  @ {formatCurrency(asset.price)}
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
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-green-400 text-sm font-medium">
            Real-time data powered by NOWNodes Enterprise API
          </span>
        </div>
        {lastUpdated && (
          <p className="text-gray-500 text-xs mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </motion.div>
    </div>
  )
}