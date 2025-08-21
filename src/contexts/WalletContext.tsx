'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ConnectedWallet, walletConnector } from '@/lib/web3/wallet-connector'

interface WalletAsset {
  symbol: string
  name: string
  balance: string
  usdValue: number
  chainId: number
  chainName: string
  type: 'native' | 'erc20'
  contractAddress: string
  decimals?: number
  logoUrl?: string
}

interface WalletPortfolio {
  totalValue: number
  totalAssets: number
  activeChains: number
  assets: WalletAsset[]
  chainDistribution: Array<{
    chainId: number
    chainName: string
    value: number
    percentage: number
    assetCount: number
  }>
  riskAnalysis: {
    diversificationScore: number
    concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    chainRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  }
}

interface WalletContextType {
  // Connection state
  isConnected: boolean
  connectedWallet: ConnectedWallet | null
  isConnecting: boolean
  connectionError: string | null
  
  // Portfolio data
  portfolio: WalletPortfolio | null
  isLoadingPortfolio: boolean
  portfolioError: string | null
  lastScanTime: Date | null
  
  // Actions
  connectWallet: (providerName: string) => Promise<void>
  disconnectWallet: () => Promise<void>
  scanWalletAssets: (address?: string) => Promise<void>
  refreshPortfolio: () => Promise<void>
  
  // Manual address input
  manualAddress: string
  setManualAddress: (address: string) => void
  scanManualAddress: (address: string) => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  // Portfolio state
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null)
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null)
  
  // Manual address
  const [manualAddress, setManualAddress] = useState('')

  // Load saved wallet connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('connectedWallet')
    const savedAddress = localStorage.getItem('walletAddress')
    
    if (savedWallet && savedAddress) {
      try {
        const wallet = JSON.parse(savedWallet)
        setConnectedWallet(wallet)
        setIsConnected(true)
        setManualAddress(savedAddress)
        // Auto-scan on load
        scanWalletAssets(savedAddress)
      } catch (error) {
        console.error('Failed to restore wallet connection:', error)
        localStorage.removeItem('connectedWallet')
        localStorage.removeItem('walletAddress')
      }
    }
  }, [])

  const connectWallet = async (providerName: string) => {
    setIsConnecting(true)
    setConnectionError(null)
    
    try {
      const supportedWallets = walletConnector.getSupportedWallets()
      const walletProvider = supportedWallets.find(w => w.name === providerName)
      
      if (!walletProvider) {
        throw new Error(`Wallet provider ${providerName} not found`)
      }
      
      if (!walletProvider.isAvailable()) {
        throw new Error(`${providerName} is not available. Please install the wallet extension.`)
      }
      
      const wallet = await walletProvider.connector()
      
      setConnectedWallet(wallet)
      setIsConnected(true)
      setManualAddress(wallet.address)
      
      // Save to localStorage
      localStorage.setItem('connectedWallet', JSON.stringify(wallet))
      localStorage.setItem('walletAddress', wallet.address)
      
      // Auto-scan assets
      await scanWalletAssets(wallet.address)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setConnectionError(errorMessage)
      console.error('Wallet connection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (connectedWallet) {
        await walletConnector.disconnectWallet(connectedWallet.address)
      }
      
      setConnectedWallet(null)
      setIsConnected(false)
      setPortfolio(null)
      setManualAddress('')
      setLastScanTime(null)
      
      // Clear localStorage
      localStorage.removeItem('connectedWallet')
      localStorage.removeItem('walletAddress')
      
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const scanWalletAssets = async (address?: string) => {
    const targetAddress = address || connectedWallet?.address || manualAddress
    
    if (!targetAddress) {
      setPortfolioError('No wallet address available')
      return
    }
    
    setIsLoadingPortfolio(true)
    setPortfolioError(null)
    
    try {
      console.log(`🔍 Scanning wallet assets for: ${targetAddress}`)
      
      // Use real API for actual blockchain data
      let response = await fetch(`/api/wallet-scanner?address=${targetAddress}&refreshPrices=true`)
      let result = await response.json()
      
      if (!result.success) {
        console.log('⚠️ Real API failed, falling back to demo API for development...')
        response = await fetch(`/api/wallet-scanner-demo?address=${targetAddress}`)
        result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to scan wallet assets')
        }
      }
      
      const scanData = result.data
      
      // Transform the scan data into our portfolio format
      const walletPortfolio: WalletPortfolio = {
        totalValue: scanData.summary.totalPortfolioValue,
        totalAssets: scanData.summary.totalAssets,
        activeChains: scanData.summary.successfulChains,
        assets: scanData.analytics.topAssets,
        chainDistribution: scanData.analytics.chainDistribution,
        riskAnalysis: scanData.analytics.riskAnalysis
      }
      
      setPortfolio(walletPortfolio)
      setLastScanTime(new Date())
      
      console.log(`✅ Portfolio loaded: $${walletPortfolio.totalValue.toFixed(2)} across ${walletPortfolio.activeChains} chains`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan wallet assets'
      setPortfolioError(errorMessage)
      console.error('Asset scan error:', error)
    } finally {
      setIsLoadingPortfolio(false)
    }
  }

  const scanManualAddress = async (address: string) => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setPortfolioError('Please enter a valid Ethereum address')
      return
    }
    
    setManualAddress(address)
    localStorage.setItem('walletAddress', address)
    await scanWalletAssets(address)
  }

  const refreshPortfolio = async () => {
    await scanWalletAssets()
  }

  const value: WalletContextType = {
    // Connection state
    isConnected,
    connectedWallet,
    isConnecting,
    connectionError,
    
    // Portfolio data
    portfolio,
    isLoadingPortfolio,
    portfolioError,
    lastScanTime,
    
    // Actions
    connectWallet,
    disconnectWallet,
    scanWalletAssets,
    refreshPortfolio,
    
    // Manual address
    manualAddress,
    setManualAddress,
    scanManualAddress
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}