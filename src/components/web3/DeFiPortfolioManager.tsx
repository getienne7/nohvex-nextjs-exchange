'use client'

import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  FireIcon, 
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { WalletAsset } from '@/lib/web3/wallet-connector'
import { yieldOptimizer, YieldOpportunity, PortfolioOptimization, YieldCategory } from '@/lib/web3/yield-optimizer'
import { assetScanner } from '@/lib/web3/asset-scanner'

interface DeFiPortfolioManagerProps {
  walletAddress: string
  chainId: number
  assets: WalletAsset[]
}

export default function DeFiPortfolioManager({ walletAddress, chainId, assets }: DeFiPortfolioManagerProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [optimization, setOptimization] = useState<PortfolioOptimization | null>(null)
  const [topOpportunities, setTopOpportunities] = useState<YieldOpportunity[]>([])
  const [riskTolerance, setRiskTolerance] = useState(5)
  const [loading, setLoading] = useState(true)

  const tabs = [
    { name: 'Portfolio Optimization', icon: ArrowTrendingUpIcon },
    { name: 'Yield Opportunities', icon: FireIcon },
    { name: 'Risk Assessment', icon: ShieldCheckIcon },
    { name: 'Analytics', icon: ChartBarIcon }
  ]

  useEffect(() => {
    if (assets.length > 0) {
      loadPortfolioData()
    }
  }, [assets, chainId, riskTolerance])

  const loadPortfolioData = async () => {
    setLoading(true)
    try {
      const [portfolioOpt, opportunities] = await Promise.all([
        yieldOptimizer.optimizePortfolio(assets, chainId, riskTolerance),
        yieldOptimizer.getYieldOpportunities(chainId)
      ])
      
      setOptimization(portfolioOpt)
      setTopOpportunities(opportunities.slice(0, 10))
    } catch (error) {
      console.error('Failed to load portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`
  }

  const getRiskColor = (risk: number): string => {
    if (risk <= 3) return 'text-green-600 bg-green-100'
    if (risk <= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getCategoryIcon = (category: YieldCategory) => {
    switch (category) {
      case YieldCategory.LENDING:
        return <CurrencyDollarIcon className="h-5 w-5" />
      case YieldCategory.STAKING:
        return <ShieldCheckIcon className="h-5 w-5" />
      case YieldCategory.LIQUIDITY_MINING:
        return <ArrowTrendingUpIcon className="h-5 w-5" />
      default:
        return <FireIcon className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">DeFi Portfolio Manager</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Risk Tolerance:</label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value={1}>Very Conservative</option>
                <option value={3}>Conservative</option>
                <option value={5}>Moderate</option>
                <option value={7}>Aggressive</option>
                <option value={10}>Very Aggressive</option>
              </select>
            </div>
            <button
              onClick={loadPortfolioData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Portfolio Overview */}
        {optimization && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(optimization.currentYield)}
              </div>
              <div className="text-sm text-gray-600">Current Yield</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(optimization.optimizedYield)}
              </div>
              <div className="text-sm text-gray-600">Optimized Yield</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(optimization.potentialGain)}
              </div>
              <div className="text-sm text-gray-600">Potential Annual Gain</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {optimization.recommendations.length}
              </div>
              <div className="text-sm text-gray-600">Opportunities</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 bg-gray-100 p-1 m-6 rounded-lg">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-sm font-medium leading-5 rounded-md transition-all ${
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`
              }
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="p-6 pt-0">
          {/* Portfolio Optimization Tab */}
          <Tab.Panel>
            {optimization && optimization.recommendations.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Optimization Recommendations
                </h3>
                {optimization.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(rec.opportunity.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {rec.opportunity.protocol}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.opportunity.riskScore)}`}>
                              Risk: {rec.opportunity.riskScore}/10
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {rec.opportunity.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-600 font-medium">
                              APY: {formatPercentage(rec.opportunity.apy)}
                            </span>
                            <span className="text-gray-500">
                              TVL: {formatCurrency(rec.opportunity.tvl)}
                            </span>
                            <span className="text-blue-600">
                              Confidence: {formatPercentage(rec.confidence * 100)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(rec.suggestedAmount)}
                        </div>
                        <div className="text-sm text-green-600">
                          +{formatCurrency(rec.expectedReturn)}/year
                        </div>
                        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                          Deploy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Optimization Opportunities</h3>
                <p className="text-gray-600">
                  No suitable yield opportunities found for your current risk tolerance and assets.
                </p>
              </div>
            )}
          </Tab.Panel>

          {/* Yield Opportunities Tab */}
          <Tab.Panel>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Yield Opportunities
                </h3>
                <div className="flex space-x-2">
                  {Object.values(YieldCategory).map((category) => (
                    <button
                      key={category}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors capitalize"
                    >
                      {category.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topOpportunities.map((opp) => (
                  <div key={opp.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(opp.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{opp.protocol}</h4>
                          <p className="text-sm text-gray-600">{opp.asset}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opp.riskScore)}`}>
                        {opp.riskScore}/10
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {formatPercentage(opp.apy)}
                        </div>
                        <div className="text-xs text-gray-500">APY</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(opp.tvl)}
                        </div>
                        <div className="text-xs text-gray-500">TVL</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{opp.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Min: {formatCurrency(opp.requirements.minDeposit)}
                      </div>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tab.Panel>

          {/* Risk Assessment Tab */}
          <Tab.Panel>
            {optimization && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className={`text-3xl font-bold mb-2 ${getRiskColor(optimization.riskAssessment.overallRisk).split(' ')[0]}`}>
                      {optimization.riskAssessment.overallRisk.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-gray-600">Overall Risk</div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatPercentage(optimization.riskAssessment.diversificationScore * 100)}
                    </div>
                    <div className="text-sm text-gray-600">Diversification</div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className={`text-3xl font-bold mb-2 ${getRiskColor(optimization.riskAssessment.liquidityRisk).split(' ')[0]}`}>
                      {optimization.riskAssessment.liquidityRisk}/10
                    </div>
                    <div className="text-sm text-gray-600">Liquidity Risk</div>
                  </div>
                </div>
                
                {optimization.riskAssessment.recommendations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-2">Risk Recommendations</h4>
                        <ul className="space-y-1">
                          {optimization.riskAssessment.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-yellow-700">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Tab.Panel>

          {/* Analytics Tab */}
          <Tab.Panel>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Asset Allocation</h4>
                  <div className="space-y-3">
                    {assets.slice(0, 5).map((asset, index) => {
                      const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.balance) * (a.usdValue || 0)), 0)
                      const assetValue = parseFloat(asset.balance) * (asset.usdValue || 0)
                      const percentage = totalValue > 0 ? (assetValue / totalValue) * 100 : 0
                      
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium">{asset.symbol}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatPercentage(percentage)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Yield by Category</h4>
                  <div className="space-y-3">
                    {Object.values(YieldCategory).map((category) => {
                      const categoryOpps = topOpportunities.filter(opp => opp.category === category)
                      const avgYield = categoryOpps.length > 0 
                        ? categoryOpps.reduce((sum, opp) => sum + opp.apy, 0) / categoryOpps.length 
                        : 0
                      
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(category)}
                            <span className="text-sm font-medium capitalize">
                              {category.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatPercentage(avgYield)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}