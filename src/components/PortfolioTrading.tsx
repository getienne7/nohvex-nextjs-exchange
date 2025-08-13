'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'

interface PortfolioTradingProps {
  className?: string
}

export function PortfolioTrading({ className = "" }: PortfolioTradingProps) {
  const { data: session } = useSession()
  const [fromCurrency, setFromCurrency] = useState('BTC')
  const [toCurrency, setToCurrency] = useState('USDT')
  const [amount, setAmount] = useState('')
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [rates, setRates] = useState<{[key: string]: number}>({})
  const [receivedAmount, setReceivedAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  useEffect(() => {
    if (session) {
      fetchPortfolio()
      fetchRates()
    }
  }, [session])

  useEffect(() => {
    calculateReceiveAmount()
  }, [amount, fromCurrency, toCurrency, rates, tradeType])

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

  const fetchRates = async () => {
    try {
      // Expanded cryptocurrency support
      const symbols = 'BTC,ETH,BNB,USDT,ADA,SOL,XRP,DOGE,DOT,AVAX,LINK,UNI,LTC,MATIC,ATOM'
      const response = await fetch(`/api/prices?symbols=${symbols}`)
      if (response.ok) {
        const { data } = await response.json()
        const priceMap: {[key: string]: number} = {}
        data.forEach((item: any) => {
          priceMap[item.symbol] = item.current_price
        })
        setRates(priceMap)
      }
    } catch (error) {
      console.error('Error fetching rates:', error)
    }
  }

  const calculateReceiveAmount = () => {
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

    if (tradeType === 'buy') {
      // Buying toCurrency with fromCurrency
      const usdValue = parseFloat(amount) * fromPrice
      const receivedValue = usdValue / toPrice
      setReceivedAmount(receivedValue.toFixed(8))
    } else {
      // Selling fromCurrency for toCurrency
      const usdValue = parseFloat(amount) * fromPrice
      const receivedValue = usdValue / toPrice
      setReceivedAmount(receivedValue.toFixed(8))
    }
  }

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !receivedAmount || !session) return
    
    setIsLoading(true)
    
    try {
      // Create transaction record
      const transactionData = {
        type: tradeType.toUpperCase(),
        symbol: tradeType === 'buy' ? toCurrency : fromCurrency,
        amount: parseFloat(tradeType === 'buy' ? receivedAmount : amount),
        price: tradeType === 'buy' ? rates[toCurrency] : rates[fromCurrency],
        totalValue: parseFloat(amount) * rates[fromCurrency]
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })

      if (response.ok) {
        // Update portfolio
        await updatePortfolio()
        
        // Reset form
        setAmount('')
        setReceivedAmount('')
        
        alert(`${tradeType === 'buy' ? 'Purchase' : 'Sale'} completed successfully!`)
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Error executing trade:', error)
      alert('Trade failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Cryptocurrency name mapping - expanded support
  const getCryptoName = (symbol: string): string => {
    const nameMap: {[key: string]: string} = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'Binance Coin',
      'USDT': 'Tether',
      'ADA': 'Cardano',
      'SOL': 'Solana',
      'XRP': 'XRP',
      'DOGE': 'Dogecoin',
      'DOT': 'Polkadot',
      'AVAX': 'Avalanche',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'LTC': 'Litecoin',
      'MATIC': 'Polygon',
      'ATOM': 'Cosmos'
    }
    return nameMap[symbol] || symbol
  }

  const updatePortfolio = async () => {
    if (!session) return

    try {
      const symbol = tradeType === 'buy' ? toCurrency : fromCurrency
      const price = tradeType === 'buy' ? rates[toCurrency] : rates[fromCurrency]
      const tradeAmount = parseFloat(tradeType === 'buy' ? receivedAmount : amount)
      
      const updateData = {
        symbol,
        name: getCryptoName(symbol),
        amount: tradeType === 'sell' ? -tradeAmount : tradeAmount, // Negative for selling
        price
      }

      await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      // If selling fromCurrency, also add the received toCurrency
      if (tradeType === 'sell') {
        await fetch('/api/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol: toCurrency,
            name: getCryptoName(toCurrency),
            amount: parseFloat(receivedAmount),
            price: rates[toCurrency]
          })
        })
      }

      // Refresh portfolio
      fetchPortfolio()
    } catch (error) {
      console.error('Error updating portfolio:', error)
    }
  }

  const getAvailableBalance = (symbol: string) => {
    const holding = portfolio.find(p => p.symbol === symbol)
    return holding ? holding.amount : 0
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
        <h3 className="text-xl font-bold text-white mb-2">Portfolio Trading</h3>
        <p className="text-sm text-gray-400">
          Trade with your internal portfolio balance
        </p>
        
        {/* Trade Type Toggle */}
        <div className="flex mt-4 bg-white/5 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              tradeType === 'buy'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              tradeType === 'sell'
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleTrade}>
        {/* From Currency */}
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

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white transition-all hover:scale-110 hover:from-blue-400 hover:to-emerald-400"
          >
            <ArrowsUpDownIcon className="h-5 w-5" />
          </button>
        </div>

        {/* To Currency */}
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

        {/* Trade Button */}
        <button
          type="submit"
          disabled={isLoading || !amount || !receivedAmount || parseFloat(amount) > getAvailableBalance(fromCurrency)}
          className={`w-full rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            tradeType === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400'
              : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400'
          }`}
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
