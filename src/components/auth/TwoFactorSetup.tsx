'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  QrCodeIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useNotify } from '@/components/notifications'
import type { TwoFactorSetup, Setup2FAResponse } from '@/types/auth'

interface TwoFactorSetupProps {
  onComplete: () => void
  onCancel: () => void
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const notify = useNotify()
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup')
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    initializeSetup()
  }, [])

  const initializeSetup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup')
      const data: Setup2FAResponse = await response.json()

      if (data.success && data.setup) {
        setSetupData(data.setup)
      } else {
        notify.error('Setup Failed', data.error || 'Unable to initialize 2FA setup')
      }
    } catch (error) {
      notify.error('Network Error', 'Unable to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!verificationCode || !password) {
      notify.error('Missing Information', 'Please enter both verification code and password')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationCode: verificationCode.replace(/\s/g, ''),
          password
        })
      })

      const data = await response.json()

      if (data.success) {
        setBackupCodes(data.backupCodesGenerated || [])
        setStep('backup')
        notify.success('2FA Enabled!', 'Two-factor authentication has been successfully enabled')
      } else {
        notify.error('Setup Failed', data.error || 'Unable to complete 2FA setup')
      }
    } catch (error) {
      notify.error('Network Error', 'Unable to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      notify.success('Copied!', `${type} copied to clipboard`)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      notify.error('Copy Failed', 'Unable to copy to clipboard')
    }
  }

  const handleFinish = () => {
    onComplete()
  }

  if (isLoading && !setupData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Initializing 2FA setup...</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enable Two-Factor Authentication</h2>
              <p className="text-gray-400">Secure your account with an additional layer of protection</p>
            </div>

            {setupData && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      <QrCodeIcon className="w-5 h-5 inline mr-2" />
                      Scan QR Code
                    </h3>
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="mx-auto" />
                    </div>
                    <p className="text-sm text-gray-400">
                      Use Google Authenticator, Authy, or any TOTP app
                    </p>
                  </div>

                  {/* Manual Setup */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      <KeyIcon className="w-5 h-5 inline mr-2" />
                      Manual Setup
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Secret Key
                        </label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono break-all">
                            {setupData.manualEntryKey}
                          </code>
                          <button
                            onClick={() => copyToClipboard(setupData.manualEntryKey, 'Secret key')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedCode === setupData.manualEntryKey ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            ) : (
                              <ClipboardIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p><strong>Account:</strong> NohVex Exchange</p>
                        <p><strong>Type:</strong> Time-based (TOTP)</p>
                        <p><strong>Digits:</strong> 6</p>
                        <p><strong>Period:</strong> 30 seconds</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSetupComplete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code from your authenticator app"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !verificationCode || !password}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                      Enable 2FA
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'backup' && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">2FA Enabled Successfully!</h2>
              <p className="text-gray-400">Save your backup codes to complete the setup</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-300 mb-2">Important: Save Your Backup Codes</h3>
                  <p className="text-yellow-200 text-sm">
                    These backup codes can be used to access your account if you lose your authenticator device. 
                    Store them in a safe place - each code can only be used once.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Backup Codes</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showBackupCodes ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'), 'Backup codes')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {showBackupCodes && (
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded text-center text-white font-mono text-sm"
                    >
                      {code}
                    </code>
                  ))}
                </div>
              )}

              {!showBackupCodes && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Click the eye icon to reveal your backup codes</p>
                </div>
              )}
            </div>

            <button
              onClick={handleFinish}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4 inline mr-2" />
              Complete Setup
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
