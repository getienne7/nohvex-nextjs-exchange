'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  CogIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Token {
  symbol: string
  name: string
  price: number
  change24h: number
  balance?: number
}

interface MobileTradingProps {
  onSwap?: (fromToken: Token, toToken: Token, amount: string) => void
}

export default function MobileTrading({ onSwap }: MobileTradingProps) {
  const [fromToken, setFromToken] = useState<Token>({
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2456.78,
    change24h: 5.23,
    balance: 2.456
  })
  
  const [toToken, setToToken] = useState<Token>({
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.00,
    change24h: 0.01,
    balance: 1234.56
  })

  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)
  const [showTokenSelector, setShowTokenSelector] = useState<'from' | 'to' | null>(null)
  const [isSwapping, setIsSwapping] = useState(false)

  const popularTokens: Token[] = [
    { symbol: 'ETH', name: 'Ethereum', price: 2456.78, change24h: 5.23, balance: 2.456 },
    { symbol: 'BTC', name: 'Bitcoin', price: 43567.89, change24h: 2.14, balance: 0.123 },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.01, balance: 1234.56 },
    { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.02, balance: 567.89 },
    { symbol: 'MATIC', name: 'Polygon', price: 0.89, change24h: 3.45, balance: 890.12 },
    { symbol: 'AAVE', name: 'Aave', price: 123.45, change24h: 7.89, balance: 5.67 }
  ]

  const slippageOptions = [0.1, 0.5, 1.0, 3.0]

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleAmountChange = (value: string, isFrom: boolean) => {
    if (isFrom) {
      setFromAmount(value)
      // Calculate to amount based on exchange rate
      const rate = fromToken.price / toToken.price
      setToAmount((parseFloat(value || '0') * rate).toFixed(6))
    } else {
      setToAmount(value)
      const rate = toToken.price / fromToken.price
      setFromAmount((parseFloat(value || '0') * rate).toFixed(6))
    }
  }

  const handleMaxAmount = () => {
    if (fromToken.balance) {
      handleAmountChange(fromToken.balance.toString(), true)
    }
  }

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) return
    
    setIsSwapping(true)
    try {
      // Simulate swap process
      await new Promise(resolve => setTimeout(resolve, 2000))
      onSwap?.(fromToken, toToken, fromAmount)
      setFromAmount('')
      setToAmount('')
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      setIsSwapping(false)
    }
  }

  const canSwap = fromAmount && toAmount && parseFloat(fromAmount) > 0 && 
                  parseFloat(fromAmount) <= (fromToken.balance || 0)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">Swap</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <CogIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-900 border-b border-slate-800"
          >
            <div className="p-4">
              <h3 className="font-semibold mb-3">Slippage Tolerance</h3>
              <div className="flex space-x-2">
                {slippageOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSlippage(option)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors ${
                      slippage === option
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    {option}%
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4">
        {/* From Token */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-sm text-gray-400">
              Balance: {fromToken.balance?.toFixed(4) || '0.0000'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTokenSelector('from')}
              className="flex items-center space-x-2 bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{fromToken.symbol[0]}</span>
              </div>
              <div className="text-left">
                <div className="font-medium">{fromToken.symbol}</div>
                <div className="text-xs text-gray-400">{fromToken.name}</div>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>
            
            <div className="flex-1">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleAmountChange(e.target.value, true)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-semibold text-right outline-none"
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                ${(parseFloat(fromAmount || '0') * fromToken.price).toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <button
              onClick={handleMaxAmount}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSwapTokens}
            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <ArrowsUpDownIcon className="w-6 h-6" />
          </motion.button>
        </div>

        {/* To Token */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">To</span>
            <span className="text-sm text-gray-400">
              Balance: {toToken.balance?.toFixed(4) || '0.0000'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTokenSelector('to')}
              className="flex items-center space-x-2 bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{toToken.symbol[0]}</span>
              </div>
              <div className="text-left">
                <div className="font-medium">{toToken.symbol}</div>
                <div className="text-xs text-gray-400">{toToken.name}</div>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>
            
            <div className="flex-1">
              <input
                type="number"
                value={toAmount}
                onChange={(e) => handleAmountChange(e.target.value, false)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-semibold text-right outline-none"
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                ${(parseFloat(toAmount || '0') * toToken.price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {fromAmount && toAmount && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Rate</span>
              <span>1 {fromToken.symbol} = {(toToken.price / fromToken.price).toFixed(6)} {toToken.symbol}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Slippage Tolerance</span>
              <span>{slippage}%</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Minimum Received</span>
              <span>{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}</span>
            </div>
          </motion.div>
        )}

        {/* Swap Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSwap}
          disabled={!canSwap || isSwapping}
          className={`w-full py-4 rounded-lg font-semibold transition-colors ${
            canSwap && !isSwapping
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSwapping ? (
            <div className="flex items-center justify-center space-x-2">
              <ClockIcon className="w-5 h-5 animate-spin" />
              <span>Swapping...</span>
            </div>
          ) : !fromAmount ? (
            'Enter an amount'
          ) : parseFloat(fromAmount) > (fromToken.balance || 0) ? (
            'Insufficient balance'
          ) : (
            `Swap ${fromToken.symbol} for ${toToken.symbol}`
          )}
        </motion.button>

        {/* Warning */}
        {fromAmount && parseFloat(fromAmount) > (fromToken.balance || 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">Insufficient {fromToken.symbol} balance</span>
          </motion.div>
        )}
      </div>

      {/* Token Selector Modal */}
      <AnimatePresence>
        {showTokenSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowTokenSelector(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="w-full bg-slate-900 rounded-t-lg max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold">Select Token</h3>
              </div>
              
              <div className="overflow-y-auto max-h-96">
                {popularTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => {
                      if (showTokenSelector === 'from') {
                        setFromToken(token)
                      } else {
                        setToToken(token)
                      }
                      setShowTokenSelector(null)
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{token.symbol[0]}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">${token.price.toFixed(2)}</div>
                      <div className={`text-sm ${
                        token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}