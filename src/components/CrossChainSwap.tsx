'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowsUpDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface Currency {
  ticker: string
  name: string
  image: string
  hasExternalId: boolean
  isFiat: boolean
  featured: boolean
  isStable: boolean
  supportsFixedRate: boolean
}

interface ExchangeAmount {
  estimatedAmount: number
  transactionSpeedForecast: string
  warningMessage?: string
}

interface ExchangeData {
  fromCurrency: string
  toCurrency: string
  fromNetwork: string
  toNetwork: string
  fromAmount: number
  toAmount: number
  address: string
  extraId?: string
  userId?: string
  contactEmail?: string
  refundAddress?: string
  refundExtraId?: string
}

export function CrossChainSwap() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null)
  const [toCurrency, setToCurrency] = useState<Currency | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [exchangeData, setExchangeData] = useState<ExchangeAmount | null>(null)
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

  // Load available currencies
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const response = await fetch('/api/changenow/currencies')
        if (response.ok) {
          const data = await response.json()
          setCurrencies(data.slice(0, 50)) // Limit to top 50 for performance
          
          // Set default currencies
          const btc = data.find((c: Currency) => c.ticker === 'btc')
          const eth = data.find((c: Currency) => c.ticker === 'eth')
          if (btc) setFromCurrency(btc)
          if (eth) setToCurrency(eth)
        }
      } catch (error) {
        console.error('Failed to load currencies:', error)
        setError('Failed to load available currencies')
      }
    }

    loadCurrencies()
  }, [])

  // Get exchange estimate
  useEffect(() => {
    if (fromCurrency && toCurrency && fromAmount && parseFloat(fromAmount) > 0) {
      const getEstimate = async () => {
        setIsLoading(true)
        try {
          const response = await fetch('/api/changenow/estimate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromCurrency: fromCurrency.ticker,
              toCurrency: toCurrency.ticker,
              fromAmount: parseFloat(fromAmount)
            })
          })

          if (response.ok) {
            const data = await response.json()
            setExchangeData(data)
            setToAmount(data.estimatedAmount.toString())
            setError('')
          } else {
            setError('Failed to get exchange estimate')
          }
        } catch (error) {
          setError('Network error occurred')
        } finally {
          setIsLoading(false)
        }
      }

      const debounceTimer = setTimeout(getEstimate, 500)
      return () => clearTimeout(debounceTimer)
    }
  }, [fromCurrency, toCurrency, fromAmount])

  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
    setFromAmount(toAmount)
    setToAmount('')
  }

  const handleCreateExchange = async () => {
    if (!fromCurrency || !toCurrency || !fromAmount || !recipientAddress) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/changenow/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCurrency: fromCurrency.ticker,
          toCurrency: toCurrency.ticker,
          fromAmount: parseFloat(fromAmount),
          address: recipientAddress
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Handle successful exchange creation
        console.log('Exchange created:', data)
        // You can redirect to a transaction status page or show success message
      } else {
        setError('Failed to create exchange')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const CurrencySelector = ({ 
    currency, 
    onSelect, 
    isOpen, 
    onToggle, 
    label 
  }: {
    currency: Currency | null
    onSelect: (currency: Currency) => void
    isOpen: boolean
    onToggle: () => void
    label: string
  }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-white/5 border border-gray-600 rounded-lg hover:bg-white/10 transition-colors"
      >
        {currency ? (
          <div className="flex items-center space-x-3">
            <img 
              src={currency.image} 
              alt={currency.name}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://via.placeholder.com/24x24/3B82F6/FFFFFF?text=${currency.ticker.charAt(0).toUpperCase()}`
              }}
            />
            <div className="text-left">
              <div className="text-white font-medium">{currency.ticker.toUpperCase()}</div>
              <div className="text-xs text-gray-400">{currency.name}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Select currency</span>
        )}
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {currencies.map((curr) => (
            <button
              key={curr.ticker}
              onClick={() => {
                onSelect(curr)
                onToggle()
              }}
              className="w-full flex items-center space-x-3 p-3 hover:bg-white/10 transition-colors"
            >
              <img 
                src={curr.image} 
                alt={curr.name}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/24x24/3B82F6/FFFFFF?text=${curr.ticker.charAt(0).toUpperCase()}`
                }}
              />
              <div className="text-left">
                <div className="text-white font-medium">{curr.ticker.toUpperCase()}</div>
                <div className="text-xs text-gray-400">{curr.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-md mx-auto rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Cross-Chain Swap
        </h3>
        <p className="text-sm text-gray-400">
          Swap 900+ cryptocurrencies instantly • No KYC • Fixed rates
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* From Currency */}
        <div>
          <CurrencySelector
            currency={fromCurrency}
            onSelect={setFromCurrency}
            isOpen={showFromDropdown}
            onToggle={() => setShowFromDropdown(!showFromDropdown)}
            label="From"
          />
          <div className="mt-2">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapCurrencies}
            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
          >
            <ArrowsUpDownIcon className="w-5 h-5 text-blue-400" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <CurrencySelector
            currency={toCurrency}
            onSelect={setToCurrency}
            isOpen={showToDropdown}
            onToggle={() => setShowToDropdown(!showToDropdown)}
            label="To"
          />
          <div className="mt-2">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.00"
              className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter wallet address"
            className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Exchange Info */}
        {exchangeData && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-300 text-sm">
              <InformationCircleIcon className="w-4 h-4" />
              <span>Estimated time: {exchangeData.transactionSpeedForecast}</span>
            </div>
            {exchangeData.warningMessage && (
              <p className="text-yellow-300 text-xs mt-1">{exchangeData.warningMessage}</p>
            )}
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleCreateExchange}
          disabled={isLoading || !fromCurrency || !toCurrency || !fromAmount || !recipientAddress}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Create Exchange'
          )}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Fixed exchange rates guaranteed for 15 minutes</p>
        <p>• No hidden fees • Anonymous transactions</p>
        <p>• Powered by ChangeNOW • 900+ assets supported</p>
      </div>
    </motion.div>
  )
}