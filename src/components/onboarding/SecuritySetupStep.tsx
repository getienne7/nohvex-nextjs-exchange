'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  KeyIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { OnboardingStep, UserProgress } from '@/lib/onboarding'

interface SecuritySetupStepProps {
  step: OnboardingStep
  userProgress: UserProgress | null
  walletAddress?: string
  onComplete: () => void
  onSkip: () => void
}

export default function SecuritySetupStep({
  step,
  userProgress,
  walletAddress,
  onComplete,
  onSkip
}: SecuritySetupStepProps) {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'enable2fa' | 'backup' | 'complete'>('intro')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [backupCodesSaved, setBackupCodesSaved] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  // Mock backup codes - in real implementation, these would come from the backend
  const backupCodes = [
    '4f2a-8b1c-9d3e',
    '7g5h-2j8k-1l6m',
    '9n4p-6q2r-8s7t',
    '3u9v-5w1x-7y4z',
    '8a6b-4c9d-2e5f',
    '1g8h-3i7j-9k2l',
    '6m5n-8o1p-4q7r',
    '2s9t-7u3v-5w8x'
  ]

  const handleEnable2FA = () => {
    setCurrentPhase('enable2fa')
  }

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true)
      setCurrentPhase('backup')
    }
  }

  const handleSaveBackupCodes = () => {
    setBackupCodesSaved(true)
    setCurrentPhase('complete')
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
  }

  const downloadBackupCodes = () => {
    const codesText = `NOHVEX Backup Codes\n\nSave these codes in a secure location. Each code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nohvex-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheckIcon className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Secure Your Account
        </h1>
        
        <p className="text-lg text-gray-600">
          Add an extra layer of security to protect your DeFi portfolio and transactions
        </p>
      </motion.div>

      {currentPhase === 'intro' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-blue-900 font-semibold mb-2">Why enable 2FA?</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Two-factor authentication (2FA) adds an extra security layer by requiring a second 
                  verification step when signing in or performing sensitive actions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">Protect against unauthorized access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">Secure high-value transactions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">Industry security standard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">Peace of mind</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <KeyIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Two-Factor Authentication
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Use Google Authenticator, Authy, or similar apps to generate secure codes
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div>• Time-based verification codes</div>
                <div>• Works offline</div>
                <div>• Industry standard security</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ClipboardDocumentIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Backup Codes
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                One-time recovery codes to regain access if you lose your authenticator
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div>• 8 unique backup codes</div>
                <div>• Use when device is unavailable</div>
                <div>• Store securely offline</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleEnable2FA}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mr-4"
            >
              Enable 2FA Now
            </button>
            
            <button
              onClick={onSkip}
              className="text-gray-600 hover:text-gray-800 px-4 py-3"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      )}

      {currentPhase === 'enable2fa' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Scan QR Code
              </h3>
              
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCodeIcon className="w-24 h-24 text-gray-400" />
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              
              <div className="bg-gray-50 rounded p-3 text-xs font-mono text-gray-800 mb-4">
                ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456
              </div>
              
              <p className="text-xs text-gray-500">
                Manual entry code (if you can't scan the QR code)
              </p>
            </div>
          </div>

          <div className="max-w-sm mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter verification code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono"
                maxLength={6}
              />
              <button
                onClick={handleVerify2FA}
                disabled={verificationCode.length !== 6}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        </motion.div>
      )}

      {currentPhase === 'backup' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              2FA Enabled Successfully!
            </h3>
            <p className="text-gray-600">
              Now let's save your backup codes for account recovery
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-900 font-semibold mb-2">Important: Save Your Backup Codes</h4>
                <p className="text-yellow-700 text-sm">
                  These backup codes are the only way to regain access to your account if you lose 
                  your authenticator device. Each code can only be used once.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Backup Codes</h4>
                <button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  {showBackupCodes ? (
                    <>
                      <EyeSlashIcon className="w-4 h-4 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Show
                    </>
                  )}
                </button>
              </div>
              
              {showBackupCodes ? (
                <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
                  Click "Show" to reveal backup codes
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={copyBackupCodes}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                  Copy
                </button>
                <button
                  onClick={downloadBackupCodes}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSaveBackupCodes}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              I've Saved My Backup Codes
            </button>
          </div>
        </motion.div>
      )}

      {currentPhase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheckIcon className="w-10 h-10 text-green-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Account Security Complete!
          </h3>
          
          <p className="text-gray-600 mb-8">
            Your account is now protected with two-factor authentication and backup codes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-green-700 font-medium">2FA Enabled</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-green-700 font-medium">Backup Codes Saved</div>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue to Portfolio
          </button>
        </motion.div>
      )}
    </div>
  )
}