import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UpdatePreferencesRequest, NotificationPreferences, PrivacySettings, TradingPreferences } from '@/types/user-preferences'

// Default preferences
const defaultPreferences = {
  notifications: {
    email: true,
    push: false,
    sms: false,
    priceAlerts: true,
    tradeConfirmations: true,
    marketNews: false,
    portfolioUpdates: true,
    systemAnnouncements: true,
    weeklyReports: false
  } as NotificationPreferences,
  privacy: {
    showPortfolio: false,
    showTrades: true,
    showProfile: true,
    allowMessages: true,
    allowFollowers: false,
    shareAnalytics: false
  } as PrivacySettings,
  trading: {
    defaultCurrency: 'USD',
    riskLevel: 'moderate',
    autoConfirmTrades: false,
    slippageTolerance: 1.0,
    gasPreference: 'standard',
    favoriteTokens: ['BTC', 'ETH'],
    tradingPairs: ['BTC/USD', 'ETH/USD'],
    chartTimeframe: '1h',
    chartType: 'line'
  } as TradingPreferences,
  appearance: {
    theme: 'dark' as const,
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY' as const,
    timeFormat: '12h' as const,
    compactMode: false
  }
}

// GET /api/preferences - Get user preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In production, this would fetch from database
    // For now, return default preferences with user-specific overrides
    const preferences = {
      ...defaultPreferences,
      userId: session.user.email
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Preferences fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdatePreferencesRequest = await request.json()

    // Validate trading preferences
    const errors: Partial<Record<'slippageTolerance', string>> = {}
    
    if (body.trading?.slippageTolerance && (body.trading.slippageTolerance < 0.1 || body.trading.slippageTolerance > 50)) {
      errors.slippageTolerance = 'Slippage tolerance must be between 0.1% and 50%'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    // Merge with existing preferences
    const updatedPreferences = {
      ...defaultPreferences,
      ...body,
      userId: session.user.email
    }

    // In production, save to database
    return NextResponse.json({ 
      success: true, 
      preferences: updatedPreferences,
      message: 'Preferences updated successfully'
    })
  } catch (error) {
    console.error('Preferences update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
