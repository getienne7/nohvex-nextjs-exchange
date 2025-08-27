'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { productionAnalytics } from '@/lib/production-analytics'

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void
  trackUserBehavior: (action: string, properties?: Record<string, any>) => void
  trackConversion: (event: string, value?: number, properties?: Record<string, any>) => void
  identify: (userId: string, traits?: Record<string, any>) => void
  startTiming: (name: string) => { end: (properties?: Record<string, any>) => number }
  isTracking: boolean
  sessionId: string
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

interface AnalyticsProviderProps {
  children: React.ReactNode
  userId?: string
  enableAutoTracking?: boolean
  trackPageViews?: boolean
  trackClicks?: boolean
  trackErrors?: boolean
  enableProduction?: boolean
}

export function AnalyticsProvider({
  children,
  userId,
  enableAutoTracking = true,
  trackPageViews = true,
  trackClicks = true,
  trackErrors = true,
  enableProduction = process.env.NODE_ENV === 'production'
}: AnalyticsProviderProps) {
  const analytics = useAnalytics({
    autoTrack: enableAutoTracking,
    trackPageViews,
    trackClicks,
    trackErrors
  })

  useEffect(() => {
    // Start production analytics collection if enabled
    if (enableProduction) {
      productionAnalytics.startCollection(60000) // 1 minute intervals
    }

    // Identify user if provided
    if (userId) {
      analytics.identify(userId)
    }

    return () => {
      if (enableProduction) {
        productionAnalytics.stopCollection()
      }
    }
  }, [userId, enableProduction, analytics])

  const contextValue: AnalyticsContextType = {
    track: analytics.track,
    trackUserBehavior: analytics.trackUserBehavior,
    trackConversion: analytics.trackConversion,
    identify: analytics.identify,
    startTiming: analytics.startTiming,
    isTracking: analytics.isTracking,
    sessionId: analytics.sessionId
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsContext(): AnalyticsContextType {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}

// Higher-order component for analytics tracking
export function withAnalytics<T extends object>(
  Component: React.ComponentType<T>,
  trackingOptions?: {
    trackMount?: boolean
    trackUnmount?: boolean
    trackProps?: boolean
    eventName?: string
  }
) {
  const options = {
    trackMount: true,
    trackUnmount: false,
    trackProps: false,
    eventName: Component.displayName || Component.name || 'Component',
    ...trackingOptions
  }

  return function AnalyticsWrappedComponent(props: T) {
    const analytics = useAnalyticsContext()

    useEffect(() => {
      if (options.trackMount) {
        analytics.track(`${options.eventName}_mount`, {
          component: options.eventName,
          ...(options.trackProps ? props : {})
        })
      }

      return () => {
        if (options.trackUnmount) {
          analytics.track(`${options.eventName}_unmount`, {
            component: options.eventName
          })
        }
      }
    }, [analytics, props])

    return <Component {...props} />
  }
}

// Custom hook for tracking specific events
export function useTrackEvent() {
  const analytics = useAnalyticsContext()

  const trackClick = (elementName: string, properties?: Record<string, any>) => {
    analytics.track('button_click', {
      element: elementName,
      ...properties
    })
  }

  const trackFormSubmit = (formName: string, success: boolean, properties?: Record<string, any>) => {
    analytics.track('form_submit', {
      form: formName,
      success,
      ...properties
    })
  }

  const trackModalOpen = (modalName: string, properties?: Record<string, any>) => {
    analytics.track('modal_open', {
      modal: modalName,
      ...properties
    })
  }

  const trackModalClose = (modalName: string, properties?: Record<string, any>) => {
    analytics.track('modal_close', {
      modal: modalName,
      ...properties
    })
  }

  const trackFeatureUsage = (featureName: string, properties?: Record<string, any>) => {
    analytics.track('feature_usage', {
      feature: featureName,
      ...properties
    })
  }

  const trackError = (errorType: string, errorMessage: string, properties?: Record<string, any>) => {
    analytics.track('error', {
      errorType,
      errorMessage,
      ...properties
    })
  }

  const trackSearch = (query: string, resultsCount: number, properties?: Record<string, any>) => {
    analytics.track('search', {
      query,
      resultsCount,
      ...properties
    })
  }

  return {
    trackClick,
    trackFormSubmit,
    trackModalOpen,
    trackModalClose,
    trackFeatureUsage,
    trackError,
    trackSearch,
    track: analytics.track,
    trackConversion: analytics.trackConversion,
    startTiming: analytics.startTiming
  }
}

// Component for tracking page views manually
export function PageView({ name, properties }: { name: string; properties?: Record<string, any> }) {
  const analytics = useAnalyticsContext()

  useEffect(() => {
    analytics.track('page_view', {
      page: name,
      ...properties
    })
  }, [name, properties, analytics])

  return null
}

// Component for tracking conversions
export function ConversionTracker({ 
  event, 
  value, 
  trigger = 'mount',
  properties 
}: { 
  event: string
  value?: number
  trigger?: 'mount' | 'interaction'
  properties?: Record<string, any>
}) {
  const analytics = useAnalyticsContext()

  useEffect(() => {
    if (trigger === 'mount') {
      analytics.trackConversion(event, value, properties)
    }
  }, [event, value, trigger, properties, analytics])

  const handleTrigger = () => {
    if (trigger === 'interaction') {
      analytics.trackConversion(event, value, properties)
    }
  }

  if (trigger === 'interaction') {
    return (
      <button onClick={handleTrigger} className="sr-only">
        Track Conversion
      </button>
    )
  }

  return null
}

export default AnalyticsProvider