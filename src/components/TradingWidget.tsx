'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'

const popularPairs = [
  { from: 'BTC', to: 'USDT', rate: '97,434' },
  { from: 'ETH', to: 'USDT', rate: '3,547' },
  { from: 'BNB', to: 'USDT', rate: '689' },
  { from: 'ADA', to: 'USDT', rate: '1.23' },
]

export function TradingWidget() {
  const [fromCurrency, setFromCurrency] = useState('BTC')
  const [toCurrency, setToCurrency] = useState('USDT')
  const [amount, setAmount] = useState('')
  const [rates, setRates] = useState<{[key: string]: number}>({})  
  const [receivedAmount, setReceivedAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    calculateReceiveAmount()
  }, [amount, fromCurrency, toCurrency, rates])

  const fetchRates = async () => {
    try {
      const symbols = 'BTC,ETH,BNB,USDT,ADA'
      const response = await fetch(`/api/prices?symbols=${symbols}`)
      if (response.ok) {
        const { data } = await response.json()
        const priceMap: {[key: string]: number} = {}
        data.forEach((item: { symbol: string; current_price: number }) => {
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

    const usdValue = parseFloat(amount) * fromPrice
    const receivedValue = usdValue / toPrice
    setReceivedAmount(receivedValue.toFixed(8))
  }

  const getExchangeRate = () => {
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      return 'Loading...'
    }
    
    const fromPrice = rates[fromCurrency] || 0
    const toPrice = rates[toCurrency] || 0
    
    if (fromPrice === 0 || toPrice === 0) {
      return 'Rate unavailable'
    }

    const rate = fromPrice / toPrice
    return rate.toLocaleString(undefined, { maximumFractionDigits: 8 })
  }

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setAmount(receivedAmount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !receivedAmount) return
    
    setIsLoading(true)
    // Here you would integrate with your trading API
    // For now, we'll just simulate a delay
    setTimeout(() => {
      alert(`Exchange submitted: ${amount} ${fromCurrency} → ${receivedAmount} ${toCurrency}`)
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Instant Crypto Exchange
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-2 text-lg leading-8 text-gray-400"
        >
          Exchange cryptocurrencies instantly with the best rates in the market
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto mt-16 max-w-lg"
      >
        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm ring-1 ring-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* From Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-300">You Send</label>
              <div className="mt-1 flex rounded-xl bg-white/5 ring-1 ring-white/10">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="block w-full bg-transparent px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-l-xl"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="bg-white/10 px-4 py-3 text-white rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border-l border-white/10"
                >
                  <option value="BTC" className="bg-gray-800">BTC</option>
                  <option value="ETH" className="bg-gray-800">ETH</option>
                  <option value="BNB" className="bg-gray-800">BNB</option>
                  <option value="USDT" className="bg-gray-800">USDT</option>
                  <option value="ADA" className="bg-gray-800">ADA</option>
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
              <label className="block text-sm font-medium text-gray-300">You Receive</label>
              <div className="mt-1 flex rounded-xl bg-white/5 ring-1 ring-white/10">
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
                  <option value="USDT" className="bg-gray-800">USDT</option>
                  <option value="BTC" className="bg-gray-800">BTC</option>
                  <option value="ETH" className="bg-gray-800">ETH</option>
                  <option value="BNB" className="bg-gray-800">BNB</option>
                  <option value="ADA" className="bg-gray-800">ADA</option>
                </select>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Exchange Rate</span>
                <span className="font-medium text-white">1 {fromCurrency} = {getExchangeRate()} {toCurrency}</span>
              </div>
            </div>

            {/* Exchange Button */}
            <button
              type="submit"
              disabled={isLoading || !amount || !receivedAmount}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-400 hover:to-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Exchange Now'
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Popular Trading Pairs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mx-auto mt-16 max-w-4xl"
      >
        <h3 className="text-center text-xl font-bold text-white mb-8">Popular Trading Pairs</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularPairs.map((pair, index) => (
            <motion.div
              key={`${pair.from}-${pair.to}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="rounded-lg bg-white/5 p-4 text-center backdrop-blur-sm ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-white/20 cursor-pointer"
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-xs font-bold">
                  {pair.from.charAt(0)}
                </div>
                <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-white text-xs font-bold">
                  {pair.to.charAt(0)}
                </div>
              </div>
              <p className="text-sm font-medium text-white">{pair.from}/{pair.to}</p>
              <p className="text-xs text-gray-400">${pair.rate}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
