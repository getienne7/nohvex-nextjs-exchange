import { onboardingManager, UserProfile } from './onboarding'

export class EnhancedOnboardingService {
  private static instance: EnhancedOnboardingService

  static getInstance(): EnhancedOnboardingService {
    if (!this.instance) {
      this.instance = new EnhancedOnboardingService()
    }
    return this.instance
  }

  /**
   * Initialize enhanced onboarding for a user
   */
  initializeUserOnboarding(
    userId: string,
    experience: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    primaryUseCase: 'trading' | 'defi' | 'portfolio' | 'all' = 'portfolio'
  ) {
    return onboardingManager.startOnboarding(userId, experience, primaryUseCase)
  }

  /**
   * Complete the welcome wizard and update user profile
   */
  completeWelcomeWizard(userId: string, profile: UserProfile) {
    return onboardingManager.completeWelcomeWizard(userId, profile)
  }

  /**
   * Get user's onboarding progress with enhanced data
   */
  getUserProgress(userId: string) {
    return onboardingManager.getUserProgress(userId)
  }

  /**
   * Check if user should see the welcome wizard
   */
  shouldShowWelcomeWizard(userId: string): boolean {
    return onboardingManager.shouldShowWelcomeWizard(userId)
  }

  /**
   * Get user's experience level
   */
  getUserExperience(userId: string) {
    return onboardingManager.getUserExperience(userId)
  }

  /**
   * Get completed feature tours
   */
  getCompletedTours(userId: string): string[] {
    return onboardingManager.getCompletedTours(userId)
  }

  /**
   * Mark a feature tour as completed
   */
  completeTour(userId: string, tourId: string): boolean {
    return onboardingManager.completeTour(userId, tourId)
  }

  /**
   * Get recommended tours based on user profile
   */
  getRecommendedTours(userId: string): string[] {
    return onboardingManager.getRecommendedTours(userId)
  }

  /**
   * Get onboarding completion status
   */
  isOnboardingComplete(userId: string): boolean {
    return onboardingManager.isOnboardingComplete(userId)
  }

  /**
   * Reset user's onboarding progress
   */
  resetProgress(userId: string): boolean {
    return onboardingManager.resetProgress(userId)
  }
}

// Export singleton instance
export const enhancedOnboardingService = EnhancedOnboardingService.getInstance()