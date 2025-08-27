'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  ClockIcon,
  PlayCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { 
  onboardingManager, 
  type OnboardingFlow as OnboardingFlowType, 
  type OnboardingStep, 
  type UserProgress 
} from '@/lib/onboarding'

// Simplified step components
const WelcomeStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Welcome to NOHVEX</h2>
    <p className="text-gray-600 mb-6">Your DeFi portfolio management platform</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Get Started
    </button>
  </div>
)

const WalletSetupStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
    <p className="text-gray-600 mb-6">Connect your crypto wallet to start managing your portfolio</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  </div>
)

const SecuritySetupStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Secure Your Account</h2>
    <p className="text-gray-600 mb-6">Enable two-factor authentication for enhanced security</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Enable 2FA
    </button>
  </div>
)

const PortfolioIntroStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Your Portfolio Dashboard</h2>
    <p className="text-gray-600 mb-6">Learn about your portfolio overview and analytics</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Explore Dashboard
    </button>
  </div>
)

const FirstTransactionStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Your First Transaction</h2>
    <p className="text-gray-600 mb-6">Learn how to make swaps and track transactions</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Make Transaction
    </button>
  </div>
)

const DeFiBasicsStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">DeFi Fundamentals</h2>
    <p className="text-gray-600 mb-6">Introduction to yield farming and liquidity provision</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Complete Onboarding
    </button>
  </div>
)

const AdvancedWelcomeStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Advanced Features</h2>
    <p className="text-gray-600 mb-6">Explore institutional-grade tools and analytics</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Continue
    </button>
  </div>
)

const AnalyticsTourStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Portfolio Analytics</h2>
    <p className="text-gray-600 mb-6">Deep dive into risk metrics and performance attribution</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Continue
    </button>
  </div>
)

const TradingToolsStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Advanced Trading</h2>
    <p className="text-gray-600 mb-6">Algorithmic trading, order management, and strategies</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Continue
    </button>
  </div>
)

const CrossChainStep = ({ onComplete }: any) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Cross-Chain Operations</h2>
    <p className="text-gray-600 mb-6">Bridge aggregation and multi-chain yield optimization</p>
    <button
      onClick={onComplete}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
    >
      Complete Tour
    </button>
  </div>
)

interface OnboardingFlowProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  walletAddress?: string
  onComplete: () => void
}

const STEP_COMPONENTS: { [key: string]: React.ComponentType<any> } = {
  WelcomeStep,
  WalletSetupStep,
  SecuritySetupStep,
  PortfolioIntroStep,
  FirstTransactionStep,
  DeFiBasicsStep,
  AdvancedWelcomeStep,
  AnalyticsTourStep,
  TradingToolsStep,
  CrossChainStep
}

export default function OnboardingFlow({
  isOpen,
  onClose,
  userId,
  walletAddress,
  onComplete
}: OnboardingFlowProps) {
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlowType | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showInitialSetup, setShowInitialSetup] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProgress()
    }
  }, [isOpen, userId])

  const loadUserProgress = () => {
    const progress = onboardingManager.getUserProgress(userId)
    if (progress) {
      setUserProgress(progress)
      const flow = onboardingManager.getCurrentFlow(userId)
      setCurrentFlow(flow)
      setShowInitialSetup(false)
      
      if (flow) {
        const stepIndex = flow.steps.findIndex(step => step.id === progress.currentStep)
        setCurrentStepIndex(Math.max(0, stepIndex))
      }
    } else {
      setShowInitialSetup(true)
    }
  }

  const startOnboarding = (
    experience: 'beginner' | 'intermediate' | 'advanced',
    primaryUseCase: 'trading' | 'defi' | 'portfolio' | 'all'
  ) => {
    setIsLoading(true)
    try {
      const progress = onboardingManager.startOnboarding(userId, experience, primaryUseCase)
      const flow = onboardingManager.getCurrentFlow(userId)
      
      setUserProgress(progress)
      setCurrentFlow(flow)
      setCurrentStepIndex(0)
      setShowInitialSetup(false)
    } catch (error) {
      console.error('Failed to start onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completeCurrentStep = () => {
    if (!currentFlow || !userProgress) return

    const currentStep = currentFlow.steps[currentStepIndex]
    if (currentStep) {
      onboardingManager.completeStep(userId, currentStep.id)
      
      // Reload progress to get updated data
      const updatedProgress = onboardingManager.getUserProgress(userId)
      const updatedFlow = onboardingManager.getCurrentFlow(userId)
      
      setUserProgress(updatedProgress)
      setCurrentFlow(updatedFlow)
      
      // Move to next step or complete onboarding
      if (currentStepIndex < currentFlow.steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1)
      } else {
        // Onboarding complete
        onComplete()
        onClose()
      }
    }
  }

  const skipCurrentStep = () => {
    if (!currentFlow || !userProgress) return

    const currentStep = currentFlow.steps[currentStepIndex]
    if (currentStep && !currentStep.isRequired) {
      onboardingManager.skipStep(userId, currentStep.id)
      
      // Move to next step
      if (currentStepIndex < currentFlow.steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1)
      } else {
        // Onboarding complete
        onComplete()
        onClose()
      }
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex)
  }

  const getStepIcon = (step: OnboardingStep, index: number) => {
    if (step.completed || (userProgress?.completedSteps.includes(step.id))) {
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />
    }
    
    if (index === currentStepIndex) {
      return <PlayCircleIcon className="w-6 h-6 text-blue-500" />
    }
    
    return (
      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
        <span className="text-sm text-gray-500">{index + 1}</span>
      </div>
    )
  }

  const currentStep = currentFlow?.steps[currentStepIndex]
  const StepComponent = currentStep ? STEP_COMPONENTS[currentStep.component] : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {showInitialSetup ? (
          <InitialSetupModal onStart={startOnboarding} onClose={onClose} isLoading={isLoading} />
        ) : (
          <div className="flex h-[80vh]">
            {/* Sidebar with steps */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentFlow?.name}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close onboarding"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {currentFlow?.totalEstimatedTime} min total
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${currentFlow?.completionPercentage || 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(currentFlow?.completionPercentage || 0)}% complete
                </div>
              </div>

              <div className="space-y-4">
                {currentFlow?.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentStepIndex
                        ? 'bg-blue-50 border border-blue-200'
                        : step.completed || userProgress?.completedSteps.includes(step.id)
                        ? 'bg-green-50'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => goToStep(index)}
                  >
                    {getStepIcon(step, index)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {step.estimatedTime} min
                      </div>
                      {!step.isRequired && (
                        <div className="text-xs text-blue-600 mt-1">Optional</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {StepComponent && (
                    <motion.div
                      key={currentStep?.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StepComponent
                        step={currentStep}
                        userProgress={userProgress}
                        walletAddress={walletAddress}
                        onComplete={completeCurrentStep}
                        onSkip={skipCurrentStep}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-3">
                    {currentStep && !currentStep.isRequired && (
                      <button
                        onClick={skipCurrentStep}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                      >
                        Skip
                      </button>
                    )}
                    
                    <button
                      onClick={completeCurrentStep}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      {currentStepIndex === (currentFlow?.steps.length || 1) - 1 ? 'Complete' : 'Next'}
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

interface InitialSetupModalProps {
  onStart: (experience: 'beginner' | 'intermediate' | 'advanced', primaryUseCase: 'trading' | 'defi' | 'portfolio' | 'all') => void
  onClose: () => void
  isLoading: boolean
}

function InitialSetupModal({ onStart, onClose, isLoading }: InitialSetupModalProps) {
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [primaryUseCase, setPrimaryUseCase] = useState<'trading' | 'defi' | 'portfolio' | 'all'>('portfolio')

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to NOHVEX</h2>
        <p className="text-lg text-gray-600">
          Let's personalize your onboarding experience to help you get the most out of our platform.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Experience Level */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's your experience with DeFi?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                value: 'beginner', 
                title: 'Beginner', 
                description: 'New to crypto and DeFi',
                icon: <UserIcon className="w-8 h-8" />
              },
              { 
                value: 'intermediate', 
                title: 'Intermediate', 
                description: 'Some DeFi experience',
                icon: <CogIcon className="w-8 h-8" />
              },
              { 
                value: 'advanced', 
                title: 'Advanced', 
                description: 'Experienced DeFi user',
                icon: <ShieldCheckIcon className="w-8 h-8" />
              }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setExperience(option.value as any)}
                className={`p-6 border-2 rounded-lg text-center transition-colors ${
                  experience === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-center mb-3 text-gray-600">
                  {option.icon}
                </div>
                <div className="font-semibold mb-2">{option.title}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Use Case */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What interests you most?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                value: 'portfolio', 
                title: 'Portfolio Management', 
                description: 'Track and analyze investments'
              },
              { 
                value: 'trading', 
                title: 'Trading', 
                description: 'Swap tokens and execute trades'
              },
              { 
                value: 'defi', 
                title: 'DeFi Protocols', 
                description: 'Yield farming and liquidity'
              },
              { 
                value: 'all', 
                title: 'Everything', 
                description: 'Full platform experience'
              }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setPrimaryUseCase(option.value as any)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  primaryUseCase === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold mb-2">{option.title}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-4 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Skip for now
          </button>
          <button
            onClick={() => onStart(experience, primaryUseCase)}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Starting...' : 'Start Onboarding'}
          </button>
        </div>
      </div>
    </div>
  )
}