'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { 
  onboardingManager, 
  FeatureTutorial, 
  TutorialHighlight 
} from '@/lib/onboarding'

interface TutorialSystemProps {
  isActive: boolean
  tutorialId: string
  onComplete: () => void
  onSkip: () => void
}

interface TutorialOverlayProps {
  highlight: TutorialHighlight
  isActive: boolean
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  currentStep: number
  totalSteps: number
}

function TutorialOverlay({
  highlight,
  isActive,
  onNext,
  onPrevious,
  onSkip,
  currentStep,
  totalSteps
}: TutorialOverlayProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    if (isActive && highlight.selector) {
      const element = document.querySelector(highlight.selector) as HTMLElement
      if (element) {
        setTargetElement(element)
        updatePosition(element)
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center', 
          inline: 'center' 
        })
        
        // Add highlight class
        element.classList.add('tutorial-highlight')
        
        return () => {
          element.classList.remove('tutorial-highlight')
        }
      }
    }
  }, [isActive, highlight.selector])

  const updatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    setPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    })
  }

  const getTooltipPosition = () => {
    const tooltipWidth = 320
    const tooltipHeight = 200
    const padding = 16
    
    switch (highlight.position) {
      case 'top':
        return {
          top: position.top - tooltipHeight - padding,
          left: position.left + (position.width / 2) - (tooltipWidth / 2)
        }
      case 'bottom':
        return {
          top: position.top + position.height + padding,
          left: position.left + (position.width / 2) - (tooltipWidth / 2)
        }
      case 'left':
        return {
          top: position.top + (position.height / 2) - (tooltipHeight / 2),
          left: position.left - tooltipWidth - padding
        }
      case 'right':
        return {
          top: position.top + (position.height / 2) - (tooltipHeight / 2),
          left: position.left + position.width + padding
        }
      default:
        return {
          top: position.top + position.height + padding,
          left: position.left + (position.width / 2) - (tooltipWidth / 2)
        }
    }
  }

  const tooltipPosition = getTooltipPosition()

  if (!isActive || !targetElement) return null

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" />
      
      {/* Highlight cutout */}
      <div
        className="fixed border-4 border-blue-500 rounded-lg z-[9999] pointer-events-none"
        style={{
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
        }}
      />
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[10000] bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm"
        style={{
          top: Math.max(16, Math.min(window.innerHeight - 216, tooltipPosition.top)),
          left: Math.max(16, Math.min(window.innerWidth - 336, tooltipPosition.left))
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {highlight.title}
          </h3>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close tutorial"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          {highlight.content}
        </p>
        
        {highlight.action && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <div className="flex items-center text-blue-700 text-sm">
              <InformationCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {highlight.action === 'click' && 'Try clicking on the highlighted element'}
                {highlight.action === 'hover' && 'Try hovering over the highlighted element'}
                {highlight.action === 'input' && 'Try typing in the highlighted field'}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {currentStep} of {totalSteps}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onPrevious}
              disabled={currentStep === 1}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back
            </button>
            
            <button
              onClick={onNext}
              className="flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              {currentStep === totalSteps ? 'Finish' : 'Next'}
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default function TutorialSystem({
  isActive,
  tutorialId,
  onComplete,
  onSkip
}: TutorialSystemProps) {
  const [tutorial, setTutorial] = useState<FeatureTutorial | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  
  useEffect(() => {
    if (isActive && tutorialId) {
      const tutorialData = onboardingManager.getFeatureTutorial(tutorialId)
      if (tutorialData) {
        setTutorial(tutorialData)
        setCurrentStep(0)
      }
    }
  }, [isActive, tutorialId])

  const handleNext = () => {
    if (!tutorial) return
    
    if (currentStep < tutorial.highlights.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isActive || !tutorial) return null

  const currentHighlight = tutorial.highlights[currentStep]

  return (
    <AnimatePresence>
      {currentHighlight && (
        <TutorialOverlay
          highlight={currentHighlight}
          isActive={isActive}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={onSkip}
          currentStep={currentStep + 1}
          totalSteps={tutorial.highlights.length}
        />
      )}
    </AnimatePresence>
  )
}

// Helper hook for managing tutorial state
export function useTutorial() {
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null)
  
  const startTutorial = (tutorialId: string) => {
    setActiveTutorial(tutorialId)
  }
  
  const stopTutorial = () => {
    setActiveTutorial(null)
  }
  
  return {
    activeTutorial,
    isActive: !!activeTutorial,
    startTutorial,
    stopTutorial
  }
}