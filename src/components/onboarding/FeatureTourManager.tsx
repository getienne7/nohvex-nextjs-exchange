'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  PlayIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { InteractiveTutorial, TutorialStep } from '../tutorial/InteractiveTutorial'

interface FeatureTour {
  id: string
  title: string
  description: string
  category: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  steps: TutorialStep[]
  prerequisites?: string[]
  isPopular?: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

interface FeatureTourManagerProps {
  isOpen: boolean
  onClose: () => void
  userExperience: 'beginner' | 'intermediate' | 'advanced'
  completedTours: string[]
  onTourComplete: (tourId: string) => void
}

export function FeatureTourManager({
  isOpen,
  onClose,
  userExperience,
  completedTours,
  onTourComplete
}: FeatureTourManagerProps) {
  const [selectedTour, setSelectedTour] = useState<FeatureTour | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [filter, setFilter] = useState<'all' | 'recommended' | 'beginner' | 'intermediate' | 'advanced'>('recommended')

  const tours: FeatureTour[] = [
    {
      id: 'portfolio_basics',
      title: 'Portfolio Dashboard',
      description: 'Learn to navigate your portfolio overview and understand key metrics',
      category: 'beginner',
      estimatedTime: 5,
      difficulty: 'easy',
      isPopular: true,
      steps: [
        {
          id: 'portfolio-value',
          title: 'Total Portfolio Value',
          content: 'This shows your total portfolio value across all connected wallets and networks. Click here to see a detailed breakdown.',
          target: '[data-tutorial="portfolio-value"]',
          position: 'bottom',
          action: 'click'
        },
        {
          id: 'asset-allocation',
          title: 'Asset Allocation',
          content: 'View how your portfolio is distributed across different cryptocurrencies and protocols. This helps you understand your diversification.',
          target: '[data-tutorial="asset-allocation"]',
          position: 'right'
        },
        {
          id: 'performance-chart',
          title: 'Performance Chart',
          content: 'Track your portfolio performance over time. You can adjust the time period and see detailed analytics.',
          target: '[data-tutorial="performance-chart"]',
          position: 'top'
        },
        {
          id: 'quick-actions',
          title: 'Quick Actions',
          content: 'Access common actions like trading, adding funds, or viewing detailed analytics from this panel.',
          target: '[data-tutorial="quick-actions"]',
          position: 'left'
        }
      ]
    },
    {
      id: 'wallet_connection',
      title: 'Wallet Connection',
      description: 'Connect your crypto wallet and understand multi-chain functionality',
      category: 'beginner',
      estimatedTime: 3,
      difficulty: 'easy',
      steps: [
        {
          id: 'wallet-connect',
          title: 'Connect Wallet',
          content: 'Click here to connect your crypto wallet. We support MetaMask, WalletConnect, and other popular wallets.',
          target: '[data-tutorial="wallet-connect"]',
          position: 'bottom',
          action: 'click'
        },
        {
          id: 'network-switcher',
          title: 'Network Switcher',
          content: 'Switch between different blockchain networks to access various DeFi protocols and manage assets.',
          target: '[data-tutorial="network-switcher"]',
          position: 'bottom'
        },
        {
          id: 'wallet-balance',
          title: 'Wallet Balance',
          content: 'View your wallet balance and transaction history. You can also manage multiple wallets from here.',
          target: '[data-tutorial="wallet-balance"]',
          position: 'left'
        }
      ]
    },
    {
      id: 'trading_basics',
      title: 'Trading Interface',
      description: 'Master the trading interface and execute your first swap',
      category: 'intermediate',
      estimatedTime: 8,
      difficulty: 'medium',
      isPopular: true,
      prerequisites: ['wallet_connection'],
      steps: [
        {
          id: 'token-selector',
          title: 'Token Selection',
          content: 'Choose the tokens you want to swap. Use the search function or browse popular tokens.',
          target: '[data-tutorial="token-selector"]',
          position: 'right',
          action: 'click'
        },
        {
          id: 'amount-input',
          title: 'Amount Input',
          content: 'Enter the amount you want to swap. You can use percentage buttons for quick selection.',
          target: '[data-tutorial="amount-input"]',
          position: 'top',
          action: 'input'
        },
        {
          id: 'price-impact',
          title: 'Price Impact',
          content: 'Monitor the price impact of your trade. High impact means you might get a worse price.',
          target: '[data-tutorial="price-impact"]',
          position: 'left'
        },
        {
          id: 'slippage-settings',
          title: 'Slippage Settings',
          content: 'Adjust slippage tolerance to control price changes during execution. Higher values allow more price movement.',
          target: '[data-tutorial="slippage-settings"]',
          position: 'left'
        },
        {
          id: 'swap-button',
          title: 'Execute Swap',
          content: 'Review all details and click to execute your swap. You\'ll need to confirm the transaction in your wallet.',
          target: '[data-tutorial="swap-button"]',
          position: 'top',
          action: 'click'
        }
      ]
    },
    {
      id: 'defi_strategies',
      title: 'DeFi Strategies',
      description: 'Explore yield farming, staking, and liquidity provision strategies',
      category: 'advanced',
      estimatedTime: 12,
      difficulty: 'hard',
      prerequisites: ['trading_basics'],
      steps: [
        {
          id: 'yield-opportunities',
          title: 'Yield Opportunities',
          content: 'Discover yield farming opportunities across different protocols. Compare APY, risks, and requirements.',
          target: '[data-tutorial="yield-opportunities"]',
          position: 'bottom'
        },
        {
          id: 'strategy-builder',
          title: 'Strategy Builder',
          content: 'Create custom DeFi strategies by combining different protocols and positions.',
          target: '[data-tutorial="strategy-builder"]',
          position: 'right'
        },
        {
          id: 'risk-assessment',
          title: 'Risk Assessment',
          content: 'Understand the risks associated with different DeFi strategies and how to manage them.',
          target: '[data-tutorial="risk-assessment"]',
          position: 'top'
        }
      ]
    },
    {
      id: 'analytics_deep_dive',
      title: 'Advanced Analytics',
      description: 'Deep dive into portfolio analytics, risk metrics, and performance attribution',
      category: 'advanced',
      estimatedTime: 10,
      difficulty: 'hard',
      prerequisites: ['portfolio_basics'],
      steps: [
        {
          id: 'risk-metrics',
          title: 'Risk Metrics',
          content: 'Understand your portfolio risk with metrics like VaR, Sharpe ratio, and volatility analysis.',
          target: '[data-tutorial="risk-metrics"]',
          position: 'left'
        },
        {
          id: 'performance-attribution',
          title: 'Performance Attribution',
          content: 'See which assets and strategies are contributing most to your portfolio performance.',
          target: '[data-tutorial="performance-attribution"]',
          position: 'bottom'
        },
        {
          id: 'correlation-analysis',
          title: 'Correlation Analysis',
          content: 'Analyze how your assets move in relation to each other and the broader market.',
          target: '[data-tutorial="correlation-analysis"]',
          position: 'top'
        }
      ]
    },
    {
      id: 'alerts_and_automation',
      title: 'Alerts & Automation',
      description: 'Set up price alerts, automated strategies, and notification preferences',
      category: 'intermediate',
      estimatedTime: 6,
      difficulty: 'medium',
      steps: [
        {
          id: 'price-alerts',
          title: 'Price Alerts',
          content: 'Set up custom price alerts to be notified when assets reach your target prices.',
          target: '[data-tutorial="price-alerts"]',
          position: 'bottom'
        },
        {
          id: 'automated-strategies',
          title: 'Automated Strategies',
          content: 'Create automated trading strategies like DCA, rebalancing, and stop-losses.',
          target: '[data-tutorial="automated-strategies"]',
          position: 'right'
        },
        {
          id: 'notification-settings',
          title: 'Notification Settings',
          content: 'Customize how and when you receive notifications about your portfolio and market events.',
          target: '[data-tutorial="notification-settings"]',
          position: 'left'
        }
      ]
    }
  ]

  const filteredTours = tours.filter(tour => {
    if (filter === 'all') return true
    if (filter === 'recommended') {
      return (
        tour.category === userExperience ||
        (userExperience === 'beginner' && tour.isPopular) ||
        !completedTours.includes(tour.id)
      )
    }
    return tour.category === filter
  })

  const startTour = (tour: FeatureTour) => {
    setSelectedTour(tour)
    setShowTutorial(true)
  }

  const completeTour = () => {
    if (selectedTour) {
      onTourComplete(selectedTour.id)
      setShowTutorial(false)
      setSelectedTour(null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'text-blue-600 bg-blue-100'
      case 'intermediate': return 'text-purple-600 bg-purple-100'
      case 'advanced': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Feature Tours</h1>
                  <p className="text-blue-100">Interactive guides to help you master NOHVEX</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">Filter by:</span>
                {[
                  { value: 'recommended', label: 'Recommended' },
                  { value: 'all', label: 'All Tours' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === option.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tours Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTours.map((tour) => {
                  const isCompleted = completedTours.includes(tour.id)
                  const canStart = !tour.prerequisites || 
                    tour.prerequisites.every(prereq => completedTours.includes(prereq))

                  return (
                    <motion.div
                      key={tour.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white border-2 rounded-xl p-6 transition-all ${
                        isCompleted
                          ? 'border-green-200 bg-green-50'
                          : canStart
                          ? 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      {/* Tour Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{tour.title}</h3>
                            {tour.isPopular && (
                              <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {isCompleted && (
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{tour.description}</p>
                        </div>
                      </div>

                      {/* Tour Metadata */}
                      <div className="flex items-center space-x-3 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tour.category)}`}>
                          {tour.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tour.difficulty)}`}>
                          {tour.difficulty}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {tour.estimatedTime} min
                        </span>
                      </div>

                      {/* Prerequisites */}
                      {tour.prerequisites && tour.prerequisites.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {tour.prerequisites.map((prereq) => {
                              const prereqCompleted = completedTours.includes(prereq)
                              const prereqTour = tours.find(t => t.id === prereq)
                              return (
                                <span
                                  key={prereq}
                                  className={`px-2 py-1 rounded text-xs ${
                                    prereqCompleted
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {prereqTour?.title || prereq}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {tour.steps.length} steps
                        </span>
                        
                        {isCompleted ? (
                          <button
                            onClick={() => startTour(tour)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span>Review</span>
                          </button>
                        ) : canStart ? (
                          <button
                            onClick={() => startTour(tour)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span>Start Tour</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>Prerequisites Required</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {filteredTours.length === 0 && (
                <div className="text-center py-12">
                  <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
                  <p className="text-gray-600">Try adjusting your filter to see more tours.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Interactive Tutorial */}
      {showTutorial && selectedTour && (
        <InteractiveTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          steps={selectedTour.steps}
          title={selectedTour.title}
          description={selectedTour.description}
          onComplete={completeTour}
        />
      )}
    </>
  )
}