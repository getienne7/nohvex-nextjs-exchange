/**
 * NOHVEX SDK Utilities
 * Helper functions and utilities for developers integrating with NOHVEX APIs
 */

export interface NOHVEXConfig {
  apiKey?: string
  baseURL?: string
  timeout?: number
  retries?: number
  debug?: boolean
}

export interface RequestOptions {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
}

export interface APIError {
  message: string
  code: string
  status: number
  details?: any
}

export class NOHVEXAPIError extends Error {
  public code: string
  public status: number
  public details?: any

  constructor(error: APIError) {
    super(error.message)
    this.name = 'NOHVEXAPIError'
    this.code = error.code
    this.status = error.status
    this.details = error.details
  }
}

export class NOHVEXClient {
  private config: Required<NOHVEXConfig>

  constructor(config: NOHVEXConfig = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      baseURL: config.baseURL || 'http://localhost:3000/api',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      debug: config.debug || false
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T = any>(
    endpoint: string, 
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    const requestConfig: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(options.timeout || this.config.timeout)
    }

    if (this.config.debug) {
      console.log('NOHVEX API Request:', { url, method: options.method || 'GET', headers, body: options.body })
    }

    let lastError: Error
    for (let attempt = 0; attempt <= (options.retries || this.config.retries); attempt++) {
      try {
        const response = await fetch(url, requestConfig)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            message: 'Request failed', 
            code: 'REQUEST_FAILED' 
          }))
          
          throw new NOHVEXAPIError({
            message: errorData.error || errorData.message || 'Request failed',
            code: errorData.code || 'REQUEST_FAILED',
            status: response.status,
            details: errorData
          })
        }

        const data = await response.json()
        
        if (this.config.debug) {
          console.log('NOHVEX API Response:', data)
        }

        return data
        
      } catch (error) {
        lastError = error as Error
        
        if (attempt < (options.retries || this.config.retries)) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        break
      }
    }

    throw lastError!
  }

  /**
   * Portfolio API methods
   */
  public portfolio = {
    /**
     * Get user portfolios
     */
    list: async (params?: { 
      userId?: string
      riskLevel?: string
      page?: number
      limit?: number 
    }) => {
      const query = new URLSearchParams()
      if (params?.userId) query.append('userId', params.userId)
      if (params?.riskLevel) query.append('riskLevel', params.riskLevel)
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())

      return this.request(`/portfolio?${query.toString()}`)
    },

    /**
     * Create new portfolio
     */
    create: async (portfolio: {
      name: string
      description?: string
      currency?: string
      riskLevel?: 'conservative' | 'moderate' | 'aggressive'
      initialAssets?: any[]
    }) => {
      return this.request('/portfolio', {
        method: 'POST',
        body: JSON.stringify(portfolio)
      })
    },

    /**
     * Get portfolio by ID
     */
    get: async (portfolioId: string) => {
      return this.request(`/portfolio/${portfolioId}`)
    },

    /**
     * Update portfolio
     */
    update: async (portfolioId: string, updates: any) => {
      return this.request(`/portfolio/${portfolioId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
    },

    /**
     * Delete portfolio
     */
    delete: async (portfolioId: string) => {
      return this.request(`/portfolio/${portfolioId}`, {
        method: 'DELETE'
      })
    }
  }

  /**
   * Cross-chain API methods
   */
  public crossChain = {
    /**
     * Find optimal cross-chain routes
     */
    findRoutes: async (params: {
      sourceChain: string
      targetChain: string
      sourceAsset: string
      targetAsset: string
      amount: number
      prioritize?: 'cost' | 'time' | 'security'
      includeYield?: boolean
    }) => {
      const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v.toString()]))
      return this.request(`/cross-chain/routes?${query.toString()}`)
    },

    /**
     * Execute cross-chain transaction
     */
    execute: async (params: {
      routeId: string
      userId: string
      amount: number
      slippageTolerance?: number
    }) => {
      return this.request('/cross-chain/routes', {
        method: 'POST',
        body: JSON.stringify(params)
      })
    },

    /**
     * Get yield opportunities
     */
    getYieldOpportunities: async (params?: {
      sourceChain?: string
      targetChain?: string
      asset?: string
      minApy?: number
      maxRisk?: 'low' | 'medium' | 'high'
      strategy?: string
    }) => {
      const query = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.append(key, value.toString())
        })
      }
      return this.request(`/cross-chain/yield?${query.toString()}`)
    },

    /**
     * Get cross-chain analytics
     */
    getAnalytics: async (params?: {
      timeframe?: '1d' | '7d' | '30d' | '90d'
      userId?: string
    }) => {
      const query = new URLSearchParams()
      if (params?.timeframe) query.append('timeframe', params.timeframe)
      if (params?.userId) query.append('userId', params.userId)
      return this.request(`/cross-chain/analytics?${query.toString()}`)
    }
  }

  /**
   * Institutional API methods
   */
  public institutional = {
    /**
     * Get institutional portfolios
     */
    getPortfolios: async (params: {
      institutionId: string
      includeRisk?: boolean
      includeCompliance?: boolean
    }) => {
      const query = new URLSearchParams()
      query.append('institutionId', params.institutionId)
      if (params.includeRisk !== undefined) query.append('includeRisk', params.includeRisk.toString())
      if (params.includeCompliance !== undefined) query.append('includeCompliance', params.includeCompliance.toString())
      
      return this.request(`/institutional/portfolios?${query.toString()}`)
    },

    /**
     * Create institutional portfolio
     */
    createPortfolio: async (portfolio: {
      institutionId: string
      name: string
      description: string
      totalInvested: number
      currency: string
      riskLevel: 'conservative' | 'moderate' | 'aggressive' | 'high-risk'
      benchmark: string
      allocations: any[]
      rebalancing: any
    }) => {
      return this.request('/institutional/portfolios', {
        method: 'POST',
        body: JSON.stringify(portfolio)
      })
    },

    /**
     * Generate rebalancing proposal
     */
    generateRebalancing: async (params: {
      portfolioId: string
      userId: string
      method?: string
    }) => {
      return this.request('/institutional/rebalancing', {
        method: 'POST',
        body: JSON.stringify(params)
      })
    },

    /**
     * Generate institutional report
     */
    generateReport: async (params: {
      portfolioId: string
      type: 'performance' | 'risk' | 'compliance' | 'allocation' | 'attribution'
      period: string
      userId: string
    }) => {
      return this.request('/institutional/reports', {
        method: 'POST',
        body: JSON.stringify(params)
      })
    }
  }

  /**
   * Utility methods
   */
  public utils = {
    /**
     * Test API connection
     */
    ping: async () => {
      return this.request('/health')
    },

    /**
     * Get API documentation
     */
    getDocs: async (format: 'json' | 'yaml' = 'json') => {
      return this.request(`/docs/openapi?format=${format}`)
    },

    /**
     * Validate API key
     */
    validateKey: async () => {
      return this.request('/auth/validate')
    }
  }
}

/**
 * Helper functions
 */
export const createClient = (config: NOHVEXConfig): NOHVEXClient => {
  return new NOHVEXClient(config)
}

export const validateAddress = (address: string, chain: string): boolean => {
  // Basic address validation - extend as needed
  const patterns: Record<string, RegExp> = {
    ethereum: /^0x[a-fA-F0-9]{40}$/,
    bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    polygon: /^0x[a-fA-F0-9]{40}$/,
    bsc: /^0x[a-fA-F0-9]{40}$/,
    arbitrum: /^0x[a-fA-F0-9]{40}$/,
    optimism: /^0x[a-fA-F0-9]{40}$/
  }

  const pattern = patterns[chain.toLowerCase()]
  return pattern ? pattern.test(address) : false
}

export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatPercentage = (
  value: number, 
  decimals: number = 2, 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100)
}

export const calculatePnL = (
  currentValue: number, 
  invested: number
): { pnl: number; pnlPercentage: number } => {
  const pnl = currentValue - invested
  const pnlPercentage = invested > 0 ? (pnl / invested) * 100 : 0
  
  return { pnl, pnlPercentage }
}

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * WebSocket utilities for real-time data
 */
export class NOHVEXWebSocket {
  private ws: WebSocket | null = null
  private config: NOHVEXConfig
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(config: NOHVEXConfig) {
    this.config = config
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.baseURL?.replace('http', 'ws') + '/ws'
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        
        // Authenticate if API key is provided
        if (this.config.apiKey) {
          this.send({
            type: 'auth',
            token: this.config.apiKey
          })
        }
        
        resolve()
      }
      
      this.ws.onerror = (error) => {
        reject(error)
      }
      
      this.ws.onclose = () => {
        this.handleReconnect()
      }
    })
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        this.connect().catch(() => {
          // Reconnection failed, will try again
        })
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
    }
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  subscribe(channel: string, callback: (data: any) => void): void {
    this.send({
      type: 'subscribe',
      channel
    })
    
    if (this.ws) {
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.channel === channel) {
          callback(data.data)
        }
      }
    }
  }

  unsubscribe(channel: string): void {
    this.send({
      type: 'unsubscribe',
      channel
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const createWebSocketClient = (config: NOHVEXConfig): NOHVEXWebSocket => {
  return new NOHVEXWebSocket(config)
}

// Export default client for convenience
export default NOHVEXClient