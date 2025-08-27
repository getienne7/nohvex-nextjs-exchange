// Enhanced Price Alerts Types
export type AlertOperator = 'GT' | 'LT' | 'EQ'

export type AlertType = 
  | 'price_threshold'
  | 'price_change'
  | 'volume_spike'
  | 'market_cap_change'
  | 'volatility'

export type AlertFrequency = 'once' | 'recurring' | 'daily_max'

export type AlertStatus = 'active' | 'paused' | 'expired' | 'triggered'

export type NotificationMethod = 'browser' | 'email' | 'sms' | 'webhook'

export interface PriceAlert {
  id: string
  userId: string
  name?: string
  description?: string
  
  // Alert Configuration
  symbol: string
  type: AlertType
  operator: AlertOperator
  threshold: number
  percentage?: number // For percentage-based alerts
  
  // Status & Timing
  status: AlertStatus
  frequency: AlertFrequency
  cooldownMinutes: number
  maxTriggers?: number
  triggerCount: number
  
  // Notification Settings
  notificationMethods: NotificationMethod[]
  emailEnabled: boolean
  browserEnabled: boolean
  smsEnabled: boolean
  soundEnabled: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastTriggeredAt?: Date
  expiresAt?: Date
  
  // Metadata
  isActive: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags?: string[]
  notes?: string
}

export interface AlertCondition {
  type: AlertType
  operator: AlertOperator
  value: number
  timeframe?: string
}

export interface AlertTriggerData {
  alertId: string
  symbol: string
  currentPrice: number
  previousPrice?: number
  changeAmount?: number
  changePercentage?: number
  volume24h?: number
  marketCap?: number
  triggeredAt: number
  conditionMet: string
}

export interface AlertStats {
  totalAlerts: number
  activeAlerts: number
  triggeredToday: number
  triggeredThisWeek: number
  triggeredThisMonth: number
  averageResponseTime: number
  successRate: number
}

export interface AlertTemplate {
  id: string
  name: string
  description: string
  category: 'price' | 'volume' | 'volatility' | 'technical'
  conditions: AlertCondition[]
  defaultSettings: Partial<PriceAlert>
  isPopular: boolean
}

// Pre-defined alert templates
export const AlertTemplates: AlertTemplate[] = [
  {
    id: 'price_breakout',
    name: 'Price Breakout',
    description: 'Alert when price breaks above resistance level',
    category: 'price',
    conditions: [
      { type: 'price_threshold', operator: 'GT', value: 0 }
    ],
    defaultSettings: {
      frequency: 'once',
      cooldownMinutes: 60,
      priority: 'high',
      notificationMethods: ['browser', 'email']
    },
    isPopular: true
  },
  {
    id: 'price_drop',
    name: 'Price Drop Alert',
    description: 'Alert when price drops below support level',
    category: 'price',
    conditions: [
      { type: 'price_threshold', operator: 'LT', value: 0 }
    ],
    defaultSettings: {
      frequency: 'once',
      cooldownMinutes: 30,
      priority: 'high',
      notificationMethods: ['browser', 'email']
    },
    isPopular: true
  },
  {
    id: 'volume_spike',
    name: 'Volume Spike',
    description: 'Alert when trading volume increases significantly',
    category: 'volume',
    conditions: [
      { type: 'volume_spike', operator: 'GT', value: 150, timeframe: '1h' }
    ],
    defaultSettings: {
      frequency: 'daily_max',
      cooldownMinutes: 120,
      priority: 'medium',
      notificationMethods: ['browser']
    },
    isPopular: false
  },
  {
    id: 'high_volatility',
    name: 'High Volatility',
    description: 'Alert when price volatility exceeds threshold',
    category: 'volatility',
    conditions: [
      { type: 'volatility', operator: 'GT', value: 5, timeframe: '1h' }
    ],
    defaultSettings: {
      frequency: 'recurring',
      cooldownMinutes: 240,
      priority: 'medium',
      notificationMethods: ['browser']
    },
    isPopular: false
  }
]

// Enhanced notification preferences for price alerts
export interface PriceAlertPreferences {
  emailEnabled: boolean
  browserEnabled: boolean
  smsEnabled: boolean
  soundEnabled: boolean
  
  // Advanced settings
  quietHours: {
    enabled: boolean
    startTime: string // HH:MM format
    endTime: string
  }
  
  // Notification limits
  maxNotificationsPerHour: number
  maxNotificationsPerDay: number
  
  // Email settings
  emailDigest: {
    enabled: boolean
    frequency: 'daily' | 'weekly'
    time: string // HH:MM format
  }
  
  // Priority filtering
  minimumPriority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Device preferences
  devicePreferences: {
    [deviceType: string]: NotificationMethod[]
  }
}

// Default preferences
export const DefaultPriceAlertPreferences: PriceAlertPreferences = {
  emailEnabled: true,
  browserEnabled: true,
  smsEnabled: false,
  soundEnabled: true,
  
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  },
  
  maxNotificationsPerHour: 10,
  maxNotificationsPerDay: 50,
  
  emailDigest: {
    enabled: true,
    frequency: 'daily',
    time: '09:00'
  },
  
  minimumPriority: 'low',
  
  devicePreferences: {
    desktop: ['browser', 'email'],
    mobile: ['browser', 'sms'],
    tablet: ['browser', 'email']
  }
}

// Alert validation rules
export interface AlertValidationRule {
  field: keyof PriceAlert
  rule: 'required' | 'min' | 'max' | 'range' | 'pattern'
  value?: any
  message: string
}

export const AlertValidationRules: AlertValidationRule[] = [
  {
    field: 'symbol',
    rule: 'required',
    message: 'Symbol is required'
  },
  {
    field: 'threshold',
    rule: 'min',
    value: 0,
    message: 'Threshold must be positive'
  },
  {
    field: 'cooldownMinutes',
    rule: 'range',
    value: [1, 10080], // 1 minute to 1 week
    message: 'Cooldown must be between 1 minute and 1 week'
  },
  {
    field: 'maxTriggers',
    rule: 'min',
    value: 1,
    message: 'Max triggers must be at least 1'
  }
]