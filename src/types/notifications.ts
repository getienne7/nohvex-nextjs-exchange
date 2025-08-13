// Notification System Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type NotificationPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number // milliseconds, 0 = never auto-dismiss
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  timestamp: number
}

export interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
}

export interface NotificationProviderProps {
  children: React.ReactNode
  position?: NotificationPosition
  maxNotifications?: number
  defaultDuration?: number
}

// Preset notification configurations
export const NotificationPresets = {
  success: {
    type: 'success' as const,
    duration: 4000,
    dismissible: true,
  },
  error: {
    type: 'error' as const,
    duration: 6000,
    dismissible: true,
  },
  warning: {
    type: 'warning' as const,
    duration: 5000,
    dismissible: true,
  },
  info: {
    type: 'info' as const,
    duration: 4000,
    dismissible: true,
  },
  persistent: {
    duration: 0,
    dismissible: true,
  }
} as const

// Common notification messages
export const NotificationMessages = {
  // Profile & Settings
  PROFILE_UPDATED: {
    title: 'Profile Updated',
    message: 'Your profile has been successfully updated.',
    type: 'success' as const
  },
  PROFILE_UPDATE_ERROR: {
    title: 'Profile Update Failed',
    message: 'Unable to update your profile. Please try again.',
    type: 'error' as const
  },
  SETTINGS_SAVED: {
    title: 'Settings Saved',
    message: 'Your preferences have been successfully saved.',
    type: 'success' as const
  },
  
  // Trading
  TRADE_EXECUTED: {
    title: 'Trade Executed',
    message: 'Your trade has been successfully completed.',
    type: 'success' as const
  },
  TRADE_FAILED: {
    title: 'Trade Failed',
    message: 'Unable to execute trade. Please check your balance and try again.',
    type: 'error' as const
  },
  INSUFFICIENT_BALANCE: {
    title: 'Insufficient Balance',
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
