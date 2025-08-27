import { enhancedOnboardingService } from '@/lib/enhanced-onboarding-service'

describe('Enhanced Onboarding Service', () => {
  const mockUserId = 'test-user-123'

  beforeEach(() => {
    // Clear any existing onboarding progress
    enhancedOnboardingService.resetProgress(mockUserId)
  })

  test('initializes user onboarding', () => {
    const progress = enhancedOnboardingService.initializeUserOnboarding(mockUserId, 'intermediate', 'trading')
    
    expect(progress).toBeDefined()
    expect(progress.userId).toBe(mockUserId)
    expect(progress.currentFlow).toBe('advanced') // For intermediate users, we use advanced flow
    expect(progress.preferences.experience).toBe('intermediate')
    expect(progress.preferences.primaryUseCase).toBe('trading')
  })

  test('completes welcome wizard and updates profile', () => {
    const userProfile = {
      experience: 'beginner',
      primaryGoal: 'portfolio',
      riskTolerance: 'moderate',
      interests: ['defi', 'trading'],
      investmentAmount: '1k_10k',
      timeCommitment: 'regular'
    }

    // Initialize onboarding first
    enhancedOnboardingService.initializeUserOnboarding(mockUserId)
    
    // Complete welcome wizard
    const result = enhancedOnboardingService.completeWelcomeWizard(mockUserId, userProfile)
    
    expect(result).toBe(true)
    
    // Check that profile was saved
    const progress = enhancedOnboardingService.getUserProgress(mockUserId)
    expect(progress).not.toBeNull()
    expect(progress?.hasCompletedWelcome).toBe(true)
    expect(progress?.userProfile?.experience).toBe('beginner')
    expect(progress?.userProfile?.primaryGoal).toBe('portfolio')
  })

  test('tracks completed tours', () => {
    // Initialize and complete onboarding
    enhancedOnboardingService.initializeUserOnboarding(mockUserId)
    enhancedOnboardingService.completeWelcomeWizard(mockUserId, {
      experience: 'beginner',
      primaryGoal: 'portfolio',
      riskTolerance: 'moderate',
      interests: ['defi'],
      investmentAmount: '1k_10k',
      timeCommitment: 'regular'
    })
    
    // Complete a tour
    const result = enhancedOnboardingService.completeTour(mockUserId, 'wallet_connection')
    expect(result).toBe(true)
    
    // Check completed tours
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
    expect(recommendedTours.length).toBeGreaterThan(0)
    expect(recommendedTours).toContain('trading_basics')
  })

  test('checks if welcome wizard should be shown', () => {
    // New user should see welcome wizard
    expect(enhancedOnboardingService.shouldShowWelcomeWizard(mockUserId)).toBe(true)
    
    // After completing welcome wizard, should not show again
    enhancedOnboardingService.initializeUserOnboarding(mockUserId)
    enhancedOnboardingService.completeWelcomeWizard(mockUserId, {
      experience: 'beginner',
      primaryGoal: 'portfolio',
      riskTolerance: 'moderate',
      interests: ['defi'],
      investmentAmount: '1k_10k',
      timeCommitment: 'regular'
    })
    
    expect(enhancedOnboardingService.shouldShowWelcomeWizard(mockUserId)).toBe(false)
  })

  test('gets user experience level', () => {
    // Default experience level
    expect(enhancedOnboardingService.getUserExperience(mockUserId)).toBe('beginner')
    
    // After setting user profile
    enhancedOnboardingService.initializeUserOnboarding(mockUserId, 'advanced', 'defi')
    expect(enhancedOnboardingService.getUserExperience(mockUserId)).toBe('advanced')
  })

  test('checks onboarding completion status', () => {
    // New user should not be complete
    expect(enhancedOnboardingService.isOnboardingComplete(mockUserId)).toBe(false)
    
    // After initializing onboarding
    enhancedOnboardingService.initializeUserOnboarding(mockUserId)
    expect(enhancedOnboardingService.isOnboardingComplete(mockUserId)).toBe(false)
  })

  test('resets user progress', () => {
    // Set up user progress
    enhancedOnboardingService.initializeUserOnboarding(mockUserId)
    enhancedOnboardingService.completeWelcomeWizard(mockUserId, {
      experience: 'beginner',
      primaryGoal: 'portfolio',
      riskTolerance: 'moderate',
      interests: ['defi'],
      investmentAmount: '1k_10k',
      timeCommitment: 'regular'
    })
    
    // Verify progress exists
    let progress = enhancedOnboardingService.getUserProgress(mockUserId)
    expect(progress).not.toBeNull()
    
    // Reset progress
    const result = enhancedOnboardingService.resetProgress(mockUserId)
    expect(result).toBe(true)
    
    // Verify progress is cleared
    progress = enhancedOnboardingService.getUserProgress(mockUserId)
    expect(progress).toBeNull()
  })
})