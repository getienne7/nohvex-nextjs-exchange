'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { 
  Notification, 
  NotificationContextType, 
  NotificationProviderProps,
  NotificationPresets 
} from '@/types/notifications'

// Generate unique ID for notifications
const generateId = (): string => {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Notification reducer actions
type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }

interface NotificationState {
  notifications: Notification[]
}

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      }
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      }
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        )
      }
    
    default:
      return state
  }
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Provider component
export function NotificationProvider({
  children,
  position = 'top-right',
  maxNotifications = 5,
  defaultDuration = 4000,
  enableSounds = true,
  stackingBehavior = 'stack',
  globalPersistence = false
}: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: []
  })

  // Play notification sound
  const playNotificationSound = useCallback((type: string, soundEnabled?: boolean) => {
    if (!enableSounds || !soundEnabled) return
    
    try {
      // Create audio element for notification sound
      const audio = new Audio(`/sounds/notification-${type}.mp3`)
      audio.volume = 0.3
      audio.play().catch(() => {
        // Fallback to system beep if audio file not found
        console.log('Notification sound played')
      })
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }, [enableSounds])

  // Enhanced add notification with priority sorting
  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'timestamp'>
  ): string => {
    const id = generateId()
    const notification: Notification = {
      id,
      timestamp: Date.now(),
      duration: defaultDuration,
      dismissible: true,
      priority: 'normal',
      category: 'general',
      soundEnabled: enableSounds,
      showProgress: true,
      expandable: false,
      persistent: globalPersistence,
      ...notificationData
    }

    // Handle stacking behavior
    if (stackingBehavior === 'replace' && state.notifications.length > 0) {
      // Replace last notification
      const lastNotification = state.notifications[state.notifications.length - 1]
      if (lastNotification.category === notification.category) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: lastNotification.id })
      }
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })

    // Play sound if enabled
    playNotificationSound(notification.type, notification.soundEnabled)

    // Auto-dismiss if duration is set and not persistent
    if (notification.duration && notification.duration > 0 && !notification.persistent) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
      }, notification.duration)
    }

    // Remove oldest notification if we exceed max (respect priority)
    if (state.notifications.length >= maxNotifications) {
      const sortedByPriority = [...state.notifications].sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
        return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal']
      })
      
      const lowestPriorityId = sortedByPriority[0]?.id
      if (lowestPriorityId && notification.priority !== 'low') {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: lowestPriorityId })
      }
    }

    return id
  }, [defaultDuration, maxNotifications, state.notifications, enableSounds, stackingBehavior, globalPersistence, playNotificationSound])

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  // Update notification
  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates } })
  }, [])

  const contextValue: NotificationContextType = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateNotification
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Enhanced convenience hooks for different notification types
export function useNotify() {
  const { addNotification } = useNotifications()

  return {
    // Basic notification types
    success: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.success,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    error: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.error,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    warning: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.warning,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    info: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.info,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    // Enhanced notification methods
    persistent: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.persistent,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    urgent: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.urgent,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    // Category-specific methods
    trade: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.trade,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    priceAlert: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.priceAlert,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    system: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        ...NotificationPresets.system,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    security: useCallback((title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        type: 'warning',
        category: 'security',
        priority: 'high',
        soundEnabled: true,
        persistent: true,
        title,
        message,
        ...options
      })
    }, [addNotification]),

    // Quick message methods using predefined messages
    quick: {
      profileUpdated: () => addNotification(NotificationMessages.PROFILE_UPDATED),
      settingsSaved: () => addNotification(NotificationMessages.SETTINGS_SAVED),
      tradeExecuted: (details?: string) => addNotification({
        ...NotificationMessages.TRADE_EXECUTED,
        message: details || NotificationMessages.TRADE_EXECUTED.message
      }),
      tradeFailed: (reason?: string) => addNotification({
        ...NotificationMessages.TRADE_FAILED,
        message: reason || NotificationMessages.TRADE_FAILED.message
      }),
      copiedToClipboard: () => addNotification(NotificationMessages.COPIED_TO_CLIPBOARD),
      connectionLost: () => addNotification(NotificationMessages.CONNECTION_LOST),
      connectionRestored: () => addNotification(NotificationMessages.CONNECTION_RESTORED)
    },

    // Custom notification with full control
    notify: addNotification
  }
}
