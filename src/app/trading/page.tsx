'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChangeNowWidget } from '@/components/ChangeNowWidget'
import { PortfolioTrading } from '@/components/PortfolioTrading'
import { GlobalNavigation } from '@/components/GlobalNavigation'

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'exchange'>('portfolio')

  return (
    <>
      <GlobalNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Trading Hub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg leading-8 text-gray-400"
          >
            Choose your trading experience - Portfolio management or Real crypto swaps
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📊 Portfolio Trading
            </button>
            <button
              onClick={() => setActiveTab('exchange')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'exchange'
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔄 Real Exchange
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          {activeTab === 'portfolio' ? (
            <div>
              <PortfolioTrading />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  💡 <strong>Portfolio Trading:</strong> Practice with your internal balance. 
                  Perfect for testing strategies and learning to trade.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <ChangeNowWidget 
                apiKey={process.env.NEXT_PUBLIC_CHANGENOW_API_KEY || 'demo-api-key'}
                referralCode={process.env.NEXT_PUBLIC_CHANGENOW_REFERRAL || 'demo-referral'}
              />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  🚀 <strong>Real Exchange:</strong> Swap actual cryptocurrencies instantly. 
                  900+ assets • No KYC • Fixed rates guaranteed.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid max-w-4xl mx-auto grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Portfolio Trading</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>✅ Practice with virtual balance</li>
              <li>✅ Real-time price updates</li>
              <li>✅ Transaction history tracking</li>
              <li>✅ Portfolio performance analytics</li>
              <li>✅ Risk-free learning environment</li>
              <li>✅ Instant execution</li>
            </ul>
          </div>
          
          <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">🔄 Real Exchange</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>✅ Actual cryptocurrency swaps</li>
              <li>✅ 900+ supported assets</li>
              <li>✅ Cross-chain exchanges</li>
              <li>✅ Fixed rates guaranteed</li>
              <li>✅ No KYC required</li>
              <li>✅ Anonymous transactions</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  )
}
