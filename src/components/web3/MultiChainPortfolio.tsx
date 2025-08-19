'use client'

import { useState, useEffect } from 'react'
import { ChartBarIcon, GlobeAltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { assetScanner, ChainConfig } from '@/lib/web3/asset-scanner'
import { WalletAsset } from '@/lib/web3/wallet-connector'

interface MultiChainPortfolioProps {
  walletAddress: string
}

interface ChainAssets {
  chainId: number
  chainName: string
  assets: WalletAsset[]
  totalValue: number
}

export default function MultiChainPortfolio({ walletAddress }: MultiChainPortfolioProps) {
  const [chainAssets, setChainAssets] = useState<ChainAssets[]>([])
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (walletAddress) {
      scanWalletAssets()
    }
  }, [walletAddress])

  const scanWalletAssets = async () => {
    setLoading(true)
    setError(null)

    try {
      const assetsMap = await assetScanner.scanAllAssets(walletAddress)
      const totalValue = assetScanner.calculateTotalValue(assetsMap)
      
      const chainAssetsArray: ChainAssets[] = []
      
      for (const [chainId, assets] of assetsMap.entries()) {
        const chainConfig = assetScanner.getChainConfig(chainId)
        if (!chainConfig) continue

        let chainValue = 0
        for (const asset of assets) {
          if (asset.usdValue) {
            chainValue += parseFloat(asset.balance) * asset.usdValue
          }
        }

        chainAssetsArray.push({
          chainId,
          chainName: chainConfig.name,
          assets,
          totalValue: chainValue
        })
      }

      setChainAssets(chainAssetsArray.sort((a, b) => b.totalValue - a.totalValue))
      setTotalPortfolioValue(totalValue)
    } catch (err: any) {
      setError(err.message || 'Failed to scan wallet assets')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatTokenAmount = (balance: string, decimals: number = 18): string => {
    const amount = parseFloat(balance)
    if (amount === 0) return '0'
    if (amount < 0.001) return '< 0.001'
    if (amount < 1) return amount.toFixed(6)
    if (amount < 1000) return amount.toFixed(4)
    return amount.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <ChartBarIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Scan Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={scanWalletAssets}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Scan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Multi-Chain Portfolio</h2>
          <button
            onClick={scanWalletAssets}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalPortfolioValue)}
            </div>
            <div className="text-sm text-gray-600">Total Portfolio Value</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {chainAssets.length}
            </div>
            <div className="text-sm text-gray-600">Active Chains</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {chainAssets.reduce((total, chain) => total + chain.assets.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Assets</div>
          </div>
        </div>

        {/* Chain Distribution */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Chain Distribution</h3>
          {chainAssets.map((chain) => {
            const percentage = totalPortfolioValue > 0 ? (chain.totalValue / totalPortfolioValue) * 100 : 0
            return (
              <div key={chain.chainId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{chain.chainName}</div>
                    <div className="text-sm text-gray-600">{chain.assets.length} assets</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatCurrency(chain.totalValue)}</div>
                  <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Asset List */}
      {chainAssets.map((chain) => (
        <div key={chain.chainId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {chain.chainName} Assets ({formatCurrency(chain.totalValue)})
          </h3>
          
          <div className="space-y-3">
            {chain.assets.map((asset, index) => {
              const assetValue = asset.usdValue ? parseFloat(asset.balance) * asset.usdValue : 0
              return (
                <div key={`${asset.address}-${index}`} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{asset.symbol}</div>
                      <div className="text-sm text-gray-600">{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatTokenAmount(asset.balance)} {asset.symbol}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(assetValue)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {chainAssets.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
          <p className="text-gray-600">
            No assets were found in this wallet across supported chains.
          </p>
        </div>
      )}
    </div>
  )
}