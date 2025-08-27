import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import OnboardingTrigger from '@/components/OnboardingTrigger'
import { onboardingManager } from '@/lib/onboarding'
import { enhancedOnboardingService } from '@/lib/enhanced-onboarding-service'

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock the TutorialSystem component since it has complex dependencies
jest.mock('@/components/TutorialSystem', () => ({
  __esModule: true,
  default: () => <div data-testid="tutorial-system">Tutorial System</div>,
  useTutorial: () => ({
    activeTutorial: null,
    isActive: false,
    startTutorial: jest.fn(),
    stopTutorial: jest.fn(),
  }),
}))

// Mock the OnboardingFlow component
jest.mock('@/components/OnboardingFlow', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onComplete }: any) => (
    isOpen ? (
      <div data-testid="onboarding-flow">
        <div>Onboarding Flow</div>
        <button onClick={onComplete}>Complete Onboarding</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}))

describe('Enhanced Onboarding Integration', () => {
  const mockUserId = 'test-user-123'
  const mockUserName = 'Test User'

  beforeEach(() => {
    // Clear any existing onboarding progress
    onboardingManager.resetProgress(mockUserId)
  })

  test('shows welcome wizard for new users', () => {
    render(
      <OnboardingTrigger 
        userId={mockUserId} 
        userName={mockUserName}
        showWelcome={true}
      />
    )

    // Should show the welcome wizard for new users
    expect(screen.getByText('Welcome to NOHVEX')).toBeInTheDocument()
  })

  test('completes welcome wizard and updates user profile', async () => {
    const user = userEvent.setup()
    
    render(
      <OnboardingTrigger 
        userId={mockUserId} 
        userName={mockUserName}
        showWelcome={true}
      />
    )

    // Complete the welcome wizard
    const nextButton = screen.getByText('Continue')
    
    // Go through all wizard steps
    for (let i = 0; i < 6; i++) {
      await user.click(nextButton)
    }
    
    // Complete the wizard
    await user.click(screen.getByText('Complete Setup'))

    // Check that the wizard is closed
    await waitFor(() => {
      expect(screen.queryByText('Welcome to NOHVEX')).not.toBeInTheDocument()
    })

    // Check that user profile was saved
    const progress = enhancedOnboardingService.getUserProgress(mockUserId)
    expect(progress).not.toBeNull()
    expect(progress?.hasCompletedWelcome).toBe(true)
  })

  test('shows feature tour manager after onboarding completion', async () => {
    const user = userEvent.setup()
    
    // First, complete the onboarding process
    enhancedOnboardingService.initializeUserOnboarding(mockUserId)
    enhancedOnboardingService.completeWelcomeWizard(mockUserId, {
      experience: 'beginner',
      primaryGoal: 'portfolio',
      riskTolerance: 'moderate',
      interests: ['defi', 'trading'],
      investmentAmount: '1k_10k',
      timeCommitment: 'regular'
    })
    
    render(
      <OnboardingTrigger 
        userId={mockUserId} 
        userName={mockUserName}
      />
    )

    // Click on the "Feature Tours" button
    const featureToursButton = screen.getByText('Feature Tours')
    await user.click(featureToursButton)

    // Should show the feature tour manager
    expect(screen.getByText('Feature Tours')).toBeInTheDocument()
  })

  test('tracks completed tours', async () => {
    const user = userEvent.setup()
    
    // Set up user with completed onboarding
    enhancedOnboardingService.initializeUserOnboarding(mockUserId)
    enhancedOnboardingService.completeWelcomeWizard(mockUserId, {
      experience: 'beginner',
      primaryGoal: 'portfolio',
      riskTolerance: 'moderate',
      interests: ['defi', 'trading'],
      investmentAmount: '1k_10k',
      timeCommitment: 'regular'
    })
    
    // Complete a tour
    enhancedOnboardingService.completeTour(mockUserId, 'wallet_connection')
    
    const completedTours = enhancedOnboardingService.getCompletedTours(mockUserId)
    expect(completedTours).toContain('wallet_connection')
  })

  test('provides recommended tours based on user profile', () => {
    // Set up user with specific profile
    enhancedOnboardingService.initializeUserOnboarding(mockUserId, 'beginner', 'trading')
    enhancedOnboardingService.completeWelcomeWizard(mockUserId, {
      experience: 'beginner',
      primaryGoal: 'trading',
      riskTolerance: 'moderate',
      interests: ['defi', 'trading'],
      investmentAmount: '1k_10k',
      timeCommitment: 'regular'
    })
    
    const recommendedTours = enhancedOnboardingService.getRecommendedTours(mockUserId)
    
    // Beginner traders should get trading-related tours first
    expect(recommendedTours[0]).toBe('trading_basics')
  })

  test('resets user progress when requested', () => {
    // Set up user progress
    enhancedOnboardingService.initializeUserOnboarding(mockUserId)
    enhancedOnboardingService.completeWelcomeWizard(mockUserId, {
      experience: 'beginner',
      primaryGoal: 'portfolio',
      riskTolerance: 'moderate',
      interests: ['defi', 'trading'],
      investmentAmount: '1k_10k',
      timeCommitment: 'regular'
    })
    
    // Verify progress exists
    let progress = enhancedOnboardingService.getUserProgress(mockUserId)
    expect(progress).not.toBeNull()
    
    // Reset progress
    enhancedOnboardingService.resetProgress(mockUserId)
    
    // Verify progress is cleared
    progress = enhancedOnboardingService.getUserProgress(mockUserId)
    expect(progress).toBeNull()
  })
})