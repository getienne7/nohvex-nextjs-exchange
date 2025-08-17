'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GlobalNavigation } from '@/components/GlobalNavigation'
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup'
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  PaintBrushIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import '@/lib/alerts-poller'
import { NotificationPreferences, PrivacySettings } from '@/types/user-preferences'
import { BackupCodesManager } from '@/components/auth/BackupCodesManager'
import { useNotify } from '@/components/notifications'

type Operator = 'GT' | 'LT'

type AlertItem = {
  id: string
  symbol: string
  operator: Operator
  threshold: number
  active: boolean
  lastTriggeredAt?: string | Date | null
}

function PriceAlertsSection() {
  const [symbol, setSymbol] = useState('BTC')
  const [operator, setOperator] = useState<Operator>('GT')
  const [threshold, setThreshold] = useState<number>(50000)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const notify = useNotify()

  const loadAlerts = async () => {
    const res = await fetch('/api/alerts', { cache: 'no-store' })
    const data = await res.json()
    setAlerts(data.alerts ?? [])
  }

  useEffect(() => { loadAlerts() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const resp = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, operator, threshold: Number(threshold) })
      })
      if (resp.ok) notify.success('Alert created', `${symbol} ${operator} ${threshold}`)
      await loadAlerts()
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    const resp = await fetch(`/api/alerts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) })
    if (resp.ok) notify.info(active ? 'Alert enabled' : 'Alert paused')
    await loadAlerts()
  }

  const remove = async (id: string) => {
    const resp = await fetch(`/api/alerts/${id}`, { method: 'DELETE' })
    if (resp.ok) notify.warning('Alert deleted')
    await loadAlerts()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Price Alerts</h3>
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input className="px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white" value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} placeholder="Symbol e.g. BTC"/>
        <select className="px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white" value={operator} onChange={e=>setOperator(e.target.value as Operator)}>
          <option value="GT">GT ({'>'})</option>
          <option value="LT">LT ({'<'})</option>
        </select>
        <input className="px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white" type="number" step="0.0001" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} placeholder="Threshold (USD)"/>
        <button disabled={isSubmitting} className="px-3 py-2 bg-blue-600 rounded-lg text-white">{isSubmitting ? 'Adding...' : 'Add Alert'}</button>
      </form>
      <div className="space-y-2">
        {alerts.map(a => (
          <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-200">
            <div>
              <span className="font-mono">{a.symbol}</span> {a.operator} {a.threshold} USD
              {a.lastTriggeredAt && <span className="ml-2 text-xs text-gray-400">last: {new Date(a.lastTriggeredAt).toLocaleString()}</span>}
            </div>
            <div className="space-x-2">
              <button onClick={()=>toggleActive(a.id, !a.active)} className={`px-2 py-1 rounded ${a.active?'bg-emerald-600':'bg-gray-600'}`}>{a.active?'Active':'Paused'}</button>
              <button onClick={()=>remove(a.id)} className="px-2 py-1 bg-red-600 rounded">Delete</button>
            </div>
          </div>
        ))}
        {alerts.length===0 && <div className="text-gray-400 text-sm">No alerts yet.</div>}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    push: false,
    sms: false,
    priceAlerts: true,
    tradeConfirmations: true,
    marketNews: false,
    portfolioUpdates: true,
    systemAnnouncements: true,
    weeklyReports: false
  })
  
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showPortfolio: false,
    showTrades: true,
    showProfile: true,
    allowMessages: true,
    allowFollowers: false,
    shareAnalytics: false
  })
  
  // Removed unused trading and appearance state to satisfy lint rules

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Check 2FA status on component mount
  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const response = await fetch('/api/auth/2fa/status')
        const data = await response.json()
        if (data.success) {
          setTwoFactorEnabled(data.enabled)
          // Also save to localStorage for persistence
          localStorage.setItem(`2fa_enabled_${session?.user?.email}`, data.enabled.toString())
        }
      } catch {
        console.error('Error checking 2FA status')
        // Fallback to localStorage if API fails
        if (session?.user?.email) {
          const stored = localStorage.getItem(`2fa_enabled_${session.user.email}`)
          if (stored !== null) {
            setTwoFactorEnabled(stored === 'true')
          }
        }
      }
    }

    if (session) {
      check2FAStatus()
    }
  }, [session])

  const handleTwoFactorComplete = () => {
    setTwoFactorEnabled(true)
    setShowTwoFactorSetup(false)
    setSuccessMessage('Two-factor authentication has been successfully enabled!')
    setTimeout(() => setSuccessMessage(''), 5000)
    // Save to localStorage for persistence
    if (session?.user?.email) {
      localStorage.setItem(`2fa_enabled_${session.user.email}`, 'true')
    }
  }

  const handleTwoFactorCancel = () => {
    setShowTwoFactorSetup(false)
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      if (data.success) {
        setTwoFactorEnabled(false)
        setSuccessMessage('Two-factor authentication has been disabled.')
        setTimeout(() => setSuccessMessage(''), 5000)
        // Clear from localStorage
        if (session?.user?.email) {
          localStorage.setItem(`2fa_enabled_${session.user.email}`, 'false')
        }
      } else {
        setErrorMessage(data.error || 'Failed to disable two-factor authentication')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch {
      setErrorMessage('Network error occurred. Please try again.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

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
                {/* Price Alerts MVP */}
                <PriceAlertsSection />
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
                    onClick={() => setNotifications({...notifications, priceAlerts: !notifications.priceAlerts})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.priceAlerts ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.priceAlerts ? 'translate-x-6' : 'translate-x-1'
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
                    onClick={() => setNotifications({...notifications, tradeConfirmations: !notifications.tradeConfirmations})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.tradeConfirmations ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.tradeConfirmations ? 'translate-x-6' : 'translate-x-1'
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
                    onClick={() => setNotifications({...notifications, marketNews: !notifications.marketNews})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.marketNews ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.marketNews ? 'translate-x-6' : 'translate-x-1'
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
                  
                  {/* Success/Error Messages */}
                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="w-5 h-5 text-green-400" />
                        <span className="text-green-300">{successMessage}</span>
                      </div>
                    </div>
                  )}
                  
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                        <span className="text-red-300">{errorMessage}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <button className="flex items-center space-x-3 w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                      <KeyIcon className="w-5 h-5" />
                      <span>Change Password</span>
                    </button>
                    
                    {!twoFactorEnabled ? (
                      <button 
                        onClick={() => setShowTwoFactorSetup(true)}
                        className="flex items-center space-x-3 w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                      >
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Enable Two-Factor Authentication</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <CheckIcon className="w-5 h-5 text-green-400" />
                          <span className="text-green-300">Two-Factor Authentication Enabled</span>
                        </div>

                        {/* Backup Codes Manager */}
                        <div className="mt-3">
                          {/* Lazy import pattern is fine; direct import at top for simplicity */}
                          <BackupCodesManager />
                        </div>

                        <button 
                          onClick={handleDisable2FA}
                          disabled={isLoading}
                          className="flex items-center space-x-3 w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-300 hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-300" />
                          ) : (
                            <ExclamationTriangleIcon className="w-5 h-5" />
                          )}
                          <span>{isLoading ? 'Disabling...' : 'Disable Two-Factor Authentication'}</span>
                        </button>
                      </div>
                    )}
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
      
      {/* Two Factor Setup Modal */}
      <AnimatePresence>
        {showTwoFactorSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-xl p-6 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <TwoFactorSetup 
                onComplete={handleTwoFactorComplete}
                onCancel={handleTwoFactorCancel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
