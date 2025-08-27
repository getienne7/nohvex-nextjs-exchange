'use client'

import { useState, useEffect, useCallback } from 'react'
import { productionAnalytics, AnalyticsEvent, UserBehaviorMetrics } from '@/lib/production-analytics'

export interface UseAnalyticsOptions {
  autoTrack?: boolean
  trackPageViews?: boolean
  trackClicks?: boolean
  trackErrors?: boolean
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    autoTrack = true,
    trackPageViews = true,
    trackClicks = true,
    trackErrors = true
  } = options

  const [sessionId] = useState(() => generateSessionId())
  const [isTracking, setIsTracking] = useState(autoTrack)

  // Auto-track page views
  useEffect(() => {
    if (!trackPageViews || !isTracking) return

    const handleRouteChange = () => {
      track('page_view', {
        path: window.location.pathname,
        referrer: document.referrer,
        title: document.title
      })
    }

    // Track initial page view
    handleRouteChange()

    // Listen for route changes (for client-side navigation)
    window.addEventListener('popstate', handleRouteChange)
    
    // For Next.js App Router, listen for navigation events
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      setTimeout(handleRouteChange, 0)
    }

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      setTimeout(handleRouteChange, 0)
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [trackPageViews, isTracking])

  // Auto-track clicks
  useEffect(() => {
    if (!trackClicks || !isTracking) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return

      // Get meaningful element information
      const elementInfo = getElementInfo(target)
      
      track('click', {
        element: elementInfo.tagName,
        text: elementInfo.text,
        className: elementInfo.className,
        id: elementInfo.id,
        href: elementInfo.href,
        x: event.clientX,
        y: event.clientY
      })
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [trackClicks, isTracking])

  // Auto-track errors
  useEffect(() => {
    if (!trackErrors || !isTracking) return

    const handleError = (event: ErrorEvent) => {
      track('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      track('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [trackErrors, isTracking])

  // Track performance metrics
  useEffect(() => {
    if (!isTracking) return

    const trackPerformance = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          track('performance', {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstContentfulPaint: getFirstContentfulPaint(),
            timeToInteractive: navigation.loadEventEnd - navigation.fetchStart
          })
        }
      }
    }

    // Track performance after page load
    if (document.readyState === 'complete') {
      setTimeout(trackPerformance, 0)
    } else {
      window.addEventListener('load', trackPerformance)
    }

    return () => window.removeEventListener('load', trackPerformance)
  }, [isTracking])

  const track = useCallback((event: string, properties: Record<string, any> = {}) => {
    if (!isTracking) return

    const analyticsEvent: Omit<AnalyticsEvent, 'id' | 'timestamp'> = {
      sessionId,
      event,
      category: 'user',
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      },
      path: window.location.pathname,
      ipAddress: undefined, // Will be filled by server
      userAgent: navigator.userAgent
    }

    productionAnalytics.track(analyticsEvent)
  }, [sessionId, isTracking])

  const trackUserBehavior = useCallback((action: string, properties: Record<string, any> = {}) => {
    if (!isTracking) return

    const behavior: Omit<UserBehaviorMetrics, 'timestamp'> = {
      sessionId,
      page: window.location.pathname,
      action,
      timeOnPage: getTimeOnPage(),
      clickDepth: getClickDepth(),
      scrollDepth: getScrollDepth(),
      conversionFunnel: getConversionFunnel(),
      deviceType: getDeviceType(),
      browserInfo: getBrowserInfo(),
      ...properties
    }

    productionAnalytics.trackUserBehavior(behavior)
  }, [sessionId, isTracking])

  const trackConversion = useCallback((event: string, value?: number, properties: Record<string, any> = {}) => {
    track('conversion', {
      conversionEvent: event,
      value,
      ...properties
    })
  }, [track])

  const trackTiming = useCallback((category: string, variable: string, time: number, label?: string) => {
    track('timing', {
      category,
      variable,
      time,
      label
    })
  }, [track])

  const startTiming = useCallback((name: string) => {
    const startTime = performance.now()
    
    return {
      end: (properties: Record<string, any> = {}) => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        track('timing', {
          name,
          duration,
          startTime,
          endTime,
          ...properties
        })
        
        return duration
      }
    }
  }, [track])

  const setUserId = useCallback((userId: string) => {
    // Store user ID for future events
    localStorage.setItem('analytics_user_id', userId)
  }, [])

  const getUserId = useCallback(() => {
    return localStorage.getItem('analytics_user_id') || undefined
  }, [])

  const identify = useCallback((userId: string, traits: Record<string, any> = {}) => {
    setUserId(userId)
    track('identify', {
      userId,
      traits
    })
  }, [track, setUserId])

  const group = useCallback((groupId: string, traits: Record<string, any> = {}) => {
    track('group', {
      groupId,
      traits
    })
  }, [track])

  const alias = useCallback((newId: string, previousId?: string) => {
    track('alias', {
      newId,
      previousId: previousId || getUserId()
    })
  }, [track, getUserId])

  const reset = useCallback(() => {
    localStorage.removeItem('analytics_user_id')
    track('reset', {})
  }, [track])

  const startTracking = useCallback(() => {
    setIsTracking(true)
  }, [])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  return {
    // Core tracking methods
    track,
    trackUserBehavior,
    trackConversion,
    trackTiming,
    startTiming,
    
    // User identification
    identify,
    setUserId,
    getUserId,
    group,
    alias,
    reset,
    
    // Control
    startTracking,
    stopTracking,
    isTracking,
    
    // Session info
    sessionId
  }
}

// Helper functions
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getElementInfo(element: HTMLElement) {
  return {
    tagName: element.tagName.toLowerCase(),
    text: element.textContent?.trim().substring(0, 100) || '',
    className: element.className || '',
    id: element.id || '',
    href: (element as HTMLAnchorElement).href || ''
  }
}

function getTimeOnPage(): number {
  const startTime = parseInt(sessionStorage.getItem('page_start_time') || Date.now().toString())
  return Date.now() - startTime
}

function getClickDepth(): number {
  const clicks = parseInt(sessionStorage.getItem('click_count') || '0')
  sessionStorage.setItem('click_count', (clicks + 1).toString())
  return clicks + 1
}

function getScrollDepth(): number {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  return Math.round((scrollTop + windowHeight) / documentHeight * 100)
}

function getConversionFunnel(): string[] {
  const funnel = JSON.parse(sessionStorage.getItem('conversion_funnel') || '[]')
  const currentPage = window.location.pathname
  
  if (!funnel.includes(currentPage)) {
    funnel.push(currentPage)
    sessionStorage.setItem('conversion_funnel', JSON.stringify(funnel))
  }
  
  return funnel
}

function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getBrowserInfo() {
  const ua = navigator.userAgent
  let browserName = 'Unknown'
  let browserVersion = 'Unknown'
  let osName = 'Unknown'

  // Detect browser
  if (ua.includes('Chrome')) {
    browserName = 'Chrome'
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Firefox')) {
    browserName = 'Firefox'
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Safari')) {
    browserName = 'Safari'
    browserVersion = ua.match(/Safari\/([0-9.]+)/)?.[1] || 'Unknown'
  }

  // Detect OS
  if (ua.includes('Windows')) osName = 'Windows'
  else if (ua.includes('Mac')) osName = 'macOS'
  else if (ua.includes('Linux')) osName = 'Linux'
  else if (ua.includes('Android')) osName = 'Android'
  else if (ua.includes('iOS')) osName = 'iOS'

  return {
    name: browserName,
    version: browserVersion,
    os: osName
  }
}

function getFirstContentfulPaint(): number {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcpEntry?.startTime || 0
  }
  return 0
}

// Set page start time on load
if (typeof window !== 'undefined') {
  sessionStorage.setItem('page_start_time', Date.now().toString())
}