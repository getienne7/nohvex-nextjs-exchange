'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import CrossChainBridgeDashboard from '@/components/bridge/CrossChainBridgeDashboard'
import RouteComparison from '@/components/bridge/RouteComparison'
import { useCrossChain } from '@/hooks/useCrossChain'
import { CrossChainRoute } from '@/lib/cross-chain-aggregator'

export default function CrossChainBridgePage() {
  const [showRouteComparison, setShowRouteComparison] = useState(false)
  const [bridgeAmount, setBridgeAmount] = useState(1000)
  const { routes, findRoutes, isLoading } = useCrossChain('demo-user-123')

  const handleRouteSearch = async () => {
    try {
      await findRoutes(
        'ethereum',
        'polygon', 
        'USDC',
        'USDC',
        bridgeAmount,
        {
          prioritize: 'cost',
          includeYield: true
        }
      )
      setShowRouteComparison(true)
    } catch (error) {
      console.error('Failed to find routes:', error)
    }
  }

  const handleRouteSelect = (route: CrossChainRoute) => {
    console.log('Selected route:', route)
    setShowRouteComparison(false)
    // Here you would typically execute the route
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Cross-Chain Bridge Aggregator
            </h1>
            <p className="text-gray-400 text-lg">
              Find optimal routes across multiple bridge protocols for seamless cross-chain transfers
            </p>
          </motion.div>
        </div>
      </div>

      {/* Quick Bridge Demo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quick Route Finder</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={bridgeAmount}
                onChange={(e) => setBridgeAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                From Chain
              </label>
              <select
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select source chain"
              >
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="bsc">BSC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                To Chain
              </label>
              <select
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select target chain"
              >
                <option value="polygon">Polygon</option>
                <option value="ethereum">Ethereum</option>
                <option value="arbitrum">Arbitrum</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRouteSearch}
                disabled={isLoading || bridgeAmount <= 0}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Finding Routes...' : 'Find Routes'}
              </button>
            </div>
          </div>
          
          {routes.length > 0 && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400">
                ✅ Found {routes.length} optimal routes! 
                <button
                  onClick={() => setShowRouteComparison(true)}
                  className="ml-2 text-blue-300 hover:text-blue-200 underline"
                >
                  Compare Routes
                </button>
              </p>
            </div>
          )}
        </motion.div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CrossChainBridgeDashboard userId="demo-user-123" />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Multi-Protocol Aggregation',
              description: 'Integrates with Multichain, Stargate, LayerZero, and Wormhole for comprehensive coverage',
              icon: '🌐'
            },
            {
              title: 'Yield-Optimized Routing',
              description: 'Find routes that not only bridge assets but also maximize yield opportunities',
              icon: '📈'
            },
            {
              title: 'Real-Time Monitoring',
              description: 'Track your cross-chain transactions with live status updates and analytics',
              icon: '👀'
            },
            {
              title: 'Cost Optimization',
              description: 'Compare fees across protocols to find the most cost-effective routes',
              icon: '💰'
            },
            {
              title: 'Security Scoring',
              description: 'Each route includes security assessment based on protocol audits and TVL',
              icon: '🛡️'
            },
            {
              title: 'Advanced Analytics',
              description: 'Comprehensive insights into bridge performance and user transaction patterns',
              icon: '📊'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Cross-Chain Bridge Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Volume', value: '$2.4B+', description: 'Bridged across all protocols' },
              { label: 'Supported Chains', value: '7+', description: 'Major blockchain networks' },
              { label: 'Bridge Protocols', value: '4+', description: 'Integrated bridge solutions' },
              { label: 'Average Time', value: '5-15min', description: 'Typical bridge completion' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</div>
                <div className="text-white font-medium mb-1">{stat.label}</div>
                <div className="text-gray-400 text-sm">{stat.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Route Comparison Modal */}
      {showRouteComparison && routes.length > 0 && (
        <RouteComparison
          routes={routes}
          onSelectRoute={handleRouteSelect}
          onClose={() => setShowRouteComparison(false)}
          amount={bridgeAmount}
        />
      )}
    </div>
  )
}