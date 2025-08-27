'use client'

import { motion } from 'framer-motion'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import { EnhancedPriceAlerts } from '@/components/alerts/EnhancedPriceAlerts'
import AlertsWatcher from '@/components/alerts/AlertsWatcher'
import { BellIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function EnhancedPriceAlertsPage() {
  return (
    <>
      <GlobalNavigation />
      <AlertsWatcher />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <BellIcon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Enhanced Price Alerts</h1>
                <p className="text-gray-400 mt-2">
                  Advanced cryptocurrency price monitoring with templates, bulk operations, and intelligent notifications
                </p>
              </div>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-white font-medium">Smart Templates</h3>
                    <p className="text-gray-400 text-sm">Pre-configured alert patterns for common scenarios</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-white font-medium">Advanced Conditions</h3>
                    <p className="text-gray-400 text-sm">Price, volume, volatility, and technical indicators</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <BellIcon className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">Multi-Channel Alerts</h3>
                    <p className="text-gray-400 text-sm">Email, browser, SMS, and webhook notifications</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Price Alerts Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <EnhancedPriceAlerts />
          </motion.div>
        </div>
      </div>
    </>
  )
}