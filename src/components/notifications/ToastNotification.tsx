'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { Notification } from '@/types/notifications'

interface ToastNotificationProps {
  notification: Notification
  onRemove: (id: string) => void
  position?: 'top' | 'bottom'
}

const getPriorityStyles = (priority?: string) => {
  switch (priority) {
    case 'urgent':
      return {
        borderWidth: 'border-2',
        shadow: 'shadow-2xl shadow-red-500/20',
        glow: 'ring-2 ring-red-500/30',
        pulse: 'animate-pulse'
      }
    case 'high':
      return {
        borderWidth: 'border-2',
        shadow: 'shadow-xl',
        glow: 'ring-1 ring-yellow-500/20',
        pulse: ''
      }
    case 'normal':
      return {
        borderWidth: 'border',
        shadow: 'shadow-lg',
        glow: '',
        pulse: ''
      }
    case 'low':
      return {
        borderWidth: 'border',
        shadow: 'shadow-md',
        glow: '',
        pulse: ''
      }
    default:
      return {
        borderWidth: 'border',
        shadow: 'shadow-lg',
        glow: '',
        pulse: ''
      }
  }
}

const getNotificationStyles = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-400',
        iconColor: 'text-green-400',
        progressColor: 'bg-green-500'
      }
    case 'error':
      return {
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        iconColor: 'text-red-400',
        progressColor: 'bg-red-500'
      }
    case 'warning':
      return {
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-400',
        iconColor: 'text-yellow-400',
        progressColor: 'bg-yellow-500'
      }
    case 'info':
      return {
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-400',
        iconColor: 'text-blue-400',
        progressColor: 'bg-blue-500'
      }
    default:
      return {
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/30',
        textColor: 'text-gray-400',
        iconColor: 'text-gray-400',
        progressColor: 'bg-gray-500'
      }
  }
}

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'trade':
      return '📈'
    case 'portfolio':
      return '💼'
    case 'security':
      return '🔒'
    case 'price-alert':
      return '🔔'
    case 'system':
      return '⚙️'
    case 'news':
      return '📰'
    default:
      return null
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [progress, setProgress] = useState(100)
  const styles = getNotificationStyles(notification.type)
  const priorityStyles = getPriorityStyles(notification.priority)
  const categoryIcon = getCategoryIcon(notification.category)

  // Progress bar animation
  useEffect(() => {
    if (!notification.duration || notification.duration === 0 || notification.persistent) {
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const decrement = 100 / (notification.duration! / 50)
        return Math.max(0, prev - decrement)
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
  }, [notification.duration, notification.id, notification.persistent, onRemove])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(notification.id), 300)
  }

  const toggleExpand = () => {
    if (notification.expandable) {
      setIsExpanded(!isExpanded)
    }
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
            ${styles.bgColor} ${styles.borderColor} ${priorityStyles.borderWidth}
            ${priorityStyles.shadow} ${priorityStyles.glow} ${priorityStyles.pulse}
            backdrop-blur-sm rounded-xl p-4
            overflow-hidden cursor-pointer
            ${notification.expandable ? 'hover:shadow-xl' : ''}
            transition-all duration-200
          `}
          onClick={toggleExpand}
        >
          {/* Progress Bar */}
          {notification.showProgress && notification.duration && notification.duration > 0 && !notification.persistent && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
              <motion.div
                className={`h-full ${styles.progressColor}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: 'linear' }}
              />
            </div>
          )}

          {/* Priority Indicator */}
          {notification.priority === 'urgent' && (
            <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
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
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-sm font-semibold ${styles.textColor}`}>
                      {notification.title}
                    </h3>
                    {/* Category Badge */}
                    {categoryIcon && (
                      <span className="text-xs opacity-70" title={notification.category}>
                        {categoryIcon}
                      </span>
                    )}
                    {/* Priority Badge */}
                    {notification.priority === 'urgent' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        URGENT
                      </span>
                    )}
                    {notification.priority === 'high' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        HIGH
                      </span>
                    )}
                  </div>
                  {notification.message && (
                    <p className={`text-sm text-gray-300 mt-1 leading-relaxed ${
                      notification.expandable && !isExpanded ? 'line-clamp-2' : ''
                    }`}>
                      {notification.message}
                    </p>
                  )}
                  
                  {/* Expandable Content */}
                  <AnimatePresence>
                    {notification.expandable && isExpanded && notification.metadata && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-400"
                      >
                        {Object.entries(notification.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1 ml-4">
                  {/* Expand Button */}
                  {notification.expandable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand()
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  {/* Dismiss Button */}
                  {notification.dismissible && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove()
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Dismiss notification"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(notification.action || notification.secondaryAction) && (
                <div className="mt-3 flex space-x-2">
                  {notification.action && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        notification.action!.onClick()
                      }}
                      className={`
                        text-sm font-medium px-3 py-1 rounded-md
                        ${styles.textColor} hover:bg-white/10 
                        transition-colors duration-200
                      `}
                    >
                      {notification.action.label}
                    </button>
                  )}
                  {notification.secondaryAction && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        notification.secondaryAction!.onClick()
                      }}
                      className="text-sm font-medium px-3 py-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      {notification.secondaryAction.label}
                    </button>
                  )}
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

          {/* Persistent Indicator */}
          {notification.persistent && (
            <div className="absolute top-2 right-2">
              <BellIcon className="w-3 h-3 text-yellow-400" title="Persistent notification" />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
