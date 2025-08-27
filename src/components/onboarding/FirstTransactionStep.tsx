'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import { OnboardingStep, UserProgress } from '@/lib/onboarding'

interface FirstTransactionStepProps {
  step: OnboardingStep
  userProgress: UserProgress | null
  walletAddress?: string
  onComplete: () => void
  onSkip: () => void
}

export default function FirstTransactionStep({
  step,
  userProgress,
  walletAddress,
  onComplete,
  onSkip
}: FirstTransactionStepProps) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ArrowsRightLeftIcon className="w-8 h-8 text-purple-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Your First Transaction
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Learn how to make swaps and track transactions safely
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-700">
            This step will guide you through making your first swap transaction and understanding 
            the transaction monitoring system.
          </p>
        </div>
        
        <button
          onClick={onComplete}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 mr-4"
        >
          Continue
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