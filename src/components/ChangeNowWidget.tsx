'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ChangeNowWidgetProps {
  apiKey?: string
  referralCode?: string
  className?: string
}

export function ChangeNowWidget({ 
  apiKey, 
  referralCode, 
  className = "" 
}: ChangeNowWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load ChangeNOW widget script
    const script = document.createElement('script')
    script.src = 'https://changenow.io/embeds/exchange-widget/v2/stepper-widget.js'
    script.async = true
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="changenow.io"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          Live Crypto Exchange
        </h3>
        <p className="text-sm text-gray-400">
          Swap 900+ cryptocurrencies instantly • No KYC • Fixed rates
        </p>
      </div>

      {/* ChangeNOW Widget Container */}
      <div 
        id="changenow-widget" 
        data-merchant-id={apiKey}
        data-referral-code={referralCode}
        className="min-h-[400px] rounded-lg"
      >
        {!isLoaded && (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            Loading exchange widget...
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Fixed exchange rates guaranteed for 15 minutes</p>
        <p>• No hidden fees • Anonymous transactions</p>
        <p>• Powered by ChangeNOW • 900+ assets supported</p>
      </div>
    </motion.div>
  )
}
