'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/contexts/NotificationContext'
import { ToastNotification } from './ToastNotification'
import { NotificationPosition } from '@/types/notifications'

interface NotificationContainerProps {
  position?: NotificationPosition
  className?: string
}

const getContainerClasses = (position: NotificationPosition): string => {
  const baseClasses = "fixed z-50 flex flex-col space-y-2 pointer-events-none"
  
  switch (position) {
    case 'top-left':
      return `${baseClasses} top-4 left-4`
    case 'top-center':
      return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`
    case 'top-right':
      return `${baseClasses} top-4 right-4`
    case 'bottom-left':
      return `${baseClasses} bottom-4 left-4`
    case 'bottom-center':
      return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`
    case 'bottom-right':
      return `${baseClasses} bottom-4 right-4`
    default:
      return `${baseClasses} top-4 right-4`
  }
}

const getAnimationDirection = (position: NotificationPosition) => {
  if (position.includes('left')) return 'left'
  if (position.includes('right')) return 'right'
  return 'center'
}

export function NotificationContainer({ 
  position = 'top-right',
  className = ''
}: NotificationContainerProps) {
  const { notifications, removeNotification } = useNotifications()
  const containerClasses = getContainerClasses(position)
  const animationDirection = getAnimationDirection(position)

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className={`${containerClasses} ${className}`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              type: 'spring', 
              damping: 20, 
              stiffness: 300,
              delay: index * 0.1 
            }}
            className="pointer-events-auto"
            style={{
              zIndex: 1000 + notifications.length - index
            }}
          >
            <ToastNotification
              notification={notification}
              onRemove={removeNotification}
              position={position.includes('top') ? 'top' : 'bottom'}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Clear All Button (appears when there are 3+ notifications) */}
      {notifications.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="pointer-events-auto mt-2"
        >
          <button
            onClick={() => {
              // Clear all dismissible notifications
              notifications.forEach(notification => {
                if (notification.dismissible) {
                  removeNotification(notification.id)
                }
              })
            }}
            className="
              w-full px-3 py-2 text-xs text-gray-400 hover:text-white
              bg-black/20 hover:bg-black/40 backdrop-blur-sm
              border border-white/10 hover:border-white/20
              rounded-lg transition-all duration-200
              text-center font-medium
            "
          >
            Clear All ({notifications.filter(n => n.dismissible).length})
          </button>
        </motion.div>
      )}
    </div>
  )
}

// Convenient wrapper for global usage
export function GlobalNotificationContainer() {
  return (
    <>
      {/* Desktop notifications - top-right */}
      <div className="hidden md:block">
        <NotificationContainer position="top-right" />
      </div>
      
      {/* Mobile notifications - top-center */}
      <div className="md:hidden">
        <NotificationContainer position="top-center" />
      </div>
    </>
  )
}
