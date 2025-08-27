'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CubeTransparentIcon } from '@heroicons/react/24/outline'
import { OnboardingStep, UserProgress } from '@/lib/onboarding'

interface DeFiBasicsStepProps {
  step: OnboardingStep
  userProgress: UserProgress | null
  walletAddress?: string
  onComplete: () => void
  onSkip: () => void
}

export default function DeFiBasicsStep({
  step,
  userProgress,
  walletAddress,
  onComplete,
  onSkip
}: DeFiBasicsStepProps) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CubeTransparentIcon className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          DeFi Fundamentals
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Introduction to yield farming and liquidity provision
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-green-700">
            Learn about decentralized finance protocols, yield farming strategies, 
            and how to provide liquidity to earn rewards.
          </p>
        </div>
        
        <button
          onClick={onComplete}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 mr-4"
        >
          Complete Onboarding
        </button>
        
        <button
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-800 px-4 py-3"
        >
          Skip
        </button>
      </motion.div>
    </div>
  )
}