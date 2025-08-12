'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface CryptoPrice {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  isLoading: boolean
}

export function CryptoTicker() {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 0, change24h: 0, isLoading: true },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 0, change24h: 0, isLoading: true },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 0, change24h: 0, isLoading: true },
    { id: 'tether', symbol: 'USDT', name: 'Tether', price: 0, change24h: 0, isLoading: true },
  ])

  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,tether&vs_currencies=usd&include_24hr_change=true'
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices')
      }
      
      const data = await response.json()
      
      setCryptoPrices(prev => prev.map(crypto => ({
        ...crypto,
        price: data[crypto.id]?.usd || 0,
        change24h: data[crypto.id]?.usd_24h_change || 0,
        isLoading: false
      })))
      
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error fetching crypto prices:', error)
      setCryptoPrices(prev => prev.map(crypto => ({
        ...crypto,
        isLoading: false
      })))
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchCryptoPrices()
    
    // Update every 30 seconds
    const interval = setInterval(fetchCryptoPrices, 30000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toFixed(4)}`
    }
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
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
          Live Crypto Prices
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-2 text-lg leading-8 text-gray-400"
        >
          Real-time cryptocurrency prices updated every 30 seconds
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto mt-10 grid max-w-lg grid-cols-1 gap-4 sm:max-w-none sm:grid-cols-2 lg:grid-cols-4"
      >
        {cryptoPrices.map((crypto, index) => (
          <motion.div
            key={crypto.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative rounded-2xl bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-200 hover:bg-white/10 hover:ring-white/20"
          >
            {crypto.isLoading ? (
              <div className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-600"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-12 rounded bg-gray-600"></div>
                    <div className="h-3 w-16 rounded bg-gray-600"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-6 w-20 rounded bg-gray-600"></div>
                  <div className="h-4 w-16 rounded bg-gray-600"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-bold text-sm">
                    {crypto.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{crypto.symbol}</p>
                    <p className="text-xs text-gray-400">{crypto.name}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-2xl font-bold text-white">
                    {formatPrice(crypto.price)}
                  </p>
                  <div className={clsx(
                    'mt-1 flex items-center text-sm font-medium',
                    crypto.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {crypto.change24h >= 0 ? (
                      <TrendingUpIcon className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDownIcon className="mr-1 h-4 w-4" />
                    )}
                    {formatChange(crypto.change24h)}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>

      {lastUpdated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated}
          </p>
        </motion.div>
      )}
    </div>
  )
}
