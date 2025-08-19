'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  LightBulbIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  InformationCircleIcon,
  CpuChipIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { 
  MarketPrediction, 
  SentimentAnalysis, 
  AIRecommendation, 
  MarketRegime,
  AIInsight,
  PortfolioOptimization,
  PredictionTimeframe,
  RiskLevel,
  RecommendationType,
  InsightType
} from '@/lib/predictive-analytics'

interface PredictiveAnalyticsProps {
  walletAddress: string
}

interface AnalyticsDashboard {
  summary: {
    totalPredictions: number
    bullishPredictions: number
    bearishPredictions: number
    averageConfidence: number
    totalRecommendations: number
    highImpactInsights: number
    immediateInsights: number
    averageSentiment: number
    dominantRegime: string
  }
  recentPredictions: MarketPrediction[]
  topRecommendations: AIRecommendation[]
  criticalInsights: AIInsight[]
  sentimentOverview: { [asset: string]: SentimentAnalysis }
  marketRegimes: MarketRegime[]
}

interface PerformanceData {
  predictionAccuracy: {
    overall: number
    byTimeframe: { [key: string]: number }
    byAsset: { [key: string]: number }
  }
  recommendationPerformance: {
    totalRecommendations: number
    successfulRecommendations: number
    successRate: number
    averageReturn: number
    bestRecommendation: any
    worstRecommendation: any
  }
  sentimentAccuracy: {
    overall: number
    correlationWithPrice: number
    leadTime: string
  }
  aiInsightsImpact: {
    totalInsights: number
    actionableInsights: number
    averageImpact: number
    userEngagement: number
  }
}

export default function PredictiveAnalytics({ walletAddress }: PredictiveAnalyticsProps) {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null)
  const [predictions, setPredictions] = useState<MarketPrediction[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'predictions' | 'recommendations' | 'insights' | 'performance'>('dashboard')
  const [selectedAsset, setSelectedAsset] = useState('ETH')

  useEffect(() => {
    loadAnalyticsData()
  }, [walletAddress])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard
      const dashboardResponse = await fetch('/api/predictive-analytics?action=dashboard')
      const dashboardResult = await dashboardResponse.json()
      
      if (dashboardResult.success) {
        setDashboard(dashboardResult.dashboard)
      }
      
      // Load predictions for ETH
      const predictionsResponse = await fetch(`/api/predictive-analytics?action=predictions&asset=${selectedAsset}`)
      const predictionsResult = await predictionsResponse.json()
      
      if (predictionsResult.success) {
        setPredictions(predictionsResult.predictions)
      }
      
      // Load recommendations
      const recommendationsResponse = await fetch('/api/predictive-analytics?action=recommendations')
      const recommendationsResult = await recommendationsResponse.json()
      
      if (recommendationsResult.success) {
        setRecommendations(recommendationsResult.recommendations)
      }
      
      // Load insights
      const insightsResponse = await fetch('/api/predictive-analytics?action=insights')
      const insightsResult = await insightsResponse.json()
      
      if (insightsResult.success) {
        setInsights(insightsResult.insights)
      }
      
      // Load performance data
      const performanceResponse = await fetch('/api/predictive-analytics?action=performance')
      const performanceResult = await performanceResponse.json()
      
      if (performanceResult.success) {
        setPerformance(performanceResult.performance)
      }
      
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePredictions = async () => {
    try {
      const response = await fetch('/api/predictive-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-predictions',
          assets: ['ETH', 'BTC', 'BNB']
        })
      })

      const result = await response.json()
      
      if (result.success) {
        loadAnalyticsData()
        alert('New predictions generated successfully!')
      } else {
        alert(`Failed to generate predictions: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to generate predictions:', error)
      alert('Failed to generate predictions')
    }
  }

  const generateRecommendations = async () => {
    try {
      const response = await fetch('/api/predictive-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-recommendations',
          walletAddress,
          riskTolerance: RiskLevel.MEDIUM
        })
      })

      const result = await response.json()
      
      if (result.success) {
        loadAnalyticsData()
        alert('New AI recommendations generated!')
      } else {
        alert(`Failed to generate recommendations: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      alert('Failed to generate recommendations')
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
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100)
  }

  const getPredictionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
      case 'bearish':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
      default:
        return <MinusIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 20) return 'text-green-600 bg-green-100'
    if (sentiment > -20) return 'text-gray-600 bg-gray-100'
    return 'text-red-600 bg-red-100'
  }

  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case InsightType.VOLUME_SPIKE:
        return <ChartBarIcon className="w-5 h-5" />
      case InsightType.SENTIMENT_SHIFT:
        return <EyeIcon className="w-5 h-5" />
      case InsightType.TECHNICAL_PATTERN:
        return <ChartPieIcon className="w-5 h-5" />
      default:
        return <LightBulbIcon className="w-5 h-5" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'text-red-600 bg-red-100'
      case 'short_term':
        return 'text-yellow-600 bg-yellow-100'
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
            <CpuChipIcon className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics & AI</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={generatePredictions}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Generate Predictions</span>
            </button>
            <button
              onClick={generateRecommendations}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <CpuChipIcon className="w-4 h-4" />
              <span>AI Recommendations</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {dashboard.summary.totalPredictions}
              </div>
              <div className="text-sm text-blue-700">Active Predictions</div>
              <div className="text-xs text-blue-600 mt-1">
                {formatPercent(dashboard.summary.averageConfidence)} avg confidence
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {dashboard.summary.bullishPredictions}
              </div>
              <div className="text-sm text-green-700">Bullish Signals</div>
              <div className="text-xs text-green-600 mt-1">
                vs {dashboard.summary.bearishPredictions} bearish
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {dashboard.summary.totalRecommendations}
              </div>
              <div className="text-sm text-purple-700">AI Recommendations</div>
              <div className="text-xs text-purple-600 mt-1">
                {dashboard.summary.highImpactInsights} high impact
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">
                {dashboard.summary.dominantRegime}
              </div>
              <div className="text-sm text-yellow-700">Market Regime</div>
              <div className="text-xs text-yellow-600 mt-1">
                {dashboard.summary.immediateInsights} urgent insights
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
              { id: 'predictions', label: 'Predictions', icon: SparklesIcon, count: predictions.length },
              { id: 'recommendations', label: 'AI Recommendations', icon: CpuChipIcon, count: recommendations.length },
              { id: 'insights', label: 'Insights', icon: LightBulbIcon, count: insights.length },
              { id: 'performance', label: 'Performance', icon: ChartPieIcon }
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
          {selectedTab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              {/* Market Sentiment Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Sentiment Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(dashboard.sentimentOverview).map(([asset, sentiment]) => (
                    <motion.div
                      key={asset}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{asset}</h4>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getSentimentColor(sentiment.overallSentiment)}`}>
                          {sentiment.overallSentiment > 0 ? '+' : ''}{sentiment.overallSentiment.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Fear & Greed: {sentiment.fearGreedIndex.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Social Score: {sentiment.socialMetrics.trendingScore.toFixed(0)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Predictions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h3>
                <div className="space-y-3">
                  {dashboard.recentPredictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg">
                          {getPredictionIcon(prediction.direction)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {prediction.asset} - {prediction.direction.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(prediction.currentPrice)} → {formatCurrency(prediction.predictedPrice)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          prediction.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {prediction.priceChangePercent >= 0 ? '+' : ''}{prediction.priceChangePercent.toFixed(2)}%
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getConfidenceColor(prediction.confidence)}`}>
                          {formatPercent(prediction.confidence * 100)} confidence
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Top Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top AI Recommendations</h3>
                <div className="space-y-4">
                  {dashboard.topRecommendations.map((recommendation, index) => (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <CpuChipIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {recommendation.action.toUpperCase()} {recommendation.asset}
                            </h4>
                            <div className="text-sm text-gray-600">
                              {recommendation.type.replace('_', ' ').toUpperCase()} • {recommendation.timeHorizon}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                          {formatPercent(recommendation.confidence * 100)} confidence
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            +{recommendation.expectedReturn.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Expected Return</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-red-600">
                            -{recommendation.maxDrawdown.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Max Drawdown</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">
                            {recommendation.riskLevel.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600">Risk Level</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <strong>Key Reasoning:</strong> {recommendation.reasoning[0]}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Critical Insights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Insights</h3>
                <div className="space-y-3">
                  {dashboard.criticalInsights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-white rounded-lg">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${getUrgencyColor(insight.urgency)}`}>
                            {insight.urgency.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <div className="text-xs text-gray-500">
                          Assets: {insight.assets.join(', ')} • Confidence: {formatPercent(insight.confidence * 100)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'predictions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Market Predictions</h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="BNB">Binance Coin (BNB)</option>
                  </select>
                  <button
                    onClick={generatePredictions}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {predictions.length > 0 ? (
                  predictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            {getPredictionIcon(prediction.direction)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {prediction.asset} Price Prediction
                            </h4>
                            <div className="text-sm text-gray-600">
                              {prediction.timeframe} • {prediction.direction.toUpperCase()} Signal
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm px-3 py-1 rounded font-medium ${getConfidenceColor(prediction.confidence)}`}>
                          {formatPercent(prediction.confidence * 100)} Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(prediction.currentPrice)}
                          </div>
                          <div className="text-sm text-gray-600">Current Price</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(prediction.predictedPrice)}
                          </div>
                          <div className="text-sm text-gray-600">Predicted Price</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className={`text-xl font-bold ${
                            prediction.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {prediction.priceChangePercent >= 0 ? '+' : ''}{prediction.priceChangePercent.toFixed(2)}%
                          </div>
                          <div className="text-sm text-gray-600">Expected Change</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-xl font-bold text-gray-900">
                            {prediction.riskLevel.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600">Risk Level</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Key Factors</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {prediction.factors.slice(0, 4).map((factor, factorIndex) => (
                              <div key={factorIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="font-medium text-gray-900">{factor.name}</div>
                                  <div className="text-sm text-gray-600">{factor.description}</div>
                                </div>
                                <div className={`text-sm font-medium ${
                                  factor.impact >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {factor.impact >= 0 ? '+' : ''}{factor.impact.toFixed(1)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Technical Indicators</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {prediction.technicalIndicators.map((indicator, indicatorIndex) => (
                              <div key={indicatorIndex} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900">{indicator.name}</span>
                                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                                    indicator.signal === 'buy' ? 'text-green-600 bg-green-100' :
                                    indicator.signal === 'sell' ? 'text-red-600 bg-red-100' :
                                    'text-gray-600 bg-gray-100'
                                  }`}>
                                    {indicator.signal.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Value: {indicator.value.toFixed(2)} • Strength: {indicator.strength.toFixed(0)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Available</h3>
                    <p className="text-gray-600">Generate AI-powered market predictions to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                <button
                  onClick={generateRecommendations}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <CpuChipIcon className="w-4 h-4" />
                  <span>Generate New</span>
                </button>
              </div>

              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((recommendation, index) => (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <CpuChipIcon className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {recommendation.action.toUpperCase()} {recommendation.asset}
                            </h4>
                            <div className="text-sm text-gray-600">
                              {recommendation.type.replace('_', ' ').toUpperCase()} • {recommendation.timeHorizon}
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm px-3 py-1 rounded font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                          {formatPercent(recommendation.confidence * 100)} Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            +{recommendation.expectedReturn.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Expected Return</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-red-600">
                            -{recommendation.maxDrawdown.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Max Drawdown</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">
                            {recommendation.targetPrice ? formatCurrency(recommendation.targetPrice) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">Target Price</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">
                            {recommendation.riskLevel.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600">Risk Level</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">AI Reasoning</h5>
                          <ul className="space-y-1">
                            {recommendation.reasoning.map((reason, reasonIndex) => (
                              <li key={reasonIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Key Factors</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recommendation.factors.map((factor, factorIndex) => (
                              <div key={factorIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="font-medium text-gray-900">{factor.factor}</div>
                                  <div className="text-sm text-gray-600">{factor.category.toUpperCase()}</div>
                                </div>
                                <div className={`text-sm font-medium ${
                                  factor.impact >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {factor.impact >= 0 ? '+' : ''}{factor.impact}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CpuChipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h3>
                    <p className="text-gray-600">Generate AI-powered trading recommendations based on your portfolio.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'insights' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Market Insights</h3>
              
              <div className="space-y-4">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              {insight.type.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            insight.impact === 'high' ? 'text-red-600 bg-red-100' :
                            insight.impact === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                            'text-green-600 bg-green-100'
                          }`}>
                            {insight.impact.toUpperCase()} IMPACT
                          </span>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${getUrgencyColor(insight.urgency)}`}>
                            {insight.urgency.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{insight.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Affected Assets</h5>
                          <div className="flex flex-wrap gap-2">
                            {insight.assets.map((asset, assetIndex) => (
                              <span key={assetIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                {asset}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Confidence Level</h5>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${insight.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPercent(insight.confidence * 100)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Recommended Actions</h5>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                              <ArrowUpIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
                    <p className="text-gray-600">AI insights will appear here when market anomalies are detected.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'performance' && performance && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">AI Performance Metrics</h3>
              
              {/* Prediction Accuracy */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Prediction Accuracy</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performance.predictionAccuracy.overall.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {performance.predictionAccuracy.byTimeframe['1d'].toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">1-Day Predictions</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {performance.predictionAccuracy.byAsset['ETH'].toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">ETH Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {performance.predictionAccuracy.byAsset['BTC'].toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">BTC Accuracy</div>
                  </div>
                </div>
              </div>

              {/* Recommendation Performance */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Recommendation Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performance.recommendationPerformance.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      +{performance.recommendationPerformance.averageReturn.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Average Return</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {performance.recommendationPerformance.totalRecommendations}
                    </div>
                    <div className="text-sm text-gray-600">Total Recommendations</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      +{performance.recommendationPerformance.bestRecommendation.return.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Best Return</div>
                  </div>
                </div>
              </div>

              {/* AI Insights Impact */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">AI Insights Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {performance.aiInsightsImpact.totalInsights}
                    </div>
                    <div className="text-sm text-gray-600">Total Insights</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performance.aiInsightsImpact.actionableInsights}
                    </div>
                    <div className="text-sm text-gray-600">Actionable</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {performance.aiInsightsImpact.averageImpact.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Average Impact</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {formatPercent(performance.aiInsightsImpact.userEngagement)}
                    </div>
                    <div className="text-sm text-gray-600">User Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Disclaimer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <InformationCircleIcon className="w-6 h-6 text-blue-600" />
          <span>AI & Predictive Analytics Disclaimer</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">AI Limitations</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• <strong>Not Financial Advice:</strong> AI predictions are for informational purposes only</li>
              <li>• <strong>Past Performance:</strong> Historical accuracy doesn't guarantee future results</li>
              <li>• <strong>Market Volatility:</strong> Crypto markets are highly unpredictable</li>
              <li>• <strong>Model Limitations:</strong> AI models may have biases or blind spots</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Best Practices</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• <strong>Diversify Sources:</strong> Use multiple analysis methods</li>
              <li>• <strong>Risk Management:</strong> Never invest more than you can afford to lose</li>
              <li>• <strong>Stay Updated:</strong> Monitor market conditions continuously</li>
              <li>• <strong>Human Judgment:</strong> Combine AI insights with your own research</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}