'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  ChartPieIcon,
  SignalIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { 
  AdvancedOrder, 
  TradingAlgorithm, 
  OrderType, 
  OrderSide, 
  OrderStatus,
  AlgorithmType,
  AlgorithmStatus,
  TimeInForce,
  TradingPair,
  MarketData,
  TradingSignal
} from '@/lib/advanced-trading'

interface AdvancedTradingProps {
  walletAddress: string
}

interface TradingDashboard {
  summary: {
    totalOrders: number
    activeOrders: number
    filledOrders: number
    totalVolume: string
    activeAlgorithms: number
    totalAlgorithms: number
    totalPositions: number
    totalPnL: string
    winRate: number
  }
  recentOrders: AdvancedOrder[]
  activeAlgorithms: TradingAlgorithm[]
  topPositions: any[]
}

export default function AdvancedTrading({ walletAddress }: AdvancedTradingProps) {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<TradingDashboard | null>(null)
  const [orders, setOrders] = useState<AdvancedOrder[]>([])
  const [algorithms, setAlgorithms] = useState<TradingAlgorithm[]>([])
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([])
  const [marketData, setMarketData] = useState<{ [symbol: string]: MarketData }>({})
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'orders' | 'algorithms' | 'signals' | 'create'>('dashboard')
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [showCreateAlgorithm, setShowCreateAlgorithm] = useState(false)

  // Order form state
  const [orderForm, setOrderForm] = useState({
    pair: '',
    type: OrderType.MARKET,
    side: OrderSide.BUY,
    quantity: '',
    price: '',
    stopPrice: '',
    limitPrice: '',
    trailingPercent: '',
    timeInForce: TimeInForce.GTC,
    stopLossPercent: '',
    takeProfitPercent: ''
  })

  // Algorithm form state
  const [algorithmForm, setAlgorithmForm] = useState({
    type: AlgorithmType.DCA,
    interval: 3600,
    amount: '100',
    maxOrders: 10,
    gridLevels: 10,
    gridSpacing: 2,
    basePrice: '2500',
    duration: 3600,
    slices: 10
  })

  useEffect(() => {
    loadTradingData()
  }, [walletAddress])

  const loadTradingData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard
      const dashboardResponse = await fetch('/api/advanced-trading?action=dashboard')
      const dashboardResult = await dashboardResponse.json()
      
      if (dashboardResult.success) {
        setDashboard(dashboardResult.dashboard)
      }
      
      // Load orders
      const ordersResponse = await fetch('/api/advanced-trading?action=orders')
      const ordersResult = await ordersResponse.json()
      
      if (ordersResult.success) {
        setOrders(ordersResult.orders)
      }
      
      // Load algorithms
      const algorithmsResponse = await fetch('/api/advanced-trading?action=algorithms')
      const algorithmsResult = await algorithmsResponse.json()
      
      if (algorithmsResult.success) {
        setAlgorithms(algorithmsResult.algorithms)
      }
      
      // Load trading pairs
      const pairsResponse = await fetch('/api/advanced-trading?action=trading-pairs')
      const pairsResult = await pairsResponse.json()
      
      if (pairsResult.success) {
        setTradingPairs(pairsResult.tradingPairs)
        
        // Load market data for each pair
        for (const pair of pairsResult.tradingPairs) {
          const marketResponse = await fetch(`/api/advanced-trading?action=market-data&symbol=${pair.symbol}`)
          const marketResult = await marketResponse.json()
          
          if (marketResult.success) {
            setMarketData(prev => ({
              ...prev,
              [pair.symbol]: marketResult.marketData
            }))
          }
        }
      }
      
      // Load signals for ETH/USDT
      const signalsResponse = await fetch('/api/advanced-trading?action=signals&symbol=ETH/USDT')
      const signalsResult = await signalsResponse.json()
      
      if (signalsResult.success) {
        setSignals(signalsResult.signals)
      }
      
    } catch (error) {
      console.error('Failed to load trading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async () => {
    try {
      const selectedPair = tradingPairs.find(p => p.id === orderForm.pair)
      if (!selectedPair) {
        alert('Please select a trading pair')
        return
      }

      const response = await fetch('/api/advanced-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-order',
          walletAddress,
          pair: selectedPair,
          type: orderForm.type,
          side: orderForm.side,
          quantity: orderForm.quantity,
          price: orderForm.price || undefined,
          stopPrice: orderForm.stopPrice || undefined,
          limitPrice: orderForm.limitPrice || undefined,
          trailingPercent: orderForm.trailingPercent ? parseFloat(orderForm.trailingPercent) : undefined,
          timeInForce: orderForm.timeInForce,
          riskParameters: {
            stopLossPercent: orderForm.stopLossPercent ? parseFloat(orderForm.stopLossPercent) : undefined,
            takeProfitPercent: orderForm.takeProfitPercent ? parseFloat(orderForm.takeProfitPercent) : undefined
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setShowCreateOrder(false)
        loadTradingData()
        alert('Order created successfully!')
      } else {
        alert(`Failed to create order: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Failed to create order')
    }
  }

  const createAlgorithm = async () => {
    try {
      const response = await fetch('/api/advanced-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-algorithm',
          walletAddress,
          type: algorithmForm.type,
          parameters: {
            interval: algorithmForm.interval,
            amount: algorithmForm.amount,
            maxOrders: algorithmForm.maxOrders,
            gridLevels: algorithmForm.gridLevels,
            gridSpacing: algorithmForm.gridSpacing,
            basePrice: algorithmForm.basePrice,
            duration: algorithmForm.duration,
            slices: algorithmForm.slices
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setShowCreateAlgorithm(false)
        loadTradingData()
        alert('Algorithm created successfully!')
      } else {
        alert(`Failed to create algorithm: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to create algorithm:', error)
      alert('Failed to create algorithm')
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/advanced-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel-order',
          orderId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        loadTradingData()
        alert('Order cancelled successfully!')
      } else {
        alert('Failed to cancel order')
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
      alert('Failed to cancel order')
    }
  }

  const controlAlgorithm = async (algorithmId: string, action: 'pause' | 'resume' | 'stop') => {
    try {
      const response = await fetch('/api/advanced-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `${action}-algorithm`,
          algorithmId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        loadTradingData()
        alert(`Algorithm ${action}d successfully!`)
      } else {
        alert(`Failed to ${action} algorithm`)
      }
    } catch (error) {
      console.error(`Failed to ${action} algorithm:`, error)
      alert(`Failed to ${action} algorithm`)
    }
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(num)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100)
  }

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.FILLED:
        return 'text-green-600 bg-green-100'
      case OrderStatus.OPEN:
      case OrderStatus.PARTIALLY_FILLED:
        return 'text-blue-600 bg-blue-100'
      case OrderStatus.CANCELLED:
        return 'text-gray-600 bg-gray-100'
      case OrderStatus.REJECTED:
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getAlgorithmStatusColor = (status: AlgorithmStatus) => {
    switch (status) {
      case AlgorithmStatus.ACTIVE:
        return 'text-green-600 bg-green-100'
      case AlgorithmStatus.PAUSED:
        return 'text-yellow-600 bg-yellow-100'
      case AlgorithmStatus.STOPPED:
      case AlgorithmStatus.COMPLETED:
        return 'text-gray-600 bg-gray-100'
      case AlgorithmStatus.ERROR:
        return 'text-red-600 bg-red-100'
      default:
        return 'text-blue-600 bg-blue-100'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <RocketLaunchIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Advanced Trading</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateOrder(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Order</span>
            </button>
            <button
              onClick={() => setShowCreateAlgorithm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <BoltIcon className="w-4 h-4" />
              <span>New Algorithm</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {dashboard.summary.totalOrders}
              </div>
              <div className="text-sm text-blue-700">Total Orders</div>
              <div className="text-xs text-blue-600 mt-1">
                {dashboard.summary.activeOrders} active
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(dashboard.summary.totalVolume)}
              </div>
              <div className="text-sm text-green-700">Total Volume</div>
              <div className="text-xs text-green-600 mt-1">
                {formatPercent(dashboard.summary.winRate)} win rate
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {dashboard.summary.activeAlgorithms}
              </div>
              <div className="text-sm text-purple-700">Active Algorithms</div>
              <div className="text-xs text-purple-600 mt-1">
                {dashboard.summary.totalAlgorithms} total
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">
                {formatCurrency(dashboard.summary.totalPnL)}
              </div>
              <div className="text-sm text-yellow-700">Total P&L</div>
              <div className="text-xs text-yellow-600 mt-1">
                {dashboard.summary.totalPositions} positions
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
              { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { id: 'orders', label: 'Orders', icon: CurrencyDollarIcon, count: orders.length },
              { id: 'algorithms', label: 'Algorithms', icon: BoltIcon, count: algorithms.length },
              { id: 'signals', label: 'Signals', icon: SignalIcon, count: signals.length }
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
          {selectedTab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              {/* Market Data */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(marketData).map(([symbol, data]) => (
                    <motion.div
                      key={symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{symbol}</h4>
                        <span className={`text-sm font-medium ${
                          data.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.changePercent24h >= 0 ? '+' : ''}{data.changePercent24h.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(data.price)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Vol: {formatCurrency(data.volume24h)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {dashboard.recentOrders.slice(0, 5).map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          order.side === OrderSide.BUY ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {order.side === OrderSide.BUY ? (
                            <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.side.toUpperCase()} {order.pair.symbol}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.quantity} @ {order.price || 'Market'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Active Algorithms */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Algorithms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboard.activeAlgorithms.map((algorithm, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {algorithm.type.toUpperCase()}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getAlgorithmStatusColor(algorithm.status)}`}>
                          {algorithm.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Orders:</span>
                          <span className="font-medium">{algorithm.performance.totalOrders}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">P&L:</span>
                          <span className={`font-medium ${
                            parseFloat(algorithm.performance.pnl) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(algorithm.performance.pnl)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Win Rate:</span>
                          <span className="font-medium">{algorithm.performance.winRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                <button
                  onClick={() => setShowCreateOrder(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New Order</span>
                </button>
              </div>

              <div className="space-y-3">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${
                            order.side === OrderSide.BUY ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {order.side === OrderSide.BUY ? (
                              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {order.side.toUpperCase()} {order.pair.symbol}
                              </h4>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {order.type.toUpperCase()}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded font-medium ${getOrderStatusColor(order.status)}`}>
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Quantity: {order.quantity} | Price: {order.price || 'Market'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Filled: {order.filled} | Remaining: {order.remaining}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {order.averagePrice ? formatCurrency(parseFloat(order.averagePrice) * parseFloat(order.filled)) : '-'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                          {[OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED].includes(order.status) && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600">Create your first advanced order to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'algorithms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Trading Algorithms</h3>
                <button
                  onClick={() => setShowCreateAlgorithm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <BoltIcon className="w-4 h-4" />
                  <span>New Algorithm</span>
                </button>
              </div>

              <div className="space-y-4">
                {algorithms.length > 0 ? (
                  algorithms.map((algorithm, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <BoltIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{algorithm.type.toUpperCase()}</h4>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${getAlgorithmStatusColor(algorithm.status)}`}>
                              {algorithm.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {algorithm.status === AlgorithmStatus.ACTIVE && (
                            <button
                              onClick={() => controlAlgorithm(index.toString(), 'pause')}
                              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg"
                            >
                              <PauseIcon className="w-4 h-4" />
                            </button>
                          )}
                          {algorithm.status === AlgorithmStatus.PAUSED && (
                            <button
                              onClick={() => controlAlgorithm(index.toString(), 'resume')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => controlAlgorithm(index.toString(), 'stop')}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          >
                            <StopIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{algorithm.performance.totalOrders}</div>
                          <div className="text-sm text-gray-600">Total Orders</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{algorithm.performance.winRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Win Rate</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className={`text-lg font-bold ${
                            parseFloat(algorithm.performance.pnl) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(algorithm.performance.pnl)}
                          </div>
                          <div className="text-sm text-gray-600">P&L</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(algorithm.performance.totalVolume)}
                          </div>
                          <div className="text-sm text-gray-600">Volume</div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Algorithms Running</h3>
                    <p className="text-gray-600">Create your first trading algorithm to automate your strategy.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'signals' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Trading Signals</h3>
              
              <div className="space-y-4">
                {signals.length > 0 ? (
                  signals.map((signal, index) => (
                    <motion.div
                      key={signal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            signal.side === OrderSide.BUY ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {signal.side === OrderSide.BUY ? (
                              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {signal.side.toUpperCase()} {signal.symbol}
                            </h4>
                            <div className="text-sm text-gray-600">
                              Strength: {signal.strength.toFixed(1)} | Confidence: {signal.confidence.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(signal.price)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {signal.timeframe}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {signal.indicators.map((indicator, indicatorIndex) => (
                          <div key={indicatorIndex} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{indicator.name}</span>
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                indicator.signal === 'bullish' ? 'text-green-600 bg-green-100' :
                                indicator.signal === 'bearish' ? 'text-red-600 bg-red-100' :
                                'text-gray-600 bg-gray-100'
                              }`}>
                                {indicator.signal.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Value: {indicator.value.toFixed(2)} | Weight: {(indicator.weight * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <SignalIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Signals Available</h3>
                    <p className="text-gray-600">Trading signals will appear here when market conditions are favorable.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Advanced Order</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trading Pair</label>
                  <select
                    value={orderForm.pair}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, pair: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Pair</option>
                    {tradingPairs.map(pair => (
                      <option key={pair.id} value={pair.id}>{pair.symbol}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                    <select
                      value={orderForm.type}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, type: e.target.value as OrderType }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={OrderType.MARKET}>Market</option>
                      <option value={OrderType.LIMIT}>Limit</option>
                      <option value={OrderType.STOP}>Stop</option>
                      <option value={OrderType.STOP_LIMIT}>Stop Limit</option>
                      <option value={OrderType.TRAILING_STOP}>Trailing Stop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Side</label>
                    <select
                      value={orderForm.side}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, side: e.target.value as OrderSide }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={OrderSide.BUY}>Buy</option>
                      <option value={OrderSide.SELL}>Sell</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.001"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>

                {[OrderType.LIMIT, OrderType.STOP_LIMIT].includes(orderForm.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                )}

                {[OrderType.STOP, OrderType.STOP_LIMIT].includes(orderForm.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stop Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={orderForm.stopPrice}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, stopPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                )}

                {orderForm.type === OrderType.TRAILING_STOP && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trailing Percent (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={orderForm.trailingPercent}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, trailingPercent: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5.0"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={orderForm.stopLossPercent}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, stopLossPercent: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={orderForm.takeProfitPercent}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, takeProfitPercent: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10.0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateOrder(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createOrder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Algorithm Modal */}
      <AnimatePresence>
        {showCreateAlgorithm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Trading Algorithm</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm Type</label>
                  <select
                    value={algorithmForm.type}
                    onChange={(e) => setAlgorithmForm(prev => ({ ...prev, type: e.target.value as AlgorithmType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={AlgorithmType.DCA}>Dollar Cost Averaging</option>
                    <option value={AlgorithmType.GRID}>Grid Trading</option>
                    <option value={AlgorithmType.TWAP}>TWAP</option>
                    <option value={AlgorithmType.MOMENTUM}>Momentum</option>
                    <option value={AlgorithmType.MEAN_REVERSION}>Mean Reversion</option>
                  </select>
                </div>

                {algorithmForm.type === AlgorithmType.DCA && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interval (seconds)</label>
                        <input
                          type="number"
                          value={algorithmForm.interval}
                          onChange={(e) => setAlgorithmForm(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                          type="number"
                          value={algorithmForm.amount}
                          onChange={(e) => setAlgorithmForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Orders</label>
                      <input
                        type="number"
                        value={algorithmForm.maxOrders}
                        onChange={(e) => setAlgorithmForm(prev => ({ ...prev, maxOrders: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </>
                )}

                {algorithmForm.type === AlgorithmType.GRID && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grid Levels</label>
                        <input
                          type="number"
                          value={algorithmForm.gridLevels}
                          onChange={(e) => setAlgorithmForm(prev => ({ ...prev, gridLevels: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grid Spacing (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={algorithmForm.gridSpacing}
                          onChange={(e) => setAlgorithmForm(prev => ({ ...prev, gridSpacing: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                      <input
                        type="number"
                        value={algorithmForm.basePrice}
                        onChange={(e) => setAlgorithmForm(prev => ({ ...prev, basePrice: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </>
                )}

                {algorithmForm.type === AlgorithmType.TWAP && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                      <input
                        type="number"
                        value={algorithmForm.duration}
                        onChange={(e) => setAlgorithmForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slices</label>
                      <input
                        type="number"
                        value={algorithmForm.slices}
                        onChange={(e) => setAlgorithmForm(prev => ({ ...prev, slices: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateAlgorithm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createAlgorithm}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Algorithm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}