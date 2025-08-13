'use client'

import { AdvancedPortfolio } from '@/components/AdvancedPortfolio'
import { SimplePortfolio } from '@/components/SimplePortfolio'
import { RealTimePortfolio } from '@/components/RealTimePortfolio'
import { WebSocketProvider } from '@/hooks/useWebSocket'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import { useState } from 'react'
import { ChartBarIcon, Cog6ToothIcon, WifiIcon } from '@heroicons/react/24/outline'

export default function PortfolioPage() {
  const [portfolioMode, setPortfolioMode] = useState<'simple' | 'advanced' | 'realtime'>('realtime')

  return (
    <WebSocketProvider>
      <GlobalNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          {/* Portfolio Mode Toggle */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg backdrop-blur-sm ring-1 ring-white/20">
              <button
                onClick={() => setPortfolioMode('simple')}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  portfolioMode === 'simple'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ChartBarIcon className="h-4 w-4" />
                Simple
              </button>
              <button
                onClick={() => setPortfolioMode('advanced')}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  portfolioMode === 'advanced'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Advanced
              </button>
              <button
                onClick={() => setPortfolioMode('realtime')}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  portfolioMode === 'realtime'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <WifiIcon className="h-4 w-4" />
                Real-Time
                <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
              </button>
            </div>
          </div>
          
          {/* Render appropriate component */}
          {portfolioMode === 'simple' && <SimplePortfolio />}
          {portfolioMode === 'advanced' && <AdvancedPortfolio />}
          {portfolioMode === 'realtime' && <RealTimePortfolio />}
        </div>
      </div>
    </WebSocketProvider>
  )
}
