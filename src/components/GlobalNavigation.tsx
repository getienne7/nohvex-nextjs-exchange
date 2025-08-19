'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  BuildingLibraryIcon,
  WalletIcon,
  SparklesIcon,
  EyeIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  ChevronDownIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import { 
  ChartBarIcon as ChartBarSolidIcon,
  ArrowsRightLeftIcon as ArrowsRightLeftSolidIcon,
  HomeIcon as HomeSolidIcon,
  WalletIcon as WalletSolidIcon,
  SparklesIcon as SparklesSolidIcon,
  EyeIcon as EyeSolidIcon,
  BeakerIcon as BeakerSolidIcon,
  RocketLaunchIcon as RocketLaunchSolidIcon,
  CpuChipIcon as CpuChipSolidIcon,
  BuildingLibraryIcon as BuildingLibrarySolidIcon,
  PresentationChartLineIcon as PresentationChartLineSolidIcon
} from '@heroicons/react/24/solid'

interface NavigationProps {
  variant?: 'hero' | 'standard'
}

export function GlobalNavigation({ variant = 'standard' }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.relative')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  // Define navigation items based on authentication status
  const publicNavItems = [
    { name: 'Home', href: '/', icon: HomeIcon, solidIcon: HomeSolidIcon },
    { name: 'Trading', href: '/trading', icon: ArrowsRightLeftIcon, solidIcon: ArrowsRightLeftSolidIcon },
  ]

  // Grouped navigation for authenticated users
  const authenticatedNavGroups = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: ChartBarIcon,
      solidIcon: ChartBarSolidIcon,
      type: 'single' as const
    },
    {
      name: 'Portfolio',
      icon: BuildingLibraryIcon,
      solidIcon: BuildingLibrarySolidIcon,
      type: 'group' as const,
      items: [
        { name: 'Portfolio Overview', href: '/portfolio', icon: BuildingLibraryIcon },
        { name: 'Web3 Portfolio', href: '/web3', icon: WalletIcon },
        { name: 'Portfolio Analytics', href: '/portfolio-analytics', icon: ChartBarIcon },
      ]
    },
    {
      name: 'DeFi Tools',
      icon: BeakerIcon,
      solidIcon: BeakerSolidIcon,
      type: 'group' as const,
      items: [
        { name: 'DeFi Positions', href: '/defi-positions', icon: BeakerIcon },
        { name: 'Yield Optimizer', href: '/yield-optimizer', icon: SparklesIcon },
        { name: 'Trading', href: '/trading', icon: ArrowsRightLeftIcon },
        { name: 'Advanced Trading', href: '/advanced-trading', icon: RocketLaunchIcon },
      ]
    },
    {
      name: 'Analytics',
      icon: PresentationChartLineIcon,
      solidIcon: PresentationChartLineSolidIcon,
      type: 'group' as const,
      items: [
        { name: 'Predictive Analytics', href: '/predictive-analytics', icon: CpuChipIcon },
        { name: 'Transaction Monitor', href: '/transaction-monitor', icon: EyeIcon },
      ]
    }
  ]

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))
  
  const isGroupActive = (group: typeof authenticatedNavGroups[0]) => {
    if (group.type === 'single' && group.href) {
      return isActive(group.href)
    }
    if (group.type === 'group' && group.items) {
      return group.items.some(item => isActive(item.href))
    }
    return false
  }

  const toggleDropdown = (groupName: string) => {
    setOpenDropdown(openDropdown === groupName ? null : groupName)
  }

  // Hero variant styles
  const heroClasses = "relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10"
  const standardClasses = "bg-slate-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50"

  return (
    <nav className={variant === 'hero' ? heroClasses : standardClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 group-hover:from-blue-400 group-hover:to-emerald-400 transition-all duration-200">
                <span className="text-sm font-bold text-white">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                NOHVEX
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {session ? (
              // Authenticated navigation with groups
              <>
                {authenticatedNavGroups.map((group) => {
                  if (group.type === 'single') {
                    const Icon = isGroupActive(group) ? group.solidIcon : group.icon
                    return (
                      <Link
                        key={group.name}
                        href={group.href!}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isGroupActive(group)
                            ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{group.name}</span>
                      </Link>
                    )
                  }

                  // Group with dropdown
                  const Icon = isGroupActive(group) ? group.solidIcon : group.icon
                  const isOpen = openDropdown === group.name
                  
                  return (
                    <div key={group.name} className="relative">
                      <button
                        onClick={() => toggleDropdown(group.name)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isGroupActive(group)
                            ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{group.name}</span>
                        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1 w-56 bg-slate-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50"
                          >
                            <div className="py-2">
                              {group.items?.map((item) => {
                                const ItemIcon = item.icon
                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-200 ${
                                      isActive(item.href)
                                        ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border-r-2 border-blue-500'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    <ItemIcon className="w-4 h-4" />
                                    <span>{item.name}</span>
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
              </>
            ) : (
              // Public navigation
              <>
                {publicNavItems.map((item) => {
                  const Icon = isActive(item.href) ? item.solidIcon : item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            ) : session ? (
              <>
                {/* Notifications */}
                <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 relative">
                  <BellIcon className="w-5 h-5" />
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {session.user?.name || session.user?.email?.split('@')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <hr className="my-1 border-gray-700" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-700 bg-slate-900/98 backdrop-blur-sm"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation Items */}
              {session ? (
                <>
                  {/* User info */}
                  <div className="flex items-center space-x-3 px-3 py-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {session.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Authenticated mobile navigation with groups */}
                  {authenticatedNavGroups.map((group) => {
                    if (group.type === 'single') {
                      const Icon = isGroupActive(group) ? group.solidIcon : group.icon
                      return (
                        <Link
                          key={group.name}
                          href={group.href!}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isGroupActive(group)
                              ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{group.name}</span>
                        </Link>
                      )
                    }

                    // Group with expandable items for mobile
                    const Icon = isGroupActive(group) ? group.solidIcon : group.icon
                    const isOpen = openDropdown === group.name
                    
                    return (
                      <div key={group.name}>
                        <button
                          onClick={() => toggleDropdown(group.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isGroupActive(group)
                              ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5" />
                            <span>{group.name}</span>
                          </div>
                          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-8 mt-1 space-y-1">
                                {group.items?.map((item) => {
                                  const ItemIcon = item.icon
                                  return (
                                    <Link
                                      key={item.name}
                                      href={item.href}
                                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                        isActive(item.href)
                                          ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border-l-2 border-blue-500'
                                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                                      }`}
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      <ItemIcon className="w-4 h-4" />
                                      <span>{item.name}</span>
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

                  {/* Mobile profile links */}
                  <hr className="my-2 border-gray-700" />
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Public mobile navigation */}
                  {publicNavItems.map((item) => {
                    const Icon = isActive(item.href) ? item.solidIcon : item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}

                  {/* Mobile auth buttons */}
                  <hr className="my-2 border-gray-700" />
                  <Link
                    href="/auth/signin"
                    className="block w-full px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full px-3 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-200 text-center"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
