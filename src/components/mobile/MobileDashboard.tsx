'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  BellIcon,
  CogIcon,
  PlusIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { MobileCard, MobileButton, MobileSection, MobileGrid, useResponsive } from './ResponsiveLayout'

interface MobileDashboardProps {
  portfolioData?: {
    totalValue: number
    change24h: number
    changePercent: number
    topAssets: Array<{
      symbol: string
      value: number
      change24h: number
    }>
  }
  notifications?: number
}

export default function MobileDashboard({ portfolioData, notifications = 0 }: MobileDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const { isMobile } = useResponsive()

  // Mock data if none provided
  const defaultData = {
    totalValue: 24567.89,
    change24h: 1456.78,
    changePercent: 6.32,
    topAssets: [
      { symbol: 'ETH', value: 16234.78, change24h: 5.23 },
      { symbol: 'USDC', value: 3450.12, change24h: 0.01 },
      { symbol: 'MATIC', value: 2134.67, change24h: -2.45 }
    ]
  }

  const data = portfolioData || defaultData

  const quickActions = [
    {
      title: 'Buy Crypto',
      icon: PlusIcon,
      color: 'from-green-500 to-emerald-600',
      href: '/buy'
    },
    {
      title: 'Swap',
      icon: ArrowsRightLeftIcon,
      color: 'from-blue-500 to-cyan-600',
      href: '/trading'
    },
    {
      title: 'Earn',
      icon: CurrencyDollarIcon,
      color: 'from-purple-500 to-pink-600',
      href: '/yield-optimizer'
    },
    {
      title: 'More',
      icon: CogIcon,
      color: 'from-gray-500 to-slate-600',
      href: '/more'
    }
  ]

  const insights = [
    {
      title: 'Market Alert',
      description: 'ETH showing strong momentum (+5.2%)',
      type: 'positive' as const,
      time: '2m ago'
    },
    {
      title: 'Yield Opportunity',
      description: 'New high-yield farming pool available',
      type: 'info' as const,
      time: '1h ago'
    },
    {
      title: 'Security Update',
      description: 'Enable 2FA for enhanced protection',
      type: 'warning' as const,
      time: '1d ago'
    }
  ]

  const timeframes = ['1h', '24h', '7d', '30d']

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-gray-400">Here's your portfolio overview</p>
          </div>
          <div className="flex items-center space-x-2">
            {notifications > 0 && (
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              </button>
            )}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <EyeIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Portfolio Value */}
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
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
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

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <MobileSection title="Quick Actions">
          <MobileGrid columns={2} gap={3}>
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-full flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium">{action.title}</span>
                </motion.button>
              )
            })}
          </MobileGrid>
        </MobileSection>

        {/* Top Assets */}
        <MobileSection 
          title="Top Holdings"
          action={
            <button className="text-blue-400 text-sm font-medium">
              View All
            </button>
          }
        >
          <div className="space-y-3">
            {data.topAssets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MobileCard className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {asset.symbol[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-gray-400">
                        {formatCurrency(asset.value)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </div>
                </MobileCard>
              </motion.div>
            ))}
          </div>
        </MobileSection>

        {/* Performance Chart Placeholder */}
        <MobileSection title="Performance">
          <MobileCard className="h-40 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <ChartBarIcon className="w-12 h-12 mx-auto mb-3" />
              <div className="font-medium">Portfolio Chart</div>
              <div className="text-sm">Coming Soon</div>
            </div>
          </MobileCard>
        </MobileSection>

        {/* Insights & Alerts */}
        <MobileSection title="Insights & Alerts">
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MobileCard className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    insight.type === 'positive' ? 'bg-green-500/20 text-green-400' :
                    insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {insight.type === 'positive' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                    ) : insight.type === 'warning' ? (
                      <ShieldCheckIcon className="w-4 h-4" />
                    ) : (
                      <SparklesIcon className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium mb-1">{insight.title}</div>
                    <div className="text-sm text-gray-400 mb-2">
                      {insight.description}
                    </div>
                    <div className="text-xs text-gray-500">{insight.time}</div>
                  </div>
                  
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <InformationCircleIcon className="w-5 h-5" />
                  </button>
                </MobileCard>
              </motion.div>
            ))}
          </div>
        </MobileSection>

        {/* Feature Discovery */}
        <MobileSection title="Discover">
          <MobileGrid columns={1} gap={3}>
            <MobileCard className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">AI Portfolio Insights</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Get personalized recommendations
                  </div>
                </div>
                <MobileButton size="sm" variant="ghost">
                  Try Now
                </MobileButton>
              </div>
            </MobileCard>
          </MobileGrid>
        </MobileSection>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </div>
  )
}