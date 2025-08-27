'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface SecuritySettingsProps {
  userId: string
  onSettingsChange?: (settings: any) => void
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  trustedDevices: number
  passwordLastChanged: number
  loginAlerts: boolean
  sessionTimeout: number
  allowedCountries: string[]
  blockedCountries: string[]
  requireStrongPassword: boolean
  logSecurityEvents: boolean
  notifyAdminOnSuspicious: boolean
}

export default function SecuritySettings({ userId, onSettingsChange }: SecuritySettingsProps) {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    trustedDevices: 0,
    passwordLastChanged: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    loginAlerts: true,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    allowedCountries: [],
    blockedCountries: ['CN', 'RU', 'KP'], // Example blocked countries
    requireStrongPassword: true,
    logSecurityEvents: true,
    notifyAdminOnSuspicious: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false)

  useEffect(() => {
    loadSecuritySettings()
  }, [userId])

  const loadSecuritySettings = async () => {
    try {
      // In a real app, this would fetch from your API
      // For now, we'll use default settings
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load security settings:', error)
      setIsLoading(false)
    }
  }

  const updateSetting = async (key: keyof SecuritySettings, value: any) => {
    setIsLoading(true)
    try {
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      onSettingsChange?.(newSettings)
      
      // In a real app, save to backend
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    } catch (error) {
      console.error('Failed to update setting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const daysSinceChange = (Date.now() - settings.passwordLastChanged) / (24 * 60 * 60 * 1000)
    if (daysSinceChange < 30) return { level: 'strong', color: 'text-green-400', message: 'Recently updated' }
    if (daysSinceChange < 90) return { level: 'medium', color: 'text-yellow-400', message: 'Should update soon' }
    return { level: 'weak', color: 'text-red-400', message: 'Update recommended' }
  }

  const formatTimeoutDuration = (ms: number) => {
    const hours = ms / (60 * 60 * 1000)
    if (hours < 1) return `${Math.round(hours * 60)} minutes`
    if (hours < 24) return `${Math.round(hours)} hours`
    return `${Math.round(hours / 24)} days`
  }

  const passwordStrength = getPasswordStrength()

  const securitySections = [
    {
      title: 'Authentication',
      icon: KeyIcon,
      items: [
        {
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          enabled: settings.twoFactorEnabled,
          action: () => updateSetting('twoFactorEnabled', !settings.twoFactorEnabled),
          critical: true
        },
        {
          label: 'Strong Password Policy',
          description: 'Require complex passwords with special characters',
          enabled: settings.requireStrongPassword,
          action: () => updateSetting('requireStrongPassword', !settings.requireStrongPassword)
        },
        {
          label: 'Password Status',
          description: passwordStrength.message,
          status: passwordStrength.level,
          color: passwordStrength.color,
          action: () => {
            // In a real app, this would trigger password change flow
            console.log('Change password triggered')
          },
          isButton: true,
          buttonText: 'Change Password'
        }
      ]
    },
    {
      title: 'Session Management',
      icon: DevicePhoneMobileIcon,
      items: [
        {
          label: 'Session Timeout',
          description: `Automatically log out after ${formatTimeoutDuration(settings.sessionTimeout)}`,
          enabled: true,
          customControl: true
        },
        {
          label: 'Trusted Devices',
          description: `${settings.trustedDevices} devices are marked as trusted`,
          status: settings.trustedDevices > 0 ? 'active' : 'inactive',
          action: () => {
            // In a real app, this would show trusted devices management
            console.log('Manage trusted devices')
          },
          isButton: true,
          buttonText: 'Manage Devices'
        }
      ]
    },
    {
      title: 'Monitoring & Alerts',
      icon: ExclamationTriangleIcon,
      items: [
        {
          label: 'Login Alerts',
          description: 'Get notified of new login attempts',
          enabled: settings.loginAlerts,
          action: () => updateSetting('loginAlerts', !settings.loginAlerts)
        },
        {
          label: 'Security Event Logging',
          description: 'Keep detailed logs of security events',
          enabled: settings.logSecurityEvents,
          action: () => updateSetting('logSecurityEvents', !settings.logSecurityEvents)
        },
        {
          label: 'Admin Notifications',
          description: 'Notify administrators of suspicious activity',
          enabled: settings.notifyAdminOnSuspicious,
          action: () => updateSetting('notifyAdminOnSuspicious', !settings.notifyAdminOnSuspicious)
        }
      ]
    },
    {
      title: 'Geographic Security',
      icon: GlobeAltIcon,
      items: [
        {
          label: 'Blocked Countries',
          description: `${settings.blockedCountries.length} countries are blocked`,
          enabled: settings.blockedCountries.length > 0,
          action: () => {
            // In a real app, this would show country management
            console.log('Manage blocked countries')
          },
          isButton: true,
          buttonText: 'Manage Locations'
        }
      ]
    }
  ]

  const timeoutOptions = [
    { label: '15 minutes', value: 15 * 60 * 1000 },
    { label: '1 hour', value: 60 * 60 * 1000 },
    { label: '4 hours', value: 4 * 60 * 60 * 1000 },
    { label: '12 hours', value: 12 * 60 * 60 * 1000 },
    { label: '24 hours', value: 24 * 60 * 60 * 1000 },
    { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Security Settings</h2>
        </div>

        <div className="space-y-8">
          {securitySections.map((section, sectionIndex) => {
            const SectionIcon = section.icon
            return (
              <div key={section.title}>
                <div className="flex items-center space-x-2 mb-4">
                  <SectionIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-white">{section.title}</h3>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (sectionIndex * section.items.length + itemIndex) * 0.1 }}
                      className="bg-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-white">{item.label}</span>
                            {item.critical && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                Critical
                              </span>
                            )}
                            {item.status && (
                              <span className={`text-sm ${item.color || 'text-gray-400'}`}>
                                ({item.status})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          {item.customControl && item.label === 'Session Timeout' && (
                            <select
                              value={settings.sessionTimeout}
                              onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                              disabled={isLoading}
                              className="bg-slate-600 text-white rounded px-3 py-1 text-sm border border-slate-500"
                            >
                              {timeoutOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {item.isButton ? (
                            <button
                              onClick={item.action}
                              disabled={isLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                            >
                              {item.buttonText}
                            </button>
                          ) : !item.customControl && (
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.enabled}
                                onChange={item.action}
                                disabled={isLoading}
                                className="sr-only"
                              />
                              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                                item.enabled ? 'bg-blue-600' : 'bg-slate-600'
                              }`}>
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                  item.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Password Policy Details */}
        <div className="mt-8 pt-6 border-t border-slate-600">
          <button
            onClick={() => setShowPasswordPolicy(!showPasswordPolicy)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            {showPasswordPolicy ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
            <span>Password Policy Details</span>
          </button>

          {showPasswordPolicy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-slate-700 rounded-lg"
            >
              <h4 className="font-medium text-white mb-3">Password Requirements</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Minimum 12 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Uppercase letters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Lowercase letters</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Numbers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Special symbols</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">No common passwords</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}