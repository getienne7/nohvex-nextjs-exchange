'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BeakerIcon,
  ChartBarIcon,
  CogIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface LiquidityPosition {
  id: string
  protocol: string
  pair: string
  tokens: [string, string]
  liquidity: number
  currentValue: number
  feesEarned: number
  impermanentLoss: number
  apy: number
  priceRange: [number, number]
  currentPrice: number
  inRange: boolean
  createdAt: number
  lastRebalanced: number
}

interface LiquidityStrategy {
  id: string
  name: string
  type: 'concentrated' | 'wide' | 'dynamic' | 'multi-range'
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  targetApy: number
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly' | 'price-based'
  priceRangeStrategy: 'tight' | 'medium' | 'wide' | 'adaptive'
  autoCompound: boolean
  stopLossThreshold: number
  takeProfitThreshold: number
}

interface RebalanceRecommendation {
  positionId: string
  reason: string
  action: 'rebalance' | 'add_liquidity' | 'remove_liquidity' | 'adjust_range'
  newRange?: [number, number]
  estimatedGas: number
  expectedImprovement: number
  urgency: 'low' | 'medium' | 'high'
}

export default function AdvancedLiquidityManager() {
  const [positions, setPositions] = useState<LiquidityPosition[]>([])
  const [strategies, setStrategies] = useState<LiquidityStrategy[]>([])
  const [recommendations, setRecommendations] = useState<RebalanceRecommendation[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'positions' | 'strategies' | 'analytics'>('positions')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      // Simulate loading data
      const mockPositions: LiquidityPosition[] = [
        {
          id: 'pos-1',
          protocol: 'Uniswap V3',
          pair: 'ETH/USDC',
          tokens: ['ETH', 'USDC'],
          liquidity: 50000,
          currentValue: 52500,
          feesEarned: 1250,
          impermanentLoss: -750,
          apy: 15.6,
          priceRange: [2800, 3200],
          currentPrice: 3050,
          inRange: true,
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          lastRebalanced: Date.now() - 2 * 24 * 60 * 60 * 1000
        },
        {
          id: 'pos-2',
          protocol: 'Uniswap V3',
          pair: 'WBTC/ETH',
          tokens: ['WBTC', 'ETH'],
          liquidity: 25000,
          currentValue: 24200,
          feesEarned: 890,
          impermanentLoss: -1690,
          apy: 8.3,
          priceRange: [18, 22],
          currentPrice: 17.8,
          inRange: false,
          createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
          lastRebalanced: Date.now() - 5 * 24 * 60 * 60 * 1000
        }
      ]

      const mockStrategies: LiquidityStrategy[] = [
        {
          id: 'strat-1',
          name: 'Conservative Range',
          type: 'wide',
          description: 'Wide price ranges for stable returns',
          riskLevel: 'low',
          targetApy: 8,
          rebalanceFrequency: 'weekly',
          priceRangeStrategy: 'wide',
          autoCompound: true,
          stopLossThreshold: 15,
          takeProfitThreshold: 25
        },
        {
          id: 'strat-2',
          name: 'Active Management',
          type: 'concentrated',
          description: 'Tight ranges with frequent rebalancing',
          riskLevel: 'high',
          targetApy: 25,
          rebalanceFrequency: 'price-based',
          priceRangeStrategy: 'tight',
          autoCompound: true,
          stopLossThreshold: 10,
          takeProfitThreshold: 15
        }
      ]

      const mockRecommendations: RebalanceRecommendation[] = [
        {
          positionId: 'pos-2',
          reason: 'Position out of range - price below lower bound',
          action: 'rebalance',
          newRange: [17, 21],
          estimatedGas: 0.015,
          expectedImprovement: 12.5,
          urgency: 'high'
        }
      ]

      setPositions(mockPositions)
      setStrategies(mockStrategies)
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Failed to load liquidity data:', error)
    } finally {
      setIsLoading(false)
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

  const getRangeStatus = (position: LiquidityPosition) => {
    if (position.inRange) {
      return { status: 'In Range', color: 'text-green-400 bg-green-500/20' }
    } else {
      return { status: 'Out of Range', color: 'text-red-400 bg-red-500/20' }
    }
  }

  const calculateRangeUtilization = (position: LiquidityPosition) => {
    const [lower, upper] = position.priceRange
    const current = position.currentPrice
    
    if (current < lower || current > upper) return 0
    
    const range = upper - lower
    const distanceFromLower = current - lower
    const distanceFromUpper = upper - current
    
    return Math.min(distanceFromLower, distanceFromUpper) / (range / 2) * 100
  }

  const executeRebalance = async (recommendation: RebalanceRecommendation) => {
    try {
      // Simulate rebalancing
      const position = positions.find(p => p.id === recommendation.positionId)
      if (position && recommendation.newRange) {
        position.priceRange = recommendation.newRange
        position.lastRebalanced = Date.now()
        position.inRange = true
        setPositions([...positions])
        setRecommendations(recommendations.filter(r => r.positionId !== recommendation.positionId))
      }
    } catch (error) {
      console.error('Failed to execute rebalance:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
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
              <BeakerIcon className="w-8 h-8 mr-3 text-blue-400" />
              Advanced Liquidity Management
            </h1>
            <p className="text-gray-400">Automated liquidity provision strategies</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400">Total Liquidity</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(positions.reduce((sum, pos) => sum + pos.currentValue, 0))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {[
            { key: 'positions', label: 'Positions', count: positions.length },
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

      {/* Recommendations Alert */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-400 mb-2">
                {recommendations.length} Rebalancing Recommendation{recommendations.length > 1 ? 's' : ''}
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec) => (
                  <div key={rec.positionId} className="flex items-center justify-between bg-slate-800 rounded p-3">
                    <div>
                      <div className="text-white font-medium">{rec.reason}</div>
                      <div className="text-yellow-300 text-sm">
                        Expected improvement: {formatPercentage(rec.expectedImprovement)}
                      </div>
                    </div>
                    <button
                      onClick={() => executeRebalance(rec)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Execute
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'positions' && (
          <motion.div
            key="positions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {positions.map((position) => {
              const rangeStatus = getRangeStatus(position)
              const utilization = calculateRangeUtilization(position)
              
              return (
                <div key={position.id} className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <ArrowsRightLeftIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{position.pair}</h3>
                        <p className="text-gray-400">{position.protocol}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${rangeStatus.color}`}>
                        {rangeStatus.status}
                      </span>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">{formatPercentage(position.apy)}</div>
                        <div className="text-gray-400 text-sm">APY</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Current Value</div>
                      <div className="text-white font-semibold">{formatCurrency(position.currentValue)}</div>
                      <div className={`text-sm ${position.currentValue > position.liquidity ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercentage((position.currentValue - position.liquidity) / position.liquidity * 100)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm mb-1">Fees Earned</div>
                      <div className="text-green-400 font-semibold">{formatCurrency(position.feesEarned)}</div>
                      <div className="text-gray-400 text-sm">
                        {formatPercentage(position.feesEarned / position.liquidity * 100)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm mb-1">Impermanent Loss</div>
                      <div className="text-red-400 font-semibold">{formatCurrency(position.impermanentLoss)}</div>
                      <div className="text-gray-400 text-sm">
                        {formatPercentage(position.impermanentLoss / position.liquidity * 100)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm mb-1">Net P&L</div>
                      <div className={`font-semibold ${(position.feesEarned + position.impermanentLoss) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(position.feesEarned + position.impermanentLoss)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatPercentage((position.feesEarned + position.impermanentLoss) / position.liquidity * 100)}
                      </div>
                    </div>
                  </div>

                  {/* Price Range Visualization */}
                  <div className="bg-slate-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">Price Range</span>
                      <span className="text-white text-sm">
                        Current: ${position.currentPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-slate-600 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${position.inRange ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.max(10, utilization)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>${position.priceRange[0].toLocaleString()}</span>
                        <span>${position.priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      <PlusIcon className="w-4 h-4 inline mr-1" />
                      Add Liquidity
                    </button>
                    <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                      <MinusIcon className="w-4 h-4 inline mr-1" />
                      Remove Liquidity
                    </button>
                    <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                      <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-1" />
                      Rebalance
                    </button>
                  </div>
                </div>
              )
            })}

            {positions.length === 0 && (
              <div className="bg-slate-800 rounded-lg p-12 text-center">
                <BeakerIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Liquidity Positions</h3>
                <p className="text-gray-400 mb-6">Create your first liquidity position to start earning fees.</p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Position
                </button>
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
            {/* Strategy Selection */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Automated Strategies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedStrategy === strategy.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{strategy.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        strategy.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                        strategy.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {strategy.riskLevel} risk
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4">{strategy.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target APY</span>
                        <span className="text-green-400">{formatPercentage(strategy.targetApy)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rebalance</span>
                        <span className="text-white capitalize">{strategy.rebalanceFrequency.replace('-', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Auto Compound</span>
                        <span className={strategy.autoCompound ? 'text-green-400' : 'text-gray-400'}>
                          {strategy.autoCompound ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Configuration */}
            {selectedStrategy && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Strategy Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Initial Investment
                    </label>
                    <input
                      type="number"
                      placeholder="10000"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Trading Pair
                    </label>
                    <select 
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                      aria-label="Select trading pair"
                    >
                      <option>ETH/USDC</option>
                      <option>WBTC/ETH</option>
                      <option>USDC/USDT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Stop Loss %
                    </label>
                    <input
                      type="number"
                      placeholder="15"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Take Profit %
                    </label>
                    <input
                      type="number"
                      placeholder="25"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                
                <button className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Deploy Strategy
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                  <h3 className="font-medium text-white">Total Fees Earned</h3>
                </div>
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(positions.reduce((sum, pos) => sum + pos.feesEarned, 0))}
                </div>
                <div className="text-sm text-gray-400">
                  +12.5% this month
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ArrowTrendingDownIcon className="w-6 h-6 text-red-400" />
                  <h3 className="font-medium text-white">Impermanent Loss</h3>
                </div>
                <div className="text-2xl font-bold text-red-400 mb-2">
                  {formatCurrency(positions.reduce((sum, pos) => sum + pos.impermanentLoss, 0))}
                </div>
                <div className="text-sm text-gray-400">
                  -3.2% this month
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ChartBarIcon className="w-6 h-6 text-blue-400" />
                  <h3 className="font-medium text-white">Average APY</h3>
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {formatPercentage(positions.reduce((sum, pos) => sum + pos.apy, 0) / positions.length)}
                </div>
                <div className="text-sm text-gray-400">
                  Across all positions
                </div>
              </div>
            </div>

            {/* Position Analytics */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Position Performance</h3>
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-500/20 rounded">
                        <ArrowsRightLeftIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{position.pair}</div>
                        <div className="text-sm text-gray-400">{position.protocol}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-8 text-right">
                      <div>
                        <div className="text-sm text-gray-400">APY</div>
                        <div className="text-green-400 font-medium">{formatPercentage(position.apy)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Fees</div>
                        <div className="text-white font-medium">{formatCurrency(position.feesEarned)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">IL</div>
                        <div className="text-red-400 font-medium">{formatCurrency(position.impermanentLoss)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Status</div>
                        <div className={`font-medium ${position.inRange ? 'text-green-400' : 'text-red-400'}`}>
                          {position.inRange ? 'Active' : 'Out of Range'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}