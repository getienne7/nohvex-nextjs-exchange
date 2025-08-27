'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { 
  PasswordValidator, 
  PasswordStrengthResult, 
  PasswordPolicy 
} from '@/lib/password-validator'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  policy?: Partial<PasswordPolicy>
  showStrengthMeter?: boolean
  showSuggestions?: boolean
  className?: string
  onValidationChange?: (isValid: boolean, result: PasswordStrengthResult) => void
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Enter password',
  disabled = false,
  policy,
  showStrengthMeter = true,
  showSuggestions = true,
  className = '',
  onValidationChange
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [strengthResult, setStrengthResult] = useState<PasswordStrengthResult | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (value) {
      const result = PasswordValidator.validatePassword(value, policy)
      setStrengthResult(result)
      onValidationChange?.(result.isValid, result)
    } else {
      setStrengthResult(null)
      onValidationChange?.(false, {
        score: 0,
        level: 'very-weak',
        feedback: [],
        isValid: false,
        entropy: 0,
        timeToCrack: 'Instantly'
      })
    }
  }, [value, policy, onValidationChange])

  const getStrengthBarWidth = () => {
    if (!strengthResult) return '0%'
    return `${strengthResult.score}%`
  }

  const getStrengthBarColor = () => {
    if (!strengthResult) return 'bg-gray-400'
    return PasswordValidator.getStrengthBgColor(strengthResult.level)
  }

  const getStrengthText = () => {
    if (!strengthResult) return ''
    return strengthResult.level.charAt(0).toUpperCase() + strengthResult.level.slice(1).replace('-', ' ')
  }

  const getStrengthTextColor = () => {
    if (!strengthResult) return 'text-gray-400'
    return PasswordValidator.getStrengthColor(strengthResult.level)
  }

  return (
    <div className="space-y-3">
      {/* Password Input */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-3 pr-12 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            strengthResult && value
              ? strengthResult.isValid
                ? 'border-green-500'
                : 'border-red-500'
              : ''
          } ${className}`}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Strength Meter */}
      {showStrengthMeter && value && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Password strength:</span>
            <span className={`font-medium ${getStrengthTextColor()}`}>
              {getStrengthText()}
            </span>
          </div>
          
          <div className="w-full bg-slate-600 rounded-full h-2">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: getStrengthBarWidth() }}
              transition={{ duration: 0.3 }}
              className={`h-2 rounded-full transition-colors ${getStrengthBarColor()}`}
            />
          </div>
          
          {strengthResult && (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Score: {strengthResult.score}/100</span>
              <span>Time to crack: {strengthResult.timeToCrack}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Feedback and Suggestions */}
      <AnimatePresence>
        {showSuggestions && strengthResult && (isFocused || strengthResult.feedback.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Validation Feedback */}
            {strengthResult.feedback.length > 0 && (
              <div className="space-y-2">
                {strengthResult.feedback.map((feedback, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start space-x-2 text-sm ${
                      feedback.includes('Excellent') || feedback.includes('Good')
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {feedback.includes('Excellent') || feedback.includes('Good') ? (
                      <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{feedback}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {!strengthResult.isValid && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-start space-x-2 mb-2">
                  <InformationCircleIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-400">Suggestions:</span>
                </div>
                <ul className="space-y-1 text-sm text-blue-300 ml-6">
                  {PasswordValidator.generateSuggestions(strengthResult.feedback).map((suggestion, index) => (
                    <li key={index} className="list-disc">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Password Requirements Checklist */}
            {isFocused && (
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Requirements:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'At least 12 characters', check: value.length >= 12 },
                    { label: 'Uppercase letter', check: /[A-Z]/.test(value) },
                    { label: 'Lowercase letter', check: /[a-z]/.test(value) },
                    { label: 'Number', check: /[0-9]/.test(value) },
                    { label: 'Special character', check: /[^A-Za-z0-9]/.test(value) },
                    { label: 'No common patterns', check: strengthResult ? !strengthResult.feedback.some(f => f.includes('common') || f.includes('pattern')) : false }
                  ].map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {req.check ? (
                        <CheckCircleIcon className="w-3 h-3 text-green-400" />
                      ) : (
                        <XCircleIcon className="w-3 h-3 text-gray-400" />
                      )}
                      <span className={req.check ? 'text-green-400' : 'text-gray-400'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}