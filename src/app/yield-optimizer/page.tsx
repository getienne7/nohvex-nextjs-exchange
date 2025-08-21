'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowTrendingUpIcon,
  FireIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '@/contexts/WalletContext'
import { GlobalNavigation } from '@/components/GlobalNavigation'

interface YieldOpportunity {
  id: string
  protocol: string
  protocolLogo: string
  asset: string
  apy: number
  tvl: number
  riskScore: number
  category: string
  description: string
  requirements: {
    minDeposit: number
    lockPeriod?: number
    fees: {
      deposit: number
      withdrawal: number
      performance: number
    }
  }
  chainId: number
}

interface PortfolioData {
  walletAddress: string
  portfolio: {
    totalValue: number
    chains: Array<{
      chainId: number
      name: string
      symbol: string
      balance: string
      usdValue: number
      price: number
    }>
  }
}

interface OptimizationResult {
  currentYield: number
  optimizedYield: number
  potentialGain: number
  recommendations: Array<{
    opportunity: YieldOpportunity
    suggestedAmount: number
    expectedReturn: number
    confidence: number
  }>
  riskAssessment: {
    overallRisk: number
    diversificationScore: number
    liquidityRisk: number
    recommendations: string[]
  }
}

export default function YieldOptimizerPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([])
  const [riskTolerance, setRiskTolerance] = useState(5)
  const [selectedChain, setSelectedChain] = useState(1) // Ethereum
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)

  // Your real wallet address
  const { connectedWallet, manualAddress } = useWallet()
  const walletAddress = connectedWallet?.address || manualAddress

  const supportedChains = [
    { id: 1, name: 'Ethereum', symbol: 'ETH', icon: '⟠' },
    { id: 56, name: 'BNB Smart Chain', symbol: 'BNB', icon: '🟡' },
    { id: 137, name: 'Polygon', symbol: 'MATIC', icon: '🟣' },
    { id: 42161, name: 'Arbitrum', symbol: 'ETH', icon: '🔵' },
    { id: 10, name: 'Optimism', symbol: 'ETH', icon: '🔴' }
  ]

  const riskLevels = [
    { value: 1, label: 'Very Conservative', color: 'green' },
    { value: 3, label: 'Conservative', color: 'green' },
    { value: 5, label: 'Moderate', color: 'yellow' },
    { value: 7, label: 'Aggressive', color: 'orange' },
    { value: 10, label: 'Very Aggressive', color: 'red' }
  ]

  useEffect(() => {
    loadPortfolioData()
    loadYieldOpportunities()
  }, [selectedChain])

  const loadPortfolioData = async () => {
    if (!walletAddress) {
      setLoading(false)
      return
    }
    try {
      const response = await fetch(`/api/wallet-dashboard?address=${walletAddress}`)
      const result = await response.json()
      
      if (result.success) {
        setPortfolioData(result.data)
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadYieldOpportunities = async () => {
    try {
      // Mock yield opportunities since the API requires authentication
      const mockOpportunities: YieldOpportunity[] = [
        {
          id: 'aave-eth-1',
          protocol: 'Aave',
          protocolLogo: '/protocols/aave.svg',
          asset: 'ETH',
          apy: 2.8,
          tvl: 800000000,
          riskScore: 3,
          category: 'lending',
          description: 'Supply ETH to Aave lending pool for stable yield',
          requirements: {
            minDeposit: 0.01,
            fees: { deposit: 0, withdrawal: 0, performance: 0 }
          },
          chainId: 1
        },
        {
          id: 'lido-eth-1',
          protocol: 'Lido',
          protocolLogo: '/protocols/lido.svg',
          asset: 'ETH',
          apy: 5.2,
          tvl: 32000000000,
          riskScore: 2,
          category: 'liquid_staking',
          description: 'Stake ETH with Lido for stETH and earn staking rewards',
          requirements: {
            minDeposit: 0.001,
            fees: { deposit: 0, withdrawal: 0, performance: 10 }
          },
          chainId: 1
        },
        {
          id: 'uniswap-eth-usdc-1',
          protocol: 'Uniswap V3',
          protocolLogo: '/protocols/uniswap.svg',
          asset: 'ETH/USDC',
          apy: 12.5,
          tvl: 450000000,
          riskScore: 6,
          category: 'liquidity_mining',
          description: 'Provide liquidity to ETH/USDC 0.05% pool',
          requirements: {
            minDeposit: 100,
            fees: { deposit: 0, withdrawal: 0, performance: 0 }
          },
          chainId: 1
        },
        {
          id: 'compound-eth-1',
          protocol: 'Compound',
          protocolLogo: '/protocols/compound.svg',
          asset: 'ETH',
          apy: 3.2,
          tvl: 600000000,
          riskScore: 4,
          category: 'lending',
          description: 'Supply ETH to Compound for cETH and earn interest',
          requirements: {
            minDeposit: 0.01,
            fees: { deposit: 0, withdrawal: 0, performance: 0 }
          },
          chainId: 1
        },
        {
          id: 'pancakeswap-bnb-56',
          protocol: 'PancakeSwap',
          protocolLogo: '/protocols/pancakeswap.svg',
          asset: 'BNB',
          apy: 8.5,
          tvl: 200000000,
          riskScore: 5,
          category: 'yield_farming',
          description: 'Stake BNB in PancakeSwap farms for CAKE rewards',
          requirements: {
            minDeposit: 0.1,
            fees: { deposit: 0, withdrawal: 0.25, performance: 2 }
          },
          chainId: 56
        }
      ]

      const filteredOpportunities = mockOpportunities.filter(opp => 
        opp.chainId === selectedChain && opp.riskScore <= riskTolerance
      )
      
      setOpportunities(filteredOpportunities)
    } catch (error) {
      console.error('Failed to load yield opportunities:', error)
    }
  }

  const optimizePortfolio = async () => {
    if (!portfolioData) return

    setOptimizing(true)
    try {
      // Simulate portfolio optimization
      const relevantAssets = portfolioData.portfolio.chains.filter(chain => 
        chain.chainId === selectedChain && chain.usdValue > 10
      )

      if (relevantAssets.length === 0) {
        setOptimization({
          currentYield: 0,
          optimizedYield: 0,
          potentialGain: 0,
          recommendations: [],
          riskAssessment: {
            overallRisk: 1,
            diversificationScore: 0,
            liquidityRisk: 1,
            recommendations: ['No assets found on selected chain for optimization']
          }
        })
        return
      }

      const totalValue = relevantAssets.reduce((sum, asset) => sum + asset.usdValue, 0)
      const currentYield = 0 // Assuming idle assets earn 0%

      // Generate recommendations based on available opportunities
      const recommendations = opportunities.slice(0, 3).map(opp => {
        const suggestedAmount = Math.min(totalValue * 0.3, totalValue - opp.requirements.minDeposit)
        const expectedReturn = (suggestedAmount * opp.apy) / 100
        const confidence = opp.tvl > 1000000000 ? 0.9 : opp.tvl > 100000000 ? 0.7 : 0.5

        return {
          opportunity: opp,
          suggestedAmount: Math.max(suggestedAmount, 0),
          expectedReturn,
          confidence
        }
      }).filter(rec => rec.suggestedAmount > 0)

      const optimizedYield = recommendations.reduce((sum, rec) => sum + rec.expectedReturn, 0)
      const avgRisk = recommendations.length > 0 
        ? recommendations.reduce((sum, rec) => sum + rec.opportunity.riskScore, 0) / recommendations.length 
        : 1

      setOptimization({
        currentYield,
        optimizedYield,
        potentialGain: optimizedYield - currentYield,
        recommendations,
        riskAssessment: {
          overallRisk: avgRisk,
          diversificationScore: Math.min(recommendations.length / 3, 1),
          liquidityRisk: recommendations.some(rec => rec.opportunity.requirements.lockPeriod) ? 7 : 3,
          recommendations: [
            recommendations.length < 2 ? 'Consider diversifying across more protocols' : '',
            avgRisk > riskTolerance ? 'Some recommendations exceed your risk tolerance' : '',
            'Always do your own research before investing'
          ].filter(Boolean)
        }
      })

    } catch (error) {
      console.error('Portfolio optimization failed:', error)
    } finally {
      setOptimizing(false)
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return 'text-green-600 bg-green-100'
    if (risk <= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getProtocolIcon = (protocol: string) => {
    const icons: { [key: string]: string } = {
      'Aave': '🏦',
      'Lido': '🥩',
      'Uniswap V3': '🦄',
      'Compound': '🏛️',
      'PancakeSwap': '🥞',
      'Curve': '🌊'
    }
    return icons[protocol] || '💎'
  }

  if (loading) {
    return (
      <>
        <GlobalNavigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-700 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <GlobalNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <SparklesIcon className="w-12 h-12 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Intelligent Yield Optimizer</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Maximize your DeFi yields with AI-powered portfolio optimization using your real wallet data
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">
                Live data from wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Chain
                  </label>
                  <select
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(Number(e.target.value))}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {supportedChains.map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        {chain.icon} {chain.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Risk Tolerance
                  </label>
                  <select
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(Number(e.target.value))}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {riskLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label} ({level.value}/10)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={optimizePortfolio}
                disabled={optimizing}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {optimizing ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <SparklesIcon className="w-5 h-5" />
                )}
                <span>{optimizing ? 'Optimizing...' : 'Optimize Portfolio'}</span>
              </button>
            </div>
          </motion.div>

          {/* Portfolio Overview */}
          {portfolioData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center space-x-3 mb-2">
                  <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
                  <h3 className="font-semibold text-white">Total Portfolio</h3>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(portfolioData.portfolio.totalValue)}
                </div>
                <p className="text-green-400 text-sm">Across {portfolioData.portfolio.chains.length} chains</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <FireIcon className="w-8 h-8 text-orange-400" />
                  <h3 className="font-semibold text-white">Current Yield</h3>
                </div>
                <div className="text-2xl font-bold text-white">
                  {optimization ? formatPercentage(optimization.currentYield) : '0.00%'}
                </div>
                <p className="text-gray-400 text-sm">From idle assets</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <ArrowTrendingUpIcon className="w-8 h-8 text-blue-400" />
                  <h3 className="font-semibold text-white">Optimized Yield</h3>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {optimization ? formatPercentage((optimization.optimizedYield / portfolioData.portfolio.totalValue) * 100) : '-.-%'}
                </div>
                <p className="text-gray-400 text-sm">Potential APY</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <ChartBarIcon className="w-8 h-8 text-purple-400" />
                  <h3 className="font-semibold text-white">Annual Gain</h3>
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {optimization ? formatCurrency(optimization.potentialGain) : '$-.--'}
                </div>
                <p className="text-gray-400 text-sm">Potential increase</p>
              </div>
            </motion.div>
          )}

          {/* Yield Opportunities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <FireIcon className="w-6 h-6 text-orange-400" />
              <span>Available Yield Opportunities</span>
              <span className="text-xs bg-orange-600 px-2 py-1 rounded">
                {supportedChains.find(c => c.id === selectedChain)?.name}
              </span>
            </h2>

            {opportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map((opp, index) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-gray-700/30 rounded-lg p-6 hover:bg-gray-700/50 transition-colors border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getProtocolIcon(opp.protocol)}</div>
                        <div>
                          <h3 className="font-semibold text-white">{opp.protocol}</h3>
                          <p className="text-gray-400 text-sm">{opp.asset}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opp.riskScore)}`}>
                        Risk: {opp.riskScore}/10
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          {formatPercentage(opp.apy)}
                        </div>
                        <div className="text-xs text-gray-400">APY</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">
                          {formatCurrency(opp.tvl)}
                        </div>
                        <div className="text-xs text-gray-400">TVL</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4">{opp.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>Min: {formatCurrency(opp.requirements.minDeposit)}</span>
                      {opp.requirements.lockPeriod && (
                        <span>Lock: {opp.requirements.lockPeriod}d</span>
                      )}
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                      Learn More
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <InformationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Opportunities Found</h3>
                <p className="text-gray-400">
                  No yield opportunities match your current risk tolerance on {supportedChains.find(c => c.id === selectedChain)?.name}.
                  Try adjusting your risk tolerance or selecting a different chain.
                </p>
              </div>
            )}
          </motion.div>

          {/* Optimization Results */}
          {optimization && optimization.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <SparklesIcon className="w-6 h-6 text-yellow-400" />
                <span>AI Optimization Recommendations</span>
              </h2>

              <div className="space-y-6">
                {optimization.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-500/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getProtocolIcon(rec.opportunity.protocol)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              {rec.opportunity.protocol}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.opportunity.riskScore)}`}>
                              Risk: {rec.opportunity.riskScore}/10
                            </span>
                            <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                              {formatPercentage(rec.confidence * 100)} Confidence
                            </span>
                          </div>
                          <p className="text-gray-300 mb-3">{rec.opportunity.description}</p>
                          <div className="flex items-center space-x-6 text-sm">
                            <span className="text-green-400 font-medium">
                              APY: {formatPercentage(rec.opportunity.apy)}
                            </span>
                            <span className="text-blue-400">
                              TVL: {formatCurrency(rec.opportunity.tvl)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-1">
                          {formatCurrency(rec.suggestedAmount)}
                        </div>
                        <div className="text-green-400 font-medium mb-2">
                          +{formatCurrency(rec.expectedReturn)}/year
                        </div>
                        <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all">
                          Deploy Funds
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Risk Assessment */}
          {optimization && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                <span>Risk Assessment</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className={`text-3xl font-bold mb-2 ${getRiskColor(optimization.riskAssessment.overallRisk).split(' ')[0]}`}>
                    {optimization.riskAssessment.overallRisk.toFixed(1)}/10
                  </div>
                  <div className="text-gray-300">Overall Risk</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {formatPercentage(optimization.riskAssessment.diversificationScore * 100)}
                  </div>
                  <div className="text-gray-300">Diversification</div>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                  <div className={`text-3xl font-bold mb-2 ${getRiskColor(optimization.riskAssessment.liquidityRisk).split(' ')[0]}`}>
                    {optimization.riskAssessment.liquidityRisk}/10
                  </div>
                  <div className="text-gray-300">Liquidity Risk</div>
                </div>
              </div>

              {optimization.riskAssessment.recommendations.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-300 mb-2">Risk Recommendations</h4>
                      <ul className="space-y-1">
                        {optimization.riskAssessment.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-yellow-200">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-lg">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">
                This is a demonstration using real portfolio data. Always DYOR before investing in DeFi protocols.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}