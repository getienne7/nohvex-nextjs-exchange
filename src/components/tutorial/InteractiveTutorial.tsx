'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export interface TutorialStep {
  id: string
  title: string
  content: string
  target: string // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'input' | 'none'
  validation?: () => boolean
  skippable?: boolean
  autoNext?: boolean
  delay?: number
}

export interface InteractiveTutorialProps {
  isOpen: boolean
  onClose: () => void
  steps: TutorialStep[]
  title: string
  description?: string
  onComplete: () => void
  onStepChange?: (step: number) => void
}

export function InteractiveTutorial({
  isOpen,
  onClose,
  steps,
  title,
  description,
  onComplete,
  onStepChange
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isPlaying, setIsPlaying] = useState(true)
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && currentStep < steps.length) {
      highlightElement(steps[currentStep].target)
      onStepChange?.(currentStep)
    }
  }, [currentStep, isOpen, steps, onStepChange])

  useEffect(() => {
    if (isOpen && isPlaying && steps[currentStep]?.autoNext && steps[currentStep]?.delay) {
      const timer = setTimeout(() => {
        nextStep()
      }, steps[currentStep].delay)
      return () => clearTimeout(timer)
    }
  }, [currentStep, isPlaying, isOpen])

  const highlightElement = (selector: string) => {
    try {
      const element = document.querySelector(selector)
      if (element) {
        setHighlightedElement(element)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setHighlightedElement(null)
      }
    } catch (error) {
      console.warn('Tutorial: Could not find element:', selector)
      setHighlightedElement(null)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(prev => prev + 1)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    }
  }

  const completeTutorial = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    onComplete()
    onClose()
  }

  const skipTutorial = () => {
    onClose()
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const restartTutorial = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setIsPlaying(true)
  }

  const getTooltipPosition = () => {
    if (!highlightedElement || !tooltipRef.current) return {}

    const rect = highlightedElement.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const step = steps[currentStep]

    const positions = {
      top: {
        top: rect.top - tooltipRect.height - 20,
        left: rect.left + (rect.width - tooltipRect.width) / 2
      },
      bottom: {
        top: rect.bottom + 20,
        left: rect.left + (rect.width - tooltipRect.width) / 2
      },
      left: {
        top: rect.top + (rect.height - tooltipRect.height) / 2,
        left: rect.left - tooltipRect.width - 20
      },
      right: {
        top: rect.top + (rect.height - tooltipRect.height) / 2,
        left: rect.right + 20
      },
      center: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }

    return positions[step.position] || positions.center
  }

  const getSpotlightStyle = () => {
    if (!highlightedElement) return {}

    const rect = highlightedElement.getBoundingClientRect()
    const padding = 8

    return {
      clipPath: `polygon(0% 0%, 0% 100%, ${rect.left - padding}px 100%, ${rect.left - padding}px ${rect.top - padding}px, ${rect.right + padding}px ${rect.top - padding}px, ${rect.right + padding}px ${rect.bottom + padding}px, ${rect.left - padding}px ${rect.bottom + padding}px, ${rect.left - padding}px 100%, 100% 100%, 100% 0%)`
    }
  }

  if (!isOpen) return null

  const currentStepData = steps[currentStep]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Spotlight Overlay */}
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 transition-all duration-300"
          style={getSpotlightStyle()}
        />

        {/* Tutorial Tooltip */}
        {currentStepData && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md"
            style={getTooltipPosition()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{currentStepData.title}</h3>
                  <p className="text-sm text-gray-600">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-700 mb-4">{currentStepData.content}</p>

              {/* Action Indicator */}
              {currentStepData.action && currentStepData.action !== 'none' && (
                <div className="flex items-center space-x-2 text-sm text-blue-600 mb-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span>
                    {currentStepData.action === 'click' && 'Click the highlighted element'}
                    {currentStepData.action === 'hover' && 'Hover over the highlighted element'}
                    {currentStepData.action === 'input' && 'Enter text in the highlighted field'}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              {/* Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlayPause}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={restartTutorial}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Restart"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-2">
                {currentStepData.skippable && (
                  <button
                    onClick={skipTutorial}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm transition-colors"
                  >
                    Skip Tutorial
                  </button>
                )}
                
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span className="text-sm">Back</span>
                </button>

                <button
                  onClick={nextStep}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="text-sm">
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  </span>
                  {currentStep === steps.length - 1 ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step indicators */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tutorial Title */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}