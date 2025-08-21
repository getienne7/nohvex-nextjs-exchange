'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { 
  ArrowsRightLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useDEXTrading } from '@/hooks/useDEXTrading'
import { Token, TradeParams } from '@/lib/dex/index'

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
  const { connectedWallet, manualAddress } = useWallet()
  const [tradingData, setTradingData] = useState<TradingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFromAsset, setSelectedFromAsset] = useState<AssetData | null>(null)
  const [selectedToAsset, setSelectedToAsset] = useState<AssetData | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [slippageTolerance, setSlippageTolerance] = useState(100) // 1%
  const [isGettingQuote, setIsGettingQuote] = useState(false)
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'quoting' | 'trading' | 'success' | 'error'>('idle')

  // DEX Trading hook
  const {
    isLoading: isDEXLoading,
    error: dexError,
    quotes,
    bestRoute,
    getQuotes,
    findBestRoute,
    executeTrade,
    getSupportedTokens,
    clearError
  } = useDEXTrading()

  // Get current wallet address from context
  const walletAddress = connectedWallet?.address || manualAddress

  const fetchTradingData = async () => {
    if (!walletAddress) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/wallet-dashboard?address=${walletAddress}`)
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
  }, [walletAddress])

  // Convert AssetData to Token format for DEX trading
  const assetToToken = (asset: AssetData): Token => ({
    address: getTokenAddress(asset.symbol, asset.chainName),
    symbol: asset.symbol,
    name: asset.name,
    decimals: getTokenDecimals(asset.symbol),
    chainId: getChainId(asset.chainName)
  })

  // Helper functions for token conversion
  const getTokenAddress = (symbol: string, chainName: string): string => {
    const addresses: { [key: string]: { [symbol: string]: string } } = {
      'Ethereum': {
        'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        'USDC': '0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      },
      'BSC': {
        'BNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        'USDT': '0x55d398326f99059fF775485246999027B3197955'
      }
    }
    return addresses[chainName]?.[symbol] || '0x0000000000000000000000000000000000000000'
  }

  const getTokenDecimals = (symbol: string): number => {
    const decimals: { [symbol: string]: number } = {
      'ETH': 18, 'BNB': 18, 'MATIC': 18,
      'USDC': 6, 'USDT': 6, 'DAI': 18
    }
    return decimals[symbol] || 18
  }

  const getChainId = (chainName: string): number => {
    const chainIds: { [name: string]: number } = {
      'Ethereum': 1,
      'BSC': 56,
      'Polygon': 137
    }
    return chainIds[chainName] || 1
  }

  // Get real-time quote when amount or assets change
  useEffect(() => {
    if (selectedFromAsset && selectedToAsset && fromAmount && parseFloat(fromAmount) > 0) {
      handleGetQuote()
    } else {
      setToAmount('')
    }
  }, [selectedFromAsset, selectedToAsset, fromAmount])

  const handleGetQuote = async () => {
    if (!selectedFromAsset || !selectedToAsset || !fromAmount) return

    setIsGettingQuote(true)
    setTradeStatus('quoting')
    clearError()

    try {
      const tokenIn = assetToToken(selectedFromAsset)
      const tokenOut = assetToToken(selectedToAsset)

      const tradeParams: TradeParams = {
        tokenIn,
        tokenOut,
        amountIn: fromAmount,
        slippageTolerance
      }

      const route = await findBestRoute(tradeParams)
      if (route && route.bestQuote) {
        setToAmount(route.bestQuote.amountOut)
        setTradeStatus('idle')
      }
    } catch (error) {
      console.error('Failed to get quote:', error)
      setTradeStatus('error')
    } finally {
      setIsGettingQuote(false)
    }
  }

  const handleExecuteTrade = async () => {
    if (!selectedFromAsset || !selectedToAsset || !fromAmount || !tradingData) return

    setTradeStatus('trading')
    clearError()

    try {
      const tokenIn = assetToToken(selectedFromAsset)
      const tokenOut = assetToToken(selectedToAsset)

      const tradeParams: TradeParams & { walletAddress: string } = {
        tokenIn,
        tokenOut,
        amountIn: fromAmount,
        slippageTolerance,
        walletAddress: tradingData.walletAddress
      }

      // Note: This will show a message about wallet connection in real implementation
      const result = await executeTrade(tradeParams)
      
      if (result.hash) {
        setTradeStatus('success')
        setTimeout(() => {
          fetchTradingData()
          setTradeStatus('idle')
        }, 3000)
      }
    } catch (error) {
      console.error('Trade execution failed:', error)
      setTradeStatus('error')
    }
  }

  const calculateToAmount = (amount: string) => {
    if (!selectedFromAsset || !selectedToAsset || !amount) return ''
    
    const fromValue = parseFloat(amount) * selectedFromAsset.price
    const toTokens = fromValue / selectedToAsset.price
    return toTokens.toFixed(6)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    // Don't use simple calculation anymore, let DEX quote handle it
    if (selectedFromAsset && selectedToAsset && value) {
      // The useEffect will trigger handleGetQuote
    } else {
      setToAmount('')
    }
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

          {/* Slippage Tolerance Setting */}
          <div className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700/50 rounded-lg mb-4">
            <span className="text-sm text-gray-300">Slippage Tolerance</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSlippageTolerance(50)}
                className={`px-2 py-1 text-xs rounded ${slippageTolerance === 50 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                0.5%
              </button>
              <button
                onClick={() => setSlippageTolerance(100)}
                className={`px-2 py-1 text-xs rounded ${slippageTolerance === 100 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                1%
              </button>
              <button
                onClick={() => setSlippageTolerance(300)}
                className={`px-2 py-1 text-xs rounded ${slippageTolerance === 300 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                3%
              </button>
            </div>
          </div>

          {/* DEX Quote Information */}
          {bestRoute && bestRoute.bestQuote && (
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-300">Best Route</span>
                <span className="text-sm font-medium text-blue-200">{bestRoute.bestQuote.dexName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Price Impact:</span>
                  <span className={`ml-1 ${bestRoute.bestQuote.priceImpact > 2 ? 'text-red-400' : 'text-green-400'}`}>
                    {bestRoute.bestQuote.priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Min. Received:</span>
                  <span className="ml-1 text-gray-200">{parseFloat(bestRoute.bestQuote.minimumAmountOut).toFixed(6)}</span>
                </div>
              </div>
              {bestRoute.savingsPercentage > 0 && (
                <div className="mt-2 text-xs text-green-400">
                  💰 Saving {bestRoute.savingsPercentage.toFixed(2)}% vs other DEXs
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {(dexError || tradeStatus === 'error') && (
            <div className="flex items-start space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-200">
                <p className="font-medium">Trading Error</p>
                <p className="text-red-300 mt-1">
                  {dexError || 'Trade execution requires wallet connection. Connect your Web3 wallet to trade.'}
                </p>
              </div>
            </div>
          )}

          {/* Trade Button */}
          <button
            onClick={handleExecuteTrade}
            disabled={!fromAmount || !selectedFromAsset || !selectedToAsset || isGettingQuote || tradeStatus === 'trading'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {tradeStatus === 'trading' && <ClockIcon className="w-5 h-5 animate-spin" />}
            {tradeStatus === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
            {isGettingQuote && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
            <span>
              {!selectedFromAsset || !selectedToAsset ? 'Select assets to trade' :
               !fromAmount ? 'Enter amount to trade' :
               isGettingQuote ? 'Getting Quote...' :
               tradeStatus === 'trading' ? 'Executing Trade...' :
               tradeStatus === 'success' ? 'Trade Successful!' :
               'Execute DEX Trade'}
            </span>
          </button>

          {/* Real Trading Information */}
          <div className="flex items-start space-x-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-200">
              <p className="font-medium">Live DEX Trading</p>
              <p className="text-green-300 mt-1">
                Real-time quotes from Uniswap V3, PancakeSwap V3, and other major DEXs. 
                Connect your Web3 wallet to execute trades directly on-chain.
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