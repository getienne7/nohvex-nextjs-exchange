'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightIcon, CurrencyDollarIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline'
import { GlobalNavigation } from './GlobalNavigation'
import WalletConnector from './web3/WalletConnector'
import { ConnectedWallet } from '@/lib/web3/wallet-connector'

export function HeroSection() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null)

  const handleWalletConnected = (wallet: ConnectedWallet) => {
    setConnectedWallet(wallet)
    console.log('Wallet connected:', wallet)
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
      {/* Navigation */}
      <GlobalNavigation variant="hero" />
      
      <div className="px-6 py-24 sm:px-12 sm:py-32 lg:px-16">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                NOHVEX
              </span>
              <br />
              DeFi Portfolio Manager
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Manage your DeFi portfolio with advanced analytics, yield tracking, and risk management. 
              Connect your wallet and take control of your decentralized investments.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <button 
              onClick={() => setIsWalletModalOpen(true)}
              className="group rounded-md bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-400 hover:to-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all duration-200"
            >
              {connectedWallet ? `Connected: ${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}` : 'Connect Wallet'}
              <ArrowRightIcon className="ml-2 h-4 w-4 inline-block group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors">
              View Portfolio <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-300">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Zero Trading Fees
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-400">
                Trade without worrying about fees eating into your profits. 100% fee-free trading.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-300">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
                  <ShieldCheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Bank-Level Security
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-400">
                Your funds are protected by military-grade encryption and cold storage solutions.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-300">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
                  <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Instant Execution
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-400">
                Lightning-fast order execution with real-time price updates and market data.
              </dd>
            </div>
          </dl>
        </motion.div>
      </div>
      </div>

      {/* Wallet Connector Modal */}
      <WalletConnector
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onWalletConnected={handleWalletConnected}
      />
    </div>
  )
}
