'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { OnboardingStep, UserProgress } from '@/lib/onboarding'

interface WelcomeStepProps {
  step: OnboardingStep
  userProgress: UserProgress | null
  walletAddress?: string
  onComplete: () => void
  onSkip: () => void
}

export default function WelcomeStep({
  step,
  userProgress,
  walletAddress,
  onComplete,
  onSkip
}: WelcomeStepProps) {
  const features = [
    {
      icon: <ChartBarIcon className="w-6 h-6" />,
      title: 'Portfolio Analytics',
      description: 'Track your crypto portfolio with advanced analytics and risk metrics'
    },
    {
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      title: 'Smart Trading',
      description: 'Execute swaps across multiple DEXs with optimal pricing and low fees'
    },
    {
      icon: <GlobeAltIcon className="w-6 h-6" />,
      title: 'Cross-Chain',
      description: 'Seamlessly manage assets across Ethereum, BSC, Polygon, and more'
    },
    {
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
      title: 'Yield Optimization',
      description: 'Discover and optimize yield farming opportunities across DeFi protocols'
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: 'Security First',
      description: 'Bank-grade security with 2FA, transaction monitoring, and alerts'
    },
    {
      icon: <SparklesIcon className="w-6 h-6" />,
      title: 'AI-Powered',
      description: 'Get intelligent insights and recommendations powered by machine learning'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SparklesIcon className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to NOHVEX
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          Your all-in-one DeFi portfolio management platform
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            What makes NOHVEX special?
          </h3>
          <p className="text-blue-700">
            We combine institutional-grade analytics with user-friendly design to help you 
            navigate the DeFi ecosystem safely and profitably. Whether you're a beginner 
            or an advanced user, NOHVEX provides the tools you need to succeed.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center"
      >
        <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
        <p className="text-blue-100 mb-6">
          We'll guide you through setting up your account, connecting your wallet, 
          and exploring the key features step by step.
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center text-blue-100">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            <span className="text-sm">Secure & Safe</span>
          </div>
          <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
          <div className="flex items-center text-blue-100">
            <SparklesIcon className="w-5 h-5 mr-2" />
            <span className="text-sm">Easy to Use</span>
          </div>
          <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
          <div className="flex items-center text-blue-100">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
            <span className="text-sm">Powerful Tools</span>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Estimated time:</span> {step.estimatedTime} minutes
          </div>
          <div>
            <span className="font-medium">Experience level:</span> {' '}
            <span className="capitalize">
              {userProgress?.preferences.experience || 'All levels'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}