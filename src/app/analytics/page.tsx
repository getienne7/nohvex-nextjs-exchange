'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  PresentationChartLineIcon 
} from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

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
            Portfolio Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            Advanced analytics and insights for your DeFi portfolio
          </p>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
              <PresentationChartLineIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Advanced Analytics Coming Soon</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              We&apos;re building powerful analytics tools to help you understand your DeFi portfolio performance, 
              track yield farming returns, analyze risk metrics, and optimize your investment strategies.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/5 rounded-lg p-6">
                <ChartBarIcon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Performance Metrics</h3>
                <p className="text-gray-400 text-sm">
                  Track ROI, APY, and portfolio performance over time
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6">
                <ArrowTrendingUpIcon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Risk Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Analyze portfolio risk and diversification metrics
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Yield Tracking</h3>
                <p className="text-gray-400 text-sm">
                  Monitor DeFi yields and farming rewards
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}