'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface PortfolioItem {
  id: string
  symbol: string
  name: string
  amount: number
  averagePrice: number
  totalValue: number
  currentPrice?: number
  change24h?: number
}

interface CryptoPrice {
  id: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
}

export default function PortfolioOverview() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [cryptoPrices, setCryptoPrices] = useState<{ [key: string]: CryptoPrice }>({})

  useEffect(() => {
    fetchPortfolio()
    fetchCryptoPrices()
    
    // Update prices every 30 seconds
    const interval = setInterval(fetchCryptoPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio)
        setTotalValue(data.totalValue)
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,tether&vs_currencies=usd&include_24hr_change=true'
      )
      if (response.ok) {
        const data = await response.json()
        const prices: { [key: string]: CryptoPrice } = {}
        
        // Map API response to our format
        const mapping = {
          bitcoin: 'BTC',
          ethereum: 'ETH',
          binancecoin: 'BNB',
          tether: 'USDT'
        }
        
        Object.entries(data).forEach(([id, priceData]: [string, { usd: number, usd_24h_change?: number }]) => {
          const symbol = mapping[id as keyof typeof mapping]
          if (symbol) {
            prices[symbol] = {
              id,
              symbol,
              current_price: priceData.usd,
              price_change_percentage_24h: priceData.usd_24h_change || 0
            }
          }
        })
        
        setCryptoPrices(prices)
      }
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const calculateProfitLoss = (item: PortfolioItem) => {
    const currentPrice = cryptoPrices[item.symbol]?.current_price || item.averagePrice
    const currentValue = item.amount * currentPrice
    const investedValue = item.amount * item.averagePrice
    const profitLoss = currentValue - investedValue
    const profitLossPercentage = ((currentValue - investedValue) / investedValue) * 100
    
    return {
      amount: profitLoss,
      percentage: profitLossPercentage,
      isProfit: profitLoss >= 0
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-gray-400">Total Portfolio Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{portfolio.length}</div>
            <div className="text-sm text-gray-400">Assets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">0%</div>
            <div className="text-sm text-gray-400">24h Change</div>
          </div>
        </div>
      </motion.div>

      {/* Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Your Assets</h2>
          <button
            onClick={() => setShowAddAsset(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No assets in your portfolio yet</div>
            <button
              onClick={() => setShowAddAsset(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-200"
            >
              Add Your First Asset
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {portfolio.map((item, index) => {
              const profitLoss = calculateProfitLoss(item)
              const currentPrice = cryptoPrices[item.symbol]?.current_price || item.averagePrice
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{item.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-gray-400 text-sm">{item.amount} {item.symbol}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrency(currentPrice)}</div>
                    <div className={`text-sm flex items-center ${profitLoss.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profitLoss.isProfit ? (
                        <ChevronUpIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3 mr-1" />
                      )}
                      {profitLoss.percentage.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrency(item.amount * currentPrice)}</div>
                    <div className={`text-sm ${profitLoss.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profitLoss.isProfit ? '+' : ''}{formatCurrency(profitLoss.amount)}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { title: 'Buy Crypto', desc: 'Add to portfolio', color: 'from-green-500 to-emerald-500' },
          { title: 'Sell Crypto', desc: 'Reduce holdings', color: 'from-red-500 to-pink-500' },
          { title: 'Market Analysis', desc: 'View trends', color: 'from-blue-500 to-indigo-500' },
          { title: 'Reports', desc: 'Download statements', color: 'from-purple-500 to-violet-500' }
        ].map((action, index) => (
          <div
            key={action.title}
            className={`bg-gradient-to-r ${action.color} p-4 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform`}
          >
            <div className="font-medium">{action.title}</div>
            <div className="text-sm opacity-90">{action.desc}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
