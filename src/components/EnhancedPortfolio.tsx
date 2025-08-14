'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

// Dynamically import Recharts components to avoid SSR issues
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>
})
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false })

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

interface EnhancedPortfolioProps {
  className?: string
}

export function EnhancedPortfolio({ className = "" }: EnhancedPortfolioProps) {
  const { data: session } = useSession()
  const [portfolio, setPortfolio] = useState<Portfolio[]>([])
  const [prices, setPrices] = useState<{[key: string]: CryptoPrice}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hideBalances, setHideBalances] = useState(false)

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
    }).filter(h => h.amount > 0) // Only show holdings with positive amounts

    const totalPnL = totalCurrentValue - totalCostBasis
    const totalPnLPercentage = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0

    // Chart data for pie chart
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

  // Colors for pie chart
  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald  
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#A78BFA', // Light Purple
    '#FB7185', // Rose
    '#FBBF24', // Yellow
    '#34D399', // Light Green
    '#60A5FA', // Light Blue
  ]

  if (!session) {
    return (
      <div className={`rounded-2xl bg-white/10 p-8 backdrop-blur-sm ring-1 ring-white/20 text-center ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">Portfolio Dashboard</h3>
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
      {/* Portfolio Summary */}
      <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-white">Portfolio Dashboard</h3>
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            {hideBalances ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            {hideBalances ? 'Show' : 'Hide'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Value */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Total Value</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(portfolioAnalytics.totalValue, hideBalances)}
            </div>
          </div>

          {/* Total P&L */}
          <div className="bg-white/5 rounded-xl p-4">
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

          {/* Holdings Count */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400">Holdings</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {portfolioAnalytics.holdings.length}
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation Chart */}
        {portfolioAnalytics.chartData.length > 0 && (
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">Portfolio Allocation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioAnalytics.chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioAnalytics.chartData.map((entry, index) => (
<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | string | (number | string)[]) => {
                      const v = Array.isArray(value) ? value[0] : value
                      return [formatCurrency(Number(v)), 'Value']
                    }}
                    labelStyle={{ color: '#000' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Holdings */}
        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Top Holdings</h4>
          <div className="space-y-3">
            {portfolioAnalytics.holdings.slice(0, 5).map((holding, index) => (
              <div key={holding.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full`} 
                       style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div>
                    <div className="font-medium text-white">{holding.symbol}</div>
                    <div className="text-sm text-gray-400">{holding.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    {formatCurrency(holding.currentValue, hideBalances)}
                  </div>
                  <div className={`text-sm ${getColorForPnL(holding.pnl)}`}>
                    {hideBalances ? '****' : `${holding.pnl >= 0 ? '+' : ''}${holding.pnlPercentage.toFixed(2)}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Holdings Table */}
      {portfolioAnalytics.holdings.length > 0 && (
        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">All Holdings</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Asset</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Amount</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Current Price</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Current Value</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Avg. Cost</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">P&L</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {portfolioAnalytics.holdings.map((holding) => (
                  <tr key={holding.id} className="border-b border-white/5">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium text-white">{holding.symbol}</div>
                        <div className="text-xs text-gray-400">{holding.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-white">
                      {formatNumber(holding.amount, 8)}
                    </td>
                    <td className="py-3 px-2 text-right text-white">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="py-3 px-2 text-right text-white">
                      {formatCurrency(holding.currentValue, hideBalances)}
                    </td>
                    <td className="py-3 px-2 text-right text-white">
                      {formatCurrency(holding.averagePrice)}
                    </td>
                    <td className={`py-3 px-2 text-right ${getColorForPnL(holding.pnl)}`}>
                      {hideBalances ? '****' : (
                        <div>
                          <div>{formatCurrency(holding.pnl)}</div>
                          <div className="text-xs">
                            {holding.pnl >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
                          </div>
                        </div>
                      )}
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
      )}

      {/* Empty State */}
      {portfolioAnalytics.holdings.length === 0 && (
        <div className="rounded-2xl bg-white/10 p-12 backdrop-blur-sm ring-1 ring-white/20 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Holdings Found</h3>
          <p className="text-gray-400 mb-4">Start trading to build your portfolio</p>
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
