'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BoltIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { CrossChainRoute } from '@/lib/cross-chain-aggregator'

interface RouteComparisonProps {
  routes: CrossChainRoute[]
  onSelectRoute: (route: CrossChainRoute) => void
  onClose: () => void
  amount: number
}

export default function RouteComparison({ routes, onSelectRoute, onClose, amount }: RouteComparisonProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'cost' | 'time' | 'security' | 'output'>('cost')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getChainDisplayName = (chainId: string) => {
    const chainNames: Record<string, string> = {
      ethereum: 'Ethereum',
      polygon: 'Polygon',
      bsc: 'BSC',
      arbitrum: 'Arbitrum',
      optimism: 'Optimism',
      avalanche: 'Avalanche',
      fantom: 'Fantom'
    }
    return chainNames[chainId] || chainId
  }

  const getBridgeTypeColor = (type: string) => {
    switch (type) {
      case 'native': return 'bg-blue-500/20 text-blue-400'
      case 'lock-mint': return 'bg-purple-500/20 text-purple-400'
      case 'liquidity': return 'bg-green-500/20 text-green-400'
      case 'atomic-swap': return 'bg-orange-500/20 text-orange-400'
      case 'relay': return 'bg-cyan-500/20 text-cyan-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const sortedRoutes = [...routes].sort((a, b) => {
    switch (sortBy) {
      case 'cost':
        return a.totalCost - b.totalCost
      case 'time':
        return a.totalTime - b.totalTime
      case 'security':
        return b.securityScore - a.securityScore
      case 'output':
        return b.estimatedOutput - a.estimatedOutput
      default:
        return 0
    }
  })

  const getBestValue = (field: 'cost' | 'time' | 'security' | 'output') => {
    if (routes.length === 0) return 0
    
    switch (field) {
      case 'cost':
        return Math.min(...routes.map(r => r.totalCost))
      case 'time':
        return Math.min(...routes.map(r => r.totalTime))
      case 'security':
        return Math.max(...routes.map(r => r.securityScore))
      case 'output':
        return Math.max(...routes.map(r => r.estimatedOutput))
      default:
        return 0
    }
  }

  const isBestValue = (route: CrossChainRoute, field: 'cost' | 'time' | 'security' | 'output') => {
    const bestValue = getBestValue(field)
    switch (field) {
      case 'cost':
        return route.totalCost === bestValue
      case 'time':
        return route.totalTime === bestValue
      case 'security':
        return route.securityScore === bestValue
      case 'output':
        return route.estimatedOutput === bestValue
      default:
        return false
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Compare Bridge Routes</h2>
            <p className="text-gray-400">
              Found {routes.length} routes for {formatCurrency(amount)}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
              {[
                { key: 'cost', label: 'Cost', icon: CurrencyDollarIcon },
                { key: 'time', label: 'Time', icon: ClockIcon },
                { key: 'security', label: 'Security', icon: ShieldCheckIcon },
                { key: 'output', label: 'Output', icon: ChartBarIcon }
              ].map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key as any)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      sortBy === option.key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Routes List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {sortedRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-slate-700 rounded-lg p-6 border transition-all cursor-pointer ${
                selectedRouteId === route.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => setSelectedRouteId(route.id)}
            >
              {/* Route Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {getChainDisplayName(route.sourceChain)}
                    </span>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-medium">
                      {getChainDisplayName(route.targetChain)}
                    </span>
                  </div>
                  
                  {/* Bridge Types */}
                  <div className="flex space-x-2">
                    {route.bridges.map((bridge, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs font-medium ${getBridgeTypeColor('liquidity')}`}
                      >
                        {bridge.bridgeName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className={`flex items-center space-x-1 ${isBestValue(route, 'cost') ? 'text-green-400' : 'text-gray-400'}`}>
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>{formatCurrency(route.totalCost)}</span>
                    {isBestValue(route, 'cost') && <CheckCircleIcon className="w-4 h-4" />}
                  </div>
                  
                  <div className={`flex items-center space-x-1 ${isBestValue(route, 'time') ? 'text-green-400' : 'text-gray-400'}`}>
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatTime(route.totalTime)}</span>
                    {isBestValue(route, 'time') && <BoltIcon className="w-4 h-4" />}
                  </div>
                  
                  <div className={`flex items-center space-x-1 ${getSecurityScoreColor(route.securityScore)}`}>
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>{route.securityScore}/100</span>
                    {isBestValue(route, 'security') && <CheckCircleIcon className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-1">
                  <span className="text-gray-400 text-sm">Total Cost</span>
                  <div className="text-white font-semibold">
                    {formatCurrency(route.totalCost)}
                    <span className="text-gray-400 text-sm ml-1">
                      ({formatPercentage((route.totalCost / amount) * 100)})
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-gray-400 text-sm">Estimated Output</span>
                  <div className="text-white font-semibold">
                    {formatCurrency(route.estimatedOutput)}
                    <span className={`text-sm ml-1 ${
                      route.estimatedOutput > amount ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      ({route.estimatedOutput > amount ? '+' : ''}{formatPercentage(((route.estimatedOutput - amount) / amount) * 100)})
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-gray-400 text-sm">Completion Time</span>
                  <div className="text-white font-semibold">{formatTime(route.totalTime)}</div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-gray-400 text-sm">Slippage</span>
                  <div className="text-white font-semibold">{formatPercentage(route.totalSlippage)}</div>
                </div>
              </div>

              {/* Route Steps */}
              {selectedRouteId === route.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-600 pt-4 mt-4"
                >
                  <h4 className="text-white font-medium mb-3">Route Steps</h4>
                  <div className="space-y-2">
                    {route.routes.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center space-x-4 p-3 bg-slate-800 rounded">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {step.stepNumber}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium capitalize">{step.action}</span>
                            <span className="text-gray-400">via {step.protocol}</span>
                            {step.targetChain && step.sourceChain !== step.targetChain && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-blue-400">{getChainDisplayName(step.sourceChain)} → {getChainDisplayName(step.targetChain)}</span>
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {step.sourceAsset} → {step.targetAsset} • Fee: {formatCurrency(step.fee)} • Time: {formatTime(step.time)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(step.estimatedOutput)}</div>
                          <div className="text-sm text-gray-400">Gas: ~{formatCurrency(step.gasEstimate)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectRoute(route)
                }}
                className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Select This Route • {formatCurrency(route.estimatedOutput)} estimated
              </button>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm">Best Cost</div>
              <div className="text-green-400 font-semibold">{formatCurrency(getBestValue('cost'))}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Fastest</div>
              <div className="text-blue-400 font-semibold">{formatTime(getBestValue('time'))}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Most Secure</div>
              <div className="text-purple-400 font-semibold">{getBestValue('security')}/100</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Best Output</div>
              <div className="text-yellow-400 font-semibold">{formatCurrency(getBestValue('output'))}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}