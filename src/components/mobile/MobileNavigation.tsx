'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  WalletIcon,
  BuildingLibraryIcon,
  BeakerIcon,
  SparklesIcon,
  EyeIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavGroup {
  name: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

export default function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName)
    } else {
      newExpanded.add(groupName)
    }
    setExpandedGroups(newExpanded)
  }

  const quickActions: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Trading', href: '/trading', icon: ArrowsRightLeftIcon },
    { name: 'Portfolio', href: '/portfolio', icon: BuildingLibraryIcon },
    { name: 'Wallet', href: '/web3', icon: WalletIcon }
  ]

  const navigationGroups: NavGroup[] = [
    {
      name: 'Portfolio Management',
      icon: BuildingLibraryIcon,
      items: [
        { name: 'Portfolio Overview', href: '/portfolio', icon: BuildingLibraryIcon },
        { name: 'Web3 Portfolio', href: '/web3', icon: WalletIcon },
        { name: 'Portfolio Analytics', href: '/portfolio-analytics', icon: ChartBarIcon }
      ]
    },
    {
      name: 'DeFi Tools',
      icon: BeakerIcon,
      items: [
        { name: 'DeFi Positions', href: '/defi-positions', icon: BeakerIcon },
        { name: 'Yield Optimizer', href: '/yield-optimizer', icon: SparklesIcon },
        { name: 'Trading', href: '/trading', icon: ArrowsRightLeftIcon },
        { name: 'Advanced Trading', href: '/advanced-trading', icon: RocketLaunchIcon }
      ]
    },
    {
      name: 'Analytics & Monitoring',
      icon: ChartBarIcon,
      items: [
        { name: 'Predictive Analytics', href: '/predictive-analytics', icon: CpuChipIcon },
        { name: 'Transaction Monitor', href: '/transaction-monitor', icon: EyeIcon, badge: 'Live' }
      ]
    }
  ]

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Navigation Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-slate-900 border-r border-gray-800 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
                  <span className="text-sm font-bold text-white">N</span>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  NOHVEX
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Close navigation"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {session ? (
                <div className="py-4">
                  {/* User Info */}
                  <div className="px-4 mb-6">
                    <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {session.user?.name || 'User'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {session.user?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="px-4 mb-6">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                          <Link
                            key={action.name}
                            href={action.href}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                              isActive(action.href)
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                            }`}
                          >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">{action.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* Navigation Groups */}
                  <div className="px-4 space-y-2">
                    {navigationGroups.map((group) => {
                      const isExpanded = expandedGroups.has(group.name)
                      const hasActiveItem = group.items.some(item => isActive(item.href))
                      const GroupIcon = group.icon

                      return (
                        <div key={group.name}>
                          <button
                            onClick={() => toggleGroup(group.name)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                              hasActiveItem
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'text-gray-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <GroupIcon className="w-5 h-5" />
                              <span className="font-medium">{group.name}</span>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRightIcon className="w-4 h-4" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-8 pr-3 py-2 space-y-1">
                                  {group.items.map((item) => {
                                    const ItemIcon = item.icon
                                    return (
                                      <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                                          isActive(item.href)
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-gray-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <ItemIcon className="w-4 h-4" />
                                          <span className="text-sm">{item.name}</span>
                                        </div>
                                        {item.badge && (
                                          <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                                            {item.badge}
                                          </span>
                                        )}
                                      </Link>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Public navigation for non-authenticated users
                <div className="p-4">
                  <div className="space-y-2">
                    <Link
                      href="/"
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive('/') ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-slate-800'
                      }`}
                    >
                      <HomeIcon className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                    <Link
                      href="/trading"
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive('/trading') ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-slate-800'
                      }`}
                    >
                      <ArrowsRightLeftIcon className="w-5 h-5" />
                      <span>Trading</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-800 p-4">
              {session ? (
                <div className="space-y-2">
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      onClose()
                      // Add sign out logic here
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    className="w-full flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full flex items-center justify-center py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}