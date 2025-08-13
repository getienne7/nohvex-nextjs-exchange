'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
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
  defaultDuration = 4000
}: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: []
  })

  // Add notification with auto-dismiss
  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'timestamp'>
  ): string => {
    const id = generateId()
    const notification: Notification = {
      id,
      timestamp: Date.now(),
      duration: defaultDuration,
      dismissible: true,
      ...notificationData
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })

    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
      }, notification.duration)
    }

    // Remove oldest notification if we exceed max
    if (state.notifications.length >= maxNotifications) {
      const oldestId = state.notifications[0]?.id
      if (oldestId) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: oldestId })
      }
    }

    return id
  }, [defaultDuration, maxNotifications, state.notifications.length])

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

// Convenience hooks for different notification types
export function useNotify() {
  const { addNotification } = useNotifications()

  return {
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

    // Custom notification
    notify: addNotification
  }
}
