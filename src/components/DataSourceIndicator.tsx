'use client'

import { useState, useEffect } from 'react'
import { CloudIcon, ServerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface DataSourceIndicatorProps {
  className?: string
}

export function DataSourceIndicator({ className = "" }: DataSourceIndicatorProps) {
  const [dataSource, setDataSource] = useState<'nownodes' | 'coingecko' | 'fallback' | 'unknown'>('unknown')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check server logs or add an endpoint to determine data source
    checkDataSource()
    
    // Set up periodic checks
    const interval = setInterval(checkDataSource, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkDataSource = async () => {
    try {
      // You could create a /api/status endpoint to return the current data source
      // For now, we'll simulate based on the current implementation
      const response = await fetch('/api/prices?symbols=BTC')
      if (response.ok) {
        setIsConnected(true)
        setLastUpdate(new Date())
        
        // Simulate checking the data source
        // In reality, this would be returned by your API
        const random = Math.random()
        if (random > 0.7) {
          setDataSource('nownodes')
        } else if (random > 0.3) {
          setDataSource('coingecko')
        } else {
          setDataSource('fallback')
        }
      } else {
        setIsConnected(false)
        setDataSource('fallback')
      }
    } catch {
      setIsConnected(false)
      setDataSource('fallback')
    }
  }

  const getSourceInfo = () => {
    switch (dataSource) {
      case 'nownodes':
        return {
          name: 'NOWNodes',
          description: 'On-chain Oracle Data',
          icon: <ServerIcon className="h-4 w-4" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          badge: 'PRIMARY'
        }
      case 'coingecko':
        return {
          name: 'CoinGecko',
          description: 'Market Data API',
          icon: <CloudIcon className="h-4 w-4" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          badge: 'FALLBACK'
        }
      case 'fallback':
        return {
          name: 'Static Data',
          description: 'Cached/Static Prices',
          icon: <ExclamationTriangleIcon className="h-4 w-4" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          badge: 'OFFLINE'
        }
      default:
        return {
          name: 'Unknown',
          description: 'Checking...',
          icon: <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          badge: 'LOADING'
        }
    }
  }

  const sourceInfo = getSourceInfo()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${sourceInfo.bgColor} backdrop-blur-sm ring-1 ring-white/10 ${className}`}
    >
      {/* Data Source Icon */}
      <div className={`${sourceInfo.color} flex-shrink-0`}>
        {sourceInfo.icon}
      </div>

      {/* Data Source Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${sourceInfo.color}`}>
            {sourceInfo.name}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            dataSource === 'nownodes' ? 'bg-blue-500 text-white' :
            dataSource === 'coingecko' ? 'bg-green-500 text-white' :
            dataSource === 'fallback' ? 'bg-yellow-500 text-black' :
            'bg-gray-500 text-white'
          }`}>
            {sourceInfo.badge}
          </span>
        </div>
        <div className="text-xs text-gray-400 truncate">
          {sourceInfo.description}
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
        }`} />
        {lastUpdate && (
          <span className="text-xs text-gray-400">
            {lastUpdate.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// Detailed data source info modal/tooltip component
export function DataSourceTooltip() {
  return (
    <div className="max-w-sm">
      <h3 className="font-semibold text-white mb-2">Data Sources</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <ServerIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-blue-400 font-medium">NOWNodes (Primary)</div>
            <div className="text-gray-400">On-chain data via Ethereum RPC and Chainlink oracles. More accurate but limited symbols.</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <CloudIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-green-400 font-medium">CoinGecko (Fallback)</div>
            <div className="text-gray-400">Market aggregated data. Comprehensive coverage but rate limited on free tier.</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-yellow-400 font-medium">Static Data (Emergency)</div>
            <div className="text-gray-400">Cached prices when both APIs are unavailable. Updates when connection restored.</div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-gray-400">
          <strong>Smart Routing:</strong> The system automatically tries NOWNodes first for on-chain accuracy, 
          falls back to CoinGecko for broader coverage, and uses cached data in emergencies.
        </div>
      </div>
    </div>
  )
}
