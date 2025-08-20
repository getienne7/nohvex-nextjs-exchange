'use client'

import { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, WalletIcon } from '@heroicons/react/24/outline'
import { walletConnector, WalletProvider, ConnectedWallet } from '@/lib/web3/wallet-connector'

interface WalletConnectorProps {
  isOpen: boolean
  onClose: () => void
  onWalletConnected: (wallet: ConnectedWallet) => void
}

export default function WalletConnector({ isOpen, onClose, onWalletConnected }: WalletConnectorProps) {
  const [supportedWallets, setSupportedWallets] = useState<WalletProvider[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSupportedWallets(walletConnector.getSupportedWallets())
  }, [])

  const handleConnect = async (wallet: WalletProvider) => {
    setConnecting(wallet.name)
    setError(null)

    try {
      // Clear WalletConnect sessions if connecting to WalletConnect
      if (wallet.name === 'WalletConnect') {
        await walletConnector.clearWalletConnectSessions()
      }
      
      const connectedWallet = await wallet.connector()
      onWalletConnected(connectedWallet)
      onClose()
    } catch (err: any) {
      console.error('Wallet connection error:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setConnecting(null)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                    Connect Your Wallet
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-300">
                    Connect your Web3 wallet to view your multi-chain portfolio and access advanced DeFi tools.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {supportedWallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleConnect(wallet)}
                      disabled={connecting !== null}
                      className="w-full flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:border-cyan-400 hover:bg-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700/20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                          <WalletIcon className="h-5 w-5 text-gray-300" />
                        </div>
                        <span className="font-medium text-white">{wallet.name}</span>
                      </div>
                      
                      {connecting === wallet.name ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                      ) : (
                        <div className="text-sm text-gray-400">Connect</div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-600">
                  <p className="text-xs text-gray-400 text-center">
                    By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                    Your wallet will be used to read your asset balances across multiple chains.
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}