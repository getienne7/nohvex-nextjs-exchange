'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { OnboardingStep, UserProgress } from '@/lib/onboarding'

interface PortfolioIntroStepProps {
  step: OnboardingStep
  userProgress: UserProgress | null
  walletAddress?: string
  onComplete: () => void
  onSkip: () => void
}

export default function PortfolioIntroStep({
  step,
  userProgress,
  walletAddress,
  onComplete,
  onSkip
}: PortfolioIntroStepProps) {
  const [currentTour, setCurrentTour] = useState(0)
  
  const tourSteps = [
    {
      title: 'Portfolio Overview',
      description: 'Your total portfolio value and key metrics at a glance',
      feature: 'total-value',
      icon: <CurrencyDollarIcon className="w-6 h-6" />
    },
    {
      title: 'Asset Allocation',
      description: 'See how your portfolio is distributed across different tokens and protocols',
      feature: 'allocation',
      icon: <ChartBarIcon className="w-6 h-6" />
    },
    {
      title: 'Performance Tracking',
      description: 'Monitor your portfolio performance with detailed charts and analytics',
      feature: 'performance',
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />
    },
    {
      title: 'Risk Management',
      description: 'Understand your portfolio risk and get intelligent recommendations',
      feature: 'risk',
      icon: <EyeIcon className="w-6 h-6" />
    },
    {
      title: 'Alerts & Notifications',
      description: 'Stay informed with price alerts and portfolio notifications',
      feature: 'alerts',
      icon: <BellIcon className="w-6 h-6" />
    }
  ]

  const mockPortfolioData = {
    totalValue: 24567.89,
    change24h: 345.67,
    changePercent: 1.42,
    assets: [
      { symbol: 'ETH', value: 12345.67, percentage: 50.2, change: 2.34 },
      { symbol: 'USDC', value: 5432.10, percentage: 22.1, change: 0.01 },
      { symbol: 'MATIC', value: 3456.78, percentage: 14.1, change: -1.23 },
      { symbol: 'AAVE', value: 2134.56, percentage: 8.7, change: 5.67 },
      { symbol: 'UNI', value: 1198.78, percentage: 4.9, change: -0.89 }
    ]
  }

  const nextStep = () => {
    if (currentTour < tourSteps.length - 1) {
      setCurrentTour(currentTour + 1)
    } else {
      onComplete()
    }
  }

  const previousStep = () => {
    if (currentTour > 0) {
      setCurrentTour(currentTour - 1)
    }
  }

  const currentStep = tourSteps[currentTour]

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChartBarIcon className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Your Portfolio Dashboard
        </h1>
        
        <p className="text-lg text-gray-600 mb-4">
          Let's explore your portfolio dashboard and learn about its key features
        </p>
        
        <div className="flex items-center justify-center space-x-2 mb-6">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentTour ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Demo */}
        <div className="lg:col-span-2">
          <motion.div
            key={currentTour}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            {currentStep.feature === 'total-value' && (
              <div className="space-y-6">
                <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${mockPortfolioData.totalValue.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">
                        +${mockPortfolioData.change24h.toFixed(2)} ({mockPortfolioData.changePercent}%)
                      </span>
                      <span className="text-gray-500 text-sm">24h</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">5</div>
                    <div className="text-sm text-gray-600">Assets</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">3</div>
                    <div className="text-sm text-gray-600">Chains</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">8</div>
                    <div className="text-sm text-gray-600">Protocols</div>
                  </div>
                </div>
              </div>
            )}

            {currentStep.feature === 'allocation' && (
              <div className="space-y-4">
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Asset Allocation</h3>
                  {mockPortfolioData.assets.map((asset, index) => (
                    <div key={asset.symbol} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{asset.symbol[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-sm text-gray-600">{asset.percentage}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${asset.value.toLocaleString()}</div>
                        <div className={`text-sm ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {asset.change >= 0 ? '+' : ''}{asset.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Portfolio Allocation Chart</span>
                </div>
              </div>
            )}

            {currentStep.feature === 'performance' && (
              <div className="space-y-4">
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Performance Analytics</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">30d Return</div>
                      <div className="text-lg font-semibold text-green-600">+12.4%</div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">Max Drawdown</div>
                      <div className="text-lg font-semibold text-red-600">-8.2%</div>
                    </div>
                  </div>
                </div>
                
                <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Performance Chart (30 days)</span>
                </div>
              </div>
            )}

            {currentStep.feature === 'risk' && (
              <div className="space-y-4">
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Risk Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Risk Score</span>
                      <span className="font-semibold text-yellow-600">Medium (6/10)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Volatility (30d)</span>
                      <span className="font-semibold">18.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sharpe Ratio</span>
                      <span className="font-semibold text-green-600">1.42</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Risk Recommendation</h4>
                  <p className="text-yellow-700 text-sm">
                    Consider diversifying into stablecoins to reduce overall portfolio volatility.
                  </p>
                </div>
              </div>
            )}

            {currentStep.feature === 'alerts' && (
              <div className="space-y-4">
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded">
                      <div className="flex items-center space-x-3">
                        <BellIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Price Alerts</div>
                          <div className="text-sm text-gray-600">ETH > $2,000</div>
                        </div>
                      </div>
                      <div className="text-green-600 text-sm">Active</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white rounded">
                      <div className="flex items-center space-x-3">
                        <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-medium">Portfolio Alerts</div>
                          <div className="text-sm text-gray-600">Daily loss > 5%</div>
                        </div>
                      </div>
                      <div className="text-green-600 text-sm">Active</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Smart Notifications</h4>
                  <p className="text-blue-700 text-sm">
                    Get intelligent alerts about market opportunities, risk changes, and portfolio rebalancing suggestions.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={previousStep}
              disabled={currentTour === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {currentTour === tourSteps.length - 1 ? 'Complete Tour' : 'Next'}
            </button>
          </div>
        </div>

        {/* Tour Guide */}
        <div className="lg:col-span-1">
          <motion.div
            key={currentTour}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              {currentStep.icon}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {currentStep.title}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {currentStep.description}
            </p>
            
            <div className="space-y-4">
              <div className="text-sm">
                <div className="text-gray-500 mb-2">Tour Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentTour + 1) / tourSteps.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Step {currentTour + 1} of {tourSteps.length}
                </div>
              </div>

              {currentTour === tourSteps.length - 1 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">🎉 Tour Complete!</h4>
                  <p className="text-green-700 text-sm">
                    You're now ready to explore your portfolio and start managing your DeFi investments.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}