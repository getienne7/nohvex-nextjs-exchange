// Notification templates for different events in the application
export const NotificationTemplates = {
  // Profile & Settings
  PROFILE_UPDATED: {
    title: 'Profile Updated',
    message: 'Your profile has been successfully updated.',
    type: 'success' as const,
    category: 'general' as const
  },
  PROFILE_UPDATE_ERROR: {
    title: 'Profile Update Failed',
    message: 'Unable to update your profile. Please try again.',
    type: 'error' as const,
    category: 'general' as const
  },
  SETTINGS_SAVED: {
    title: 'Settings Saved',
    message: 'Your preferences have been successfully saved.',
    type: 'success' as const,
    category: 'general' as const
  },
  
  // Trading Messages
  TRADE_EXECUTED: {
    title: 'Trade Executed',
    message: 'Your trade has been successfully completed.',
    type: 'success' as const,
    category: 'trade' as const,
    priority: 'high' as const,
    soundEnabled: true
  },
  TRADE_FAILED: {
    title: 'Trade Failed',
    message: 'Unable to execute trade. Please check your balance and try again.',
    type: 'error' as const,
    category: 'trade' as const,
    priority: 'high' as const,
    soundEnabled: true
  },
  INSUFFICIENT_BALANCE: {
    title: 'Insufficient Balance',
    message: 'You do not have enough funds to complete this transaction.',
    type: 'warning' as const,
    category: 'trade' as const,
    priority: 'high' as const
  },
  
  // Portfolio Messages
  PORTFOLIO_REBALANCED: {
    title: 'Portfolio Rebalanced',
    message: 'Your portfolio has been automatically rebalanced according to your strategy.',
    type: 'success' as const,
    category: 'portfolio' as const,
    priority: 'normal' as const
  },
  PORTFOLIO_SYNC_ERROR: {
    title: 'Portfolio Sync Error',
    message: 'Unable to sync portfolio data. Retrying...',
    type: 'warning' as const,
    category: 'portfolio' as const
  },
  
  // Price Alert Messages
  PRICE_ALERT_TRIGGERED: {
    title: 'Price Alert Triggered',
    message: 'Your price alert condition has been met.',
    type: 'warning' as const,
    category: 'price-alert' as const,
    priority: 'high' as const,
    soundEnabled: true
  },
  PRICE_ALERT_CREATED: {
    title: 'Price Alert Created',
    message: 'Your price alert has been successfully set.',
    type: 'success' as const,
    category: 'price-alert' as const
  },
  
  // Security Messages
  LOGIN_SUCCESS: {
    title: 'Login Successful',
    message: 'Welcome back to NOHVEX!',
    type: 'success' as const,
    category: 'security' as const
  },
  SECURITY_ALERT: {
    title: 'Security Alert',
    message: 'Unusual activity detected on your account.',
    type: 'error' as const,
    category: 'security' as const,
    priority: 'urgent' as const,
    persistent: true,
    soundEnabled: true
  },
  TWO_FA_ENABLED: {
    title: '2FA Enabled',
    message: 'Two-factor authentication has been successfully enabled.',
    type: 'success' as const,
    category: 'security' as const,
    priority: 'high' as const
  },
  
  // System Messages
  MAINTENANCE_NOTICE: {
    title: 'Maintenance Notice',
    message: 'Scheduled maintenance will begin in 30 minutes.',
    type: 'warning' as const,
    category: 'system' as const,
    priority: 'high' as const,
    persistent: true
  },
  CONNECTION_RESTORED: {
    title: 'Connection Restored',
    message: 'Your connection to NOHVEX has been restored.',
    type: 'success' as const,
    category: 'system' as const
  },
  CONNECTION_LOST: {
    title: 'Connection Lost',
    message: 'Connection to NOHVEX has been lost. Attempting to reconnect...',
    type: 'error' as const,
    category: 'system' as const,
    priority: 'high' as const,
    persistent: true
  },
  
  // Network & API Messages
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Please check your internet connection and try again.',
    type: 'error' as const,
    category: 'system' as const
  },
  API_RATE_LIMIT: {
    title: 'Rate Limit Exceeded',
    message: 'Too many requests. Please wait a moment before trying again.',
    type: 'warning' as const,
    category: 'system' as const
  },
  
  // General Messages
  COPIED_TO_CLIPBOARD: {
    title: 'Copied!',
    message: 'Content has been copied to your clipboard.',
    type: 'success' as const,
    category: 'general' as const,
    duration: 2000
  },
  FEATURE_UNAVAILABLE: {
    title: 'Feature Unavailable',
    message: 'This feature is currently under development.',
    type: 'info' as const,
    category: 'general' as const
  }
} as const

// Notification presets for different types
export const NotificationPresets = {
  success: {
    type: 'success' as const,
    category: 'general' as const,
    priority: 'normal' as const,
    duration: 4000,
    dismissible: true,
    soundEnabled: false
  },
  error: {
    type: 'error' as const,
    category: 'general' as const,
    priority: 'high' as const,
    duration: 0, // Persistent until dismissed
    dismissible: true,
    soundEnabled: true
  },
  warning: {
    type: 'warning' as const,
    category: 'general' as const,
    priority: 'high' as const,
    duration: 6000,
    dismissible: true,
    soundEnabled: true
  },
  info: {
    type: 'info' as const,
    category: 'general' as const,
    priority: 'normal' as const,
    duration: 4000,
    dismissible: true,
    soundEnabled: false
  },
  persistent: {
    type: 'info' as const,
    category: 'general' as const,
    priority: 'normal' as const,
    duration: 0, // Persistent until dismissed
    dismissible: true,
    soundEnabled: false,
    persistent: true
  },
  urgent: {
    type: 'error' as const,
    category: 'system' as const,
    priority: 'urgent' as const,
    duration: 0, // Persistent until dismissed
    dismissible: true,
    soundEnabled: true,
    persistent: true
  },
  trade: {
    type: 'success' as const,
    category: 'trade' as const,
    priority: 'high' as const,
    duration: 5000,
    dismissible: true,
    soundEnabled: true
  },
  priceAlert: {
    type: 'warning' as const,
    category: 'price-alert' as const,
    priority: 'high' as const,
    duration: 8000,
    dismissible: true,
    soundEnabled: true
  },
  system: {
    type: 'info' as const,
    category: 'system' as const,
    priority: 'normal' as const,
    duration: 6000,
    dismissible: true,
    soundEnabled: false
  }
} as const

// Notification messages for quick notifications
export const NotificationMessages = {
  PROFILE_UPDATED: {
    ...NotificationTemplates.PROFILE_UPDATED
  },
  SETTINGS_SAVED: {
    ...NotificationTemplates.SETTINGS_SAVED
  },
  TRADE_EXECUTED: {
    ...NotificationTemplates.TRADE_EXECUTED
  },
  TRADE_FAILED: {
    ...NotificationTemplates.TRADE_FAILED
  },
  COPIED_TO_CLIPBOARD: {
    ...NotificationTemplates.COPIED_TO_CLIPBOARD
  },
  CONNECTION_LOST: {
    ...NotificationTemplates.CONNECTION_LOST
  },
  CONNECTION_RESTORED: {
    ...NotificationTemplates.CONNECTION_RESTORED
  }
} as const

// Notification sound types
export const NotificationSounds = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  info: '/sounds/info.mp3',
  urgent: '/sounds/urgent.mp3'
} as const

// Additional notification templates
export const AdditionalNotificationTemplates = {
  INSUFFICIENT_FUNDS: {
    title: 'Insufficient Funds',
    message: 'You do not have enough funds to complete this trade.',
    type: 'warning' as const
  },
  
  // Authentication
  LOGIN_SUCCESS: {
    title: 'Welcome Back',
    message: 'You have been successfully logged in.',
    type: 'success' as const
  },
  LOGOUT_SUCCESS: {
    title: 'Logged Out',
    message: 'You have been successfully logged out.',
    type: 'info' as const
  },
  AUTH_ERROR: {
    title: 'Authentication Error',
    message: 'Unable to authenticate. Please try again.',
    type: 'error' as const
  },
  
  // System
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Unable to connect to server. Please check your internet connection.',
    type: 'error' as const
  },
  LOADING: {
    title: 'Loading...',
    message: 'Please wait while we process your request.',
    type: 'info' as const
  },
  MAINTENANCE: {
    title: 'Scheduled Maintenance',
    message: 'System will be under maintenance from 2:00 AM - 4:00 AM UTC.',
    type: 'warning' as const
  }
} as const

export type NotificationTemplateKey = keyof typeof NotificationTemplates | keyof typeof AdditionalNotificationTemplates
export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationCategory = 'general' | 'trade' | 'portfolio' | 'price-alert' | 'security' | 'system'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationTemplate {
  title: string
  message: string
  type: NotificationType
  category?: NotificationCategory
  priority?: NotificationPriority
  soundEnabled?: boolean
  persistent?: boolean
  duration?: number
}

export interface NotificationMessage extends NotificationTemplate {
  id: string
  timestamp: Date
  read: boolean
}