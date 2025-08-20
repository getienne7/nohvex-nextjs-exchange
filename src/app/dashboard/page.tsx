'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import WalletPortfolioOverview from '@/components/dashboard/WalletPortfolioOverview'
import RealTimePortfolioOverview from '@/components/dashboard/RealTimePortfolioOverview'
import WalletBasedCryptoChart from '@/components/dashboard/WalletBasedCryptoChart'
import WalletBasedTransactionHistory from '@/components/dashboard/WalletBasedTransactionHistory'
import { GlobalNavigation } from '@/components/GlobalNavigation'

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [autoConnectWallet, setAutoConnectWallet] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Handle wallet query parameter from /web3 redirect
  useEffect(() => {
    const walletParam = searchParams.get('wallet')
    if (walletParam && walletParam !== autoConnectWallet) {
      console.log('🔗 Auto-connecting wallet from URL:', walletParam)
      setAutoConnectWallet(walletParam)
      
      // Clear the URL parameter after processing
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('wallet')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams, autoConnectWallet])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {session.user.name || session.user.email}
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor your DeFi portfolio performance and track your decentralized investments
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Portfolio Overview' },
                { id: 'realtime', name: 'Live Portfolio (NOWNodes)' },
                { id: 'charts', name: 'Advanced Charts' },
                { id: 'history', name: 'Transaction History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <WalletPortfolioOverview autoConnectWallet={autoConnectWallet} />}
          {activeTab === 'realtime' && <RealTimePortfolioOverview />}
          {activeTab === 'charts' && <WalletBasedCryptoChart />}
          {activeTab === 'history' && <WalletBasedTransactionHistory />}
        </motion.div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
