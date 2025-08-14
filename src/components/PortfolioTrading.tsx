'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowsUpDownIcon,
  ChartBarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { useNotify } from '@/components/notifications'

interface PortfolioTradingProps {
  className?: string
}

type Holding = { symbol: string; amount: number }

export function PortfolioTrading({ className = "" }: PortfolioTradingProps) {
  const { data: session } = useSession()
  const notify = useNotify()
  const priceUpdateInterval = useRef<NodeJS.Timeout | null>(null)

  // Trading state
  const [fromCurrency, setFromCurrency] = useState('BTC')
  const [toCurrency, setToCurrency] = useState('USDT')
  const [amount, setAmount] = useState('')
  const [portfolio, setPortfolio] = useState<Holding[]>([])
  const [rates, setRates] = useState<{ [key: string]: number }>({})
  const [receivedAmount, setReceivedAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  // Enhanced features
  const [priceChangeAlert, setPriceChangeAlert] = useState<{ [key: string]: 'up' | 'down' | null }>({})
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)

  // Helper: Crypto name mapping
  const getCryptoName = (symbol: string): string => {
    const nameMap: { [key: string]: string } = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      BNB: 'Binance Coin',
      USDT: 'Tether',
      ADA: 'Cardano',
      SOL: 'Solana',
      XRP: 'XRP',
      DOGE: 'Dogecoin',
      DOT: 'Polkadot',
      AVAX: 'Avalanche',
      LINK: 'Chainlink',
      UNI: 'Uniswap',
      LTC: 'Litecoin',
      MATIC: 'Polygon',
      ATOM: 'Cosmos'
    }
    return nameMap[symbol] || symbol
  }

  // API: Portfolio
  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio || [])
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    }
  }

  // API: Rates (initial and periodic)
  const fetchRates = useCallback(async () => {
    try {
      const symbols = 'BTC,ETH,BNB,USDT,ADA,SOL,XRP,DOGE,DOT,AVAX,LINK,UNI,LTC,MATIC,ATOM'
      const response = await fetch(`/api/prices?symbols=${symbols}`)
      if (response.ok) {
        const { data } = await response.json()
        const priceMap: { [key: string]: number } = {}
        data.forEach((item: { symbol: string; current_price: number }) => {
          priceMap[item.symbol] = item.current_price
        })
        setRates(priceMap)
        setLastPriceUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching rates:', error)
      notify.error('Price Update Failed', 'Unable to fetch latest cryptocurrency prices')
    }
  }, [notify])

  // API: Rates with comparison (for live alerts)
  const fetchRatesWithComparison = useCallback(async () => {
    try {
      const symbols = 'BTC,ETH,BNB,USDT,ADA,SOL,XRP,DOGE,DOT,AVAX,LINK,UNI,LTC,ATOM'
      const response = await fetch(`/api/prices?symbols=${symbols}`)
      if (response.ok) {
        const { data } = await response.json()
        const newPriceMap: { [key: string]: number } = {}
        const alerts: { [key: string]: 'up' | 'down' | null } = {}

        data.forEach((item: { symbol: string; current_price: number }) => {
          const symbol = item.symbol
          const newPrice = item.current_price
          const oldPrice = rates[symbol]

          newPriceMap[symbol] = newPrice

          if (oldPrice && Math.abs((newPrice - oldPrice) / oldPrice) > 0.02) {
            const direction = newPrice > oldPrice ? 'up' : 'down'
            alerts[symbol] = direction

            if ([fromCurrency, toCurrency].includes(symbol)) {
              const changePercent = (((newPrice - oldPrice) / oldPrice) * 100).toFixed(2)
              notify.info(
                `${symbol} Price ${direction === 'up' ? 'Surge' : 'Drop'}`,
                `${getCryptoName(symbol)} ${direction === 'up' ? 'increased' : 'decreased'} by ${Math.abs(parseFloat(changePercent))}%`
              )
            }
          }
        })

        setRates(newPriceMap)
        setPriceChangeAlert(alerts)
        setLastPriceUpdate(new Date())

        setTimeout(() => setPriceChangeAlert({}), 3000)
      }
    } catch (error) {
      console.error('Error fetching rates:', error)
    }
  }, [rates, fromCurrency, toCurrency, notify])

  // Derived amount
  const calculateReceiveAmount = useCallback(() => {
    if (!amount || !rates[fromCurrency] || !rates[toCurrency]) {
      setReceivedAmount('')
      return
    }
    const fromPrice = rates[fromCurrency] || 0
    const toPrice = rates[toCurrency] || 0
    if (fromPrice === 0 || toPrice === 0) {
      setReceivedAmount('')
      return
    }
    const usdValue = parseFloat(amount) * fromPrice
    const receivedValue = usdValue / toPrice
    setReceivedAmount(receivedValue.toFixed(8))
  }, [amount, fromCurrency, toCurrency, rates])

  // Effects
  useEffect(() => {
    if (session) {
      fetchPortfolio()
      fetchRates()
      priceUpdateInterval.current = setInterval(() => {
        fetchRatesWithComparison()
      }, 30000)
    }
    return () => {
      if (priceUpdateInterval.current) clearInterval(priceUpdateInterval.current)
    }
  }, [session, fetchRates, fetchRatesWithComparison])

  useEffect(() => {
    calculateReceiveAmount()
  }, [calculateReceiveAmount])

  // Helpers
  const updatePortfolio = async () => {
    if (!session) return
    try {
      const symbol = tradeType === 'buy' ? toCurrency : fromCurrency
      const price = tradeType === 'buy' ? rates[toCurrency] : rates[fromCurrency]
      const tradeAmount = parseFloat(tradeType === 'buy' ? receivedAmount : amount)

      const updateData = {
        symbol,
        name: getCryptoName(symbol),
        amount: tradeType === 'sell' ? -tradeAmount : tradeAmount,
        price
      }

      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (tradeType === 'sell') {
        await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: toCurrency,
            name: getCryptoName(toCurrency),
            amount: parseFloat(receivedAmount),
            price: rates[toCurrency]
          })
        })
      }

      fetchPortfolio()
    } catch (error) {
      console.error('Error updating portfolio:', error)
    }
  }

  const getAvailableBalance = (symbol: string) => {
    const holding = portfolio.find(p => p.symbol === symbol)
    return holding ? holding.amount : 0
  }

  // UI Handlers
  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !receivedAmount || !session) return

    const tradeAmount = parseFloat(amount)
    const availableBalance = getAvailableBalance(fromCurrency)

    if (tradeAmount <= 0) {
      notify.error('Invalid Amount', 'Please enter a valid trading amount greater than 0')
      return
    }
    if (tradeAmount > availableBalance) {
      notify.error('Insufficient Balance', `You only have ${availableBalance.toFixed(8)} ${fromCurrency} available`)
      return
    }

    setIsLoading(true)
    try {
      const transactionData = {
        type: tradeType.toUpperCase(),
        symbol: tradeType === 'buy' ? toCurrency : fromCurrency,
        amount: parseFloat(tradeType === 'buy' ? receivedAmount : amount),
        price: tradeType === 'buy' ? rates[toCurrency] : rates[fromCurrency],
        totalValue: parseFloat(amount) * rates[fromCurrency]
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      })

      if (response.ok) {
        await updatePortfolio()
        setAmount('')
        setReceivedAmount('')
        const tradeSymbol = tradeType === 'buy' ? toCurrency : fromCurrency
        const tradeAmountStr = (tradeType === 'buy' ? parseFloat(receivedAmount) : parseFloat(amount)).toFixed(6)
        notify.success(
          `${tradeType === 'buy' ? 'Purchase' : 'Sale'} Successful!`,
          `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${tradeAmountStr} ${tradeSymbol} at $${rates[tradeSymbol]?.toFixed(2)}`
        )
      } else {
        const errorData: unknown = await response.json().catch(() => ({}))
        const message =
          errorData && typeof errorData === 'object' && 'message' in errorData && typeof (errorData as { message: unknown }).message === 'string'
            ? (errorData as { message: string }).message
            : 'Transaction failed'
        throw new Error(message)
      }
    } catch (error) {
      console.error('Error executing trade:', error)
      notify.error('Trade Failed', error instanceof Error ? error.message : 'Unable to execute trade. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setAmount('')
    setReceivedAmount('')
  }

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl bg-white/10 p-8 backdrop-blur-sm ring-1 ring-white/20 text-center ${className}`}
      >
        <h3 className="text-xl font-bold text-white mb-4">Portfolio Trading</h3>
        <p className="text-gray-400">Please sign in to start trading with your portfolio</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20 ${className}`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white">Portfolio Trading</h3>
          {lastPriceUpdate && (
            <div className="flex items-center text-xs text-gray-400">
              <ClockIcon className="w-3 h-3 mr-1" />
              Updated {lastPriceUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400">
          Trade with your internal portfolio balance • Live prices every 30s
        </p>

        {rates[fromCurrency] && rates[toCurrency] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <span className="text-gray-400">Current Rate:</span>
                <div className={`ml-2 flex items-center ${
                  priceChangeAlert[fromCurrency] === 'up' ? 'text-green-400' :
                  priceChangeAlert[fromCurrency] === 'down' ? 'text-red-400' : 'text-white'
                }`}>
                  {priceChangeAlert[fromCurrency] === 'up' && <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />}
                  {priceChangeAlert[fromCurrency] === 'down' && <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />}
                  1 {fromCurrency} = ${rates[fromCurrency]?.toFixed(fromCurrency === 'BTC' || fromCurrency === 'ETH' ? 2 : 6)}
                </div>
              </div>
              <div className="flex items-center">
                <div className={`flex items-center ${
                  priceChangeAlert[toCurrency] === 'up' ? 'text-green-400' :
                  priceChangeAlert[toCurrency] === 'down' ? 'text-red-400' : 'text-white'
                }`}>
                  {priceChangeAlert[toCurrency] === 'up' && <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />}
                  {priceChangeAlert[toCurrency] === 'down' && <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />}
                  1 {toCurrency} = ${rates[toCurrency]?.toFixed(toCurrency === 'BTC' || toCurrency === 'ETH' ? 2 : 6)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex mt-4 bg-white/5 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              tradeType === 'buy' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BanknotesIcon className="w-4 h-4 inline mr-1" />
            Buy
          </button>
          <button
            type="button"
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              tradeType === 'sell' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ChartBarIcon className="w-4 h-4 inline mr-1" />
            Sell
          </button>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleTrade}>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">
              {tradeType === 'buy' ? 'Pay With' : 'Sell'}
            </label>
            <span className="text-xs text-gray-500">
              Balance: {getAvailableBalance(fromCurrency).toFixed(8)} {fromCurrency}
            </span>
          </div>
          <div className="flex rounded-xl bg-white/5 ring-1 ring-white/10">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="any"
              max={getAvailableBalance(fromCurrency)}
              className="block w-full bg-transparent px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-l-xl"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="bg-white/10 px-4 py-3 text-white rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border-l border-white/10"
            >
              <option value="BTC" className="bg-gray-800">BTC - Bitcoin</option>
              <option value="ETH" className="bg-gray-800">ETH - Ethereum</option>
              <option value="BNB" className="bg-gray-800">BNB - Binance Coin</option>
              <option value="USDT" className="bg-gray-800">USDT - Tether</option>
              <option value="ADA" className="bg-gray-800">ADA - Cardano</option>
              <option value="SOL" className="bg-gray-800">SOL - Solana</option>
              <option value="XRP" className="bg-gray-800">XRP - XRP</option>
              <option value="DOGE" className="bg-gray-800">DOGE - Dogecoin</option>
              <option value="DOT" className="bg-gray-800">DOT - Polkadot</option>
              <option value="AVAX" className="bg-gray-800">AVAX - Avalanche</option>
              <option value="LINK" className="bg-gray-800">LINK - Chainlink</option>
              <option value="UNI" className="bg-gray-800">UNI - Uniswap</option>
              <option value="LTC" className="bg-gray-800">LTC - Litecoin</option>
              <option value="MATIC" className="bg-gray-800">MATIC - Polygon</option>
              <option value="ATOM" className="bg-gray-800">ATOM - Cosmos</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white transition-all hover:scale-110 hover:from-blue-400 hover:to-emerald-400"
          >
            <ArrowsUpDownIcon className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {tradeType === 'buy' ? 'Receive' : 'Get'}
          </label>
          <div className="flex rounded-xl bg-white/5 ring-1 ring-white/10">
            <input
              type="text"
              value={receivedAmount}
              placeholder="0.00"
              readOnly
              className="block w-full bg-transparent px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none rounded-l-xl"
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="bg-white/10 px-4 py-3 text-white rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border-l border-white/10"
            >
              <option value="USDT" className="bg-gray-800">USDT - Tether</option>
              <option value="BTC" className="bg-gray-800">BTC - Bitcoin</option>
              <option value="ETH" className="bg-gray-800">ETH - Ethereum</option>
              <option value="BNB" className="bg-gray-800">BNB - Binance Coin</option>
              <option value="ADA" className="bg-gray-800">ADA - Cardano</option>
              <option value="SOL" className="bg-gray-800">SOL - Solana</option>
              <option value="XRP" className="bg-gray-800">XRP - XRP</option>
              <option value="DOGE" className="bg-gray-800">DOGE - Dogecoin</option>
              <option value="DOT" className="bg-gray-800">DOT - Polkadot</option>
              <option value="AVAX" className="bg-gray-800">AVAX - Avalanche</option>
              <option value="LINK" className="bg-gray-800">LINK - Chainlink</option>
              <option value="UNI" className="bg-gray-800">UNI - Uniswap</option>
              <option value="LTC" className="bg-gray-800">LTC - Litecoin</option>
              <option value="MATIC" className="bg-gray-800">MATIC - Polygon</option>
              <option value="ATOM" className="bg-gray-800">ATOM - Cosmos</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount || !receivedAmount}
          className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${tradeType === 'buy' ? toCurrency : fromCurrency}`
          )}
        </button>
      </form>
    </motion.div>
  )
}

