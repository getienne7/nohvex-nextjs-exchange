'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  SparklesIcon,
  UserIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  AcademicCapIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  experience: 'beginner' | 'intermediate' | 'advanced'
  primaryGoal: 'trading' | 'portfolio' | 'defi' | 'learning'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  interests: string[]
  investmentAmount: 'under_1k' | '1k_10k' | '10k_100k' | 'over_100k'
  timeCommitment: 'casual' | 'regular' | 'intensive'
}

interface WelcomeWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (profile: UserProfile) => void
  userName?: string
}

export function WelcomeWizard({ isOpen, onClose, onComplete, userName }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({
    experience: 'beginner',
    primaryGoal: 'portfolio',
    riskTolerance: 'moderate',
    interests: [],
    investmentAmount: '1k_10k',
    timeCommitment: 'regular'
  })

  const steps = [
    { id: 'welcome', title: 'Welcome', component: WelcomeStepComponent },
    { id: 'experience', title: 'Experience', component: ExperienceStepComponent },
    { id: 'goals', title: 'Goals', component: GoalsStepComponent },
    { id: 'interests', title: 'Interests', component: InterestsStepComponent },
    { id: 'risk', title: 'Risk Profile', component: RiskStepComponent },
    { id: 'investment', title: 'Investment', component: InvestmentStepComponent },
    { id: 'summary', title: 'Summary', component: SummaryStepComponent }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete(profile)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  if (!isOpen) return null

  const CurrentStepComponent = steps[currentStep].component

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome to NOHVEX</h1>
                  <p className="text-blue-100">Let's personalize your experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      index < currentStep
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : index === currentStep
                        ? 'border-blue-600 text-blue-600'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            <CurrentStepComponent
              profile={profile}
              updateProfile={updateProfile}
              userName={userName}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip Setup
              </button>
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Step Components
function WelcomeStepComponent({ userName }: { userName?: string; profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <HeartIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {userName ? `Welcome, ${userName}!` : 'Welcome to NOHVEX!'}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We're excited to help you navigate the world of decentralized finance. 
          Let's take a few minutes to personalize your experience and help you achieve your financial goals.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
      >
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <ChartBarIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Portfolio Management</h3>
          <p className="text-gray-600 text-sm">Track and optimize your crypto investments</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <CurrencyDollarIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Smart Trading</h3>
          <p className="text-gray-600 text-sm">Execute trades with advanced tools</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 text-center">
          <GlobeAltIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">DeFi Access</h3>
          <p className="text-gray-600 text-sm">Explore yield farming and staking</p>
        </div>
      </motion.div>
    </div>
  )
}

function ExperienceStepComponent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  const experienceOptions = [
    {
      value: 'beginner',
      title: 'Beginner',
      description: 'New to crypto and DeFi',
      icon: <AcademicCapIcon className="w-8 h-8" />,
      features: ['Guided tutorials', 'Educational content', 'Simple interface']
    },
    {
      value: 'intermediate',
      title: 'Intermediate',
      description: 'Some crypto experience',
      icon: <CogIcon className="w-8 h-8" />,
      features: ['Advanced charts', 'Portfolio analytics', 'Trading tools']
    },
    {
      value: 'advanced',
      title: 'Advanced',
      description: 'Experienced trader/investor',
      icon: <BoltIcon className="w-8 h-8" />,
      features: ['Professional tools', 'API access', 'Advanced strategies']
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your experience level?</h2>
        <p className="text-gray-600">This helps us customize your interface and recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {experienceOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => updateProfile({ experience: option.value as UserProfile['experience'] })}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              profile.experience === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`${profile.experience === option.value ? 'text-blue-600' : 'text-gray-600'} mb-4`}>
              {option.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{option.description}</p>
            <ul className="space-y-1">
              {option.features.map((feature, index) => (
                <li key={index} className="flex items-center text-xs text-gray-500">
                  <CheckIcon className="w-3 h-3 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function GoalsStepComponent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  const goalOptions = [
    {
      value: 'portfolio',
      title: 'Portfolio Management',
      description: 'Track and optimize my investments',
      icon: <ChartBarIcon className="w-8 h-8" />,
      color: 'blue'
    },
    {
      value: 'trading',
      title: 'Active Trading',
      description: 'Execute frequent trades and strategies',
      icon: <ArrowTrendingUpIcon className="w-8 h-8" />,
      color: 'green'
    },
    {
      value: 'defi',
      title: 'DeFi Participation',
      description: 'Explore yield farming and staking',
      icon: <GlobeAltIcon className="w-8 h-8" />,
      color: 'purple'
    },
    {
      value: 'learning',
      title: 'Learning & Exploration',
      description: 'Understand crypto and DeFi better',
      icon: <AcademicCapIcon className="w-8 h-8" />,
      color: 'orange'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your primary goal?</h2>
        <p className="text-gray-600">We'll customize your dashboard based on your main objective</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => updateProfile({ primaryGoal: option.value as UserProfile['primaryGoal'] })}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              profile.primaryGoal === option.value
                ? `border-${option.color}-500 bg-${option.color}-50`
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`text-${option.color}-600 mb-4`}>
              {option.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-gray-600 text-sm">{option.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function InterestsStepComponent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  const interestOptions = [
    'Yield Farming', 'NFTs', 'GameFi', 'Staking', 'Cross-chain', 'Lending',
    'Options Trading', 'Technical Analysis', 'News & Research', 'Community'
  ]

  const toggleInterest = (interest: string) => {
    const newInterests = profile.interests.includes(interest)
      ? profile.interests.filter(i => i !== interest)
      : [...profile.interests, interest]
    updateProfile({ interests: newInterests })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What interests you most?</h2>
        <p className="text-gray-600">Select all that apply - we'll show relevant content and features</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {interestOptions.map((interest) => (
          <motion.button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              profile.interests.includes(interest)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm font-medium">{interest}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function RiskStepComponent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  const riskOptions = [
    {
      value: 'conservative',
      title: 'Conservative',
      description: 'Minimize risk, stable returns',
      color: 'green'
    },
    {
      value: 'moderate',
      title: 'Moderate',
      description: 'Balanced risk and return',
      color: 'yellow'
    },
    {
      value: 'aggressive',
      title: 'Aggressive',
      description: 'Higher risk for higher returns',
      color: 'red'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your risk tolerance?</h2>
        <p className="text-gray-600">This affects our investment suggestions and warnings</p>
      </div>

      <div className="space-y-4">
        {riskOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => updateProfile({ riskTolerance: option.value as UserProfile['riskTolerance'] })}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
              profile.riskTolerance === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full bg-${option.color}-500`} />
              <div>
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function InvestmentStepComponent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  const investmentOptions = [
    { value: 'under_1k', label: 'Under $1,000', description: 'Just getting started' },
    { value: '1k_10k', label: '$1,000 - $10,000', description: 'Building portfolio' },
    { value: '10k_100k', label: '$10,000 - $100,000', description: 'Serious investor' },
    { value: 'over_100k', label: 'Over $100,000', description: 'High net worth' }
  ]

  const timeOptions = [
    { value: 'casual', label: 'Casual', description: 'Few times a month' },
    { value: 'regular', label: 'Regular', description: 'Weekly check-ins' },
    { value: 'intensive', label: 'Intensive', description: 'Daily monitoring' }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment preferences</h2>
        <p className="text-gray-600">Help us understand your investment approach</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Typical investment amount</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {investmentOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateProfile({ investmentAmount: option.value as UserProfile['investmentAmount'] })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  profile.investmentAmount === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Time commitment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateProfile({ timeCommitment: option.value as UserProfile['timeCommitment'] })}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  profile.timeCommitment === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryStepComponent({ profile }: { profile: UserProfile; updateProfile: (updates: Partial<UserProfile>) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set! 🎉</h2>
        <p className="text-gray-600">Here's what we've learned about you</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Experience Level</h4>
            <p className="text-gray-600 capitalize">{profile.experience}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Primary Goal</h4>
            <p className="text-gray-600 capitalize">{profile.primaryGoal.replace('_', ' ')}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Risk Tolerance</h4>
            <p className="text-gray-600 capitalize">{profile.riskTolerance}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Time Commitment</h4>
            <p className="text-gray-600 capitalize">{profile.timeCommitment}</p>
          </div>
        </div>
        
        {profile.interests.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h4 className="font-medium text-green-800 mb-2">What's next?</h4>
        <ul className="space-y-2 text-green-700 text-sm">
          <li className="flex items-start space-x-2">
            <CheckIcon className="w-4 h-4 mt-0.5 text-green-600" />
            <span>Your dashboard will be customized based on your preferences</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckIcon className="w-4 h-4 mt-0.5 text-green-600" />
            <span>You'll receive personalized recommendations and tutorials</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckIcon className="w-4 h-4 mt-0.5 text-green-600" />
            <span>Connect your wallet to start managing your portfolio</span>
          </li>
        </ul>
      </div>
    </div>
  )
}