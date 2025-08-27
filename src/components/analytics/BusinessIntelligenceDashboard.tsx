'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClockIcon,
  ArrowPathIcon,
  BanknotesIcon,
  UserGroupIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'
import { productionAnalytics } from '@/lib/production-analytics'

interface BusinessMetric {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
}

interface RevenueBreakdown {
  source: string
  amount: number
  percentage: number
  trend: number
}

interface UserSegment {
  segment: string
  count: number
  percentage: number
  value: number
  growth: number
}

export default function BusinessIntelligenceDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetric[]>([])
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([])
  const [userSegments, setUserSegments] = useState<UserSegment[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadBusinessData()
    const interval = setInterval(() => {
      loadBusinessData()
      setLastUpdated(new Date())
    }, 300000) // Update every 5 minutes

    return () => clearInterval(interval)
  }, [selectedPeriod])

  const loadBusinessData = async () => {
    try {
      setIsLoading(true)
      
      // Get real-time metrics
      const realTimeData = await productionAnalytics.getRealTimeMetrics()
      
      // Generate business metrics
      const businessMetrics: BusinessMetric[] = [
        {
          title: 'Monthly Revenue',
          value: '$125,430',
          change: 12.5,
          changeType: 'increase',
          icon: CurrencyDollarIcon,
          color: 'text-green-400',
          description: 'Total revenue this month'
        },
        {
          title: 'Active Users',
          value: realTimeData.business?.users?.active || 0,
          change: 8.3,
          changeType: 'increase',
          icon: UsersIcon,
          color: 'text-blue-400',
          description: 'Users active in the last 30 days'
        },
        {
          title: 'Total Value Locked',
          value: `$${((realTimeData.defi?.totalValueLocked || 0) / 1000000).toFixed(1)}M`,
          change: 15.7,
          changeType: 'increase',
          icon: BanknotesIcon,
          color: 'text-purple-400',
          description: 'Total assets under management'
        },
        {
          title: 'User Retention',
          value: '78.5%',
          change: -2.1,
          changeType: 'decrease',
          icon: ArrowPathIcon,
          color: 'text-yellow-400',
          description: '30-day user retention rate'
        },
        {
          title: 'Avg Session Duration',
          value: `${Math.round((realTimeData.business?.engagement?.averageSessionDuration || 0) / 60)}m`,
          change: 5.2,
          changeType: 'increase',
          icon: ClockIcon,
          color: 'text-indigo-400',
          description: 'Average time spent per session'
        },
        {
          title: 'Conversion Rate',
          value: '3.2%',
          change: 0.8,
          changeType: 'increase',
          icon: ArrowTrendingUpIcon,
          color: 'text-emerald-400',
          description: 'Visitors to active users conversion'
        }
      ]

      const revenueData: RevenueBreakdown[] = [
        { source: 'Trading Fees', amount: 45680, percentage: 36.4, trend: 12.5 },
        { source: 'Premium Subscriptions', amount: 32150, percentage: 25.6, trend: 8.3 },
        { source: 'DeFi Protocol Fees', amount: 28900, percentage: 23.0, trend: 18.7 },
        { source: 'Yield Optimization', amount: 18700, percentage: 14.9, trend: 22.1 }
      ]

      const segmentData: UserSegment[] = [
        { segment: 'Power Traders', count: 1250, percentage: 12.5, value: 2840, growth: 15.3 },
        { segment: 'DeFi Farmers', count: 3200, percentage: 32.0, value: 1650, growth: 23.7 },
        { segment: 'Casual Investors', count: 4800, percentage: 48.0, value: 420, growth: 8.9 },
        { segment: 'New Users', count: 750, percentage: 7.5, value: 120, growth: 45.2 }
      ]

      setMetrics(businessMetrics)
      setRevenueBreakdown(revenueData)
      setUserSegments(segmentData)
    } catch (error) {
      console.error('Failed to load business data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num)
  }

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
      case 'decrease':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const getTrendColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-400'
      case 'decrease': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3 text-blue-400" />
              Business Intelligence
            </h1>
            <p className="text-gray-400">Executive dashboard and key performance indicators</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Last Updated</div>
              <div className="text-sm text-white">{lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {[
            { key: '24h', label: '24 Hours' },
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-opacity-20 ${metric.color.replace('text-', 'bg-').replace('-400', '-500')}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.changeType)}
                  <span className={`text-sm font-medium ${getTrendColor(metric.changeType)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
                <div className="text-2xl font-bold text-white mt-1 mb-2">
                  {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                </div>
                <p className="text-gray-400 text-xs">{metric.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Revenue Breakdown</h2>
        <div className="space-y-4">
          {revenueBreakdown.map((item, index) => (
            <motion.div
              key={item.source}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{item.source}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 font-semibold">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="w-full bg-slate-600 rounded-full h-2 mr-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowTrendingUpIcon className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">+{item.trend}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Segments */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">User Segments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userSegments.map((segment, index) => (
            <motion.div
              key={segment.segment}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-700 rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">{segment.segment}</h3>
                <div className="flex items-center space-x-1">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">+{segment.growth}%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Users</span>
                  <span className="text-white font-medium">{formatNumber(segment.count)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Avg Value</span>
                  <span className="text-white font-medium">{formatCurrency(segment.value)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Share</span>
                  <span className="text-blue-400 font-medium">{segment.percentage}%</span>
                </div>
                
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${segment.percentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <GlobeAltIcon className="w-5 h-5 mr-2" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {[
              { country: 'United States', percentage: 35.2, users: 3520 },
              { country: 'European Union', percentage: 28.7, users: 2870 },
              { country: 'Asia Pacific', percentage: 22.1, users: 2210 },
              { country: 'Others', percentage: 14.0, users: 1400 }
            ].map((region) => (
              <div key={region.country} className="flex items-center justify-between">
                <span className="text-gray-300">{region.country}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-12 text-right">
                    {region.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DevicePhoneMobileIcon className="w-5 h-5 mr-2" />
            Device Usage
          </h3>
          <div className="space-y-4">
            {[
              { device: 'Desktop', percentage: 58.3, icon: 'desktop' },
              { device: 'Mobile', percentage: 31.2, icon: 'mobile' },
              { device: 'Tablet', percentage: 10.5, icon: 'tablet' }
            ].map((device) => (
              <div key={device.device} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <DevicePhoneMobileIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300">{device.device}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-12 text-right">
                    {device.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}