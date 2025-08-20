/**
 * DEX Trading Hook
 * React hook for interacting with DEX trading functionality
 */

import { useState, useCallback, useEffect } from 'react'
import { Token, TradeParams } from '@/lib/dex/index'

export interface DEXQuote {
  amountOut: string
  priceImpact: number
  route: string[]
  gasEstimate: string
  minimumAmountOut: string
  dexName: string
  confidence: number
}

export interface BestRoute {
  bestQuote: DEXQuote
  allQuotes: DEXQuote[]
  savings: string
  savingsPercentage: number
}

export interface TradeResult {
  hash: string
  amountIn: string
  amountOut: string
  gasUsed: string
  effectivePrice: string
  priceImpact: number
  dexUsed: string
}

export interface UseDEXTradingReturn {
  // State
  isLoading: boolean
  error: string | null
  quotes: DEXQuote[]
  bestRoute: BestRoute | null
  supportedTokens: Token[]
  
  // Actions
  getQuotes: (params: TradeParams) => Promise<DEXQuote[]>
  findBestRoute: (params: TradeParams) => Promise<BestRoute>
  executeTrade: (params: TradeParams & { walletAddress: string }) => Promise<TradeResult>
  getSupportedTokens: (chainId: number) => Promise<Token[]>
  getTokenPrice: (tokenA: Token, tokenB: Token) => Promise<number>
  estimateGas: (params: TradeParams) => Promise<{ [dexName: string]: string }>
  
  // Utilities
  clearError: () => void
  reset: () => void
}

export function useDEXTrading(): UseDEXTradingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quotes, setQuotes] = useState<DEXQuote[]>([])
  const [bestRoute, setBestRoute] = useState<BestRoute | null>(null)
  const [supportedTokens, setSupportedTokens] = useState<Token[]>([])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setQuotes([])
    setBestRoute(null)
  }, [])

  const handleApiCall = useCallback(async <T,>(
    apiCall: () => Promise<Response>,
    successCallback?: (data: T) => void
  ): Promise<T | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiCall()
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'API call failed')
      }

      if (successCallback) {
        successCallback(result.data)
      }

      return result.data
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      console.error('DEX Trading Error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getQuotes = useCallback(async (params: TradeParams): Promise<DEXQuote[]> => {
    const result = await handleApiCall<{ quotes: DEXQuote[]; bestQuote: DEXQuote | null }>(
      () => fetch('/api/dex-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getQuote', ...params })
      }),
      (data) => {
        setQuotes(data.quotes)
      }
    )

    return result?.quotes || []
  }, [handleApiCall])

  const findBestRoute = useCallback(async (params: TradeParams): Promise<BestRoute> => {
    const result = await handleApiCall<BestRoute>(
      () => fetch('/api/dex-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'findBestRoute', ...params })
      }),
      (data) => {
        setBestRoute(data)
        setQuotes(data.allQuotes)
      }
    )

    return result || {
      bestQuote: {} as DEXQuote,
      allQuotes: [],
      savings: '0',
      savingsPercentage: 0
    }
  }, [handleApiCall])

  const executeTrade = useCallback(async (
    params: TradeParams & { walletAddress: string }
  ): Promise<TradeResult> => {
    // Note: In a real implementation, this would use Web3 wallet connection
    // instead of sending private keys to the server
    const result = await handleApiCall<TradeResult>(
      () => fetch('/api/dex-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'executeTrade', 
          ...params,
          // In production, this would be handled client-side with wallet connection
          privateKey: null // This will cause the API to return an error for security
        })
      })
    )

    return result || {
      hash: '',
      amountIn: '0',
      amountOut: '0',
      gasUsed: '0',
      effectivePrice: '0',
      priceImpact: 0,
      dexUsed: ''
    }
  }, [handleApiCall])

  const getSupportedTokens = useCallback(async (chainId: number): Promise<Token[]> => {
    const result = await handleApiCall<{ tokens: Token[] }>(
      () => fetch('/api/dex-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSupportedTokens', chainId })
      }),
      (data) => {
        setSupportedTokens(data.tokens)
      }
    )

    return result?.tokens || []
  }, [handleApiCall])

  const getTokenPrice = useCallback(async (tokenA: Token, tokenB: Token): Promise<number> => {
    const result = await handleApiCall<{ price: number }>(
      () => fetch('/api/dex-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getTokenPrice', tokenA, tokenB })
      })
    )

    return result?.price || 0
  }, [handleApiCall])

  const estimateGas = useCallback(async (params: TradeParams): Promise<{ [dexName: string]: string }> => {
    const result = await handleApiCall<{ gasCosts: { [dexName: string]: string } }>(
      () => fetch('/api/dex-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'estimateGas', ...params })
      })
    )

    return result?.gasCosts || {}
  }, [handleApiCall])

  return {
    // State
    isLoading,
    error,
    quotes,
    bestRoute,
    supportedTokens,
    
    // Actions
    getQuotes,
    findBestRoute,
    executeTrade,
    getSupportedTokens,
    getTokenPrice,
    estimateGas,
    
    // Utilities
    clearError,
    reset
  }
}