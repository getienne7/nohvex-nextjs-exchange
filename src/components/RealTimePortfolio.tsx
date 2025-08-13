'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ArrowsUpDownIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {
  PriceHistoryChart,
  PortfolioTimelineChart,
  PortfolioDistributionChart,
  VolumeChart
} from './charts/ChartComponents'
import {
  useWebSocket,
  useRealTimePrices,
  useRealTimePortfolio,
  useMarketAlerts
} from '../hooks/useWebSocket'
import { DataSourceIndicator } from './DataSourceIndicator'

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

interface RealTimePortfolioProps {
  className?: string
}

// Real-time price ticker component
function LivePriceTicker({ symbols }: { symbols: string[] }) {
  const { prices, isConnected } = useRealTimePrices(symbols)

  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          Live Prices
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        </h4>
        <DataSourceIndicator />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {symbols.map(symbol => {
          const priceData = prices[symbol]
          return (
            <motion.div
              key={symbol}
              initial={{ scale: 1 }}
              animate={{ scale: priceData ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 rounded-lg p-3 text-center"
            >
              <div className="text-sm font-medium text-white">{symbol}</div>
              {priceData ? (
                <>
                  <div className="text-lg font-bold text-white">
                    ${priceData.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs flex items-center justify-center gap-1 ${
                    priceData.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {priceData.change_24h >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" />
                    )}
                    {Math.abs(priceData.change_24h).toFixed(2)}%
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm">Loading...</div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Market alerts notification component
function MarketAlertsPanel() {
  const { alerts, alertCount } = useMarketAlerts()
  const [showAlerts, setShowAlerts] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id))

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  return (
    <>
      {/* Alert Button */}
      <button
        onClick={() => setShowAlerts(!showAlerts)}
        className="relative flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
      >
        <BellIcon className="h-4 w-4" />
        Alerts
        {visibleAlerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {visibleAlerts.length}
          </span>
        )}
      </button>

      {/* Alerts Panel */}
      <AnimatePresence>
        {showAlerts && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">Market Alerts</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {visibleAlerts.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No new alerts
                </div>
              ) : (
                visibleAlerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 border-b border-white/5 hover:bg-white/5 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-white text-sm">{alert.message}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-white ml-2"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Connection status indicator
function ConnectionStatus() {
  const { isConnected, connectionStatus } = useWebSocket()

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400'
      case 'connecting':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Error'
      default:
        return 'Disconnected'
    }
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
      <WifiIcon className="h-4 w-4" />
      {getStatusText()}
      {isConnected && <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />}
    </div>
  )
}

export function RealTimePortfolio({ className = "" }: RealTimePortfolioProps) {
  const { data: session } = useSession()
  const [portfolio, setPortfolio] = useState<Portfolio[]>([])
  const [staticPrices, setStaticPrices] = useState<{[key: string]: CryptoPrice}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hideBalances, setHideBalances] = useState(false)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC')
  const [viewMode, setViewMode] = useState<'overview' | 'charts' | 'analytics'>('overview')
  const [showTechnicals, setShowTechnicals] = useState(false)

  // Real-time hooks
  const symbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'AVAX']
  const { prices: livePrices } = useRealTimePrices(symbols)
  const { portfolioData: livePortfolioData } = useRealTimePortfolio()

  useEffect(() => {
    if (session) {
      fetchPortfolio()
      fetchPrices()
    }
  }, [session])

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio || [])
      } else {
        console.error('Portfolio fetch failed:', response.status, response.statusText)
        throw new Error(`Failed to fetch portfolio: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error instanceof Error ? error.message : String(error))
      setPortfolio([]) // Set empty portfolio on error
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPrices = async () => {
    try {
      const symbolString = 'BTC,ETH,BNB,USDT,ADA,SOL,XRP,DOGE,DOT,AVAX,LINK,UNI,LTC,MATIC,ATOM'
      const response = await fetch(`/api/prices?symbols=${symbolString}`)
      if (response.ok) {
        const { data } = await response.json()
        const priceMap: {[key: string]: CryptoPrice} = {}
        if (Array.isArray(data)) {
          data.forEach((item: CryptoPrice) => {
            priceMap[item.symbol] = item
          })
          setStaticPrices(priceMap)
        } else {
          console.error('Invalid price data format:', data)
        }
      } else {
        console.error('Price fetch failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching prices:', error instanceof Error ? error.message : String(error))
    }
  }

  // Merge live prices with static prices (live prices take precedence)
  const currentPrices = useMemo(() => {
    const mergedPrices: {[key: string]: CryptoPrice} = { ...staticPrices }
    
    Object.entries(livePrices).forEach(([symbol, livePrice]) => {
      mergedPrices[symbol] = {
        symbol: livePrice.symbol,
        name: staticPrices[symbol]?.name || livePrice.symbol,
        current_price: livePrice.price,
        price_change_percentage_24h: livePrice.change_24h
      }
    })
    
    return mergedPrices
  }, [staticPrices, livePrices])

  // Use real-time portfolio data if available, otherwise use static data
  const effectivePortfolio = useMemo(() => {
    if (livePortfolioData && livePortfolioData.holdings.length > 0) {
      return livePortfolioData.holdings.map((holding, index) => ({
        id: `live_${index}`,
        symbol: holding.symbol,
        name: staticPrices[holding.symbol]?.name || holding.symbol,
        amount: holding.amount,
        averagePrice: holding.current_value / holding.amount,
        totalValue: holding.current_value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    }
    return portfolio
  }, [livePortfolioData, portfolio, staticPrices])

  const portfolioAnalytics = useMemo(() => {
    if (!effectivePortfolio.length || !Object.keys(currentPrices).length) {
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
    const holdings = effectivePortfolio.map(holding => {
      const currentPrice = currentPrices[holding.symbol]?.current_price || 0
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
        priceChange24h: currentPrices[holding.symbol]?.price_change_percentage_24h || 0
      }
    }).filter(h => h.amount > 0)

    const totalPnL = livePortfolioData?.total_pnl ?? (totalCurrentValue - totalCostBasis)
    const totalValue = livePortfolioData?.total_value ?? totalCurrentValue
    const totalPnLPercentage = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0

    // Chart data for distribution
    const chartData = holdings.map(holding => ({
      name: holding.symbol,
      value: holding.currentValue,
      percentage: totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0
    }))

    return {
      totalValue,
      totalPnL,
      totalPnLPercentage,
      holdings: holdings.sort((a, b) => b.currentValue - a.currentValue),
      chartData: chartData.filter(item => item.value > 0)
    }
  }, [effectivePortfolio, currentPrices, livePortfolioData])

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

  if (!session) {
    return (
      <div className={`rounded-2xl bg-white/10 p-8 backdrop-blur-sm ring-1 ring-white/20 text-center ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">Real-Time Portfolio Dashboard</h3>
        <p className="text-gray-400">Please sign in to view your real-time portfolio</p>
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
      {/* Live Price Ticker */}
      <LivePriceTicker symbols={symbols} />

      {/* Header with Controls */}
      <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">Real-Time Portfolio Dashboard</h3>
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <p className="text-gray-400">Live market data and real-time updates</p>
              <ConnectionStatus />
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative">
            {/* Market Alerts */}
            <MarketAlertsPanel />

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

      {/* Portfolio Summary with Real-Time Updates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Value */}
        <motion.div 
          key={`total-${portfolioAnalytics.totalValue}`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Value</span>
            <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(portfolioAnalytics.totalValue, hideBalances)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {portfolioAnalytics.holdings.length} assets • Live
          </div>
        </motion.div>

        {/* Total P&L */}
        <motion.div
          key={`pnl-${portfolioAnalytics.totalPnL}`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20"
        >
          <div className="flex items-center gap-2 mb-2">
            {portfolioAnalytics.totalPnL >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm text-gray-400">Total P&L</span>
            <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
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
          {livePortfolioData && (
            <div className="text-xs text-gray-400 mt-1">
              Updated {new Date(livePortfolioData.timestamp).toLocaleTimeString()}
            </div>
          )}
        </motion.div>

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
          <div className="text-lg font-bold text-green-400 flex items-center gap-2">
            LIVE
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Real-time updates
          </div>
        </div>
      </div>

      {/* Main Content - Same as AdvancedPortfolio but with real-time data */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Distribution Chart */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <ChartPieIcon className="h-5 w-5 text-purple-400" />
                Portfolio Distribution
                <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
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
              Live Holdings
              <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
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
                    <motion.tr 
                      key={`${holding.id}-${holding.currentValue}`}
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                      onClick={() => setSelectedAsset(holding.symbol)}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-white">{holding.symbol}</div>
                            <div className="text-xs text-gray-400">{formatNumber(holding.amount, 8)}</div>
                          </div>
                          {livePrices[holding.symbol] && (
                            <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                          )}
                        </div>
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Analytics views would be similar to AdvancedPortfolio */}
      {viewMode === 'charts' && (
        <div className="space-y-6">
          {/* Asset Selector */}
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex flex-wrap gap-2">
              {symbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    selectedAsset === symbol
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {symbol}
                  {livePrices[symbol] && (
                    <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Chart */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                {selectedAsset} Price Chart ({timeRange})
                {livePrices[selectedAsset] && (
                  <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                )}
              </h4>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(currentPrices[selectedAsset]?.current_price || 0)}
                <span className={`text-sm ml-2 ${getColorForPnL(currentPrices[selectedAsset]?.price_change_percentage_24h || 0)}`}>
                  {(currentPrices[selectedAsset]?.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                  {(currentPrices[selectedAsset]?.price_change_percentage_24h || 0).toFixed(2)}%
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
              <h4 className="text-lg font-semibold text-white">Real-Time Portfolio Performance</h4>
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
        </div>
      )}

      {/* Empty State */}
      {portfolioAnalytics.holdings.length === 0 && (
        <div className="rounded-2xl bg-white/10 p-12 backdrop-blur-sm ring-1 ring-white/20 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Holdings Found</h3>
          <p className="text-gray-400 mb-4">Start trading to see real-time portfolio updates</p>
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
