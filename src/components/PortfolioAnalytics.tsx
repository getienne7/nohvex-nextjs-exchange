'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ScaleIcon,
  FireIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  PortfolioSnapshot, 
  PerformanceAttribution, 
  RebalancingRecommendation,
  AssetSnapshot,
  ChainSnapshot
} from '@/lib/portfolio-analytics'

interface PortfolioAnalyticsProps {
  walletAddress: string
}

export default function PortfolioAnalytics({ walletAddress }: PortfolioAnalyticsProps) {
  const [loading, setLoading] = useState(true)
  const [currentSnapshot, setCurrentSnapshot] = useState<PortfolioSnapshot | null>(null)
  const [attribution, setAttribution] = useState<PerformanceAttribution | null>(null)
  const [recommendations, setRecommendations] = useState<RebalancingRecommendation[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const [selectedTab, setSelectedTab] = useState<'overview' | 'attribution' | 'recommendations' | 'risk'>('overview')

  const timeframes = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ]

  useEffect(() => {
    loadAnalytics()
  }, [walletAddress, selectedTimeframe])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(
        `/api/portfolio-analytics?action=summary&walletAddress=${walletAddress}&timeframe=${selectedTimeframe}`
      )
      const result = await response.json()
      
      if (result.success) {
        setCurrentSnapshot(result.data.currentSnapshot)
        setAttribution(result.data.performanceAttribution)
        setRecommendations(result.data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to load portfolio analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSnapshot = async () => {
    try {
      const response = await fetch('/api/portfolio-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      })

      const result = await response.json()
      
      if (result.success) {
        await loadAnalytics() // Reload data
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100)
  }

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getPerformanceIcon = (value: number) => {
    if (value > 0) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
    if (value < 0) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
    return <div className="w-4 h-4" />
  }

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return 'text-green-600 bg-green-100'
    if (risk < 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentSnapshot) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600 mb-4">Create your first portfolio snapshot to start tracking performance.</p>
          <button
            onClick={createSnapshot}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Snapshot
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Portfolio Analytics</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={createSnapshot}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Update</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentSnapshot.totalValue)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
            <div className={`text-sm font-medium ${getPerformanceColor(currentSnapshot.performance.dailyReturn)}`}>
              {currentSnapshot.performance.dailyReturn > 0 ? '+' : ''}{currentSnapshot.performance.dailyReturn.toFixed(2)}% (24h)
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {currentSnapshot.performance.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Sharpe Ratio</div>
            <div className={`text-sm font-medium ${currentSnapshot.performance.sharpeRatio > 1 ? 'text-green-600' : 'text-yellow-600'}`}>
              {currentSnapshot.performance.sharpeRatio > 1 ? 'Good' : 'Fair'}
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {(currentSnapshot.riskMetrics.portfolioVolatility * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Volatility</div>
            <div className={`text-sm font-medium ${getRiskColor(currentSnapshot.riskMetrics.portfolioVolatility).split(' ')[0]}`}>
              {currentSnapshot.riskMetrics.portfolioVolatility < 0.5 ? 'Low' : currentSnapshot.riskMetrics.portfolioVolatility < 0.8 ? 'Medium' : 'High'}
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentSnapshot.riskMetrics.valueAtRisk95)}
            </div>
            <div className="text-sm text-gray-600">VaR (95%)</div>
            <div className="text-sm text-gray-600">Daily risk</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'attribution', label: 'Attribution', icon: ScaleIcon },
              { id: 'recommendations', label: 'Recommendations', icon: LightBulbIcon, count: recommendations.length },
              { id: 'risk', label: 'Risk Analysis', icon: ShieldCheckIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Asset Allocation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
                <div className="space-y-3">
                  {currentSnapshot.assets.map((asset, index) => (
                    <motion.div
                      key={asset.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{asset.name}</div>
                          <div className="text-sm text-gray-600">{asset.balance} {asset.symbol}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(asset.usdValue)}</div>
                        <div className="text-sm text-gray-600">{asset.weight.toFixed(1)}%</div>
                        <div className={`text-sm font-medium flex items-center space-x-1 ${getPerformanceColor(asset.change24h)}`}>
                          {getPerformanceIcon(asset.change24h)}
                          <span>{asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Chain Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chain Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentSnapshot.chains.map((chain, index) => (
                    <motion.div
                      key={chain.chainId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{chain.name}</h4>
                        <span className="text-sm text-gray-600">{chain.weight.toFixed(1)}%</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {formatCurrency(chain.totalValue)}
                      </div>
                      <div className={`text-sm font-medium flex items-center space-x-1 ${getPerformanceColor(chain.performance24h)}`}>
                        {getPerformanceIcon(chain.performance24h)}
                        <span>{chain.performance24h > 0 ? '+' : ''}{chain.performance24h.toFixed(2)}% (24h)</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'attribution' && attribution && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Attribution Analysis</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">
                      {attribution.totalAttribution > 0 ? '+' : ''}{attribution.totalAttribution.toFixed(2)}%
                    </div>
                    <div className="text-blue-700">Total Attribution</div>
                  </div>
                </div>
              </div>

              {/* Attribution Effects Summary */}
              {(attribution.allocationEffect !== undefined || attribution.selectionEffect !== undefined) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Attribution Effects</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {attribution.allocationEffect !== undefined && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="text-sm font-semibold text-green-900 mb-1">Allocation Effect</h5>
                        <div className={`text-lg font-bold ${getPerformanceColor(attribution.allocationEffect)}`}>
                          {attribution.allocationEffect > 0 ? '+' : ''}{attribution.allocationEffect.toFixed(2)}%
                        </div>
                        <div className="text-xs text-green-700">Asset allocation impact</div>
                      </div>
                    )}

                    {attribution.selectionEffect !== undefined && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="text-sm font-semibold text-blue-900 mb-1">Selection Effect</h5>
                        <div className={`text-lg font-bold ${getPerformanceColor(attribution.selectionEffect)}`}>
                          {attribution.selectionEffect > 0 ? '+' : ''}{attribution.selectionEffect.toFixed(2)}%
                        </div>
                        <div className="text-xs text-blue-700">Security selection impact</div>
                      </div>
                    )}

                    {attribution.currencyEffect !== undefined && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="text-sm font-semibold text-purple-900 mb-1">Currency Effect</h5>
                        <div className={`text-lg font-bold ${getPerformanceColor(attribution.currencyEffect)}`}>
                          {attribution.currencyEffect > 0 ? '+' : ''}{attribution.currencyEffect.toFixed(2)}%
                        </div>
                        <div className="text-xs text-purple-700">Multi-chain exposure</div>
                      </div>
                    )}

                    {attribution.timingEffect !== undefined && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h5 className="text-sm font-semibold text-yellow-900 mb-1">Timing Effect</h5>
                        <div className={`text-lg font-bold ${getPerformanceColor(attribution.timingEffect)}`}>
                          {attribution.timingEffect > 0 ? '+' : ''}{attribution.timingEffect.toFixed(2)}%
                        </div>
                        <div className="text-xs text-yellow-700">Market timing impact</div>
                      </div>
                    )}

                    {attribution.interactionEffect !== undefined && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Interaction Effect</h5>
                        <div className={`text-lg font-bold ${getPerformanceColor(attribution.interactionEffect)}`}>
                          {attribution.interactionEffect > 0 ? '+' : ''}{attribution.interactionEffect.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-700">Cross-effect impact</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Asset Contributions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Asset Contributions</h4>
                <div className="space-y-2">
                  {attribution.assetContributions.map((contrib, index) => (
                    <motion.div
                      key={contrib.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {contrib.symbol.slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-900">{contrib.symbol}</span>
                        <span className="text-sm text-gray-600">({contrib.weight.toFixed(1)}%)</span>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${getPerformanceColor(contrib.contribution)}`}>
                          {contrib.contribution > 0 ? '+' : ''}{contrib.contribution.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-600">
                          {contrib.contributionPercent.toFixed(1)}% of total
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Chain Contributions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Chain Contributions</h4>
                <div className="space-y-2">
                  {attribution.chainContributions.map((contrib, index) => (
                    <motion.div
                      key={contrib.chainName}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {contrib.chainName.slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-900">{contrib.chainName}</span>
                        <span className="text-sm text-gray-600">({contrib.weight.toFixed(1)}%)</span>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${getPerformanceColor(contrib.contribution)}`}>
                          {contrib.contribution > 0 ? '+' : ''}{contrib.contribution.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-600">
                          {contrib.contributionPercent.toFixed(1)}% of total
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sector Analysis */}
              {attribution.sectorContributions && attribution.sectorContributions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Sector Analysis</h4>
                  <div className="space-y-2">
                    {attribution.sectorContributions.map((sector, index) => (
                      <motion.div
                        key={sector.sectorName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {sector.sectorName.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{sector.sectorName}</span>
                            <div className="text-sm text-gray-600">Weight: {sector.weight.toFixed(1)}%</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-semibold ${getPerformanceColor(sector.contribution)}`}>
                            {sector.contribution > 0 ? '+' : ''}{sector.contribution.toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-600">
                            Risk: {(sector.riskContribution * 100).toFixed(1)}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Factor Analysis */}
              {attribution.factorContributions && attribution.factorContributions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Factor Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attribution.factorContributions.map((factor, index) => (
                      <motion.div
                        key={factor.factorName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-indigo-50 rounded-lg border border-indigo-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-indigo-900">{factor.factorName}</h5>
                          <span className="text-sm text-indigo-700">
                            Exposure: {factor.exposure.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`text-lg font-bold ${getPerformanceColor(factor.contribution)}`}>
                            {factor.contribution > 0 ? '+' : ''}{factor.contribution.toFixed(2)}%
                          </div>
                          <div className="text-sm text-indigo-700">
                            Risk: {(factor.riskContribution * 100).toFixed(1)}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'recommendations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rebalancing Recommendations ({recommendations.length})
              </h3>
              
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(rec.priority)}`}>
                          {rec.type === 'risk_reduction' && <ShieldCheckIcon className="w-5 h-5" />}
                          {rec.type === 'opportunity' && <LightBulbIcon className="w-5 h-5" />}
                          {rec.type === 'rebalance' && <ScaleIcon className="w-5 h-5" />}
                          {rec.type === 'tax_loss_harvest' && <CurrencyDollarIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <p className="text-gray-600 mt-1">{rec.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(rec.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>

                    {/* Expected Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${rec.expectedImpact.riskReduction > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {rec.expectedImpact.riskReduction > 0 ? '-' : ''}{Math.abs(rec.expectedImpact.riskReduction)}%
                        </div>
                        <div className="text-sm text-gray-600">Risk Reduction</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getPerformanceColor(rec.expectedImpact.returnImprovement)}`}>
                          {rec.expectedImpact.returnImprovement > 0 ? '+' : ''}{rec.expectedImpact.returnImprovement}%
                        </div>
                        <div className="text-sm text-gray-600">Return Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(rec.expectedImpact.costEstimate)}
                        </div>
                        <div className="text-sm text-gray-600">Est. Cost</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Recommended Actions:</h5>
                      <div className="space-y-2">
                        {rec.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                action.type === 'buy' ? 'bg-green-100 text-green-800' :
                                action.type === 'sell' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {action.type.toUpperCase()}
                              </span>
                              <span className="font-medium text-gray-900">
                                {action.fromAsset && `${action.fromAsset} → `}{action.toAsset}
                              </span>
                              <span className="text-sm text-gray-600">{action.reason}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{formatCurrency(action.amountUSD)}</div>
                              <div className={`text-xs ${
                                action.urgency === 'high' ? 'text-red-600' :
                                action.urgency === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {action.urgency} urgency
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Optimized</h3>
                  <p className="text-gray-600">No rebalancing recommendations at this time. Your portfolio allocation looks good!</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'risk' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Risk Analysis</h3>
              
              {/* Primary Risk Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-900">Portfolio Volatility</h4>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(currentSnapshot.riskMetrics.portfolioVolatility * 100).toFixed(1)}%
                  </div>
                  <div className={`text-sm font-medium ${getRiskColor(currentSnapshot.riskMetrics.portfolioVolatility).split(' ')[0]}`}>
                    {currentSnapshot.riskMetrics.portfolioVolatility < 0.5 ? 'Low Risk' : 
                     currentSnapshot.riskMetrics.portfolioVolatility < 0.8 ? 'Medium Risk' : 'High Risk'}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FireIcon className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-gray-900">Concentration Risk</h4>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(currentSnapshot.riskMetrics.concentrationRisk * 100).toFixed(0)}%
                  </div>
                  <div className={`text-sm font-medium ${
                    currentSnapshot.riskMetrics.concentrationRisk > 0.5 ? 'text-red-600' :
                    currentSnapshot.riskMetrics.concentrationRisk > 0.3 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {currentSnapshot.riskMetrics.concentrationRisk > 0.5 ? 'High' :
                     currentSnapshot.riskMetrics.concentrationRisk > 0.3 ? 'Medium' : 'Low'}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ScaleIcon className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Diversification</h4>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentSnapshot.riskMetrics.diversificationRatio.toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium ${
                    currentSnapshot.riskMetrics.diversificationRatio > 1.2 ? 'text-green-600' :
                    currentSnapshot.riskMetrics.diversificationRatio > 1.0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {currentSnapshot.riskMetrics.diversificationRatio > 1.2 ? 'Well Diversified' :
                     currentSnapshot.riskMetrics.diversificationRatio > 1.0 ? 'Moderately Diversified' : 'Concentrated'}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Liquidity Score</h4>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(currentSnapshot.riskMetrics.liquidityScore * 100).toFixed(0)}%
                  </div>
                  <div className={`text-sm font-medium ${
                    currentSnapshot.riskMetrics.liquidityScore > 0.8 ? 'text-green-600' :
                    currentSnapshot.riskMetrics.liquidityScore > 0.6 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {currentSnapshot.riskMetrics.liquidityScore > 0.8 ? 'High Liquidity' :
                     currentSnapshot.riskMetrics.liquidityScore > 0.6 ? 'Medium Liquidity' : 'Low Liquidity'}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-gray-900">Value at Risk (95%)</h4>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentSnapshot.riskMetrics.valueAtRisk95)}
                  </div>
                  <div className="text-sm text-gray-600">Daily potential loss</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-700" />
                    <h4 className="font-semibold text-gray-900">Value at Risk (99%)</h4>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentSnapshot.riskMetrics.valueAtRisk99)}
                  </div>
                  <div className="text-sm text-gray-600">Extreme loss scenario</div>
                </div>
              </div>

              {/* Advanced Risk Metrics */}
              {currentSnapshot.riskMetrics.conditionalVaR95 !== undefined && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Advanced Risk Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="text-sm font-semibold text-red-900 mb-1">Conditional VaR (95%)</h5>
                      <div className="text-lg font-bold text-red-900">
                        {formatCurrency(currentSnapshot.riskMetrics.conditionalVaR95)}
                      </div>
                      <div className="text-xs text-red-700">Expected shortfall</div>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="text-sm font-semibold text-red-900 mb-1">Conditional VaR (99%)</h5>
                      <div className="text-lg font-bold text-red-900">
                        {formatCurrency(currentSnapshot.riskMetrics.conditionalVaR99)}
                      </div>
                      <div className="text-xs text-red-700">Extreme shortfall</div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-semibold text-blue-900 mb-1">Sortino Ratio</h5>
                      <div className="text-lg font-bold text-blue-900">
                        {currentSnapshot.riskMetrics.sortinoRatio?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-blue-700">Downside risk-adjusted</div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="text-sm font-semibold text-purple-900 mb-1">Tail Risk</h5>
                      <div className="text-lg font-bold text-purple-900">
                        {(currentSnapshot.riskMetrics.tailRisk * 100)?.toFixed(1) || 'N/A'}%
                      </div>
                      <div className="text-xs text-purple-700">5% worst outcomes</div>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="text-sm font-semibold text-green-900 mb-1">Calmar Ratio</h5>
                      <div className="text-lg font-bold text-green-900">
                        {currentSnapshot.riskMetrics.calmarRatio?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-green-700">Return/max drawdown</div>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="text-sm font-semibold text-yellow-900 mb-1">Skewness</h5>
                      <div className="text-lg font-bold text-yellow-900">
                        {currentSnapshot.riskMetrics.skewness?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-yellow-700">
                        {(currentSnapshot.riskMetrics.skewness || 0) < 0 ? 'Left tail risk' : 
                         (currentSnapshot.riskMetrics.skewness || 0) > 0 ? 'Right tail bias' : 'Symmetric'}
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h5 className="text-sm font-semibold text-indigo-900 mb-1">Kurtosis</h5>
                      <div className="text-lg font-bold text-indigo-900">
                        {currentSnapshot.riskMetrics.kurtosis?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-indigo-700">
                        {(currentSnapshot.riskMetrics.kurtosis || 0) > 0 ? 'Heavy tails' : 'Light tails'}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-900 mb-1">Information Ratio</h5>
                      <div className="text-lg font-bold text-gray-900">
                        {currentSnapshot.riskMetrics.informationRatio?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-700">Alpha per unit risk</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Assessment Summary */}
              <div className="p-6 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Comprehensive Risk Assessment</h4>
                <div className="space-y-2 text-blue-800">
                  <p>• Your portfolio shows <strong>{currentSnapshot.riskMetrics.portfolioVolatility < 0.5 ? 'low' : currentSnapshot.riskMetrics.portfolioVolatility < 0.8 ? 'moderate' : 'high'}</strong> volatility at {(currentSnapshot.riskMetrics.portfolioVolatility * 100).toFixed(1)}%</p>
                  <p>• Concentration risk is <strong>{currentSnapshot.riskMetrics.concentrationRisk > 0.5 ? 'high' : currentSnapshot.riskMetrics.concentrationRisk > 0.3 ? 'moderate' : 'low'}</strong> with {(currentSnapshot.riskMetrics.concentrationRisk * 100).toFixed(0)}% concentration</p>
                  <p>• Liquidity is <strong>{currentSnapshot.riskMetrics.liquidityScore > 0.8 ? 'excellent' : currentSnapshot.riskMetrics.liquidityScore > 0.6 ? 'good' : 'limited'}</strong> at {(currentSnapshot.riskMetrics.liquidityScore * 100).toFixed(0)}%</p>
                  <p>• In a 95% confidence scenario, you could lose up to <strong>{formatCurrency(currentSnapshot.riskMetrics.valueAtRisk95)}</strong> in a single day</p>
                  {currentSnapshot.riskMetrics.conditionalVaR95 && (
                    <p>• Expected shortfall (tail risk) in worst 5% scenarios: <strong>{formatCurrency(currentSnapshot.riskMetrics.conditionalVaR95)}</strong></p>
                  )}
                  {currentSnapshot.riskMetrics.skewness !== undefined && (
                    <p>• Return distribution shows <strong>{currentSnapshot.riskMetrics.skewness < -0.5 ? 'significant left tail risk' : currentSnapshot.riskMetrics.skewness > 0.5 ? 'upside bias' : 'balanced symmetry'}</strong></p>
                  )}
                  {currentSnapshot.riskMetrics.maximumDrawdownDuration !== undefined && currentSnapshot.riskMetrics.maximumDrawdownDuration > 0 && (
                    <p>• Maximum drawdown period: <strong>{currentSnapshot.riskMetrics.maximumDrawdownDuration} periods</strong></p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}