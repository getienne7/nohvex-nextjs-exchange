'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BoltIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  LightBulbIcon,
  EyeIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { 
  arbitrageManager, 
  ArbitrageOpportunity, 
  ArbitrageExecution,
  ArbitrageAnalytics,
  ArbitrageStrategy
} from '@/lib/arbitrage-manager'

interface ArbitrageDashboardProps {
  userId: string
}

export default function ArbitrageDashboard({ userId }: ArbitrageDashboardProps) {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [executions, setExecutions] = useState<ArbitrageExecution[]>([])
  const [analytics, setAnalytics] = useState<ArbitrageAnalytics | null>(null)
  const [strategies, setStrategies] = useState<ArbitrageStrategy[]>([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null)
  const [activeTab, setActiveTab] = useState<'opportunities' | 'executions' | 'strategies' | 'analytics'>('opportunities')
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filters, setFilters] = useState<{
    type: Array<'dex-arbitrage' | 'flash-loan' | 'triangular' | 'cross-chain' | 'statistical'>;
    minProfit: number;
    maxRisk: 'low' | 'medium' | 'high';
    chains: string[];
  }>({
    type: [],
    minProfit: 0,
    maxRisk: 'high' as const,
    chains: []
  })

  useEffect(() => {
    loadData()
    let interval: NodeJS.Timeout | null = null
    
    if (autoRefresh) {
      interval = setInterval(loadData, 10000) // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [userId, autoRefresh])

  const loadData = async () => {
    try {
      const [opportunitiesData, executionsData, analyticsData, strategiesData] = await Promise.all([
        arbitrageManager.getOpportunities(filters),
        arbitrageManager.getExecutionHistory(userId),
        arbitrageManager.getAnalytics(userId),
        arbitrageManager.getStrategies()
      ])
      
      setOpportunities(opportunitiesData)
      setExecutions(executionsData)
      setAnalytics(analyticsData)
      setStrategies(strategiesData)
    } catch (error) {
      console.error('Failed to load arbitrage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const executeOpportunity = async (opportunity: ArbitrageOpportunity, amount: number) => {
    try {
      const execution = await arbitrageManager.executeArbitrage(opportunity.id, userId, amount)
      setExecutions(prev => [execution, ...prev])
      
      // Remove executed opportunity
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunity.id))
    } catch (error) {
      console.error('Failed to execute arbitrage:', error)
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
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getOpportunityTypeIcon = (type: string) => {
    switch (type) {
      case 'dex-arbitrage': return <ArrowPathIcon className="w-5 h-5" />
      case 'flash-loan': return <BoltIcon className="w-5 h-5" />
      case 'triangular': return <CogIcon className="w-5 h-5" />
      case 'cross-chain': return <LightBulbIcon className="w-5 h-5" />
      default: return <ChartBarIcon className="w-5 h-5" />
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'executing': return 'text-blue-400 bg-blue-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      case 'cancelled': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getUrgencyIcon = (timeWindow: number) => {
    if (timeWindow < 60) return <FireIcon className="w-4 h-4 text-red-400" />
    if (timeWindow < 180) return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
    return <ClockIcon className="w-4 h-4 text-green-400" />
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
            <h1 className="text-2xl font-bold text-white flex items-center">
              <BoltIcon className="w-8 h-8 mr-3 text-yellow-400" />
              Arbitrage Bot
            </h1>
            <p className="text-gray-400">Automated arbitrage opportunity detection and execution</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Active Opportunities</div>
              <div className="text-2xl font-bold text-yellow-400">{opportunities.length}</div>
            </div>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <ArrowPathIcon className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Net Profit</span>
              </div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(analytics.netProfit)}
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Win Rate</span>
              </div>
              <div className="text-xl font-bold text-blue-400">
                {analytics.winRate.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BoltIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Total Trades</span>
              </div>
              <div className="text-xl font-bold text-white">
                {analytics.successfulTrades + analytics.failedTrades}
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Avg Time</span>
              </div>
              <div className="text-xl font-bold text-purple-400">
                {analytics.averageExecutionTime.toFixed(1)}s
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {[
            { key: 'opportunities', label: 'Opportunities', count: opportunities.length },
            { key: 'executions', label: 'Executions', count: executions.length },
            { key: 'strategies', label: 'Strategies', count: strategies.length },
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
        {activeTab === 'opportunities' && (
          <motion.div
            key="opportunities"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {opportunities.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-12 text-center">
                <EyeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
                <p className="text-gray-400">The scanner is actively looking for profitable arbitrage opportunities.</p>
              </div>
            ) : (
              opportunities.map((opportunity) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        {getOpportunityTypeIcon(opportunity.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white capitalize">
                          {opportunity.type.replace('-', ' ')} Arbitrage
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{opportunity.tokens.join('/')}</span>
                          <span>•</span>
                          <span>{opportunity.protocols.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getUrgencyIcon(opportunity.timeWindow)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.riskLevel)}`}>
                        {opportunity.riskLevel} risk
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-gray-400 text-sm">Net Profit</div>
                      <div className="text-green-400 font-semibold text-lg">
                        {formatCurrency(opportunity.netProfitUsd)}
                      </div>
                      <div className="text-green-400 text-sm">
                        {formatPercentage(opportunity.profitPercentage)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-sm">Gas Cost</div>
                      <div className="text-red-400 font-medium">
                        {formatCurrency(opportunity.gasCostUsd)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-sm">Time Window</div>
                      <div className="text-white font-medium">
                        {Math.floor(opportunity.timeWindow / 60)}:{(opportunity.timeWindow % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-sm">Confidence</div>
                      <div className="text-blue-400 font-medium">
                        {opportunity.metadata.confidence.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => executeOpportunity(opportunity, opportunity.minInvestment)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Execute - {formatCurrency(opportunity.minInvestment)}
                    </button>
                    <button
                      onClick={() => setSelectedOpportunity(opportunity)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'executions' && (
          <motion.div
            key="executions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {executions.map((execution) => (
              <div key={execution.id} className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/20 rounded">
                      <BoltIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        Arbitrage #{execution.id.slice(0, 8)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(execution.startedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">Investment</div>
                    <div className="text-white font-medium">{formatCurrency(execution.investmentAmount)}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm">Profit</div>
                    <div className={`font-medium ${execution.actualProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(execution.actualProfit)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm">Gas Cost</div>
                    <div className="text-red-400 font-medium">{formatCurrency(execution.actualGasCost)}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm">Duration</div>
                    <div className="text-white font-medium">{execution.executionTime.toFixed(1)}s</div>
                  </div>
                </div>

                {execution.error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                    {execution.error}
                  </div>
                )}
              </div>
            ))}
            
            {executions.length === 0 && (
              <div className="bg-slate-800 rounded-lg p-12 text-center">
                <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Executions Yet</h3>
                <p className="text-gray-400">Your arbitrage execution history will appear here.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'strategies' && (
          <motion.div
            key="strategies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Automated Strategies</h3>
              <p className="text-gray-400 mb-6">Configure automated execution strategies for different types of arbitrage opportunities.</p>
              
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{strategy.name}</h4>
                        <p className="text-gray-400 text-sm">{strategy.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {strategy.isActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        <button 
                          className="p-1 text-gray-400 hover:text-white"
                          aria-label="Configure strategy"
                        >
                          <CogIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Min Profit</span>
                        <div className="text-white">{formatCurrency(strategy.parameters.minProfitUsd)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Max Investment</span>
                        <div className="text-white">{formatCurrency(strategy.parameters.maxInvestmentPerTrade)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Risk Level</span>
                        <div className="text-white capitalize">{strategy.parameters.maxRiskLevel}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Auto Execute</span>
                        <div className={strategy.parameters.autoExecute ? 'text-green-400' : 'text-red-400'}>
                          {strategy.parameters.autoExecute ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && analytics && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Performance Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profit by Type</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.profitByType).map(([type, profit]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-400 capitalize">{type.replace('-', ' ')}</span>
                      <span className="text-green-400 font-medium">{formatCurrency(profit)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profit by Chain</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.profitByChain).map(([chain, profit]) => (
                    <div key={chain} className="flex items-center justify-between">
                      <span className="text-gray-400 capitalize">{chain}</span>
                      <span className="text-green-400 font-medium">{formatCurrency(profit)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opportunity Detail Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOpportunity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Arbitrage Opportunity Details</h2>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">Execution Routes</h3>
                  <div className="space-y-3">
                    {selectedOpportunity.routes.map((route, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-600 rounded">
                        <div>
                          <div className="text-white font-medium">
                            Step {route.step}: {route.action} {route.tokenIn} → {route.tokenOut}
                          </div>
                          <div className="text-gray-400 text-sm">{route.protocol} on {route.chain}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{route.amountOut.toFixed(4)}</div>
                          <div className="text-gray-400 text-sm">{formatPercentage(route.priceImpact)} impact</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Risk Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Level</span>
                        <span className="text-white capitalize">{selectedOpportunity.riskLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Complexity</span>
                        <span className="text-white capitalize">{selectedOpportunity.complexity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-white">{selectedOpportunity.metadata.confidence.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Requirements</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Flash Loan</span>
                        <span className={selectedOpportunity.requirements.flashLoanRequired ? 'text-green-400' : 'text-gray-400'}>
                          {selectedOpportunity.requirements.flashLoanRequired ? 'Required' : 'Not needed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gas Estimate</span>
                        <span className="text-white">{selectedOpportunity.requirements.gasEstimate.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    executeOpportunity(selectedOpportunity, selectedOpportunity.minInvestment)
                    setSelectedOpportunity(null)
                  }}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Execute Arbitrage - {formatCurrency(selectedOpportunity.minInvestment)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}