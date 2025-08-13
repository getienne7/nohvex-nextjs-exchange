'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  GlobeAltIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState({
    email: true,
    price: true,
    trades: false,
    news: true
  })
  const [privacy, setPrivacy] = useState({
    showPortfolio: false,
    showTrades: true
  })

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
    <>
      <GlobalNavigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Cog6ToothIcon className="w-8 h-8 mr-3" />
              Settings
            </h1>
            <p className="text-gray-400 mt-2">
              Customize your NOHVEX experience and manage your preferences
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <BellIcon className="w-5 h-5 mr-2" />
                Notification Preferences
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Email Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive important updates via email</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, email: !notifications.email})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Price Alerts</h3>
                    <p className="text-gray-400 text-sm">Get notified when crypto prices hit your targets</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, price: !notifications.price})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.price ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.price ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Trade Confirmations</h3>
                    <p className="text-gray-400 text-sm">Confirm each trade before execution</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, trades: !notifications.trades})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.trades ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.trades ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Market News</h3>
                    <p className="text-gray-400 text-sm">Stay updated with crypto market news</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, news: !notifications.news})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.news ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.news ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Privacy & Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Privacy & Security
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Show Portfolio Publicly</h3>
                    <p className="text-gray-400 text-sm">Allow others to see your portfolio performance</p>
                  </div>
                  <button
                    onClick={() => setPrivacy({...privacy, showPortfolio: !privacy.showPortfolio})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.showPortfolio ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showPortfolio ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Show Trade History</h3>
                    <p className="text-gray-400 text-sm">Display your trading activity to other users</p>
                  </div>
                  <button
                    onClick={() => setPrivacy({...privacy, showTrades: !privacy.showTrades})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.showTrades ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showTrades ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-white font-medium mb-4">Security Actions</h3>
                  <div className="space-y-3">
                    <button className="flex items-center space-x-3 w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                      <KeyIcon className="w-5 h-5" />
                      <span>Change Password</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                      <ShieldCheckIcon className="w-5 h-5" />
                      <span>Enable Two-Factor Authentication (Coming Soon)</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <PaintBrushIcon className="w-5 h-5 mr-2" />
                Appearance
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-3">Theme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-lg border-2 border-blue-500 text-white">
                      <div className="text-sm font-medium">Dark (Current)</div>
                      <div className="text-xs text-gray-400 mt-1">Default dark theme</div>
                    </button>
                    <button className="p-4 bg-gray-200 rounded-lg border-2 border-transparent text-gray-600 opacity-50">
                      <div className="text-sm font-medium">Light (Coming Soon)</div>
                      <div className="text-xs text-gray-500 mt-1">Clean light theme</div>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-lg border-2 border-transparent text-white opacity-50">
                      <div className="text-sm font-medium">Galaxy (Coming Soon)</div>
                      <div className="text-xs text-gray-400 mt-1">Purple space theme</div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-3">Language</h3>
                  <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="en">English (Current)</option>
                    <option value="es" disabled>Español (Coming Soon)</option>
                    <option value="fr" disabled>Français (Coming Soon)</option>
                    <option value="de" disabled>Deutsch (Coming Soon)</option>
                    <option value="ja" disabled>日本語 (Coming Soon)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end"
            >
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-200 font-medium">
                Save All Settings
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
