'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface MobilePortfolioProps {
  portfolioData?: {
    totalValue: number
    change24h: number
    changePercent: number
    assets: Array<{
      symbol: string
      name: string
      balance: number
      value: number
      change24h: number
      percentage: number
    }>
  }
}

export default function MobilePortfolio({ portfolioData }: MobilePortfolioProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  // Mock data if none provided
  const defaultData = {
    totalValue: 24567.89,
    change24h: 1456.78,
    changePercent: 6.32,
    assets: [
      { symbol: 'ETH', name: 'Ethereum', balance: 8.456, value: 16234.78, change24h: 5.23, percentage: 66.1 },
      { symbol: 'USDC', name: 'USD Coin', balance: 3450.12, value: 3450.12, change24h: 0.01, percentage: 14.0 },
      { symbol: 'MATIC', name: 'Polygon', balance: 2340.56, value: 2134.67, change24h: -2.45, percentage: 8.7 },
      { symbol: 'AAVE', name: 'Aave', balance: 12.34, value: 1456.78, change24h: 8.92, percentage: 5.9 },
      { symbol: 'UNI', name: 'Uniswap', balance: 89.12, value: 1291.64, change24h: -1.23, percentage: 5.3 }
    ]
  }

  const data = portfolioData || defaultData
  const timeframes = ['1h', '24h', '7d', '30d']

  const formatCurrency = (amount: number) => {
    if (!isBalanceVisible) return '••••••'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    if (!isBalanceVisible) return '••••'
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isBalanceVisible ? (
              <EyeIcon className="w-6 h-6" />
            ) : (
              <EyeSlashIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Total Value */}
        <div className="mb-4">
          <div className="text-4xl font-bold mb-2">
            {formatCurrency(data.totalValue)}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${
              data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {data.changePercent >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span className="font-medium">
                {formatPercent(data.changePercent)}
              </span>
            </div>
            <span className="text-gray-400">
              {formatCurrency(Math.abs(data.change24h))} today
            </span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <PlusIcon className="w-6 h-6 text-green-400 mb-2" />
            <span className="text-sm font-medium">Buy</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ArrowsRightLeftIcon className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-sm font-medium">Swap</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <CurrencyDollarIcon className="w-6 h-6 text-purple-400 mb-2" />
            <span className="text-sm font-medium">Earn</span>
          </motion.button>
        </div>
      </div>

      {/* Portfolio Composition */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Holdings</h2>
          <button className="text-blue-400 text-sm font-medium">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {data.assets.map((asset, index) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Token Icon Placeholder */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {asset.symbol[0]}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-gray-400">{asset.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(asset.value)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {isBalanceVisible ? asset.balance.toFixed(4) : '••••'} {asset.symbol}
                  </div>
                </div>
              </div>

              {/* Asset Performance */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">
                    {asset.percentage.toFixed(1)}% of portfolio
                  </div>
                </div>
                
                <div className={`text-sm font-medium ${
                  asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatPercent(asset.change24h)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="w-full bg-slate-700 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${asset.percentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="px-4 pb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Performance</h3>
            <button className="text-gray-400">
              <InformationCircleIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-32 bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <ChartBarIcon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm">Chart Coming Soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </div>
  )
}