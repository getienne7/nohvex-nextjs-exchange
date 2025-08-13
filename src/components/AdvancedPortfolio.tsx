'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  SparklesIcon,
  ChartPieIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline'
import {
  PriceHistoryChart,
  PortfolioTimelineChart,
  PortfolioDistributionChart,
  VolumeChart
} from './charts/ChartComponents'

interface Portfolio {
  id: string
  symbol: string
  name: string
  amount: number
  averagePrice: number
  totalValue: number
  createdAt: string
  updatedAt: string
}

interface CryptoPrice {
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
}

interface AdvancedPortfolioProps {
  className?: string
}

interface TechnicalIndicators {
  rsi: number
  macd: { value: number; signal: number; histogram: number }
  sma20: number
  sma50: number
  bollinger: { upper: number; middle: number; lower: number }
}

export function AdvancedPortfolio({ className = "" }: AdvancedPortfolioProps) {
  const { data: session } = useSession()
  const [portfolio, setPortfolio] = useState<Portfolio[]>([])
  const [prices, setPrices] = useState<{[key: string]: CryptoPrice}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hideBalances, setHideBalances] = useState(false)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC')
  const [viewMode, setViewMode] = useState<'overview' | 'charts' | 'analytics'>('overview')
  const [showTechnicals, setShowTechnicals] = useState(false)

  useEffect(() => {
    if (session) {
      fetchPortfolio()
      fetchPrices()
    }
  }, [session])

  useEffect(() => {
    const interval = setInterval(() => {
      if (session) {
        fetchPrices()
      }
    }, 30000) // Update prices every 30 seconds

    return () => clearInterval(interval)
  }, [session])

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio || [])
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPrices = async () => {
    try {
      const symbols = 'BTC,ETH,BNB,USDT,ADA,SOL,XRP,DOGE,DOT,AVAX,LINK,UNI,LTC,MATIC,ATOM'
      const response = await fetch(`/api/prices?symbols=${symbols}`)
      if (response.ok) {
        const { data } = await response.json()
        const priceMap: {[key: string]: CryptoPrice} = {}
        data.forEach((item: CryptoPrice) => {
          priceMap[item.symbol] = item
        })
        setPrices(priceMap)
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
    }
  }

  // Generate sample technical indicators
  const generateTechnicalIndicators = (symbol: string): TechnicalIndicators => {
    return {
      rsi: Math.random() * 100,
      macd: {
        value: (Math.random() - 0.5) * 1000,
        signal: (Math.random() - 0.5) * 1000,
        histogram: (Math.random() - 0.5) * 500
      },
      sma20: (prices[symbol]?.current_price || 45000) * (1 + (Math.random() - 0.5) * 0.02),
      sma50: (prices[symbol]?.current_price || 45000) * (1 + (Math.random() - 0.5) * 0.05),
      bollinger: {
        upper: (prices[symbol]?.current_price || 45000) * 1.02,
        middle: (prices[symbol]?.current_price || 45000),
        lower: (prices[symbol]?.current_price || 45000) * 0.98
      }
    }
  }

  const technicals = useMemo(() => generateTechnicalIndicators(selectedAsset), [selectedAsset, prices])

  const portfolioAnalytics = useMemo(() => {
    if (!portfolio.length || !Object.keys(prices).length) {
      return {
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        holdings: [],
        chartData: []
      }
    }

    let totalCurrentValue = 0
    let totalCostBasis = 0
    const holdings = portfolio.map(holding => {
      const currentPrice = prices[holding.symbol]?.current_price || 0
      const currentValue = holding.amount * currentPrice
      const costBasis = holding.amount * holding.averagePrice
      const pnl = currentValue - costBasis
      const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0

      totalCurrentValue += currentValue
      totalCostBasis += costBasis

      return {
        ...holding,
        currentPrice,
        currentValue,
        costBasis,
        pnl,
        pnlPercentage,
        priceChange24h: prices[holding.symbol]?.price_change_percentage_24h || 0
      }
    }).filter(h => h.amount > 0)

    const totalPnL = totalCurrentValue - totalCostBasis
    const totalPnLPercentage = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0

    // Chart data for distribution
    const chartData = holdings.map(holding => ({
      name: holding.symbol,
      value: holding.currentValue,
      percentage: totalCurrentValue > 0 ? (holding.currentValue / totalCurrentValue) * 100 : 0
    }))

    return {
      totalValue: totalCurrentValue,
      totalPnL,
      totalPnLPercentage,
      holdings: holdings.sort((a, b) => b.currentValue - a.currentValue),
      chartData: chartData.filter(item => item.value > 0)
    }
  }, [portfolio, prices])

  const formatCurrency = (amount: number, hideBalance: boolean = false) => {
    if (hideBalance) return '****'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (amount: number, decimals: number = 6) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const getColorForPnL = (pnl: number) => {
    return pnl >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-400'
    if (rsi < 30) return 'text-green-400'
    return 'text-yellow-400'
  }

  if (!session) {
    return (
      <div className={`rounded-2xl bg-white/10 p-8 backdrop-blur-sm ring-1 ring-white/20 text-center ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">Advanced Portfolio Dashboard</h3>
        <p className="text-gray-400">Please sign in to view your portfolio</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`rounded-2xl bg-white/10 p-8 backdrop-blur-sm ring-1 ring-white/20 text-center ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-4"></div>
          <div className="h-6 bg-white/10 rounded mb-2"></div>
          <div className="h-6 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header with Controls */}
      <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Advanced Portfolio Dashboard</h3>
            <p className="text-gray-400">Real-time analytics and comprehensive insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Selector */}
            <div className="flex bg-white/5 rounded-lg p-1">
              {(['overview', 'charts', 'analytics'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded text-sm transition-colors capitalize ${
                    viewMode === mode
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Time Range Selector */}
            <div className="flex bg-white/5 rounded-lg p-1">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    timeRange === range
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Hide Balances Toggle */}
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              {hideBalances ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              {hideBalances ? 'Show' : 'Hide'}
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Value */}
        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(portfolioAnalytics.totalValue, hideBalances)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {portfolioAnalytics.holdings.length} assets
          </div>
        </div>

        {/* Total P&L */}
        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
          <div className="flex items-center gap-2 mb-2">
            {portfolioAnalytics.totalPnL >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm text-gray-400">Total P&L</span>
          </div>
          <div className={`text-2xl font-bold ${getColorForPnL(portfolioAnalytics.totalPnL)}`}>
            {hideBalances ? '****' : (
              <>
                {formatCurrency(portfolioAnalytics.totalPnL)}
                <span className="text-sm ml-2">
                  ({portfolioAnalytics.totalPnLPercentage >= 0 ? '+' : ''}
                  {portfolioAnalytics.totalPnLPercentage.toFixed(2)}%)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Best Performer */}
        {portfolioAnalytics.holdings.length > 0 && (
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Best Performer</span>
            </div>
            {(() => {
              const bestPerformer = portfolioAnalytics.holdings
                .filter(h => h.pnlPercentage > 0)
                .sort((a, b) => b.pnlPercentage - a.pnlPercentage)[0]
              
              return bestPerformer ? (
                <>
                  <div className="text-2xl font-bold text-white">{bestPerformer.symbol}</div>
                  <div className="text-xs text-green-400 mt-1">
                    +{bestPerformer.pnlPercentage.toFixed(2)}%
                  </div>
                </>
              ) : (
                <div className="text-lg text-gray-400">-</div>
              )
            })()}
          </div>
        )}

        {/* Market Status */}
        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">Market Status</span>
          </div>
          <div className="text-lg font-bold text-green-400">OPEN</div>
          <div className="text-xs text-gray-400 mt-1">
            Auto-refresh: 30s
          </div>
        </div>
      </div>

      {/* Main Content Based on View Mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Distribution Chart */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <ChartPieIcon className="h-5 w-5 text-purple-400" />
                Portfolio Distribution
              </h4>
            </div>
            <PortfolioDistributionChart
              portfolioDistribution={portfolioAnalytics.chartData}
              theme="dark"
            />
          </div>

          {/* Holdings Table */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-blue-400" />
              Current Holdings
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Asset</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-medium">Value</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-medium">P&L</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-medium">24h</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioAnalytics.holdings.slice(0, 5).map((holding) => (
                    <tr key={holding.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                        onClick={() => setSelectedAsset(holding.symbol)}>
                      <td className="py-3 px-2">
                        <div className="font-medium text-white">{holding.symbol}</div>
                        <div className="text-xs text-gray-400">{formatNumber(holding.amount, 8)}</div>
                      </td>
                      <td className="py-3 px-2 text-right text-white">
                        {formatCurrency(holding.currentValue, hideBalances)}
                      </td>
                      <td className={`py-3 px-2 text-right ${getColorForPnL(holding.pnl)}`}>
                        {hideBalances ? '****' : `${holding.pnl >= 0 ? '+' : ''}${holding.pnlPercentage.toFixed(1)}%`}
                      </td>
                      <td className={`py-3 px-2 text-right ${getColorForPnL(holding.priceChange24h)}`}>
                        <div className="flex items-center justify-end gap-1">
                          {holding.priceChange24h >= 0 ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          )}
                          {Math.abs(holding.priceChange24h).toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'charts' && (
        <div className="space-y-6">
          {/* Asset Selector */}
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex flex-wrap gap-2">
              {['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'AVAX'].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedAsset === symbol
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Price Chart */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">
                {selectedAsset} Price Chart ({timeRange})
              </h4>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(prices[selectedAsset]?.current_price || 0)}
                <span className={`text-sm ml-2 ${getColorForPnL(prices[selectedAsset]?.price_change_percentage_24h || 0)}`}>
                  {(prices[selectedAsset]?.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                  {(prices[selectedAsset]?.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
              </div>
            </div>
            <PriceHistoryChart
              priceHistory={[]}
              symbol={selectedAsset}
              timeRange={timeRange}
              theme="dark"
            />
          </div>

          {/* Volume Chart */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">Volume Analysis</h4>
            <VolumeChart
              priceHistory={[]}
              theme="dark"
            />
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Portfolio Performance Chart */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Portfolio Performance Timeline</h4>
              <button
                onClick={() => setShowTechnicals(!showTechnicals)}
                className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowsUpDownIcon className="h-4 w-4" />
                Technical Analysis
              </button>
            </div>
            <PortfolioTimelineChart
              portfolioHistory={[]}
              timeRange={timeRange}
              theme="dark"
            />
          </div>

          {/* Technical Indicators */}
          {showTechnicals && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* RSI */}
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20">
                <h5 className="text-sm text-gray-400 mb-2">RSI (14)</h5>
                <div className={`text-2xl font-bold ${getRSIColor(technicals.rsi)}`}>
                  {technicals.rsi.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">
                  {technicals.rsi > 70 ? 'Overbought' : technicals.rsi < 30 ? 'Oversold' : 'Neutral'}
                </div>
              </div>

              {/* MACD */}
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20">
                <h5 className="text-sm text-gray-400 mb-2">MACD</h5>
                <div className={`text-lg font-bold ${getColorForPnL(technicals.macd.value)}`}>
                  {technicals.macd.value.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">
                  Signal: {technicals.macd.signal.toFixed(2)}
                </div>
              </div>

              {/* SMA 20/50 */}
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20">
                <h5 className="text-sm text-gray-400 mb-2">SMA 20/50</h5>
                <div className="text-sm text-white">
                  <div>20: {formatCurrency(technicals.sma20)}</div>
                  <div>50: {formatCurrency(technicals.sma50)}</div>
                </div>
              </div>

              {/* Bollinger Bands */}
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20">
                <h5 className="text-sm text-gray-400 mb-2">Bollinger Bands</h5>
                <div className="text-xs text-white space-y-1">
                  <div>Upper: {formatCurrency(technicals.bollinger.upper)}</div>
                  <div>Middle: {formatCurrency(technicals.bollinger.middle)}</div>
                  <div>Lower: {formatCurrency(technicals.bollinger.lower)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {portfolioAnalytics.holdings.length === 0 && (
        <div className="rounded-2xl bg-white/10 p-12 backdrop-blur-sm ring-1 ring-white/20 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Holdings Found</h3>
          <p className="text-gray-400 mb-4">Start trading to unlock advanced analytics</p>
          <a 
            href="/trading" 
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-400 hover:to-emerald-400 transition-all"
          >
            Start Trading
          </a>
        </div>
      )}
    </motion.div>
  )
}
