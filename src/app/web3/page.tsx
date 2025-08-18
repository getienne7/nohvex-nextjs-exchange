'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  WalletIcon, 
  PlusIcon, 
  ArrowPathIcon,
  ChartBarIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import WalletConnector from '@/components/web3/WalletConnector'
import MultiChainPortfolio from '@/components/web3/MultiChainPortfolio'
import DeFiPortfolioManager from '@/components/web3/DeFiPortfolioManager'
import { ConnectedWallet, WalletAsset } from '@/lib/web3/wallet-connector'

interface WalletConnection {
  id: string
  address: string
  chainId: number
  walletType: string
  isActive: boolean
  createdAt: string
  assets: WalletAsset[]
}

export default function Web3Dashboard() {
  const { data: session, status } = useSession()
  const [showWalletConnector, setShowWalletConnector] = useState(false)
  const [connectedWallets, setConnectedWallets] = useState<WalletConnection[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    
    if (status === 'authenticated') {
      loadConnectedWallets()
    }
  }, [status])

  const loadConnectedWallets = async () => {
    try {
      const response = await fetch('/api/wallet/connect')
      const data = await response.json()
      
      if (data.success) {
        setConnectedWallets(data.wallets)
        if (data.wallets.length > 0 && !selectedWallet) {
          setSelectedWallet(data.wallets[0])
        }
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnected = async (wallet: ConnectedWallet) => {
    try {
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: wallet.address,
          chainId: wallet.chainId,
          walletType: wallet.provider.toUpperCase().replace(' ', '_')
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await loadConnectedWallets()
        setShowWalletConnector(false)
        
        // Trigger asset scan for new wallet
        await scanWalletAssets(wallet.address, wallet.chainId)
      }
    } catch (error) {
      console.error('Failed to save wallet connection:', error)
    }
  }

  const scanWalletAssets = async (address: string, chainId: number) => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/wallet/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: address,
          chainId,
          forceRefresh: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await loadConnectedWallets()
      }
    } catch (error) {
      console.error('Failed to scan assets:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      56: 'BNB Chain',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism'
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  const getTotalPortfolioValue = (): number => {
    return connectedWallets.reduce((total, wallet) => {
      return total + wallet.assets.reduce((walletTotal, asset) => {
        return walletTotal + (parseFloat(asset.balance) * (asset.usdValue || 0))
      }, 0)
    }, 0)
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Web3 Portfolio</h1>
              <p className="text-gray-600 mt-1">
                Manage your multi-chain DeFi portfolio and discover yield opportunities
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => selectedWallet && scanWalletAssets(selectedWallet.address, selectedWallet.chainId)}
                disabled={refreshing || !selectedWallet}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowWalletConnector(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            </div>
          </div>
        </div>

        {connectedWallets.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <WalletIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Connect Your First Wallet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your Web3 wallet to start managing your multi-chain portfolio, 
              discover yield opportunities, and optimize your DeFi strategy.
            </p>
            <button
              onClick={() => setShowWalletConnector(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Portfolio Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(getTotalPortfolioValue())}
                  </div>
                  <div className="text-sm text-gray-600">Total Portfolio Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {connectedWallets.length}
                  </div>
                  <div className="text-sm text-gray-600">Connected Wallets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {new Set(connectedWallets.map(w => w.chainId)).size}
                  </div>
                  <div className="text-sm text-gray-600">Active Chains</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {connectedWallets.reduce((total, wallet) => total + wallet.assets.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Assets</div>
                </div>
              </div>
            </div>

            {/* Wallet Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Wallets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => setSelectedWallet(wallet)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedWallet?.id === wallet.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <WalletIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {wallet.walletType.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {getChainName(wallet.chainId)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 font-mono">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {wallet.assets.length} assets
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Wallet Details */}
            {selectedWallet && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Multi-Chain Portfolio */}
                <div>
                  <MultiChainPortfolio walletAddress={selectedWallet.address} />
                </div>

                {/* DeFi Portfolio Manager */}
                <div>
                  <DeFiPortfolioManager
                    walletAddress={selectedWallet.address}
                    chainId={selectedWallet.chainId}
                    assets={selectedWallet.assets}
                  />
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Portfolio Analytics</div>
                    <div className="text-sm text-gray-600">View detailed analytics</div>
                  </div>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all">
                  <FireIcon className="h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Yield Opportunities</div>
                    <div className="text-sm text-gray-600">Discover high-yield protocols</div>
                  </div>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <ArrowPathIcon className="h-8 w-8 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Rebalance Portfolio</div>
                    <div className="text-sm text-gray-600">Optimize asset allocation</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connector Modal */}
        <WalletConnector
          isOpen={showWalletConnector}
          onClose={() => setShowWalletConnector(false)}
          onWalletConnected={handleWalletConnected}
        />
      </div>
    </div>
  )
}