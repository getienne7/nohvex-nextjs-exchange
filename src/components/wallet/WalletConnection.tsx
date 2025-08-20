'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { walletConnector } from '@/lib/web3/wallet-connector'
import { 
  WalletIcon, 
  LinkIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface WalletConnectionProps {
  onClose?: () => void
  showManualInput?: boolean
  autoConnectWallet?: string | null
}

export default function WalletConnection({ onClose, showManualInput = true, autoConnectWallet }: WalletConnectionProps) {
  const {
    isConnected,
    connectedWallet,
    isConnecting,
    connectionError,
    connectWallet,
    disconnectWallet,
    manualAddress,
    setManualAddress,
    scanManualAddress,
    isLoadingPortfolio
  } = useWallet()

  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [inputAddress, setInputAddress] = useState(manualAddress)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const supportedWallets = walletConnector.getSupportedWallets()

  const handleWalletConnect = async (providerName: string) => {
    await connectWallet(providerName)
    if (onClose) onClose()
  }

  const handleManualScan = async () => {
    if (inputAddress) {
      await scanManualAddress(inputAddress)
      if (onClose) onClose()
    }
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    setInputAddress('')
  }

  // Auto-connect wallet from /web3 redirect
  useEffect(() => {
    if (autoConnectWallet && !manualAddress && !isLoadingPortfolio) {
      console.log('🚀 Auto-scanning wallet:', autoConnectWallet)
      setInputAddress(autoConnectWallet)
      setShowSuccessMessage(true)
      scanManualAddress(autoConnectWallet)
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [autoConnectWallet, manualAddress, isLoadingPortfolio, scanManualAddress])

  if (isConnected && connectedWallet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
              <p className="text-sm text-gray-400">{connectedWallet.provider}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-400">Address</span>
            <span className="text-sm text-white font-mono">
              {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-gray-400">Network</span>
            <span className="text-sm text-white">Chain ID: {connectedWallet.chainId}</span>
          </div>

          <div className="flex space-x-3 pt-3">
            <button
              onClick={handleDisconnect}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm ring-1 ring-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <WalletIcon className="w-8 h-8 text-blue-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">Connect Wallet</h3>
            <p className="text-sm text-gray-400">Connect your wallet or enter an address to view portfolio</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded-lg flex items-center space-x-2"
        >
          <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-sm text-green-300">
            🎉 Wallet connected successfully! Scanning portfolio...
          </span>
        </motion.div>
      )}

      {connectionError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center space-x-2"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">{connectionError}</span>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Manual Address Input */}
        {showManualInput && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-white">Enter Wallet Address</span>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="0xa2232F6250c89Da64475Fd998d96995cf8828f5a"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleManualScan}
                disabled={!inputAddress || isLoadingPortfolio}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoadingPortfolio ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Scan</span>
                )}
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-gray-400">or</span>
            </div>
          </div>
        )}

        {/* Wallet Connection Options */}
        <div className="space-y-3">
          <button
            onClick={() => setShowWalletOptions(!showWalletOptions)}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <WalletIcon className="w-6 h-6 text-blue-400" />
              <span className="text-white font-medium">Connect Wallet</span>
            </div>
            <motion.div
              animate={{ rotate: showWalletOptions ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>

          <AnimatePresence>
            {showWalletOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {supportedWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleWalletConnect(wallet.name)}
                    disabled={isConnecting || !wallet.isAvailable()}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {wallet.name.slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-white">{wallet.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!wallet.isAvailable() && (
                        <span className="text-xs text-red-400">Not Available</span>
                      )}
                      {isConnecting && (
                        <ArrowPathIcon className="w-4 h-4 text-blue-400 animate-spin" />
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Test Address Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => {
              setInputAddress('0xa2232F6250c89Da64475Fd998d96995cf8828f5a')
              scanManualAddress('0xa2232F6250c89Da64475Fd998d96995cf8828f5a')
            }}
            disabled={isLoadingPortfolio}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
          >
            Try Demo Address
          </button>
        </div>
      </div>
    </motion.div>
  )
}