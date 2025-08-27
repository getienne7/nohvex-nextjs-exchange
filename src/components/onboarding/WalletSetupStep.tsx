'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  WalletIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { OnboardingStep, UserProgress } from '@/lib/onboarding'

interface WalletSetupStepProps {
  step: OnboardingStep
  userProgress: UserProgress | null
  walletAddress?: string
  onComplete: () => void
  onSkip: () => void
}

interface WalletOption {
  id: string
  name: string
  icon: string
  description: string
  isInstalled: boolean
  downloadUrl: string
  popularity: 'high' | 'medium' | 'low'
}

export default function WalletSetupStep({
  step,
  userProgress,
  walletAddress,
  onComplete,
  onSkip
}: WalletSetupStepProps) {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(walletAddress || null)
  const [connectionStep, setConnectionStep] = useState<'choose' | 'connecting' | 'connected'>('choose')
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'The most popular Ethereum wallet with browser extension',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask,
      downloadUrl: 'https://metamask.io/download/',
      popularity: 'high'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '📱',
      description: 'Connect with mobile wallets via QR code scanning',
      isInstalled: true, // Always available
      downloadUrl: '',
      popularity: 'high'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Self-custody wallet from Coinbase',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isCoinbaseWallet,
      downloadUrl: 'https://wallet.coinbase.com/',
      popularity: 'medium'
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '💙',
      description: 'Mobile-first wallet with built-in dApp browser',
      isInstalled: false,
      downloadUrl: 'https://trustwallet.com/',
      popularity: 'medium'
    }
  ]

  useEffect(() => {
    if (walletAddress) {
      setConnectedWallet(walletAddress)
      setConnectionStep('connected')
    }
  }, [walletAddress])

  const handleWalletSelect = async (wallet: WalletOption) => {
    setSelectedWallet(wallet)
    
    if (!wallet.isInstalled && wallet.downloadUrl) {
      window.open(wallet.downloadUrl, '_blank')
      return
    }

    setConnectionStep('connecting')
    
    // Simulate wallet connection process
    try {
      // In a real implementation, this would connect to the actual wallet
      setTimeout(() => {
        setConnectedWallet('0x1234...5678') // Mock address
        setConnectionStep('connected')
      }, 2000)
    } catch (error) {
      setConnectionStep('choose')
      console.error('Wallet connection failed:', error)
    }
  }

  const handleContinue = () => {
    if (connectedWallet) {
      onComplete()
    }
  }

  const securityTips = [
    'Never share your seed phrase with anyone',
    'Always verify transaction details before signing',
    'Use hardware wallets for large amounts',
    'Keep your wallet software updated',
    'Be cautious of phishing websites'
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WalletIcon className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h1>
        
        <p className="text-lg text-gray-600 mb-4">
          Choose a wallet to securely connect to NOHVEX and start managing your DeFi portfolio
        </p>
        
        {connectedWallet && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">
                Wallet Connected: {connectedWallet}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {connectionStep === 'choose' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {walletOptions
              .filter(wallet => showAdvanced || wallet.popularity === 'high')
              .map((wallet, index) => (
              <motion.button
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleWalletSelect(wallet)}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  wallet.isInstalled
                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{wallet.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {wallet.name}
                      </h3>
                      {wallet.popularity === 'high' && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {wallet.description}
                    </p>
                    
                    {wallet.isInstalled ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Ready to connect
                      </div>
                    ) : (
                      <div className="flex items-center text-orange-600 text-sm">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        Need to install first
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showAdvanced ? 'Show less options' : 'Show more wallet options'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-blue-900 font-semibold mb-2">New to crypto wallets?</h4>
                <p className="text-blue-700 text-sm mb-3">
                  A crypto wallet is like a digital bank account that lets you store, send, and receive 
                  cryptocurrencies. It's essential for interacting with DeFi protocols.
                </p>
                <div className="space-y-1">
                  <p className="text-blue-700 text-sm font-medium">We recommend MetaMask for beginners:</p>
                  <ul className="text-blue-600 text-sm space-y-1 ml-4">
                    <li>• Easy to set up and use</li>
                    <li>• Excellent browser integration</li>
                    <li>• Strong security features</li>
                    <li>• Wide DeFi protocol support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {connectionStep === 'connecting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <LinkIcon className="w-8 h-8 text-blue-600" />
            </motion.div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Connecting to {selectedWallet?.name}
          </h3>
          
          <p className="text-gray-600 mb-6">
            Please check your wallet extension and approve the connection request
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-yellow-700 text-sm">
                Make sure to approve the connection in your wallet
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {connectionStep === 'connected' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Wallet Connected Successfully!
          </h3>
          
          <p className="text-gray-600 mb-8">
            Your wallet is now connected and ready to use with NOHVEX
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-8">
            <div className="text-center">
              <div className="text-sm text-green-600 mb-2">Connected Address</div>
              <div className="font-mono text-gray-900 text-sm">
                {connectedWallet}
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Setup
          </button>
        </motion.div>
      )}

      {/* Security Tips Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-gray-50 rounded-lg p-6"
      >
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-gray-600 mr-2" />
          <h4 className="text-lg font-semibold text-gray-900">Security Best Practices</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-600">{tip}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}