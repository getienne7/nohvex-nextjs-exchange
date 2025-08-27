'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ShieldExclamationIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { 
  transactionAnalytics, 
  WalletBehaviorAnalysis, 
  SecurityAlert, 
  TransactionPattern,
  MonitoringStats 
} from '@/lib/transaction-analytics'
import { Transaction, TransactionAlert } from '@/lib/transaction-monitor'

interface TransactionAnalyticsDashboardProps {
  walletAddress: string
  transactions: Transaction[]
  alerts: TransactionAlert[]
  className?: string
}

interface AnalyticsCard {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  description?: string
}

export default function TransactionAnalyticsDashboard({
  walletAddress,
  transactions,
  alerts,
  className = ''
}: TransactionAnalyticsDashboardProps) {
  const [behaviorAnalysis, setBehaviorAnalysis] = useState<WalletBehaviorAnalysis | null>(null)
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'patterns' | 'security' | 'insights'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [walletAddress, transactions])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Generate behavior analysis
      const analysis = await transactionAnalytics.analyzeWalletBehavior(walletAddress, transactions)
      setBehaviorAnalysis(analysis)
      
      // Get security alerts
      const securityAlertsData = transactionAnalytics.getSecurityAlerts(walletAddress)
      setSecurityAlerts(securityAlertsData)
      
      // Get monitoring stats
      const stats = transactionAnalytics.getMonitoringStats()
      setMonitoringStats(stats)
      
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const insights = transactions.length > 0 
    ? transactionAnalytics.generateTransactionInsights(transactions)
    : null

  const analyticsCards: AnalyticsCard[] = [
    {
      title: 'Total Volume (24h)',
      value: behaviorAnalysis ? `$${behaviorAnalysis.transactionVolume24h.toLocaleString()}` : '$0',
      change: 12.5,
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      color: 'text-green-600 bg-green-100',
      description: 'Total transaction volume in last 24 hours'
    },
    {
      title: 'Risk Score',
      value: behaviorAnalysis ? `${behaviorAnalysis.riskScore.toFixed(0)}/100` : '0/100',
      change: behaviorAnalysis ? (behaviorAnalysis.riskScore > 50 ? 15 : -8) : 0,
      icon: <ShieldExclamationIcon className="w-6 h-6" />,
      color: behaviorAnalysis && behaviorAnalysis.riskScore > 50 
        ? 'text-red-600 bg-red-100' 
        : 'text-green-600 bg-green-100',
      description: 'Calculated risk level based on transaction patterns'
    },
    {
      title: 'DeFi Engagement',
      value: behaviorAnalysis ? `${behaviorAnalysis.defiEngagement.toFixed(1)}%` : '0%',
      change: 5.2,
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: 'text-blue-600 bg-blue-100',
      description: 'Percentage of transactions involving DeFi protocols'
    },
    {
      title: 'Security Alerts',
      value: securityAlerts.length,
      change: securityAlerts.length > 0 ? 1 : 0,
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
      color: securityAlerts.length > 0 ? 'text-orange-600 bg-orange-100' : 'text-green-600 bg-green-100',
      description: 'Active security alerts requiring attention'
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'frequent_dust_transactions':
        return <ArrowTrendingDownIcon className="w-5 h-5" />
      case 'rapid_sequence_transactions':
        return <ClockIcon className="w-5 h-5" />
      case 'large_night_transactions':
        return <EyeIcon className="w-5 h-5" />
      case 'new_contract_interactions':
        return <BellIcon className="w-5 h-5" />
      default:
        return <ChartBarIcon className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Transaction Analytics</h2>
            <p className="text-sm text-gray-600 mt-1">
              Advanced insights and security analysis for {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-green-400 animate-pulse`}></div>
            <span className="text-sm text-gray-600">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {analyticsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  {card.icon}
                </div>
                {card.change !== undefined && (
                  <div className={`flex items-center text-sm ${
                    card.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change > 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(card.change)}%
                  </div>
                )}
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <div className="text-sm text-gray-600">{card.title}</div>
                {card.description && (
                  <div className="text-xs text-gray-500 mt-1">{card.description}</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'patterns', label: 'Patterns' },
              { key: 'security', label: 'Security' },
              { key: 'insights', label: 'Insights' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:text-gray-700