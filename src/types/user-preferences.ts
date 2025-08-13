// User Profile and Preferences Types
export interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  location?: string
  timezone?: string
  phone?: string
  avatar?: string
  verified: boolean
  memberSince: string
  lastLogin?: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  priceAlerts: boolean
  tradeConfirmations: boolean
  marketNews: boolean
  portfolioUpdates: boolean
  systemAnnouncements: boolean
  weeklyReports: boolean
}

export interface PrivacySettings {
  showPortfolio: boolean
  showTrades: boolean
  showProfile: boolean
  allowMessages: boolean
  allowFollowers: boolean
  shareAnalytics: boolean
}

export interface TradingPreferences {
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD'
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
  autoConfirmTrades: boolean
  slippageTolerance: number // percentage
  gasPreference: 'slow' | 'standard' | 'fast'
  favoriteTokens: string[]
  tradingPairs: string[]
  chartTimeframe: '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
  chartType: 'line' | 'candlestick' | 'area'
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
  trustedDevices: TrustedDevice[]
  loginHistory: LoginRecord[]
  apiKeys: ApiKey[]
}

export interface TrustedDevice {
  id: string
  name: string
  browser: string
  os: string
  location: string
  addedAt: string
  lastUsed: string
}

export interface LoginRecord {
  id: string
  ip: string
  location: string
  device: string
  timestamp: string
  success: boolean
}

export interface ApiKey {
  id: string
  name: string
  key: string // Should be masked in UI
  permissions: string[]
  lastUsed?: string
  expiresAt?: string
  isActive: boolean
  createdAt: string
}

export interface UserPreferences {
  profile: UserProfile
  notifications: NotificationPreferences
  privacy: PrivacySettings
  trading: TradingPreferences
  security: SecuritySettings
  appearance: {
    theme: 'dark' | 'light' | 'system'
    language: string
    currency: string
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
    timeFormat: '12h' | '24h'
    compactMode: boolean
  }
}

// API Response Types
export interface UpdateProfileRequest {
  name?: string
  bio?: string
  location?: string
  timezone?: string
  phone?: string
}

export interface UpdatePreferencesRequest {
  notifications?: Partial<NotificationPreferences>
  privacy?: Partial<PrivacySettings>
  trading?: Partial<TradingPreferences>
  appearance?: Partial<UserPreferences['appearance']>
}

// Form Validation
export interface ProfileFormErrors {
  name?: string
  bio?: string
  location?: string
  phone?: string
}

export interface PreferencesFormErrors {
  [key: string]: string
}
