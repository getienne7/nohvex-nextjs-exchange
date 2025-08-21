'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { 
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface FundingMethod {
  id: string
  name: string
  icon: any
  description: string
  fees: string
  time: string
  available: boolean
}

export default function WalletFunding() {
  const { connectedWallet, manualAddress } = useWallet()
  const [selectedMethod, setSelectedMethod] = useState<string>('crypto')
  const [amount, setAmount] = useState('')
  const [selectedChain, setSelectedChain] = useState('ethereum')
  const [copied, setCopied] = useState(false)

  // Get current wallet address from context
  const walletAddress = connectedWallet?.address || manualAddress

  const fundingMethods: FundingMethod[] = [
    {
      id: 'crypto',
      name: 'Cryptocurrency Deposit',
      icon: QrCodeIcon,
      description: 'Send crypto directly to your wallet',
      fees: 'Network fees only',
      time: '1-15 minutes',
      available: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCardIcon,
      description: 'Buy crypto instantly with your card',
      fees: '3-5% + network fees',
      time: 'Instant',
      available: false
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: BanknotesIcon,
      description: 'Wire transfer or ACH deposit',
      fees: '1-2% + network fees',
      time: '1-3 business days',
      available: false
    }
  ]

  const supportedChains = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '⟠', color: 'blue' },
    { id: 'bsc', name: 'BNB Smart Chain', symbol: 'BNB', icon: '🟡', color: 'yellow' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC', icon: '🟣', color: 'purple' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH', icon: '🔵', color: 'blue' },
    { id: 'optimism', name: 'Optimism', symbol: 'ETH', icon: '🔴', color: 'red' }
  ]

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainInfo = (chainId: string) => {
    const chain = supportedChains.find(c => c.id === chainId)
    return chain || supportedChains[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Add Funds</h2>
        <p className="text-gray-400">
          Fund your wallet to start trading with real assets
        </p>
      </motion.div>

      {/* Funding Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Choose Funding Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fundingMethods.map((method) => (
            <motion.button
              key={method.id}
              onClick={() => method.available && setSelectedMethod(method.id)}
              disabled={!method.available}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : method.available
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                  : 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
              }`}
              whileHover={method.available ? { scale: 1.02 } : {}}
              whileTap={method.available ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center space-x-3 mb-2">
                <method.icon className="w-6 h-6 text-blue-400" />
                <span className="font-medium text-white">{method.name}</span>
                {!method.available && (
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">Soon</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">{method.description}</p>
              <div className="text-xs text-gray-500">
                <div>Fees: {method.fees}</div>
                <div>Time: {method.time}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Crypto Deposit Interface */}
      {selectedMethod === 'crypto' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Cryptocurrency Deposit</h3>
          
          {/* Chain Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Network
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {supportedChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedChain(chain.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedChain === chain.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{chain.icon}</div>
                    <div className="text-xs font-medium text-white">{chain.symbol}</div>
                    <div className="text-xs text-gray-400">{chain.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deposit Address ({getChainInfo(selectedChain).name})
            </label>
            <div className="flex items-center space-x-3 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex-1">
                <div className="font-mono text-white text-sm break-all">
                  {walletAddress || 'No wallet connected'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Only send {getChainInfo(selectedChain).symbol} on {getChainInfo(selectedChain).name} network
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(walletAddress || '')}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <ClipboardDocumentIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              QR Code
            </label>
            <div className="flex justify-center p-8 bg-white rounded-lg">
              <div className="text-center">
                <QrCodeIcon className="w-32 h-32 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  QR Code for {walletAddress ? formatAddress(walletAddress) : 'No wallet'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getChainInfo(selectedChain).name} Network
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-300 mb-2">Deposit Instructions</h4>
            <ol className="text-sm text-blue-200 space-y-1 list-decimal list-inside">
              <li>Copy the deposit address above</li>
              <li>Send {getChainInfo(selectedChain).symbol} from your external wallet</li>
              <li>Make sure you&apos;re using {getChainInfo(selectedChain).name} network</li>
              <li>Wait for network confirmations (1-15 minutes)</li>
              <li>Funds will appear in your portfolio automatically</li>
            </ol>
          </div>

          {/* Warnings */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-300 mb-2">Important Warnings</h4>
                <ul className="text-sm text-yellow-200 space-y-1">
                  <li>• Only send {getChainInfo(selectedChain).symbol} tokens on {getChainInfo(selectedChain).name} network</li>
                  <li>• Sending tokens on wrong network will result in permanent loss</li>
                  <li>• Always send a small test amount first</li>
                  <li>• Network fees apply and vary by congestion</li>
                  <li>• Double-check the address before sending</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Coming Soon Methods */}
      {selectedMethod !== 'crypto' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center"
        >
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
          <p className="text-gray-400 mb-4">
            {fundingMethods.find(m => m.id === selectedMethod)?.name} integration is in development.
          </p>
          <p className="text-sm text-gray-500">
            For now, please use cryptocurrency deposits to fund your wallet.
          </p>
          <button
            onClick={() => setSelectedMethod('crypto')}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Use Crypto Deposit Instead
          </button>
        </motion.div>
      )}

      {/* Current Portfolio Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-900/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 text-center"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Current Portfolio</h3>
        <div className="text-3xl font-bold text-green-400 mb-1">$64.18</div>
        <p className="text-gray-400 text-sm">
          Your current balance across all networks
        </p>
        <div className="mt-4 flex justify-center space-x-4 text-sm">
          <div className="text-center">
            <div className="text-white font-medium">⟠ ETH</div>
            <div className="text-gray-400">$57.75</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">🟡 BNB</div>
            <div className="text-gray-400">$6.03</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">🟣 MATIC</div>
            <div className="text-gray-400">$0.39</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}