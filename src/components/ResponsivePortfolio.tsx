'use client'

import React, { useState, useEffect } from 'react'
import { useResponsive } from './mobile/ResponsiveLayout'
import MobilePortfolio from './mobile/MobilePortfolio'

// Placeholder components - replace with actual imports when available
const SimplePortfolio = () => (
  <div className="p-4 text-white">Simple Portfolio View</div>
)

const EnhancedPortfolio = () => (
  <div className="p-4 text-white">Enhanced Portfolio View</div>
)

interface ResponsivePortfolioProps {
  portfolioData?: {
    totalValue: number
    change24h: number
    changePercent: number
    assets: Array<{
      symbol: string
      name: string
      balance: number
      value: number
      change24h: number
      percentage: number
    }>
  }
  userPreferences?: {
    showMobileView?: boolean
    complexityLevel?: 'simple' | 'enhanced' | 'advanced'
  }
}

export default function ResponsivePortfolio({ 
  portfolioData, 
  userPreferences = {} 
}: ResponsivePortfolioProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [viewMode, setViewMode] = useState<'auto' | 'mobile' | 'desktop'>('auto')
  
  const {
    showMobileView = false,
    complexityLevel = 'enhanced'
  } = userPreferences

  useEffect(() => {
    // Auto-detect view mode based on screen size and user preferences
    if (showMobileView || isMobile) {
      setViewMode('mobile')
    } else if (isTablet || isDesktop) {
      setViewMode('desktop')
    }
  }, [isMobile, isTablet, isDesktop, showMobileView])

  // Force mobile view for screens smaller than tablet
  if (viewMode === 'mobile' || (isMobile && viewMode === 'auto')) {
    return <MobilePortfolio portfolioData={portfolioData} />
  }

  // Desktop/tablet view with complexity options
  if (complexityLevel === 'simple') {
    return <SimplePortfolio />
  }

  return <EnhancedPortfolio />
}

// Enhanced portfolio wrapper with responsive features
export function ResponsivePortfolioWrapper({ children }: { children: React.ReactNode }) {
  const { isMobile } = useResponsive()

  return (
    <div className={`min-h-screen ${isMobile ? 'pb-20' : ''}`}>
      {children}
    </div>
  )
}