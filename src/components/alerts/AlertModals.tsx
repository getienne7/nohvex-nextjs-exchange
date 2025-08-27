'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  PlusIcon,
  SparklesIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { 
  PriceAlert, 
  AlertTemplate, 
  AlertType, 
  AlertOperator, 
  AlertFrequency,
  PriceAlertPreferences 
} from '@/types/price-alerts'

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (alertData: Partial<PriceAlert>) => void
  loading?: boolean
}

export function CreateAlertModal({ isOpen, onClose, onSubmit, loading }: CreateAlertModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    operator: 'GT' as AlertOperator,
    threshold: 0,
    emailEnabled: true,
    browserEnabled: true,
    priority: 'medium' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-2xl"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Price Alert</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Alert Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Bitcoin Alert"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Symbol *</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  placeholder="BTC"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Condition</label>
                <select
                  value={formData.operator}
                  onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value as AlertOperator }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GT">Greater Than (&gt;)</option>
                  <option value="LT">Less Than (&lt;)</option>
                  <option value="EQ">Equals (=)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Threshold (USD) *</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.threshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0 }))}
                  placeholder="50000"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Notification Settings</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ComputerDesktopIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Browser Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, browserEnabled: !prev.browserEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.browserEnabled ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.browserEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white">Email Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.emailEnabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                <span>{loading ? 'Creating...' : 'Create Alert'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  templates: AlertTemplate[]
  onApplyTemplate: (templateId: string, symbols: string[]) => void
  loading?: boolean
}

export function TemplateModal({ isOpen, onClose, templates, onApplyTemplate, loading }: TemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AlertTemplate | null>(null)
  const [symbols, setSymbols] = useState<string[]>(['BTC'])
  const [symbolInput, setSymbolInput] = useState('')

  const addSymbol = () => {
    const symbol = symbolInput.trim().toUpperCase()
    if (symbol && !symbols.includes(symbol)) {
      setSymbols(prev => [...prev, symbol])
      setSymbolInput('')
    }
  }

  const handleApply = () => {
    if (!selectedTemplate || symbols.length === 0) return
    onApplyTemplate(selectedTemplate.id, symbols)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-4xl"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Alert Templates</h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Choose Template</h3>
                <div className="space-y-3">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <h4 className="text-white font-medium">{template.name}</h4>
                      <p className="text-gray-400 text-sm">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Configuration</h3>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Symbols</label>
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={symbolInput}
                          onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                          placeholder="BTC, ETH, etc."
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" onClick={addSymbol} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {symbols.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {symbols.map(symbol => (
                            <span key={symbol} className="px-2 py-1 bg-white/10 text-white text-sm rounded">
                              {symbol}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Select a template to configure alerts</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={loading || !selectedTemplate || symbols.length === 0}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Apply Template'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export function PreferencesModal({ isOpen, onClose }: {
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-2xl"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Alert Preferences</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-400 py-8">
              Preferences configuration UI would be implemented here
            </div>
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                Save Preferences
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}