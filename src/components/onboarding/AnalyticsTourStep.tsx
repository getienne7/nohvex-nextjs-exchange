'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { OnboardingStep, UserProgress } from '@/lib/onboarding'

interface AnalyticsTourStepProps {
  step: OnboardingStep
  userProgress: UserProgress | null
  walletAddress?: string
  onComplete: () => void
  onSkip: () => void
}

export default function AnalyticsTourStep({
  step,
  userProgress,
  walletAddress,
  onComplete,
  onSkip
}: AnalyticsTourStepProps) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChartBarIcon className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Portfolio Analytics
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Deep dive into risk metrics and performance attribution
        </p>
        
        <button
          onClick={onComplete}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Continue
        </button>
      </motion.div>
    </div>
  )
}