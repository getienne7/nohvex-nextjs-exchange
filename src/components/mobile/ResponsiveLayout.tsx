'use client'

import React, { useState, useEffect } from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import MobileNavigation from './MobileNavigation'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  title?: string
  showMobileNav?: boolean
  mobileHeaderAction?: React.ReactNode
}

export default function ResponsiveLayout({
  children,
  title,
  showMobileNav = true,
  mobileHeaderAction
}: ResponsiveLayoutProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile Header */}
      {isMobile && showMobileNav && (
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between md:hidden">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Open navigation"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          {title && (
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          )}
          
          {mobileHeaderAction && (
            <div>{mobileHeaderAction}</div>
          )}
        </header>
      )}

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content */}
      <main className={`${isMobile ? 'md:ml-0' : ''}`}>
        {children}
      </main>
    </div>
  )
}

// Mobile-optimized card component
export function MobileCard({
  children,
  className = '',
  padding = 'p-4',
  ...props
}: {
  children: React.ReactNode
  className?: string
  padding?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-slate-800 rounded-lg ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Mobile-optimized button component
export function MobileButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = 'font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600',
    ghost: 'text-gray-300 hover:text-white hover:bg-slate-800'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Mobile-optimized input component
export function MobileInput({
  label,
  error,
  className = '',
  ...props
}: {
  label?: string
  error?: string
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

// Mobile-optimized section component
export function MobileSection({
  title,
  subtitle,
  action,
  children,
  className = ''
}: {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

// Mobile-optimized grid component
export function MobileGrid({
  children,
  columns = 1,
  gap = 4,
  className = ''
}: {
  children: React.ReactNode
  columns?: 1 | 2 | 3
  gap?: number
  className?: string
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3'
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-${gap} ${className}`}>
      {children}
    </div>
  )
}

// Mobile-optimized list component
export function MobileList({
  items,
  renderItem,
  className = ''
}: {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}

// Hook for detecting mobile breakpoints
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsDesktop(width >= 1024)
    }

    checkBreakpoints()
    window.addEventListener('resize', checkBreakpoints)
    return () => window.removeEventListener('resize', checkBreakpoints)
  }, [])

  return { isMobile, isTablet, isDesktop }
}