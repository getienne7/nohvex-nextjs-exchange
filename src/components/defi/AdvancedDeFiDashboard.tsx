'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  CubeTransparentIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { 
  advancedDeFiManager, 
  DeFiStrategy, 
  StrategyExecution, 
  RiskMetrics 
} from '@/lib/advanced-defi-manager'

interface AdvancedDeFiDashboardProps {
  userId: string
}

export default function AdvancedDeFiDashboard({ userId }: AdvancedDeFiDashboardProps) {
  const [strategies, setStrategies] = useState<DeFiStrategy[]>([])
  const [executions, setExecutions] = useState<StrategyExecution[]>([])
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<DeFiStrategy | null>(null)
  const [activeTab, setActiveTab] = useState<'strategies' | 'portfolio' | 'analytics'>('strategies')
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    riskLevel: [] as string[],
    category: [] as string[],
    minApy: 0,
    chains: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [availableStrategies, portfolioRisk] = await Promise.all([
        advancedDeFiManager.getAvailableStrategies(filters),
        advancedDeFiManager.assessPortfolioRisk(userId)
      ])
      
      setStrategies(availableStrategies)
      setRiskMetrics(portfolioRisk)
      
      // In a real app, load user executions from API
      setExecutions([])
    } catch (error) {
      console.error('Failed to load DeFi data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const executeStrategy = async (strategy: DeFiStrategy, amount: number) => {
    try {
      const execution = await advancedDeFiManager.executeStrategy(
        strategy.id,
        userId,
        amount,
        {
          autoRebalance: true,
          stopLoss: 20, // 20% stop loss
          takeProfit: 50 // 50% take profit
        }
      )
      
      setExecutions(prev => [...prev, execution])
    } catch (error) {
      console.error('Failed to execute strategy:', error)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'very-high': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'yield-farming': return <CubeTransparentIcon className="w-5 h-5" />
      case 'liquidity-mining': return <BanknotesIcon className="w-5 h-5" />
      case 'staking': return <ShieldCheckIcon className="w-5 h-5" />
      case 'lending': return <ArrowTrendingUpIcon className="w-5 h-5" />
      default: return <ChartBarIcon className="w-5 h-5" />
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
    return `${value.toFixed(2)}%`
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Advanced DeFi Strategies</h1>
            <p className="text-gray-400">Automated portfolio management and yield optimization</p>
          </div>
          
          {riskMetrics && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Portfolio Risk Score</div>
              <div className={`text-2xl font-bold ${
                riskMetrics.overallScore < 30 ? 'text-green-400' :
                riskMetrics.overallScore < 60 ? 'text-yellow-400' :
                riskMetrics.overallScore < 80 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {riskMetrics.overallScore}/100
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {[
            { key: 'strategies', label: 'Available Strategies', count: strategies.length },
            { key: 'portfolio', label: 'My Portfolio', count: executions.length },
            { key: 'analytics', label: 'Analytics', count: null }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 px-2 py-1 bg-slate-600 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'strategies' && (
          <motion.div
            key="strategies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Risk Level
                  </label>
                  <select
                    multiple
                    value={filters.riskLevel}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      riskLevel: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    aria-label="Select risk levels"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="very-high">Very High Risk</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    multiple
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      category: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    aria-label="Select strategy categories"
                  >
                    <option value="yield-farming">Yield Farming</option>
                    <option value="liquidity-mining">Liquidity Mining</option>
                    <option value="staking">Staking</option>
                    <option value="lending">Lending</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Min APY %
                  </label>
                  <input
                    type="number"
                    value={filters.minApy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      minApy: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <button
                    onClick={loadData}
                    className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Strategy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategies.map((strategy) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        {getCategoryIcon(strategy.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{strategy.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {strategy.category.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(strategy.riskLevel)}`}>
                      {strategy.riskLevel} risk
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {strategy.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Expected APY</span>
                      <span className="text-green-400 font-semibold">
                        {formatPercentage(strategy.expectedApy)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">TVL</span>
                      <span className="text-white">{formatCurrency(strategy.tvl)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Min Investment</span>
                      <span className="text-white">{formatCurrency(strategy.minInvestment)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Chains</span>
                      <div className="flex space-x-1">
                        {strategy.chains.slice(0, 2).map((chain) => (
                          <span key={chain} className="px-2 py-1 bg-slate-700 rounded text-xs">
                            {chain}
                          </span>
                        ))}
                        {strategy.chains.length > 2 && (
                          <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                            +{strategy.chains.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      executeStrategy(strategy, strategy.minInvestment)
                    }}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Execute Strategy
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {executions.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-12 text-center">
                <CubeTransparentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Active Strategies</h3>
                <p className="text-gray-400 mb-6">Start by executing a DeFi strategy to see your portfolio here.</p>
                <button
                  onClick={() => setActiveTab('strategies')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Strategies
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {executions.map((execution) => (
                  <div key={execution.id} className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">
                        {strategies.find(s => s.id === execution.strategyId)?.name || 'Unknown Strategy'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        execution.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        execution.status === 'executing' ? 'bg-yellow-500/20 text-yellow-400' :
                        execution.status === 'paused' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {execution.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Investment</span>
                        <span className="text-white">{formatCurrency(execution.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Value</span>
                        <span className="text-white">{formatCurrency(execution.currentValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">P&L</span>
                        <span className={execution.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {execution.pnl >= 0 ? '+' : ''}{formatCurrency(execution.pnl)} 
                          ({formatPercentage(execution.pnlPercentage)})
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                        <PlayIcon className="w-4 h-4 inline mr-1" />
                        Manage
                      </button>
                      <button className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
                        <StopIcon className="w-4 h-4 inline mr-1" />
                        Exit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && riskMetrics && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Risk Metrics */}
              {[
                { label: 'Portfolio Risk', value: riskMetrics.portfolioRisk, icon: ShieldCheckIcon },
                { label: 'Concentration Risk', value: riskMetrics.concentrationRisk, icon: ChartBarIcon },
                { label: 'Liquidity Risk', value: riskMetrics.liquidityRisk, icon: BanknotesIcon },
                { label: 'Protocol Risk', value: riskMetrics.protocolRisk, icon: CubeTransparentIcon },
                { label: 'Market Risk', value: riskMetrics.marketRisk, icon: ArrowTrendingUpIcon },
                { label: 'Overall Score', value: riskMetrics.overallScore, icon: ExclamationTriangleIcon }
              ].map((metric) => {
                const Icon = metric.icon
                return (
                  <div key={metric.label} className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="font-medium text-white">{metric.label}</h3>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                      {metric.value.toFixed(1)}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          metric.value < 30 ? 'bg-green-500' :
                          metric.value < 60 ? 'bg-yellow-500' :
                          metric.value < 80 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(metric.value, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recommendations */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <InformationCircleIcon className="w-5 h-5 mr-2" />
                Risk Management Recommendations
              </h3>
              <div className="space-y-3">
                {riskMetrics.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-200">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategy Detail Modal */}
      <AnimatePresence>
        {selectedStrategy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStrategy(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{selectedStrategy.name}</h2>
                <button
                  onClick={() => setSelectedStrategy(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-gray-300">{selectedStrategy.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-gray-400 text-sm">Expected APY</span>
                    <div className="text-green-400 font-semibold text-lg">
                      {formatPercentage(selectedStrategy.expectedApy)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-400 text-sm">Risk Level</span>
                    <div className={`font-semibold text-lg capitalize ${
                      selectedStrategy.riskLevel === 'low' ? 'text-green-400' :
                      selectedStrategy.riskLevel === 'medium' ? 'text-yellow-400' :
                      selectedStrategy.riskLevel === 'high' ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {selectedStrategy.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">7D APY</span>
                      <div className="text-white">{formatPercentage(selectedStrategy.performance.apy7d)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">30D APY</span>
                      <div className="text-white">{formatPercentage(selectedStrategy.performance.apy30d)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Max Drawdown</span>
                      <div className="text-red-400">{formatPercentage(selectedStrategy.performance.maxDrawdown)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Sharpe Ratio</span>
                      <div className="text-white">{selectedStrategy.performance.sharpeRatio.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Risk Analysis */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">Risk Analysis</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Impermanent Loss Risk', value: selectedStrategy.risks.impermanentLoss },
                      { label: 'Smart Contract Risk', value: selectedStrategy.risks.smartContractRisk },
                      { label: 'Liquidity Risk', value: selectedStrategy.risks.liquidityRisk },
                      { label: 'Protocol Risk', value: selectedStrategy.risks.protocolRisk }
                    ].map((risk) => (
                      <div key={risk.label} className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{risk.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                risk.value < 20 ? 'bg-green-500' :
                                risk.value < 40 ? 'bg-yellow-500' :
                                risk.value < 60 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${risk.value}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{risk.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => executeStrategy(selectedStrategy, selectedStrategy.minInvestment)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Execute Strategy - {formatCurrency(selectedStrategy.minInvestment)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}