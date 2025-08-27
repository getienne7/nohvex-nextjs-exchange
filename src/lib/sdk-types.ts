/**
 * NOHVEX SDK TypeScript Definitions
 * Official TypeScript SDK for NOHVEX DeFi Platform API
 * 
 * This file provides comprehensive type definitions for the NOHVEX API
 * Usage: npm install @nohvex/sdk
 */

declare module '@nohvex/sdk' {
  // Configuration Types
  export interface SDKConfig {
    apiKey?: string
    authToken?: string
    baseUrl?: string
    environment?: 'development' | 'staging' | 'production'
    timeout?: number
    retries?: number
    rateLimit?: {
      requests: number
      window: number
    }
  }

  // Portfolio Types
  export interface Portfolio {
    id: string
    userId: string
    name: string
    description?: string
    totalValue: number
    totalInvested: number
    pnl: number
    pnlPercentage: number
    currency: string
    riskLevel: 'conservative' | 'moderate' | 'aggressive'
    createdAt: number
    updatedAt: number
    assets: Asset[]
  }

  export interface Asset {
    id: string
    symbol: string
    name: string
    type: 'crypto' | 'defi' | 'nft' | 'derivative'
    allocation: number
    currentValue: number
    invested: number
    pnl: number
    pnlPercentage: number
    chain: string
    protocol?: string
    lastUpdated: number
  }

  // Cross-Chain Types
  export interface CrossChainRoute {
    id: string
    sourceChain: string
    targetChain: string
    sourceAsset: string
    targetAsset: string
    protocol: string
    estimatedTime: number
    estimatedCost: number
    estimatedOutput: number
    securityScore: number
    liquidityScore: number
    steps: RouteStep[]
  }

  export interface RouteStep {
    stepNumber: number
    action: string
    protocol: string
    estimatedTime: number
    estimatedCost: number
  }

  // DeFi Strategy Types
  export interface DeFiStrategy {
    id: string
    name: string
    description: string
    category: 'yield-farming' | 'liquidity-mining' | 'arbitrage' | 'staking' | 'lending'
    riskLevel: 'low' | 'medium' | 'high' | 'very-high'
    expectedApy: number
    minInvestment: number
    maxInvestment?: number
    protocols: string[]
    chains: string[]
    tvl: number
    performance: {
      apy7d: number
      apy30d: number
      maxDrawdown: number
      sharpeRatio: number
      volatility: number
    }
    risks: {
      impermanentLoss: number
      smartContractRisk: number
      liquidityRisk: number
      protocolRisk: number
    }
  }

  // Yield Optimization Types
  export interface YieldOpportunity {
    id: string
    protocol: string
    chain: string
    apy: number
    tvl: number
    riskScore: number
    assets: string[]
    minDeposit: number
    lockupPeriod: number
    features: string[]
    impermanentLossRisk: number
  }

  // Analytics Types
  export interface AnalyticsData {
    metrics: AnalyticsMetric[]
    aggregations: Record<string, any>
    trends: TrendData[]
  }

  export interface AnalyticsMetric {
    name: string
    value: number
    unit: string
    change: number
    changePercentage: number
    timestamp: number
    category: string
  }

  export interface TrendData {
    timestamp: number
    value: number
    metric: string
  }

  // Risk Management Types
  export interface RiskMetrics {
    portfolioRisk: number
    concentrationRisk: number
    liquidityRisk: number
    protocolRisk: number
    marketRisk: number
    overallScore: number
    recommendations: string[]
  }

  // WebSocket Types
  export interface WebSocketMessage {
    type: 'subscribe' | 'unsubscribe' | 'portfolio.update' | 'price.change' | 'alert'
    topics?: string[]
    data?: any
    timestamp: number
  }

  // Error Types
  export class NohvexError extends Error {
    code: string
    details?: any
    constructor(message: string, code: string, details?: any)
  }

  export class AuthenticationError extends NohvexError {}
  export class NetworkError extends NohvexError {}
  export class RateLimitError extends NohvexError {}
  export class ValidationError extends NohvexError {}

  // Main SDK Class
  export class NohvexSDK {
    constructor(config: SDKConfig)
    
    // Portfolio Management
    portfolio: {
      list(options?: {
        riskLevel?: string[]
        page?: number
        limit?: number
      }): Promise<Portfolio[]>
      
      get(portfolioId: string): Promise<Portfolio>
      
      create(portfolioData: {
        name: string
        description?: string
        riskLevel: string
        currency?: string
        initialAssets?: Asset[]
      }): Promise<Portfolio>
      
      update(portfolioId: string, updates: Partial<Portfolio>): Promise<Portfolio>
      
      delete(portfolioId: string): Promise<void>
      
      getAnalytics(portfolioId: string, options?: {
        timeRange?: string
        includeRisk?: boolean
        includeBenchmark?: boolean
      }): Promise<AnalyticsData>
      
      getRiskMetrics(portfolioId: string): Promise<RiskMetrics>
      
      rebalance(portfolioId: string, options?: {
        strategy?: string
        maxDeviation?: number
        executeImmediately?: boolean
      }): Promise<any>
    }
    
    // Cross-Chain Operations
    crossChain: {
      findRoutes(params: {
        sourceChain: string
        targetChain: string
        sourceAsset: string
        targetAsset: string
        amount: number
        prioritize?: 'cost' | 'time' | 'security'
      }): Promise<CrossChainRoute[]>
      
      execute(params: {
        routeId: string
        amount: number
        slippageTolerance?: number
        deadline?: number
      }): Promise<any>
      
      getTransferStatus(transferId: string): Promise<any>
      
      getSupportedChains(): Promise<string[]>
      
      getSupportedAssets(chain: string): Promise<string[]>
    }
    
    // DeFi Strategies
    defi: {
      getStrategies(filters?: {
        riskLevel?: string[]
        category?: string[]
        minApy?: number
        chains?: string[]
      }): Promise<DeFiStrategy[]>
      
      executeStrategy(strategyId: string, amount: number, options?: {
        autoRebalance?: boolean
        stopLoss?: number
        takeProfit?: number
      }): Promise<any>
      
      getStrategyAnalytics(strategyId: string): Promise<any>
    }
    
    // Yield Optimization
    yield: {
      findOpportunities(filters?: {
        minAPY?: number
        maxRisk?: string
        chains?: string[]
        amount?: number
      }): Promise<YieldOpportunity[]>
      
      execute(opportunityId: string, amount: number, options?: {
        autoCompound?: boolean
        duration?: string
      }): Promise<any>
      
      getStatus(executionId: string): Promise<any>
      
      exit(executionId: string): Promise<any>
    }
    
    // Analytics
    analytics: {
      get(options?: {
        start?: number
        end?: number
        category?: string[]
        userId?: string
        limit?: number
      }): Promise<AnalyticsData>
      
      getRealTime(): Promise<any>
      
      export(format: 'json' | 'csv', options?: any): Promise<string>
    }
    
    // WebSocket
    websocket: {
      connect(options: {
        topics: string[]
        onMessage: (data: WebSocketMessage) => void
        onError?: (error: Error) => void
        onClose?: () => void
      }): Promise<WebSocket>
      
      disconnect(): void
      
      subscribe(topics: string[]): void
      
      unsubscribe(topics: string[]): void
    }
    
    // Authentication
    auth: {
      getOAuth2Url(params: {
        clientId: string
        redirectUri: string
        scopes: string[]
      }): string
      
      exchangeCode(code: string): Promise<{
        accessToken: string
        refreshToken: string
        expiresIn: number
      }>
      
      refreshToken(refreshToken: string): Promise<{
        accessToken: string
        expiresIn: number
      }>
      
      validateToken(token: string): Promise<boolean>
    }
    
    // Utility methods
    setAuthToken(token: string): void
    getApiKey(): string | undefined
    isAuthenticated(): boolean
  }

  // Default export
  export default NohvexSDK
}

// Package.json template for SDK
export const PACKAGE_TEMPLATE = {
  "name": "@nohvex/sdk",
  "version": "1.2.0",
  "description": "Official TypeScript SDK for NOHVEX DeFi Platform API",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "CHANGELOG.md"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src/**/*.ts",
    "docs": "typedoc src/index.ts"
  },
  "keywords": [
    "nohvex",
    "defi",
    "crypto",
    "blockchain",
    "portfolio",
    "cross-chain",
    "yield-farming",
    "api",
    "sdk",
    "typescript"
  ],
  "author": "NOHVEX Team <dev@nohvex.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/nohvex/sdk-typescript.git"
  },
  "homepage": "https://docs.nohvex.com/sdk",
  "bugs": {
    "url": "https://github.com/nohvex/sdk-typescript/issues"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "ws": "^8.14.0",
    "eventemitter3": "^5.0.0"
  },
  "devDependencies": {
    "@types/ws": "^8.5.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.0",
    "rollup": "^4.0.0",
    "typedoc": "^0.25.0",
    "typescript": "^5.2.0"
  },
  "peerDependencies": {
    "typescript": ">=4.5.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}