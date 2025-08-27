'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  WalletIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  ArrowsRightLeftIcon as ArrowsRightLeftSolidIcon,
  WalletIcon as WalletSolidIcon,
  Cog6ToothIcon as Cog6ToothSolidIcon
} from '@heroicons/react/24/solid'

interface TabItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  solidIcon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface MobileTabNavigationProps {
  className?: string
}

export default function MobileTabNavigation({ className = '' }: MobileTabNavigationProps) {
  const pathname = usePathname()

  const tabs: TabItem[] = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: HomeIcon,
      solidIcon: HomeSolidIcon
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: ChartBarIcon,
      solidIcon: ChartBarSolidIcon
    },
    {
      name: 'Trade',
      href: '/trading',
      icon: ArrowsRightLeftIcon,
      solidIcon: ArrowsRightLeftSolidIcon
    },
    {
      name: 'Wallet',
      href: '/web3',
      icon: WalletIcon,
      solidIcon: WalletSolidIcon
    },
    {
      name: 'More',
      href: '/settings',
      icon: Cog6ToothIcon,
      solidIcon: Cog6ToothSolidIcon
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 z-40 md:hidden ${className}`}>
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          const Icon = active ? tab.solidIcon : tab.icon

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
            >
              <motion.div
                className="relative"
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-500/20 rounded-full scale-150"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}

                <div className={`relative z-10 p-2 ${
                  active ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                  
                  {/* Badge */}
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
              </motion.div>

              <span className={`text-xs font-medium mt-1 transition-colors ${
                active ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}

// Floating Action Button for quick actions
export function MobileFloatingActionButton({
  onClick,
  icon: Icon = ArrowsRightLeftIcon,
  className = ''
}: {
  onClick: () => void
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={`fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 md:hidden ${className}`}
    >
      <Icon className="w-6 h-6" />
    </motion.button>
  )
}

// Quick action sheet that slides up from bottom
export function MobileQuickActions({
  isOpen,
  onClose,
  actions = []
}: {
  isOpen: boolean
  onClose: () => void
  actions: Array<{
    title: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    onClick: () => void
  }>
}) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 md:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />

        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          Quick Actions
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  action.onClick()
                  onClose()
                }}
                className="flex flex-col items-center p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{action.title}</span>
              </motion.button>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>

        {/* Safe area */}
        <div className="h-safe-area-inset-bottom" />
      </motion.div>
    </motion.div>
  )
}