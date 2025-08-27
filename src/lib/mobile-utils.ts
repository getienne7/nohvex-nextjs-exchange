/**
 * Mobile UI Optimization Utilities
 * Provides utilities, hooks, and helpers for creating mobile-responsive interfaces
 */

import { useState, useEffect, useCallback } from 'react'

// Breakpoint definitions
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

// Device detection
export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  hasTouch: boolean
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    screenHeight: 768,
    orientation: 'landscape',
    hasTouch: false,
    platform: 'desktop'
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < BREAKPOINTS.md
      const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
      const isDesktop = width >= BREAKPOINTS.lg
      
      // Detect platform
      let platform: DeviceInfo['platform'] = 'desktop'
      if (typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent.toLowerCase()
        if (/iphone|ipad|ipod/.test(userAgent)) {
          platform = 'ios'
        } else if (/android/.test(userAgent)) {
          platform = 'android'
        }
      }

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait',
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        platform
      })
    }

    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

// Touch gesture handling
export interface TouchGesture {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
}

export function useTouchGestures(
  element: React.RefObject<HTMLElement>,
  options: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    threshold?: number
  } = {}
) {
  const { threshold = 50 } = options
  const [gesture, setGesture] = useState<TouchGesture | null>(null)

  useEffect(() => {
    const el = element.current
    if (!el) return

    let touchStart: { x: number; y: number } | null = null

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStart = { x: touch.clientX, y: touch.clientY }
      
      setGesture({
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: 0,
        deltaY: 0,
        direction: null,
        distance: 0
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart) return
      
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      let direction: TouchGesture['direction'] = null
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      setGesture({
        startX: touchStart.x,
        startY: touchStart.y,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX,
        deltaY,
        direction,
        distance
      })
    }

    const handleTouchEnd = () => {
      if (!gesture || !touchStart) return

      const { deltaX, deltaY, distance } = gesture

      if (distance > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            options.onSwipeRight?.()
          } else {
            options.onSwipeLeft?.()
          }
        } else {
          if (deltaY > 0) {
            options.onSwipeDown?.()
          } else {
            options.onSwipeUp?.()
          }
        }
      }

      touchStart = null
      setGesture(null)
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [element, options, threshold, gesture])

  return gesture
}

// Safe area utilities for devices with notches
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  useEffect(() => {
    const updateSafeArea = () => {
      if (typeof CSS !== 'undefined' && CSS.supports('padding', 'env(safe-area-inset-top)')) {
        const computedStyle = getComputedStyle(document.documentElement)
        setSafeArea({
          top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
          right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
          bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
          left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
        })
      }
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    window.addEventListener('orientationchange', updateSafeArea)

    return () => {
      window.removeEventListener('resize', updateSafeArea)
      window.removeEventListener('orientationchange', updateSafeArea)
    }
  }, [])

  return safeArea
}

// Responsive value hook
export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>> & { base: T }
): T {
  const { screenWidth } = useDeviceDetection()
  
  const breakpointEntries = Object.entries(BREAKPOINTS)
    .sort(([, a], [, b]) => b - a) // Sort by breakpoint value descending
  
  for (const [breakpoint, minWidth] of breakpointEntries) {
    if (screenWidth >= minWidth && values[breakpoint as Breakpoint] !== undefined) {
      return values[breakpoint as Breakpoint]!
    }
  }
  
  return values.base
}

// Intersection observer for mobile optimization
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        setEntry(entry)
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])

  return { isIntersecting, entry }
}

// Mobile keyboard detection
export function useMobileKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const heightDifference = initialViewportHeight - currentHeight
      
      setIsKeyboardOpen(heightDifference > 150) // Threshold for keyboard detection
      setKeyboardHeight(Math.max(0, heightDifference))
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange)
      }
    } else {
      window.addEventListener('resize', handleViewportChange)
      return () => {
        window.removeEventListener('resize', handleViewportChange)
      }
    }
  }, [])

  return { isKeyboardOpen, keyboardHeight }
}

// Performance optimization for mobile
export function useMobilePerformance() {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduceMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)

    // Detect low power mode (iOS Safari)
    const checkLowPowerMode = () => {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          setIsLowPowerMode(renderer.includes('Apple') && renderer.includes('GPU'))
        }
      }
    }

    checkLowPowerMode()

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return { isLowPowerMode, shouldReduceMotion }
}

// Mobile-optimized class name utilities
export function mobileClasses(classes: {
  base?: string
  mobile?: string
  tablet?: string
  desktop?: string
}): string {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection()
  
  let result = classes.base || ''
  
  if (isMobile && classes.mobile) {
    result += ` ${classes.mobile}`
  } else if (isTablet && classes.tablet) {
    result += ` ${classes.tablet}`
  } else if (isDesktop && classes.desktop) {
    result += ` ${classes.desktop}`
  }
  
  return result.trim()
}

// Haptic feedback for mobile devices
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const lightImpact = useCallback(() => {
    vibrate(10)
  }, [vibrate])

  const mediumImpact = useCallback(() => {
    vibrate(20)
  }, [vibrate])

  const heavyImpact = useCallback(() => {
    vibrate([30, 10, 30])
  }, [vibrate])

  return {
    vibrate,
    lightImpact,
    mediumImpact,
    heavyImpact
  }
}

// Export all utilities
export {
  useDeviceDetection as useResponsive, // Alias for backward compatibility
}