'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  FireIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { 
  DeFiPosition, 
  LiquidationAlert, 
  YieldOptimization,
  DeFiProtocol,
  PositionType,
  RiskLevel
} from '@/lib/defi-position-tracker'

interface DeFiPositionTrackerProps {
  walletAddress: string
}

interface PositionSummary {
  totalPositions: number
  totalValueLocked: number
  totalDailyYield: number
  averageAPY: number
  protocolCount: number
  chainCount: number
  totalClaimableRewards: number
  atRiskPositions: number
  protocolBreakdown: any[]
  riskAnalysis: any
}

export default function DeFiPositionTracker({ walletAddress }: DeFiPositionTrackerProps) {
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [positions, setPositions] = useState<DeFiPosition[]>([])
  const [summary, setSummary] = useState<PositionSummary | null>(null)
  const [alerts, setAlerts] = useState<LiquidationAlert[]>([])
  const [optimizations, setOptimizations] = useState<YieldOptimization[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'positions' | 'alerts' | 'optimizations'>('overview')
  const [selectedProtocol, setSelectedProtocol] = useState<DeFiProtocol | 'all'>('all')
  const [selectedType, setSelectedType] = useState<PositionType | 'all'>('all')

  const protocolNames = {
    [DeFiProtocol.AAVE]: 'Aave',
    [DeFiProtocol.COMPOUND]: 'Compound',
    [DeFiProtocol.UNISWAP_V2]: 'Uniswap V2',
    [DeFiProtocol.UNISWAP_V3]: 'Uniswap V3',
    [DeFiProtocol.CURVE]: 'Curve',
    [DeFiProtocol.LIDO]: 'Lido',
    [DeFiProtocol.PANCAKESWAP]: 'PancakeSwap',
    [DeFiProtocol.SUSHISWAP]: 'SushiSwap',
    [DeFiProtocol.BALANCER]: 'Balancer',
    [DeFiProtocol.YEARN]: 'Yearn',
    [DeFiProtocol.CONVEX]: 'Convex'
  }

  const positionTypeNames = {
    [PositionType.LENDING]: 'Lending',
    [PositionType.BORROWING]: 'Borrowing',
    [PositionType.LIQUIDITY_POOL]: 'Liquidity Pool',
    [PositionType.STAKING]: 'Staking',
    [PositionType.YIELD_FARMING]: 'Yield Farming',
    [PositionType.LEVERAGED]: 'Leveraged',
    [PositionType.SYNTHETIC]: 'Synthetic'
  }

  useEffect(() => {
    loadPositions()
  }, [walletAddress])

  const loadPositions = async () => {
    try {
      setLoading(true)
      
      // Load summary
      const summaryResponse = await fetch(`/api/defi-positions?action=summary&walletAddress=${walletAddress}`)
      const summaryResult = await summaryResponse.json()
      
      if (summaryResult.success) {
        setSummary(summaryResult.summary)
      }
      
      // Load positions
      const positionsResponse = await fetch(`/api/defi-positions?action=positions&walletAddress=${walletAddress}`)
      const positionsResult = await positionsResponse.json()
      
      if (positionsResult.success) {
        setPositions(positionsResult.positions)
      }
      
      // Load alerts
      const alertsResponse = await fetch(`/api/defi-positions?action=alerts&walletAddress=${walletAddress}`)
      const alertsResult = await alertsResponse.json()
      
      if (alertsResult.success) {
        setAlerts(alertsResult.alerts)
      }
      
      // Load optimizations
      const optimizationsResponse = await fetch(`/api/defi-positions?action=optimizations&walletAddress=${walletAddress}`)
      const optimizationsResult = await optimizationsResponse.json()
      
      if (optimizationsResult.success) {
        setOptimizations(optimizationsResult.optimizations)
      }
      
    } catch (error) {
      console.error('Failed to load DeFi positions:', error)
    } finally {
      setLoading(false)
    }
  }

  const scanPositions = async () => {
    try {
      setScanning(true)
      
      const response = await fetch('/api/defi-positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress, 
          forceRefresh: true 
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setPositions(result.positions)
        setSummary(result.summary)
        setAlerts(result.liquidationAlerts)
        setOptimizations(result.optimizations)
      }
    } catch (error) {
      console.error('Failed to scan positions:', error)
    } finally {
      setScanning(false)
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

  const getProtocolIcon = (protocol: DeFiProtocol) => {
    switch (protocol) {
      case DeFiProtocol.AAVE:
      case DeFiProtocol.COMPOUND:
        return <BanknotesIcon className="w-5 h-5" />
      case DeFiProtocol.UNISWAP_V2:
      case DeFiProtocol.UNISWAP_V3:
      case DeFiProtocol.PANCAKESWAP:
        return <ArrowPathIcon className="w-5 h-5" />
      case DeFiProtocol.LIDO:
        return <ShieldCheckIcon className="w-5 h-5" />
      default:
        return <BeakerIcon className="w-5 h-5" />
    }
  }

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW:
        return 'text-green-600 bg-green-100'
      case RiskLevel.MEDIUM:
        return 'text-yellow-600 bg-yellow-100'
      case RiskLevel.HIGH:
        return 'text-orange-600 bg-orange-100'
      case RiskLevel.CRITICAL:
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPositionTypeIcon = (type: PositionType) => {
    switch (type) {
      case PositionType.LENDING:
        return <BanknotesIcon className="w-4 h-4" />
      case PositionType.LIQUIDITY_POOL:
        return <ArrowPathIcon className="w-4 h-4" />
      case PositionType.STAKING:
        return <ShieldCheckIcon className="w-4 h-4" />
      case PositionType.YIELD_FARMING:
        return <FireIcon className="w-4 h-4" />
      default:
        return <BeakerIcon className="w-4 h-4" />
    }
  }

  const filteredPositions = positions.filter(position => {
    if (selectedProtocol !== 'all' && position.protocol !== selectedProtocol) return false
    if (selectedType !== 'all' && position.type !== selectedType) return false
    return true
  })

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BeakerIcon className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">DeFi Position Tracker</h2>
          </div>
          
          <button
            onClick={scanPositions}
            disabled={scanning}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning...' : 'Scan Positions'}</span>
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {summary.totalPositions}
              </div>
              <div className="text-sm text-purple-700">Active Positions</div>
              <div className="text-xs text-purple-600 mt-1">
                {summary.protocolCount} protocols
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(summary.totalValueLocked)}
              </div>
              <div className="text-sm text-green-700">Total Value Locked</div>
              <div className="text-xs text-green-600 mt-1">
                {summary.chainCount} chains
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {formatPercent(summary.averageAPY)}
              </div>
              <div className="text-sm text-blue-700">Average APY</div>
              <div className="text-xs text-blue-600 mt-1">
                {formatCurrency(summary.totalDailyYield)}/day
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">
                {formatCurrency(summary.totalClaimableRewards)}
              </div>
              <div className="text-sm text-yellow-700">Claimable Rewards</div>
              <div className="text-xs text-yellow-600 mt-1">
                {summary.atRiskPositions} at risk
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'positions', label: 'Positions', icon: BeakerIcon, count: positions.length },
              { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon, count: alerts.length },
              { id: 'optimizations', label: 'Optimizations', icon: LightBulbIcon, count: optimizations.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && summary && (
            <div className="space-y-6">
              {/* Protocol Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.protocolBreakdown.map((protocol, index) => (
                    <motion.div
                      key={protocol.protocol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {getProtocolIcon(protocol.protocol)}
                        <h4 className="font-semibold text-gray-900">
                          {protocolNames[protocol.protocol as DeFiProtocol]}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Positions:</span>
                          <span className="font-medium">{protocol.positionCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Value:</span>
                          <span className="font-medium">{formatCurrency(protocol.totalValue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">APY:</span>
                          <span className="font-medium text-green-600">{formatPercent(protocol.averageAPY)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Risk Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{summary.riskAnalysis.lowRisk}</div>
                    <div className="text-sm text-green-700">Low Risk</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-900">{summary.riskAnalysis.mediumRisk}</div>
                    <div className="text-sm text-yellow-700">Medium Risk</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">{summary.riskAnalysis.highRisk}</div>
                    <div className="text-sm text-orange-700">High Risk</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-900">{summary.riskAnalysis.criticalRisk}</div>
                    <div className="text-sm text-red-700">Critical Risk</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'positions' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <select
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Protocols</option>
                  {Object.entries(protocolNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  {Object.entries(positionTypeNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Positions List */}
              <div className="space-y-4">
                {filteredPositions.length > 0 ? (
                  filteredPositions.map((position, index) => (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                            {getProtocolIcon(position.protocol)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {protocolNames[position.protocol]}
                              </h4>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {position.chainName}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${getRiskColor(position.risks.overallRisk)}`}>
                                {position.risks.overallRisk.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              {getPositionTypeIcon(position.type)}
                              <span>{positionTypeNames[position.type]}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(position.metrics.totalValue)}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            {formatPercent(position.metrics.apy)} APY
                          </div>
                        </div>
                      </div>

                      {/* Assets */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {position.assets.map((asset, assetIndex) => (
                          <div key={assetIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {asset.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{asset.symbol}</div>
                                <div className="text-sm text-gray-600">{asset.balance}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{formatCurrency(asset.usdValue)}</div>
                              <div className="text-sm text-gray-600">{asset.weight.toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Rewards */}
                      {position.rewards.claimableRewards.length > 0 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-800">Claimable Rewards</span>
                            </div>
                            <div className="text-sm font-bold text-yellow-900">
                              {formatCurrency(position.rewards.totalClaimableUSD)}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {position.rewards.claimableRewards.map((reward, rewardIndex) => (
                              <span key={rewardIndex} className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                {reward.amount} {reward.symbol}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BeakerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No DeFi Positions Found</h3>
                    <p className="text-gray-600">
                      {positions.length === 0 
                        ? 'Scan your wallet to discover active DeFi positions across multiple protocols.'
                        : 'No positions match the selected filters.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Liquidation Alerts ({alerts.length})
              </h3>
              
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'critical' 
                        ? 'bg-red-50 border-red-400' 
                        : 'bg-yellow-50 border-yellow-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${
                          alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <div>
                          <h4 className={`font-semibold ${
                            alert.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                          }`}>
                            {alert.severity === 'critical' ? 'Critical' : 'Warning'}: Liquidation Risk
                          </h4>
                          <p className={`text-sm mt-1 ${
                            alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                          }`}>
                            Health Factor: {alert.currentHealthFactor.toFixed(2)} 
                            (Threshold: {alert.liquidationThreshold})
                          </p>
                          <p className={`text-sm ${
                            alert.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'
                          }`}>
                            Price drop of {alert.priceDropRequired.toFixed(1)}% could trigger liquidation
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className={`text-sm font-medium ${
                        alert.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                      }`}>
                        Recommended Actions:
                      </h5>
                      <ul className={`text-sm mt-1 space-y-1 ${
                        alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {alert.recommendedActions.map((action, actionIndex) => (
                          <li key={actionIndex}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Liquidation Risks</h3>
                  <p className="text-gray-600">All your DeFi positions are healthy and safe from liquidation.</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'optimizations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Yield Optimizations ({optimizations.length})
              </h3>
              
              {optimizations.length > 0 ? (
                optimizations.map((optimization, index) => (
                  <motion.div
                    key={optimization.positionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <LightBulbIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{optimization.strategy.description}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {optimization.strategy.type.charAt(0).toUpperCase() + optimization.strategy.type.slice(1)} Strategy
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{formatCurrency(optimization.potentialGain)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {(optimization.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>

                    {/* APY Improvement */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {formatPercent(optimization.currentAPY)}
                        </div>
                        <div className="text-sm text-gray-600">Current APY</div>
                      </div>
                      <div className="text-center">
                        <ArrowTrendingUpIcon className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Optimized</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {formatPercent(optimization.optimizedAPY)}
                        </div>
                        <div className="text-sm text-gray-600">Target APY</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Required Actions:</h5>
                      <div className="space-y-2">
                        {optimization.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                action.type === 'claim' ? 'bg-green-100 text-green-800' :
                                action.type === 'compound' ? 'bg-blue-100 text-blue-800' :
                                action.type === 'migrate' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {action.type.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-900">{action.description}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                +{formatCurrency(action.expectedReturn)}
                              </div>
                              <div className="text-xs text-gray-600">
                                Gas: ~{formatCurrency(action.estimatedGas)}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Positions Optimized</h3>
                  <p className="text-gray-600">Your DeFi positions are already well-optimized for yield generation.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}