'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowsRightLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  EyeIcon,
  CogIcon,
  ArrowPathIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  crossChainAggregator,
  CrossChainRoute,
  CrossChainExecution,
  YieldOpportunity,
  BridgeProtocol
} from '@/lib/cross-chain-aggregator'

interface CrossChainBridgeDashboardProps {
  userId: string
}

export default function CrossChainBridgeDashboard({ userId }: CrossChainBridgeDashboardProps) {
  const [routes, setRoutes] = useState<CrossChainRoute[]>([])
  const [executions, setExecutions] = useState<CrossChainExecution[]>([])
  const [yieldOpportunities, setYieldOpportunities] = useState<YieldOpportunity[]>([])
  const [bridgeAnalytics, setBridgeAnalytics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'bridge' | 'yield' | 'monitor' | 'analytics'>('bridge')
  const [isLoading, setIsLoading] = useState(true)
  
  // Bridge form state
  const [sourceChain, setSourceChain] = useState('ethereum')
  const [targetChain, setTargetChain] = useState('polygon')
  const [sourceAsset, setSourceAsset] = useState('USDC')
  const [targetAsset, setTargetAsset] = useState('USDC')
  const [bridgeAmount, setBridgeAmount] = useState('')
  const [prioritize, setPrioritize] = useState<'cost' | 'time' | 'security'>('cost')
  const [includeYield, setIncludeYield] = useState(false)

  const chains = ['ethereum', 'bsc', 'polygon', 'avalanche', 'arbitrum', 'optimism', 'fantom']
  const assets = ['USDC', 'USDT', 'ETH', 'BTC', 'DAI', 'WETH']

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [userId])

  const loadData = async () => {
    try {
      const [executionData, yieldData, analyticsData] = await Promise.all([
        crossChainAggregator.monitorExecutions(userId),
        crossChainAggregator.getCrossChainYieldOpportunities(),
        crossChainAggregator.getBridgeAnalytics()
      ])
      
      setExecutions(executionData)
      setYieldOpportunities(yieldData)
      setBridgeAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load cross-chain data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchRoutes = async () => {
    if (!bridgeAmount || parseFloat(bridgeAmount) <= 0) return

    try {
      setIsLoading(true)
      const foundRoutes = await crossChainAggregator.findOptimalRoutes(
        sourceChain,
        targetChain,
        sourceAsset,
        targetAsset,
        parseFloat(bridgeAmount),
        {
          prioritize,
          includeYield
        }
      )
      setRoutes(foundRoutes)
    } catch (error) {
      console.error('Failed to find routes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const executeRoute = async (routeId: string) => {
    try {
      const execution = await crossChainAggregator.executeCrossChainTransaction(
        routeId,
        userId,
        parseFloat(bridgeAmount)
      )
      setExecutions(prev => [execution, ...prev])
    } catch (error) {
      console.error('Failed to execute route:', error)
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

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  const getChainIcon = (chain: string) => {
    const colors = {
      ethereum: 'text-blue-400',
      bsc: 'text-yellow-400',
      polygon: 'text-purple-400',
      avalanche: 'text-red-400',
      arbitrum: 'text-blue-300',
      optimism: 'text-red-300',
      fantom: 'text-blue-500'
    }
    return colors[chain as keyof typeof colors] || 'text-gray-400'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'bridging': case 'swapping': case 'farming': return 'text-blue-400 bg-blue-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const generateMockChartData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      volume: Math.floor(Math.random() * 5000000) + 1000000,
      transactions: Math.floor(Math.random() * 500) + 100,
      avgTime: Math.floor(Math.random() * 600) + 300
    }))
  }

  if (isLoading && routes.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const chartData = generateMockChartData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <LinkIcon className="w-8 h-8 mr-3 text-blue-400" />
              Cross-Chain Bridge Aggregator
            </h1>
            <p className="text-gray-400">Multi-chain bridge routing and yield optimization</p>
          </div>
          
          {bridgeAnalytics && (
            <div className="text-right">
              <div className="text-sm text-gray-400">24h Volume</div>
              <div className="text-2xl font-bold text-blue-400">
                {formatCurrency(bridgeAnalytics.totalVolume)}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {bridgeAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowsRightLeftIcon className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Total Transactions</span>
              </div>
              <div className="text-xl font-bold text-white">{bridgeAnalytics.totalTransactions}</div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Avg Time</span>
              </div>
              <div className="text-xl font-bold text-white">{formatTime(bridgeAnalytics.averageTime)}</div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Success Rate</span>
              </div>
              <div className="text-xl font-bold text-green-400">{bridgeAnalytics.successRate.toFixed(1)}%</div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUpIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Active Routes</span>
              </div>
              <div className="text-xl font-bold text-white">{routes.length}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {[
            { key: 'bridge', label: 'Bridge', icon: ArrowsRightLeftIcon },
            { key: 'yield', label: 'Yield Opportunities', icon: CurrencyDollarIcon },
            { key: 'monitor', label: 'Monitor', icon: EyeIcon },
            { key: 'analytics', label: 'Analytics', icon: ChartBarIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'bridge' && (
          <motion.div
            key="bridge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Bridge Form */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Find Optimal Routes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Source Chain</label>
                  <select
                    value={sourceChain}
                    onChange={(e) => setSourceChain(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    {chains.map(chain => (
                      <option key={chain} value={chain}>{chain.charAt(0).toUpperCase() + chain.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Chain</label>
                  <select
                    value={targetChain}
                    onChange={(e) => setTargetChain(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    {chains.map(chain => (
                      <option key={chain} value={chain}>{chain.charAt(0).toUpperCase() + chain.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Asset</label>
                  <select
                    value={sourceAsset}
                    onChange={(e) => setSourceAsset(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    {assets.map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    value={bridgeAmount}
                    onChange={(e) => setBridgeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Prioritize</label>
                  <select
                    value={prioritize}
                    onChange={(e) => setPrioritize(e.target.value as any)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value="cost">Lowest Cost</option>
                    <option value="time">Fastest</option>
                    <option value="security">Most Secure</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeYield}
                      onChange={(e) => setIncludeYield(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-400 text-sm">Include Yield</span>
                  </label>
                </div>
              </div>
              
              <button
                onClick={searchRoutes}
                disabled={!bridgeAmount || parseFloat(bridgeAmount) <= 0}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className="w-5 h-5 inline mr-2" />
                Find Routes
              </button>
            </div>

            {/* Routes Results */}
            {routes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Available Routes</h3>
                {routes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800 rounded-lg p-6 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <GlobeAltIcon className={`w-5 h-5 ${getChainIcon(route.sourceChain)}`} />
                          <span className="text-white font-medium">{route.sourceChain}</span>
                          <ArrowsRightLeftIcon className="w-4 h-4 text-gray-400" />
                          <GlobeAltIcon className={`w-5 h-5 ${getChainIcon(route.targetChain)}`} />
                          <span className="text-white font-medium">{route.targetChain}</span>
                        </div>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {route.bridges.length} step{route.bridges.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">
                          {formatCurrency(route.estimatedOutput)}
                        </div>
                        <div className="text-gray-400 text-sm">Est. Output</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-gray-400 text-sm">Total Cost</div>
                        <div className="text-red-400 font-medium">{formatCurrency(route.totalCost)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Time</div>
                        <div className="text-yellow-400 font-medium">{formatTime(route.totalTime)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Security Score</div>
                        <div className="text-blue-400 font-medium">{route.securityScore}/100</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Slippage</div>
                        <div className="text-purple-400 font-medium">{route.totalSlippage.toFixed(2)}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {route.bridges.map((bridge, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded">
                            {bridge.bridgeName}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => executeRoute(route.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <PlayIcon className="w-4 h-4 inline mr-1" />
                        Execute
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'yield' && (
          <motion.div
            key="yield"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cross-Chain Yield Opportunities</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {yieldOpportunities.slice(0, 6).map((opportunity) => (
                  <div key={opportunity.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{opportunity.strategy.replace('-', ' ')}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.riskLevel)}`}>
                        {opportunity.riskLevel} risk
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">APY</span>
                        <span className="text-green-400 font-medium">{opportunity.apy.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">TVL</span>
                        <span className="text-white">{formatCurrency(opportunity.tvl)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Min Amount</span>
                        <span className="text-white">{formatCurrency(opportunity.requirements.minAmount)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      {opportunity.chains.map((chain, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-600 text-gray-300 text-xs rounded">
                          {chain}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                      Explore Strategy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'monitor' && (
          <motion.div
            key="monitor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Execution Monitor</h3>
              
              {executions.length === 0 ? (
                <div className="text-center py-8">
                  <EyeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">No Active Executions</h4>
                  <p className="text-gray-400">Your cross-chain transactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <div key={execution.id} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-white font-medium">Bridge #{execution.id.slice(0, 8)}</span>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                            {execution.status}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {new Date(execution.startedAt).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-gray-400 text-sm">Progress</div>
                          <div className="text-white">{execution.currentStep}/{execution.totalSteps} steps</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Cost</div>
                          <div className="text-red-400">{formatCurrency(execution.actualCost)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Output</div>
                          <div className="text-green-400">{formatCurrency(execution.actualOutput)}</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(execution.currentStep / execution.totalSteps) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && bridgeAnalytics && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Bridge Volume</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Protocol Performance</h3>
                <div className="space-y-4">
                  {Object.entries(bridgeAnalytics.protocolBreakdown).slice(0, 4).map(([protocol, data]: [string, any]) => (
                    <div key={protocol} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <div>
                        <div className="text-white font-medium capitalize">{protocol}</div>
                        <div className="text-gray-400 text-sm">{data.transactions} transactions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">{data.successRate.toFixed(1)}%</div>
                        <div className="text-gray-400 text-sm">{formatCurrency(data.avgCost)} avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}