'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BellIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  TagIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { 
  PriceAlert, 
  AlertTemplate, 
  AlertStats, 
  PriceAlertPreferences,
  AlertStatus,
  AlertType,
  AlertOperator,
  AlertFrequency 
} from '@/types/price-alerts'
import { useNotify } from '@/components/notifications'
import { CreateAlertModal, TemplateModal, PreferencesModal } from './AlertModals'

interface EnhancedPriceAlertsProps {
  className?: string
}

export function EnhancedPriceAlerts({ className }: EnhancedPriceAlertsProps) {
  const notify = useNotify()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [templates, setTemplates] = useState<AlertTemplate[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [preferences, setPreferences] = useState<PriceAlertPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null)
  const [filter, setFilter] = useState<{
    status?: AlertStatus
    type?: AlertType
    symbol?: string
  }>({})

  // Load data
  useEffect(() => {
    loadAlerts()
    loadTemplates()
    loadStats()
    loadPreferences()
  }, [])

  const loadAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.type) params.append('type', filter.type)
      if (filter.symbol) params.append('symbol', filter.symbol)

      const response = await fetch(`/api/alerts/enhanced?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Failed to load alerts:', error)
      notify.error('Load Failed', 'Unable to load price alerts')
    }
  }, [filter, notify])

  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts/enhanced?action=templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts/enhanced?action=stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }, [])

  const loadPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts/enhanced?action=preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }, [])

  // Alert operations
  const createAlert = async (alertData: Partial<PriceAlert>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/alerts/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      })

      if (response.ok) {
        const data = await response.json()
        setAlerts(prev => [data.alert, ...prev])
        notify.success('Alert Created', `${alertData.name || alertData.symbol} alert created successfully`)
        setShowCreateModal(false)
        loadStats() // Refresh stats
      } else {
        const error = await response.json()
        notify.error('Create Failed', error.error || 'Failed to create alert')
      }
    } catch (error) {
      notify.error('Network Error', 'Unable to create alert')
    } finally {
      setLoading(false)
    }
  }

  const updateAlert = async (alertId: string, updates: Partial<PriceAlert>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/alerts/enhanced', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, ...updates })
      })

      if (response.ok) {
        const data = await response.json()
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? data.alert : alert
        ))
        notify.success('Alert Updated', 'Alert updated successfully')
        setEditingAlert(null)
      } else {
        notify.error('Update Failed', 'Failed to update alert')
      }
    } catch (error) {
      notify.error('Network Error', 'Unable to update alert')
    } finally {
      setLoading(false)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/enhanced?alertId=${alertId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
        notify.success('Alert Deleted', 'Alert deleted successfully')
        loadStats() // Refresh stats
      } else {
        notify.error('Delete Failed', 'Failed to delete alert')
      }
    } catch (error) {
      notify.error('Network Error', 'Unable to delete alert')
    }
  }

  const bulkDeleteAlerts = async () => {
    if (selectedAlerts.size === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/alerts/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_delete',
          alertIds: Array.from(selectedAlerts)
        })
      })

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => !selectedAlerts.has(alert.id)))
        setSelectedAlerts(new Set())
        notify.success('Alerts Deleted', `${selectedAlerts.size} alerts deleted successfully`)
        loadStats()
      } else {
        notify.error('Delete Failed', 'Failed to delete alerts')
      }
    } catch (error) {
      notify.error('Network Error', 'Unable to delete alerts')
    } finally {
      setLoading(false)
    }
  }

  const toggleAlertStatus = async (alertId: string, isActive: boolean) => {
    await updateAlert(alertId, { isActive })
  }

  const createFromTemplate = async (templateId: string, symbols: string[], customThresholds?: { [symbol: string]: number }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/alerts/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_from_template',
          templateId,
          symbols,
          customThresholds
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAlerts(prev => [...data.alerts, ...prev])
        notify.success('Template Applied', `${data.alerts.length} alerts created from template`)
        setShowTemplateModal(false)
        loadStats()
      } else {
        notify.error('Template Failed', 'Failed to create alerts from template')
      }
    } catch (error) {
      notify.error('Network Error', 'Unable to create alerts from template')
    } finally {
      setLoading(false)
    }
  }

  // Utility functions
  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'triggered': return 'text-blue-600 bg-blue-100'
      case 'expired': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getOperatorIcon = (operator: AlertOperator) => {
    switch (operator) {
      case 'GT': return <ArrowTrendingUpIcon className="w-4 h-4" />
      case 'LT': return <ArrowTrendingDownIcon className="w-4 h-4" />
      case 'EQ': return <span className="w-4 h-4 text-center font-bold">=</span>
      default: return null
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price)
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter.status && alert.status !== filter.status) return false
    if (filter.type && alert.type !== filter.type) return false
    if (filter.symbol && !alert.symbol.toLowerCase().includes(filter.symbol.toLowerCase())) return false
    return true
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeAlerts}</p>
                <p className="text-gray-400 text-sm">Active Alerts</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.triggeredToday}</p>
                <p className="text-gray-400 text-sm">Triggered Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.triggeredThisWeek}</p>
                <p className="text-gray-400 text-sm">This Week</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
                <p className="text-gray-400 text-sm">Success Rate</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center justify-between gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Alert</span>
          </button>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Templates</span>
          </button>

          {selectedAlerts.size > 0 && (
            <button
              onClick={bulkDeleteAlerts}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete ({selectedAlerts.size})</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setShowPreferencesModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <BellIcon className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as AlertStatus || undefined }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="triggered">Triggered</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as AlertType || undefined }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="price_threshold">Price Threshold</option>
              <option value="price_change">Price Change</option>
              <option value="volume_spike">Volume Spike</option>
              <option value="volatility">Volatility</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Symbol</label>
            <input
              type="text"
              value={filter.symbol || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, symbol: e.target.value }))}
              placeholder="Filter by symbol..."
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilter({})}
              className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Price Alerts</h3>
            <span className="text-gray-400 text-sm">{filteredAlerts.length} alerts</span>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Alerts Found</h3>
              <p className="text-gray-400 mb-6">
                {Object.keys(filter).length > 0 
                  ? 'No alerts match your current filters.'
                  : 'Create your first price alert to get notified of important price movements.'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Create Your First Alert
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.has(alert.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedAlerts)
                          if (e.target.checked) {
                            newSelected.add(alert.id)
                          } else {
                            newSelected.delete(alert.id)
                          }
                          setSelectedAlerts(newSelected)
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-medium">{alert.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-white">{alert.symbol}</span>
                            {getOperatorIcon(alert.operator)}
                            <span className="text-white">{formatPrice(alert.threshold)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{alert.cooldownMinutes}m cooldown</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <span>Triggered: {alert.triggerCount}</span>
                            {alert.maxTriggers && <span>/ {alert.maxTriggers}</span>}
                          </div>
                        </div>

                        {alert.description && (
                          <p className="text-gray-400 text-sm mb-2">{alert.description}</p>
                        )}

                        {alert.tags && alert.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mb-2">
                            <TagIcon className="w-4 h-4 text-gray-400" />
                            <div className="flex space-x-1">
                              {alert.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notification Methods */}
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            {alert.browserEnabled && <ComputerDesktopIcon className="w-4 h-4" />}
                            {alert.emailEnabled && <EnvelopeIcon className="w-4 h-4" />}
                            {alert.smsEnabled && <DevicePhoneMobileIcon className="w-4 h-4" />}
                          </div>
                          
                          {alert.lastTriggeredAt && (
                            <span>
                              Last triggered: {new Date(alert.lastTriggeredAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAlertStatus(alert.id, !alert.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          alert.isActive 
                            ? 'text-green-400 hover:bg-green-500/10' 
                            : 'text-gray-400 hover:bg-gray-500/10'
                        }`}
                        title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                      >
                        {alert.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setEditingAlert(alert)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit alert"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete alert"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals would be implemented here */}
      {/* CreateAlertModal, TemplateModal, PreferencesModal, EditAlertModal */}
      
      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createAlert}
        loading={loading}
      />

      {/* Template Modal */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={templates}
        onApplyTemplate={createFromTemplate}
        loading={loading}
      />

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
      />
    </div>
  )
}

export default EnhancedPriceAlerts