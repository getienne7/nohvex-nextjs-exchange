'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserIcon,
  AcademicCapIcon,
  XMarkIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import OnboardingFlow from './OnboardingFlow'
import TutorialSystem, { useTutorial } from './TutorialSystem'
import { WelcomeWizard } from './onboarding/WelcomeWizard'
import { FeatureTourManager } from './onboarding/FeatureTourManager'
import { onboardingManager, UserProgress, UserProfile } from '@/lib/onboarding'

interface OnboardingTriggerProps {
  userId: string
  walletAddress?: string
  autoStart?: boolean
  showWelcome?: boolean
  userName?: string
}

export default function OnboardingTrigger({
  userId,
  walletAddress,
  autoStart = false,
  showWelcome = true,
  userName
}: OnboardingTriggerProps) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false)
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false)
  const [showFeatureTours, setShowFeatureTours] = useState(false)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)
  
  const { activeTutorial, isActive: isTutorialActive, startTutorial, stopTutorial } = useTutorial()

  useEffect(() => {
    checkUserProgress()
  }, [userId])

  useEffect(() => {
    if (autoStart && !hasSeenWelcome && showWelcome) {
      setShowWelcomePrompt(true)
      setHasSeenWelcome(true)
    }
  }, [autoStart, hasSeenWelcome, showWelcome])

  const checkUserProgress = () => {
    const progress = onboardingManager.getUserProgress(userId)
    setUserProgress(progress)
    
    // Show welcome wizard for new users who haven't completed it
    if (onboardingManager.shouldShowWelcomeWizard(userId) && showWelcome && !hasSeenWelcome) {
      setShowWelcomeWizard(true)
      setHasSeenWelcome(true)
    }
  }

  const handleStartOnboarding = () => {
    setShowWelcomePrompt(false)
    setShowOnboarding(true)
  }

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false)
    checkUserProgress() // Refresh progress after completion
  }

  const handleCloseOnboarding = () => {
    setShowOnboarding(false)
  }

  const handleDismissWelcome = () => {
    setShowWelcomePrompt(false)
  }

  const handleCompleteWelcomeWizard = (profile: UserProfile) => {
    onboardingManager.completeWelcomeWizard(userId, profile)
    setShowWelcomeWizard(false)
    checkUserProgress()
  }

  const handleCloseWelcomeWizard = () => {
    setShowWelcomeWizard(false)
  }

  const handleOpenFeatureTours = () => {
    setShowFeatureTours(true)
  }

  const handleCloseFeatureTours = () => {
    setShowFeatureTours(false)
  }

  const handleTourComplete = (tourId: string) => {
    onboardingManager.completeTour(userId, tourId)
    checkUserProgress()
  }

  const isOnboardingComplete = userProgress ? 
    onboardingManager.isOnboardingComplete(userId) : false

  const availableTutorials = [
    { id: 'wallet_connection', name: 'Wallet Setup', category: 'wallet' },
    { id: 'trading_basics', name: 'Trading Interface', category: 'trading' },
    { id: 'portfolio_analytics', name: 'Portfolio Analytics', category: 'portfolio' }
  ]

  return (
    <>
      {/* Welcome Prompt */}
      <AnimatePresence>
        {showWelcomePrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm z-50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <button
                onClick={handleDismissWelcome}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Dismiss welcome prompt"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to NOHVEX! 👋
            </h3>
            
            <p className="text-gray-600 text-sm mb-4">
              Get started with a quick tour to learn about portfolio management, 
              trading, and DeFi features.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleStartOnboarding}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
              >
                Start Tour
              </button>
              <button
                onClick={handleDismissWelcome}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Welcome Wizard */}
      <WelcomeWizard
        isOpen={showWelcomeWizard}
        onClose={handleCloseWelcomeWizard}
        onComplete={handleCompleteWelcomeWizard}
        userName={userName}
      />

      {/* Feature Tour Manager */}
      <FeatureTourManager
        isOpen={showFeatureTours}
        onClose={handleCloseFeatureTours}
        userExperience={onboardingManager.getUserExperience(userId)}
        completedTours={onboardingManager.getCompletedTours(userId)}
        onTourComplete={handleTourComplete}
      />

      {/* Onboarding Status & Quick Access */}
      {userProgress && !isOnboardingComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs z-40"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">Onboarding</div>
              <div className="text-xs text-gray-500">
                {Math.round((userProgress.completedSteps.length / 6) * 100)}% complete
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(userProgress.completedSteps.length / 6) * 100}%` }}
            />
          </div>
          
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            Continue Setup
          </button>
        </motion.div>
      )}

      {/* Enhanced Tutorial Quick Access */}
      {isOnboardingComplete && (
        <div className="fixed bottom-6 left-6 z-40">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Learning Center</span>
              </div>
              <button 
                onClick={handleOpenFeatureTours}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-2">
              {availableTutorials.map((tutorial) => (
                <button
                  key={tutorial.id}
                  onClick={() => startTutorial(tutorial.id)}
                  className="flex items-center space-x-2 w-full text-left px-2 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-50"
                >
                  <PlayCircleIcon className="w-4 h-4" />
                  <span>{tutorial.name}</span>
                </button>
              ))}
              
              <button
                onClick={handleOpenFeatureTours}
                className="flex items-center space-x-2 w-full text-left px-2 py-1.5 rounded text-sm text-blue-600 hover:bg-blue-50"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Feature Tours</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Flow Modal */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onComplete={handleCompleteOnboarding}
        userId={userId}
        walletAddress={walletAddress}
      />

      {/* Tutorial System */}
      <TutorialSystem
        isActive={isTutorialActive}
        tutorialId={activeTutorial || ''}
        onComplete={stopTutorial}
        onSkip={stopTutorial}
      />

      {/* Global styles for tutorial highlighting */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9999;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .tutorial-highlight::before {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border: 2px solid #3b82f6;
          border-radius: 12px;
          pointer-events: none;
          animation: tutorialPulse 2s infinite;
        }
        
        @keyframes tutorialPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.02);
          }
        }
      `}</style>
    </>
  )
}

// Export additional components for use in other parts of the application
export { OnboardingFlow, TutorialSystem, useTutorial, WelcomeWizard, FeatureTourManager }