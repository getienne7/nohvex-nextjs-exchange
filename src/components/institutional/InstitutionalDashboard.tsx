'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  institutionalPortfolioManager,
  InstitutionalPortfolio,
  RebalancingProposal
} from '@/lib/institutional-portfolio-manager'

interface InstitutionalDashboardProps {
  institutionId: string
  userId: string
  userRole: string
}

export default function InstitutionalDashboard({ institutionId, userId, userRole }: InstitutionalDashboardProps) {
  const [portfolio, setPortfolio] = useState<InstitutionalPortfolio | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'compliance' | 'rebalancing' | 'reports'>('overview')
  const [rebalancingProposal, setRebalancingProposal] = useState<RebalancingProposal | null>(null)
  const [complianceDashboard, setComplianceDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [institutionId])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const portfolioData = await institutionalPortfolioManager.getPortfolioAnalytics('demo-institutional-portfolio')
      setPortfolio(portfolioData)
      const complianceData = await institutionalPortfolioManager.getComplianceDashboard(institutionId)
      setComplianceDashboard(complianceData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRebalancingProposal = async () => {
    if (!portfolio) return
    try {
      const proposal = await institutionalPortfolioManager.generateRebalancingProposal(
        portfolio.id, userId, 'risk-parity'
      )
      setRebalancingProposal(proposal)
    } catch (error) {
      console.error('Failed to generate rebalancing proposal:', error)
    }
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
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-4">No Portfolio Data</h2>
        <p className="text-gray-400">Unable to load institutional portfolio data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{portfolio.name}</h1>
            <p className="text-gray-400">{portfolio.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Total AUM</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">P&L</div>
              <div className={`text-2xl font-bold ${portfolio.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(portfolio.pnlPercentage)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            { key: 'risk', label: 'Risk Analysis', icon: ShieldCheckIcon },
            { key: 'compliance', label: 'Compliance', icon: ExclamationTriangleIcon },
            { key: 'rebalancing', label: 'Rebalancing', icon: CogIcon },
            { key: 'reports', label: 'Reports', icon: DocumentChartBarIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Tabs */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Return', value: formatPercentage(portfolio.performance.totalReturn), color: 'text-green-400', icon: TrendingUpIcon },
                { label: 'Sharpe Ratio', value: portfolio.riskMetrics.sharpeRatio.toFixed(2), color: 'text-blue-400', icon: ChartBarIcon },
                { label: 'Max Drawdown', value: formatPercentage(portfolio.riskMetrics.maxDrawdown * 100), color: 'text-orange-400', icon: TrendingDownIcon },
                { label: 'VaR (95%)', value: formatCurrency(portfolio.riskMetrics.var95), color: 'text-red-400', icon: ShieldCheckIcon }
              ].map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div key={index} className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-slate-700 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-gray-400 text-sm">{metric.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Portfolio Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolio.assets.map(asset => ({
                        name: asset.symbol,
                        value: asset.allocation
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolio.assets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance vs Benchmark</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={portfolio.performance.periods}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Line type="monotone" dataKey="return" stroke="#10B981" name="Portfolio" strokeWidth={2} />
                    <Line type="monotone" dataKey="benchmark" stroke="#6B7280" name="Benchmark" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rebalancing' && (
          <motion.div
            key="rebalancing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Portfolio Rebalancing</h3>
                  <p className="text-gray-400">Maintain target allocations and optimize risk-return profile</p>
                </div>
                <button
                  onClick={generateRebalancingProposal}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Proposal
                </button>
              </div>

              {/* Current vs Target Allocations */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Current vs Target Allocation</h4>
                {portfolio.allocations.map((allocation, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{allocation.category}</span>
                      <span className="text-white">
                        {allocation.currentPercentage.toFixed(1)}% / {allocation.targetPercentage}%
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${allocation.currentPercentage}%` }}
                        />
                      </div>
                      <div
                        className="absolute top-0 w-0.5 h-2 bg-yellow-400"
                        style={{ left: `${allocation.targetPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rebalancing Proposal */}
            {rebalancingProposal && (
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Rebalancing Proposal</h3>
                <div className="space-y-3">
                  {rebalancingProposal.trades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{trade.symbol}</div>
                        <div className="text-gray-400 text-sm capitalize">{trade.action}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{formatCurrency(trade.quantity)}</div>
                        <div className="text-gray-400 text-sm">Cost: {formatCurrency(trade.estimatedCost)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400">Total Expected Cost:</span>
                    <span className="text-white font-semibold">{formatCurrency(rebalancingProposal.expectedCost)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}