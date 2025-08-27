/**
 * User Onboarding System
 * Manages user onboarding flow, progress tracking, and tutorial system
 */

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  isRequired: boolean
  estimatedTime: number // in minutes
  prerequisites: string[]
  completed: boolean
}

export interface OnboardingFlow {
  id: string
  name: string
  description: string
  steps: OnboardingStep[]
  totalEstimatedTime: number
  completionPercentage: number
}

export interface UserProfile {
  experience: 'beginner' | 'intermediate' | 'advanced'
  primaryGoal: 'trading' | 'portfolio' | 'defi' | 'learning'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  interests: string[]
  investmentAmount: 'under_1k' | '1k_10k' | '10k_100k' | 'over_100k'
  timeCommitment: 'casual' | 'regular' | 'intensive'
}

export interface UserProgress {
  userId?: string
  walletAddress?: string
  currentFlow: string
  currentStep: string
  completedSteps: string[]
  skippedSteps: string[]
  startedAt: number
  lastActivity: number
  userProfile?: UserProfile
  preferences: {
    experience: 'beginner' | 'intermediate' | 'advanced'
    primaryUseCase: 'trading' | 'defi' | 'portfolio' | 'all'
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    skipTutorials: boolean
  }
  hasCompletedWelcome?: boolean
  completedTours: string[]
}

export interface TutorialHighlight {
  selector: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'input' | 'none'
}

export interface FeatureTutorial {
  id: string
  title: string
  description: string
  highlights: TutorialHighlight[]
  triggerElement?: string
  autoStart: boolean
  category: 'wallet' | 'trading' | 'defi' | 'portfolio' | 'analytics'
}

export class OnboardingManager {
  private static instance: OnboardingManager
  private userProgress: Map<string, UserProgress> = new Map()
  private onboardingFlows: Map<string, OnboardingFlow> = new Map()
  private featureTutorials: Map<string, FeatureTutorial> = new Map()
  
  static getInstance(): OnboardingManager {
    if (!OnboardingManager.instance) {
      OnboardingManager.instance = new OnboardingManager()
      OnboardingManager.instance.initializeDefaultFlows()
    }
    return OnboardingManager.instance
  }

  private initializeDefaultFlows(): void {
    // Beginner Onboarding Flow
    const beginnerFlow: OnboardingFlow = {
      id: 'beginner',
      name: 'Getting Started with NOHVEX',
      description: 'Complete introduction to DeFi portfolio management',
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to NOHVEX',
          description: 'Learn about our platform and what you can achieve',
          component: 'WelcomeStep',
          isRequired: true,
          estimatedTime: 2,
          prerequisites: [],
          completed: false
        },
        {
          id: 'wallet_setup',
          title: 'Connect Your Wallet',
          description: 'Set up your crypto wallet for secure access',
          component: 'WalletSetupStep',
          isRequired: true,
          estimatedTime: 5,
          prerequisites: ['welcome'],
          completed: false
        },
        {
          id: 'security_setup',
          title: 'Secure Your Account',
          description: 'Enable two-factor authentication and backup codes',
          component: 'SecuritySetupStep',
          isRequired: true,
          estimatedTime: 3,
          prerequisites: ['wallet_setup'],
          completed: false
        },
        {
          id: 'portfolio_intro',
          title: 'Your Portfolio Dashboard',
          description: 'Understand your portfolio overview and key metrics',
          component: 'PortfolioIntroStep',
          isRequired: false,
          estimatedTime: 4,
          prerequisites: ['security_setup'],
          completed: false
        },
        {
          id: 'first_transaction',
          title: 'Your First Transaction',
          description: 'Learn how to make swaps and track transactions',
          component: 'FirstTransactionStep',
          isRequired: false,
          estimatedTime: 6,
          prerequisites: ['portfolio_intro'],
          completed: false
        },
        {
          id: 'defi_basics',
          title: 'DeFi Fundamentals',
          description: 'Introduction to yield farming and liquidity provision',
          component: 'DeFiBasicsStep',
          isRequired: false,
          estimatedTime: 8,
          prerequisites: ['first_transaction'],
          completed: false
        }
      ],
      totalEstimatedTime: 28,
      completionPercentage: 0
    }

    // Advanced User Flow
    const advancedFlow: OnboardingFlow = {
      id: 'advanced',
      name: 'Advanced Features Tour',
      description: 'Quick tour of advanced DeFi and trading features',
      steps: [
        {
          id: 'advanced_welcome',
          title: 'Advanced Features Overview',
          description: 'Explore institutional-grade tools and analytics',
          component: 'AdvancedWelcomeStep',
          isRequired: true,
          estimatedTime: 2,
          prerequisites: [],
          completed: false
        },
        {
          id: 'analytics_tour',
          title: 'Portfolio Analytics',
          description: 'Deep dive into risk metrics and performance attribution',
          component: 'AnalyticsTourStep',
          isRequired: false,
          estimatedTime: 5,
          prerequisites: ['advanced_welcome'],
          completed: false
        },
        {
          id: 'trading_tools',
          title: 'Advanced Trading',
          description: 'Algorithmic trading, order management, and strategies',
          component: 'TradingToolsStep',
          isRequired: false,
          estimatedTime: 7,
          prerequisites: ['analytics_tour'],
          completed: false
        },
        {
          id: 'cross_chain',
          title: 'Cross-Chain Operations',
          description: 'Bridge aggregation and multi-chain yield optimization',
          component: 'CrossChainStep',
          isRequired: false,
          estimatedTime: 6,
          prerequisites: ['trading_tools'],
          completed: false
        }
      ],
      totalEstimatedTime: 20,
      completionPercentage: 0
    }

    this.onboardingFlows.set('beginner', beginnerFlow)
    this.onboardingFlows.set('advanced', advancedFlow)

    // Initialize feature tutorials
    this.initializeFeatureTutorials()
  }

  private initializeFeatureTutorials(): void {
    const walletTutorial: FeatureTutorial = {
      id: 'wallet_connection',
      title: 'Wallet Connection',
      description: 'Learn how to connect and manage your crypto wallets',
      category: 'wallet',
      autoStart: true,
      highlights: [
        {
          selector: '[data-tutorial="wallet-connect"]',
          title: 'Connect Wallet',
          content: 'Click here to connect your crypto wallet. We support MetaMask, WalletConnect, and more.',
          position: 'bottom',
          action: 'click'
        },
        {
          selector: '[data-tutorial="wallet-balance"]',
          title: 'Your Balance',
          content: 'View your total portfolio value and asset breakdown here.',
          position: 'left'
        },
        {
          selector: '[data-tutorial="network-switcher"]',
          title: 'Network Switcher',
          content: 'Switch between different blockchain networks to access various DeFi protocols.',
          position: 'bottom'
        }
      ]
    }

    const tradingTutorial: FeatureTutorial = {
      id: 'trading_basics',
      title: 'Trading Interface',
      description: 'Master the trading interface and execute your first swap',
      category: 'trading',
      autoStart: false,
      highlights: [
        {
          selector: '[data-tutorial="token-selector"]',
          title: 'Token Selection',
          content: 'Choose the tokens you want to swap. Search or browse from popular options.',
          position: 'right',
          action: 'click'
        },
        {
          selector: '[data-tutorial="amount-input"]',
          title: 'Amount Input',
          content: 'Enter the amount you want to swap. You can use percentages for quick selection.',
          position: 'top',
          action: 'input'
        },
        {
          selector: '[data-tutorial="slippage-settings"]',
          title: 'Slippage Settings',
          content: 'Adjust slippage tolerance to control price impact. Higher values may result in worse rates.',
          position: 'left'
        },
        {
          selector: '[data-tutorial="swap-button"]',
          title: 'Execute Swap',
          content: 'Review the transaction details and click to execute your swap.',
          position: 'top',
          action: 'click'
        }
      ]
    }

    const portfolioTutorial: FeatureTutorial = {
      id: 'portfolio_analytics',
      title: 'Portfolio Analytics',
      description: 'Understand your portfolio performance and risk metrics',
      category: 'portfolio',
      autoStart: false,
      highlights: [
        {
          selector: '[data-tutorial="portfolio-value"]',
          title: 'Total Portfolio Value',
          content: 'Your total portfolio value across all connected wallets and chains.',
          position: 'bottom'
        },
        {
          selector: '[data-tutorial="asset-allocation"]',
          title: 'Asset Allocation',
          content: 'See how your portfolio is distributed across different assets and protocols.',
          position: 'right'
        },
        {
          selector: '[data-tutorial="performance-chart"]',
          title: 'Performance Chart',
          content: 'Track your portfolio performance over time with detailed charts.',
          position: 'top'
        },
        {
          selector: '[data-tutorial="risk-metrics"]',
          title: 'Risk Metrics',
          content: 'Monitor your portfolio risk with metrics like volatility, Sharpe ratio, and VaR.',
          position: 'left'
        }
      ]
    }

    const defiTutorial: FeatureTutorial = {
      id: 'defi_basics',
      title: 'DeFi Fundamentals',
      description: 'Introduction to yield farming and liquidity provision',
      category: 'defi',
      autoStart: false,
      highlights: [
        {
          selector: '[data-tutorial="yield-farming"]',
          title: 'Yield Farming',
          content: 'Discover high-yield opportunities across different DeFi protocols.',
          position: 'bottom'
        },
        {
          selector: '[data-tutorial="liquidity-pools"]',
          title: 'Liquidity Pools',
          content: 'Provide liquidity to earn trading fees and additional rewards.',
          position: 'right'
        },
        {
          selector: '[data-tutorial="staking-rewards"]',
          title: 'Staking Rewards',
          content: 'Stake your assets to earn passive income with minimal risk.',
          position: 'top'
        }
      ]
    }

    const advancedTradingTutorial: FeatureTutorial = {
      id: 'advanced_trading',
      title: 'Advanced Trading Tools',
      description: 'Algorithmic trading, order management, and strategies',
      category: 'trading',
      autoStart: false,
      highlights: [
        {
          selector: '[data-tutorial="limit-orders"]',
          title: 'Limit Orders',
          content: 'Set limit orders to execute trades at your target prices.',
          position: 'bottom'
        },
        {
          selector: '[data-tutorial="stop-loss"]',
          title: 'Stop Loss Orders',
          content: 'Protect your investments with automated stop loss mechanisms.',
          position: 'right'
        },
        {
          selector: '[data-tutorial="trading-view"]',
          title: 'TradingView Integration',
          content: 'Use advanced charting tools for technical analysis.',
          position: 'top'
        }
      ]
    }

    const riskManagementTutorial: FeatureTutorial = {
      id: 'risk_management',
      title: 'Risk Management',
      description: 'Portfolio protection and risk monitoring tools',
      category: 'portfolio',
      autoStart: false,
      highlights: [
        {
          selector: '[data-tutorial="risk-dashboard"]',
          title: 'Risk Dashboard',
          content: 'Monitor your portfolio risk exposure in real-time.',
          position: 'bottom'
        },
        {
          selector: '[data-tutorial="diversification"]',
          title: 'Diversification Analysis',
          content: 'Analyze your portfolio diversification and concentration risks.',
          position: 'right'
        },
        {
          selector: '[data-tutorial="correlation-matrix"]',
          title: 'Asset Correlation',
          content: 'Understand how your assets move in relation to each other.',
          position: 'top'
        }
      ]
    }

    const yieldOptimizationTutorial: FeatureTutorial = {
      id: 'yield_optimization',
      title: 'Yield Optimization',
      description: 'Maximize your DeFi yields with automated strategies',
      category: 'defi',
      autoStart: false,
      highlights: [
        {
          selector: '[data-tutorial="yield-dashboard"]',
          title: 'Yield Dashboard',
          content: 'Track all your DeFi yields in one place.',
          position: 'bottom'
        },
        {
          selector: '[data-tutorial="auto-compound"]',
          title: 'Auto-Compounding',
          content: 'Automatically compound your yields for maximum returns.',
          position: 'right'
        },
        {
          selector: '[data-tutorial="yield-strategies"]',
          title: 'Strategy Optimizer',
          content: 'Compare different yield strategies and optimize your allocations.',
          position: 'top'
        }
      ]
    }

    this.featureTutorials.set('wallet_connection', walletTutorial)
    this.featureTutorials.set('trading_basics', tradingTutorial)
    this.featureTutorials.set('portfolio_analytics', portfolioTutorial)
    this.featureTutorials.set('defi_basics', defiTutorial)
    this.featureTutorials.set('advanced_trading', advancedTradingTutorial)
    this.featureTutorials.set('risk_management', riskManagementTutorial)
    this.featureTutorials.set('yield_optimization', yieldOptimizationTutorial)
  }

  /**
   * Start onboarding for a new user with enhanced profile
   */
  startOnboarding(
    userId: string, 
    experience: 'beginner' | 'intermediate' | 'advanced',
    primaryUseCase: 'trading' | 'defi' | 'portfolio' | 'all',
    userProfile?: UserProfile
  ): UserProgress {
    const flowId = experience === 'beginner' ? 'beginner' : 'advanced'
    const flow = this.onboardingFlows.get(flowId)
    
    if (!flow) {
      throw new Error(`Onboarding flow not found: ${flowId}`)
    }

    const progress: UserProgress = {
      userId,
      currentFlow: flowId,
      currentStep: flow.steps[0].id,
      completedSteps: [],
      skippedSteps: [],
      startedAt: Date.now(),
      lastActivity: Date.now(),
      userProfile,
      preferences: {
        experience,
        primaryUseCase,
        riskTolerance: userProfile?.riskTolerance || 'moderate',
        skipTutorials: false
      },
      hasCompletedWelcome: !!userProfile,
      completedTours: []
    }

    this.userProgress.set(userId, progress)
    return progress
  }

  /**
   * Get user's onboarding progress
   */
  getUserProgress(userId: string): UserProgress | null {
    return this.userProgress.get(userId) || null
  }

  /**
   * Mark a step as completed
   */
  completeStep(userId: string, stepId: string): boolean {
    const progress = this.userProgress.get(userId)
    if (!progress) return false

    const flow = this.onboardingFlows.get(progress.currentFlow)
    if (!flow) return false

    // Mark step as completed
    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId)
    }

    // Update step completion in flow
    const step = flow.steps.find(s => s.id === stepId)
    if (step) {
      step.completed = true
    }

    // Move to next step
    const currentStepIndex = flow.steps.findIndex(s => s.id === stepId)
    const nextStep = flow.steps[currentStepIndex + 1]
    if (nextStep) {
      progress.currentStep = nextStep.id
    }

    // Update completion percentage
    flow.completionPercentage = (progress.completedSteps.length / flow.steps.length) * 100

    progress.lastActivity = Date.now()
    this.userProgress.set(userId, progress)

    return true
  }

  /**
   * Skip a step
   */
  skipStep(userId: string, stepId: string): boolean {
    const progress = this.userProgress.get(userId)
    if (!progress) return false

    const flow = this.onboardingFlows.get(progress.currentFlow)
    if (!flow) return false

    const step = flow.steps.find(s => s.id === stepId)
    if (!step || step.isRequired) return false

    if (!progress.skippedSteps.includes(stepId)) {
      progress.skippedSteps.push(stepId)
    }

    // Move to next step
    const currentStepIndex = flow.steps.findIndex(s => s.id === stepId)
    const nextStep = flow.steps[currentStepIndex + 1]
    if (nextStep) {
      progress.currentStep = nextStep.id
    }

    progress.lastActivity = Date.now()
    this.userProgress.set(userId, progress)

    return true
  }

  /**
   * Get available onboarding flows
   */
  getAvailableFlows(): OnboardingFlow[] {
    return Array.from(this.onboardingFlows.values())
  }

  /**
   * Get current flow for user
   */
  getCurrentFlow(userId: string): OnboardingFlow | null {
    const progress = this.userProgress.get(userId)
    if (!progress) return null

    return this.onboardingFlows.get(progress.currentFlow) || null
  }

  /**
   * Get feature tutorial
   */
  getFeatureTutorial(tutorialId: string): FeatureTutorial | null {
    return this.featureTutorials.get(tutorialId) || null
  }

  /**
   * Get all tutorials for a category
   */
  getTutorialsByCategory(category: string): FeatureTutorial[] {
    return Array.from(this.featureTutorials.values())
      .filter(tutorial => tutorial.category === category)
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, preferences: Partial<UserProgress['preferences']>): boolean {
    const progress = this.userProgress.get(userId)
    if (!progress) return false

    progress.preferences = { ...progress.preferences, ...preferences }
    progress.lastActivity = Date.now()
    this.userProgress.set(userId, progress)

    return true
  }

  /**
   * Check if onboarding is complete
   */
  isOnboardingComplete(userId: string): boolean {
    const progress = this.userProgress.get(userId)
    if (!progress) return false

    const flow = this.onboardingFlows.get(progress.currentFlow)
    if (!flow) return false

    const requiredSteps = flow.steps.filter(step => step.isRequired)
    const completedRequiredSteps = requiredSteps.filter(step => 
      progress.completedSteps.includes(step.id)
    )

    return completedRequiredSteps.length === requiredSteps.length
  }

  /**
   * Get next recommended tutorial
   */
  getRecommendedTutorial(userId: string): FeatureTutorial | null {
    const progress = this.userProgress.get(userId)
    if (!progress) return null

    // Recommend based on primary use case
    switch (progress.preferences.primaryUseCase) {
      case 'trading':
        return this.featureTutorials.get('trading_basics') || null
      case 'portfolio':
        return this.featureTutorials.get('portfolio_analytics') || null
      case 'defi':
        return this.featureTutorials.get('yield_farming_basics') || null
      default:
        return this.featureTutorials.get('wallet_connection') || null
    }
  }

  /**
   * Complete welcome wizard with user profile
   */
  completeWelcomeWizard(userId: string, userProfile: UserProfile): boolean {
    const progress = this.userProgress.get(userId)
    if (!progress) {
      // Create new progress if none exists
      const newProgress = this.startOnboarding(
        userId,
        userProfile.experience,
        userProfile.primaryGoal === 'learning' ? 'portfolio' : userProfile.primaryGoal,
        userProfile
      )
      return true
    }

    // Update existing progress
    progress.userProfile = userProfile
    progress.hasCompletedWelcome = true
    progress.preferences.experience = userProfile.experience
    progress.preferences.riskTolerance = userProfile.riskTolerance
    progress.preferences.primaryUseCase = userProfile.primaryGoal === 'learning' ? 'portfolio' : userProfile.primaryGoal
    progress.lastActivity = Date.now()
    
    this.userProgress.set(userId, progress)
    return true
  }

  /**
   * Mark tutorial tour as completed
   */
  completeTour(userId: string, tourId: string): boolean {
    const progress = this.userProgress.get(userId)
    if (!progress) return false

    if (!progress.completedTours.includes(tourId)) {
      progress.completedTours.push(tourId)
    }

    progress.lastActivity = Date.now()
    this.userProgress.set(userId, progress)
    return true
  }

  /**
   * Get recommended tours based on user experience and completed tours
   */
  getRecommendedTours(userId: string): string[] {
    const progress = this.userProgress.get(userId)
    if (!progress) return []

    const { experience, primaryUseCase } = progress.preferences
    const { completedTours } = progress

    const allTours = [
      'wallet_connection',
      'trading_basics', 
      'portfolio_analytics',
      'defi_basics',
      'advanced_trading',
      'risk_management',
      'yield_optimization'
    ]

    // Filter based on experience level
    let recommendedTours = allTours.filter(tour => {
      if (experience === 'beginner') {
        return ['wallet_connection', 'trading_basics', 'portfolio_analytics'].includes(tour)
      } else if (experience === 'intermediate') {
        return !['advanced_trading', 'yield_optimization'].includes(tour)
      }
      return true // Advanced users get all tours
    })

    // Prioritize based on primary use case
    if (primaryUseCase === 'trading') {
      recommendedTours = ['trading_basics', 'advanced_trading', 'risk_management', ...recommendedTours.filter(t => !['trading_basics', 'advanced_trading', 'risk_management'].includes(t))]
    } else if (primaryUseCase === 'defi') {
      recommendedTours = ['defi_basics', 'yield_optimization', 'portfolio_analytics', ...recommendedTours.filter(t => !['defi_basics', 'yield_optimization', 'portfolio_analytics'].includes(t))]
    } else if (primaryUseCase === 'portfolio') {
      recommendedTours = ['portfolio_analytics', 'risk_management', 'wallet_connection', ...recommendedTours.filter(t => !['portfolio_analytics', 'risk_management', 'wallet_connection'].includes(t))]
    }

    // Remove already completed tours
    return recommendedTours.filter(tour => !completedTours.includes(tour))
  }

  /**
   * Check if user should see welcome wizard
   */
  shouldShowWelcomeWizard(userId: string): boolean {
    const progress = this.userProgress.get(userId)
    return !progress || !progress.hasCompletedWelcome
  }

  /**
   * Get user experience level for tour filtering
   */
  getUserExperience(userId: string): 'beginner' | 'intermediate' | 'advanced' {
    const progress = this.userProgress.get(userId)
    return progress?.preferences.experience || 'beginner'
  }

  /**
   * Get completed tours list
   */
  getCompletedTours(userId: string): string[] {
    const progress = this.userProgress.get(userId)
    return progress?.completedTours || []
  }

  /**
   * Reset user progress
   */
  resetProgress(userId: string): boolean {
    return this.userProgress.delete(userId)
  }
}

// Export global instance
export const onboardingManager = OnboardingManager.getInstance()