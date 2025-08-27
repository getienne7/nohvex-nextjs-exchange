'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  CpuChipIcon,
  ServerIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  BellIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import { 
  productionAnalytics,
  SystemMetrics,
  DeFiMetrics,
  BusinessMetrics,
  AlertRule,
  AnalyticsDashboard
} from '@/lib/production-analytics'

interface ProductionAnalyticsDashboardProps {
  isProduction?: boolean
}

export default function ProductionAnalyticsDashboard({ isProduction = false }: ProductionAnalyticsDashboardProps) {
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const [selectedCategory, setSelectedCategory] = useState<'overview' | 'system' | 'defi' | 'business' | 'alerts'>('overview')
  const [isCollecting, setIsCollecting] = useState(false)
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([])
  const [alerts, setAlerts] = useState<AlertRule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    startRealTimeUpdates()
    
    return () => {
      productionAnalytics.stopCollection()
    }
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const metrics = await productionAnalytics.getRealTimeMetrics()
      setRealTimeMetrics(metrics)
      setAlerts(metrics.alerts)
      
      // Start collection if not already running
      if (!isCollecting) {
        productionAnalytics.startCollection(30000) // 30 seconds
        setIsCollecting(true)
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      const metrics = await productionAnalytics.getRealTimeMetrics()
      setRealTimeMetrics(metrics)
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }

  const toggleCollection = async () => {
    if (isCollecting) {
      productionAnalytics.stopCollection()
      setIsCollecting(false)
    } else {
      productionAnalytics.startCollection(30000)
      setIsCollecting(true)
    }
  }

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const now = Date.now()
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }
      
      const start = now - timeRanges[selectedTimeRange as keyof typeof timeRanges]
      const data = await productionAnalytics.exportData(format, {
        timeRange: { start, end: now }
      })
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-green-400' }
    if (value <= thresholds.warning) return { status: 'warning', color: 'text-yellow-400' }
    return { status: 'critical', color: 'text-red-400' }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-400 bg-blue-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'critical': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3 text-blue-400" />
              Production Analytics
            </h1>
            <p className="text-gray-400">Real-time monitoring and insights</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isCollecting ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-400">
                {isCollecting ? 'Collecting' : 'Stopped'}
              </span>
            </div>
            
            <button
              onClick={toggleCollection}
              className={`p-2 rounded-lg transition-colors ${
                isCollecting 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
              title={isCollecting ? 'Stop collection' : 'Start collection'}
            >
              {isCollecting ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => exportData('json')}
              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              title="Export JSON"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1 mb-6">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTimeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: EyeIcon },
            { key: 'system', label: 'System', icon: ServerIcon },
            { key: 'defi', label: 'DeFi', icon: CurrencyDollarIcon },
            { key: 'business', label: 'Business', icon: UsersIcon },
            { key: 'alerts', label: 'Alerts', icon: BellIcon }
          ].map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
                {category.key === 'alerts' && alerts.length > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                    {alerts.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedCategory === 'overview' && realTimeMetrics && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CpuChipIcon className="w-6 h-6 text-blue-400" />
                  <h3 className="font-medium text-white">CPU Usage</h3>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {realTimeMetrics.system?.cpu?.usage?.toFixed(1) || '0'}%
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (realTimeMetrics.system?.cpu?.usage || 0) > 80 ? 'bg-red-500' :
                      (realTimeMetrics.system?.cpu?.usage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(realTimeMetrics.system?.cpu?.usage || 0, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ServerIcon className="w-6 h-6 text-green-400" />
                  <h3 className="font-medium text-white">Memory Usage</h3>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {formatBytes((realTimeMetrics.system?.memory?.used || 0) * 1024 * 1024)}
                </div>
                <div className="text-sm text-gray-400">
                  of {formatBytes((realTimeMetrics.system?.memory?.total || 0) * 1024 * 1024)}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
                  <h3 className="font-medium text-white">Requests/min</h3>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {realTimeMetrics.system?.api?.requestsPerMinute || 0}
                </div>
                <div className="text-sm text-gray-400">
                  {formatPercentage(realTimeMetrics.system?.api?.errorRate || 0)} error rate
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ClockIcon className="w-6 h-6 text-yellow-400" />
                  <h3 className="font-medium text-white">Response Time</h3>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {(realTimeMetrics.system?.api?.averageResponseTime || 0).toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-400">
                  Average response time
                </div>
              </div>
            </div>

            {/* DeFi Metrics */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">DeFi Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Value Locked</div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(realTimeMetrics.defi?.totalValueLocked || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Active Positions</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {(realTimeMetrics.defi?.activePositions || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Success Rate</div>
                  <div className="text-2xl font-bold text-white">
                    {realTimeMetrics.defi?.transactions ? 
                      formatPercentage((realTimeMetrics.defi.transactions.successful / realTimeMetrics.defi.transactions.total) * 100) 
                      : '0%'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Business Metrics */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Business Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Users</div>
                  <div className="text-xl font-bold text-white">
                    {(realTimeMetrics.business?.users?.total || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Active Users</div>
                  <div className="text-xl font-bold text-green-400">
                    {(realTimeMetrics.business?.users?.active || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Avg Session</div>
                  <div className="text-xl font-bold text-blue-400">
                    {Math.round((realTimeMetrics.business?.engagement?.averageSessionDuration || 0) / 60)}m
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Bounce Rate</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {formatPercentage(realTimeMetrics.business?.engagement?.bounceRate || 0)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedCategory === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {alerts.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-12 text-center">
                <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
                <p className="text-gray-400">All systems are operating normally.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                      <div>
                        <h3 className="font-semibold text-white">{alert.name}</h3>
                        <p className="text-gray-400 text-sm">{alert.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAlertSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Category</span>
                      <div className="text-white capitalize">{alert.category}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Trigger Count</span>
                      <div className="text-white">{alert.triggerCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Triggered</span>
                      <div className="text-white">
                        {alert.lastTriggered ? new Date(alert.lastTriggered).toLocaleString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}