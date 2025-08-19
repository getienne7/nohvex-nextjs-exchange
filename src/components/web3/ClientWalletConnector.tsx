'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ConnectedWallet } from '@/lib/web3/wallet-connector'

// Dynamically import WalletConnector to avoid SSR issues
const WalletConnector = dynamic(() => import('./WalletConnector'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet connector...</p>
        </div>
      </div>
    </div>
  )
})

interface ClientWalletConnectorProps {
  isOpen: boolean
  onClose: () => void
  onWalletConnected: (wallet: ConnectedWallet) => void
}

export default function ClientWalletConnector({ isOpen, onClose, onWalletConnected }: ClientWalletConnectorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <WalletConnector
      isOpen={isOpen}
      onClose={onClose}
      onWalletConnected={onWalletConnected}
    />
  )
}