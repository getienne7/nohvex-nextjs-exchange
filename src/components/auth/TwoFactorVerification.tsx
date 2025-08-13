'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon,
  ArrowLeftIcon,
  KeyIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

interface TwoFactorVerificationProps {
  email: string
  onVerified: () => void
  onBack: () => void
  onError: (error: string) => void
}

export function TwoFactorVerification({ email, onVerified, onBack, onError }: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useBackupCode, setUseBackupCode] = useState(false)

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!verificationCode) {
      onError('Please enter a verification code')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode.replace(/\s/g, ''),
          useBackupCode,
          action: 'login'
        })
      })

      const data = await response.json()

      if (data.success) {
        onVerified()
      } else {
        onError(data.error || 'Invalid verification code')
        setVerificationCode('')
      }
    } catch (error) {
      onError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-400">
          Enter the {useBackupCode ? 'backup code' : '6-digit code'} from your authenticator app
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Signing in as: <span className="text-blue-400">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerification} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {useBackupCode ? 'Backup Code' : 'Verification Code'}
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder={useBackupCode ? 'Enter backup code' : 'Enter 6-digit code'}
            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-wider"
            maxLength={useBackupCode ? 12 : 6}
            pattern={useBackupCode ? "[A-Z0-9]{8,12}" : "[0-9]{6}"}
            autoComplete="one-time-code"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode)
              setVerificationCode('')
            }}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading || !verificationCode}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <KeyIcon className="w-4 h-4 mr-2" />
                Verify & Sign In
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-300 font-medium">Can't access your authenticator?</p>
            <p className="text-yellow-200">
              Use a backup code or contact support if you've lost access to your authentication device.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
