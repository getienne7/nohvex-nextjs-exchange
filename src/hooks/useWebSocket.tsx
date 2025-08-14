'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface WebSocketMessage {
  type: 'price_update' | 'portfolio_update' | 'notification' | 'market_alert'
  data: any
  timestamp: string
}

interface PriceUpdate {
  symbol: string
  price: number
  change_24h: number
  volume: number
  timestamp: string
}

interface PortfolioUpdate {
  user_id: string
  total_value: number
  total_pnl: number
  holdings: {
    symbol: string
    amount: number
    current_value: number
    pnl: number
  }[]
  timestamp: string
}

interface MarketAlert {
  id: string
  type: 'price_threshold' | 'portfolio_change' | 'volatility_alert'
  message: string
  symbol?: string
  value?: number
  timestamp: string
}

interface WebSocketContextType {
  isConnected: boolean
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
  sendMessage: (message: any) => void
  latestPrices: { [symbol: string]: PriceUpdate }
  portfolioUpdates: PortfolioUpdate | null
  marketAlerts: MarketAlert[]
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}

// Real-time price hook
export function useRealTimePrices(symbols: string[] = []) {
  const { latestPrices, subscribe, unsubscribe, isConnected } = useWebSocket()
  
  useEffect(() => {
    if (symbols.length > 0 && isConnected) {
      symbols.forEach(symbol => subscribe(`price_${symbol}`))
      
      return () => {
        symbols.forEach(symbol => unsubscribe(`price_${symbol}`))
      }
    }
  }, [symbols, subscribe, unsubscribe, isConnected])

  return {
    prices: latestPrices,
    isConnected,
    symbols: Object.keys(latestPrices)
  }
}

// Real-time portfolio hook
export function useRealTimePortfolio() {
  const { portfolioUpdates, subscribe, unsubscribe, isConnected } = useWebSocket()
  const { data: session } = useSession()
  
  useEffect(() => {
    if (session && isConnected) {
      subscribe('portfolio_updates')
      
      return () => {
        unsubscribe('portfolio_updates')
      }
    }
  }, [session, subscribe, unsubscribe, isConnected])

  return {
    portfolioData: portfolioUpdates,
    isConnected,
    lastUpdate: portfolioUpdates?.timestamp
  }
}

// Market alerts hook
export function useMarketAlerts() {
  const { marketAlerts, subscribe, unsubscribe, isConnected } = useWebSocket()
  
  useEffect(() => {
    if (isConnected) {
      subscribe('market_alerts')
      
      return () => {
        unsubscribe('market_alerts')
      }
    }
  }, [subscribe, unsubscribe, isConnected])

  return {
    alerts: marketAlerts,
    isConnected,
    alertCount: marketAlerts.length
  }
}

interface WebSocketProviderProps {
  children: React.ReactNode
  url?: string
}

export function WebSocketProvider({ 
  children, 
  url = typeof window !== 'undefined' && process.env.NODE_ENV === 'production' 
    ? 'wss://your-domain.com/ws' 
    : 'ws://localhost:3001/ws' 
}: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [latestPrices, setLatestPrices] = useState<{ [symbol: string]: PriceUpdate }>({})
  const [portfolioUpdates, setPortfolioUpdates] = useState<PortfolioUpdate | null>(null)
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([])
  
  const { data: session } = useSession()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const subscriptionsRef = useRef<Set<string>>(new Set())

  // Initialize intervals refs
  const intervalsRef = useRef<{
    price?: NodeJS.Timeout
    portfolio?: NodeJS.Timeout
    alerts?: NodeJS.Timeout
  }>({})

  // Start simulated connection
  const startSimulation = useCallback(() => {
    setConnectionStatus('connecting')
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus('connected')
      
      // Start simulating price updates
      intervalsRef.current.price = setInterval(() => {
        const symbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'AVAX']
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
        
        const basePrice = randomSymbol === 'BTC' ? 45000 : randomSymbol === 'ETH' ? 3000 : 1000
        const price = basePrice * (1 + (Math.random() - 0.5) * 0.02) // 2% variance
        const change24h = (Math.random() - 0.5) * 10 // ±5% change
        
        const priceUpdate: PriceUpdate = {
          symbol: randomSymbol,
          price,
          change_24h: change24h,
          volume: Math.random() * 1000000,
          timestamp: new Date().toISOString()
        }
        
        setLatestPrices(prev => ({
          ...prev,
          [randomSymbol]: priceUpdate
        }))
      }, 3000) // Update every 3 seconds

      // Start simulating portfolio updates
      intervalsRef.current.portfolio = setInterval(() => {
        const portfolioUpdate: PortfolioUpdate = {
          user_id: 'demo-user',
          total_value: 50000 * (1 + (Math.random() - 0.5) * 0.01),
          total_pnl: (Math.random() - 0.3) * 5000,
          holdings: [
            {
              symbol: 'BTC',
              amount: 1.2,
              current_value: 45000 * 1.2 * (1 + (Math.random() - 0.5) * 0.02),
              pnl: (Math.random() - 0.3) * 2000
            },
            {
              symbol: 'ETH',
              amount: 10,
              current_value: 3000 * 10 * (1 + (Math.random() - 0.5) * 0.02),
              pnl: (Math.random() - 0.3) * 1500
            }
          ],
          timestamp: new Date().toISOString()
        }
        setPortfolioUpdates(portfolioUpdate)
      }, 6000) // Update every 6 seconds

      // Simulate random market alerts
      intervalsRef.current.alerts = setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance of alert
          const alerts = [
            'BTC price crossed $45,000!',
            'High volatility detected in ETH',
            'Portfolio gained 2% in the last hour',
            'New all-time high for SOL',
            'Strong volume spike in ADA'
          ]
          
          const randomAlert = alerts[Math.floor(Math.random() * alerts.length)]
          const alert: MarketAlert = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'price_threshold',
            message: randomAlert,
            timestamp: new Date().toISOString()
          }
          
          setMarketAlerts(prev => [alert, ...prev.slice(0, 9)]) // Keep last 10 alerts
        }
      }, 10000) // Check every 10 seconds
    }, 1000)
  }, [])

  // Stop simulation
  const stopSimulation = useCallback(() => {
    Object.values(intervalsRef.current).forEach(interval => {
      if (interval) clearInterval(interval)
    })
    intervalsRef.current = {}
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  const connect = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      return
    }

    // For now, we'll simulate the connection
    startSimulation()

    /* Real WebSocket implementation would look like this:
    try {
      setConnectionStatus('connecting')
      const newSocket = new WebSocket(url)
      
      newSocket.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        
        // Authenticate if session exists
        if (session) {
          newSocket.send(JSON.stringify({
            type: 'auth',
            token: session.accessToken
          }))
        }
      }
      
      newSocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      newSocket.onclose = () => {
        setIsConnected(false)
        setConnectionStatus('disconnected')
        setSocket(null)
        
        // Auto-reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1
            connect()
          }, delay)
        }
      }
      
      newSocket.onerror = () => {
        setConnectionStatus('error')
      }
      
      setSocket(newSocket)
    } catch (error) {
      setConnectionStatus('error')
      console.error('WebSocket connection failed:', error)
    }
    */
  }, [url, session, startSimulation])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socket) {
      socket.close()
    }
    
    stopSimulation()
    setSocket(null)
  }, [socket, stopSimulation])

  const subscribe = useCallback((channel: string) => {
    subscriptionsRef.current.add(channel)
    
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        channel
      }))
    }
  }, [socket])

  const unsubscribe = useCallback((channel: string) => {
    subscriptionsRef.current.delete(channel)
    
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        channel
      }))
    }
  }, [socket])

  const sendMessage = useCallback((message: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    }
  }, [socket])

  // Auto-connect when component mounts
  useEffect(() => {
    startSimulation()
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      stopSimulation()
    }
  }, [startSimulation, stopSimulation]) // Only run on mount/unmount

  const value: WebSocketContextType = {
    isConnected,
    subscribe,
    unsubscribe,
    sendMessage,
    latestPrices,
    portfolioUpdates,
    marketAlerts,
    connectionStatus
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
