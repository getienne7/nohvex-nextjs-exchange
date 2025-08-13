'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Notification } from '@/types/notifications'

interface ToastNotificationProps {
  notification: Notification
  onRemove: (id: string) => void
  position?: 'top' | 'bottom'
}

const getNotificationStyles = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-400',
        iconColor: 'text-green-400'
      }
    case 'error':
      return {
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        iconColor: 'text-red-400'
      }
    case 'warning':
      return {
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-400',
        iconColor: 'text-yellow-400'
      }
    case 'info':
      return {
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-400',
        iconColor: 'text-blue-400'
      }
    default:
      return {
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/30',
        textColor: 'text-gray-400',
        iconColor: 'text-gray-400'
      }
  }
}

const getNotificationIcon = (type: Notification['type'], iconColor: string) => {
  const iconClass = `w-5 h-5 ${iconColor}`
  
  switch (type) {
    case 'success':
      return <CheckCircleIcon className={iconClass} />
    case 'error':
      return <XCircleIcon className={iconClass} />
    case 'warning':
      return <ExclamationTriangleIcon className={iconClass} />
    case 'info':
      return <InformationCircleIcon className={iconClass} />
    default:
      return <InformationCircleIcon className={iconClass} />
  }
}

export function ToastNotification({ 
  notification, 
  onRemove, 
  position = 'top' 
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)
  const styles = getNotificationStyles(notification.type)

  // Progress bar animation
  useEffect(() => {
    if (!notification.duration || notification.duration === 0) {
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const decrement = 100 / (notification.duration! / 50)
        return prev - decrement
      })
    }, 50)

    const timeout = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(notification.id), 300)
    }, notification.duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [notification.duration, notification.id, onRemove])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(notification.id), 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          layout
          initial={{ 
            opacity: 0, 
            x: position === 'top' ? 400 : -400,
            scale: 0.9 
          }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: 1 
          }}
          exit={{ 
            opacity: 0, 
            x: 400, 
            scale: 0.9,
            transition: { duration: 0.3 }
          }}
          transition={{ 
            type: 'spring', 
            damping: 20, 
            stiffness: 300 
          }}
          className={`
            relative max-w-sm w-full mx-auto
            ${styles.bgColor} ${styles.borderColor}
            backdrop-blur-sm border rounded-xl p-4 shadow-lg
            overflow-hidden
          `}
        >
          {/* Progress Bar */}
          {notification.duration && notification.duration > 0 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
              <motion.div
                className={`h-full ${notification.type === 'success' ? 'bg-green-500' : 
                  notification.type === 'error' ? 'bg-red-500' :
                  notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: 'linear' }}
              />
            </div>
          )}

          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 pt-0.5">
              {notification.icon || getNotificationIcon(notification.type, styles.iconColor)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${styles.textColor}`}>
                    {notification.title}
                  </h3>
                  {notification.message && (
                    <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                  )}
                </div>

                {/* Dismiss Button */}
                {notification.dismissible && (
                  <button
                    onClick={handleRemove}
                    className="flex-shrink-0 ml-4 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Button */}
              {notification.action && (
                <div className="mt-3">
                  <button
                    onClick={notification.action.onClick}
                    className={`
                      text-sm font-medium px-3 py-1 rounded-md
                      ${styles.textColor} hover:bg-white/10 
                      transition-colors duration-200
                    `}
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="absolute bottom-1 right-2 text-xs text-gray-500">
            {new Date(notification.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
