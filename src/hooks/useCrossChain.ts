import { useState, useEffect, useCallback } from 'react'
import { CrossChainRoute, CrossChainExecution, YieldOpportunity } from '@/lib/cross-chain-aggregator'

interface UseCrossChainOptions {
  refreshInterval?: number
  autoRefresh?: boolean
}

interface CrossChainFilters {
  sourceChain?: string
  targetChain?: string
  sourceAsset?: string
  targetAsset?: string
  minApy?: number
  maxRisk?: 'low' | 'medium' | 'high'
  strategy?: string
}

export function useCrossChain(userId?: string, options: UseCrossChainOptions = {}) {
  const { refreshInterval = 30000, autoRefresh = true } = options
  
  const [routes, setRoutes] = useState<CrossChainRoute[]>([])
  const [executions, setExecutions] = useState<CrossChainExecution[]>([])
  const [yieldOpportunities, setYieldOpportunities] = useState<YieldOpportunity[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Find optimal cross-chain routes
  const findRoutes = useCallback(async (
    sourceChain: string,
    targetChain: string,
    sourceAsset: string,
    targetAsset: string,
    amount: number,
    preferences?: {
      prioritize?: 'cost' | 'time' | 'security'
      maxSlippage?: number
      maxTime?: number
      includeYield?: boolean
    }
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        sourceChain,
        targetChain,
        sourceAsset,
        targetAsset,
        amount: amount.toString(),
        ...(preferences?.prioritize && { prioritize: preferences.prioritize }),
        ...(preferences?.maxSlippage && { maxSlippage: preferences.maxSlippage.toString() }),
        ...(preferences?.maxTime && { maxTime: preferences.maxTime.toString() }),
        ...(preferences?.includeYield && { includeYield: preferences.includeYield.toString() })
      })

      const response = await fetch(`/api/cross-chain/routes?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to find routes')
      }

      setRoutes(result.data)
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find routes'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Execute cross-chain transaction
  const executeTransaction = useCallback(async (
    routeId: string,
    amount: number
  ) => {
    if (!userId) {
      throw new Error('User ID required for transaction execution')
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/cross-chain/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId,
          userId,
          amount
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to execute transaction')
      }

      // Update executions list
      setExecutions(prev => [result.data, ...prev])
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute transaction'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Get yield opportunities
  const getYieldOpportunities = useCallback(async (filters?: CrossChainFilters) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/cross-chain/yield?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch yield opportunities')
      }

      setYieldOpportunities(result.data)
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch yield opportunities'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Optimize yield strategy
  const optimizeYieldStrategy = useCallback(async (
    assets: Record<string, number>,
    targetYield: number,
    riskTolerance: 'low' | 'medium' | 'high',
    duration: number
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/cross-chain/yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets,
          targetYield,
          riskTolerance,
          duration
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to optimize yield strategy')
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize yield strategy'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Monitor executions
  const refreshExecutions = useCallback(async () => {
    if (!userId) return

    try {
      const params = new URLSearchParams({ userId })
      const response = await fetch(`/api/cross-chain/executions?${params}`)
      const result = await response.json()

      if (result.success) {
        setExecutions(result.data)
      }
    } catch (err) {
      console.error('Failed to refresh executions:', err)
    }
  }, [userId])

  // Get analytics
  const refreshAnalytics = useCallback(async (timeframe: string = '7d') => {
    try {
      const params = new URLSearchParams({ timeframe })
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/cross-chain/analytics?${params}`)
      const result = await response.json()

      if (result.success) {
        setAnalytics(result.data)
      }
    } catch (err) {
      console.error('Failed to refresh analytics:', err)
    }
  }, [userId])

  // Control execution (pause, resume, cancel)
  const controlExecution = useCallback(async (
    executionId: string,
    action: 'pause' | 'resume' | 'cancel'
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/cross-chain/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionId,
          action
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || `Failed to ${action} execution`)
      }

      // Refresh executions after control action
      await refreshExecutions()
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${action} execution`
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [refreshExecutions])

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshExecutions()
      refreshAnalytics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshExecutions, refreshAnalytics])

  // Initial data load
  useEffect(() => {
    if (userId) {
      refreshExecutions()
    }
    refreshAnalytics()
    getYieldOpportunities()
  }, [userId, refreshExecutions, refreshAnalytics, getYieldOpportunities])

  return {
    // Data
    routes,
    executions,
    yieldOpportunities,
    analytics,
    isLoading,
    error,

    // Actions
    findRoutes,
    executeTransaction,
    getYieldOpportunities,
    optimizeYieldStrategy,
    controlExecution,
    refreshExecutions,
    refreshAnalytics,

    // Utilities
    clearError: () => setError(null),
    clearRoutes: () => setRoutes([])
  }
}