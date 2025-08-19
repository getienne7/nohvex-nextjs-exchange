/**
 * Enhanced Web3 Wallet Connection Service
 * Handles connection to multiple wallet providers with real implementations
 */

import { ethers } from 'ethers'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

declare global {
  interface Window {
    ethereum?: any
    web3?: any
  }
}

export interface WalletProvider {
  name: string
  icon: string
  connector: () => Promise<ConnectedWallet>
  isAvailable: () => boolean
}

export interface ConnectedWallet {
  address: string
  chainId: number
  provider: string
  balance?: string
  providerInstance?: any
}

export interface WalletAsset {
  address: string
  symbol: string
  name: string
  balance: string
  decimals: number
  usdValue?: number
  logoUrl?: string
}

export class WalletConnector {
  private static instance: WalletConnector
  private connectedWallets: Map<string, ConnectedWallet> = new Map()
  private walletConnectProvider: any = null
  private coinbaseWallet: CoinbaseWalletSDK | null = null

  static getInstance(): WalletConnector {
    if (!WalletConnector.instance) {
      WalletConnector.instance = new WalletConnector()
    }
    return WalletConnector.instance
  }

  // Supported wallet providers with availability checks
  getSupportedWallets(): WalletProvider[] {
    return [
      {
        name: 'MetaMask',
        icon: '/wallets/metamask.svg',
        connector: () => this.connectMetaMask(),
        isAvailable: () => this.isMetaMaskAvailable()
      },
      {
        name: 'WalletConnect',
        icon: '/wallets/walletconnect.svg',
        connector: () => this.connectWalletConnect(),
        isAvailable: () => true // Always available
      },
      {
        name: 'Coinbase Wallet',
        icon: '/wallets/coinbase.svg',
        connector: () => this.connectCoinbaseWallet(),
        isAvailable: () => true // Always available
      },
      {
        name: 'Trust Wallet',
        icon: '/wallets/trust.svg',
        connector: () => this.connectTrustWallet(),
        isAvailable: () => this.isTrustWalletAvailable()
      }
    ]
  }

  // Availability checks
  private isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask
  }

  private isTrustWalletAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isTrust
  }

  // Connect to MetaMask
  async connectMetaMask(): Promise<ConnectedWallet> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask not installed')
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })

      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(accounts[0])

      const wallet: ConnectedWallet = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        provider: 'MetaMask',
        balance: ethers.formatEther(balance),
        providerInstance: provider
      }

      this.connectedWallets.set(accounts[0], wallet)
      this.setupEventListeners(window.ethereum, wallet)
      return wallet
    } catch (error) {
      throw new Error(`Failed to connect MetaMask: ${error}`)
    }
  }

  // Connect to WalletConnect v2.0
  async connectWalletConnect(): Promise<ConnectedWallet> {
    try {
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo'
      
      // Initialize WalletConnect v2.0 provider
      this.walletConnectProvider = await EthereumProvider.init({
        projectId,
        chains: [1, 56, 137], // Ethereum, BSC, Polygon
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'light',
          themeVariables: {
            '--wcm-z-index': '1000'
          }
        },
        metadata: {
          name: 'NOHVEX Exchange',
          description: 'Professional Crypto Exchange Platform',
          url: 'https://nohvex.com',
          icons: ['https://nohvex.com/logo.png']
        }
      })

      // Enable session (shows QR modal)
      await this.walletConnectProvider.enable()
      
      const provider = new ethers.BrowserProvider(this.walletConnectProvider)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      const wallet: ConnectedWallet = {
        address,
        chainId: Number(network.chainId),
        provider: 'WalletConnect',
        balance: ethers.formatEther(balance),
        providerInstance: provider
      }

      this.connectedWallets.set(address, wallet)
      this.setupWalletConnectListeners(wallet)
      return wallet
    } catch (error) {
      throw new Error(`Failed to connect WalletConnect: ${error}`)
    }
  }

  // Connect to Coinbase Wallet
  async connectCoinbaseWallet(): Promise<ConnectedWallet> {
    try {
      this.coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'NOHVEX Exchange',
        appLogoUrl: '/logo.png',
        darkMode: false
      })

      const ethereum = this.coinbaseWallet.makeWeb3Provider(
        process.env.NEXT_PUBLIC_INFURA_ID || 'demo',
        1
      )

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      const chainId = await ethereum.request({
        method: 'eth_chainId'
      })

      const provider = new ethers.BrowserProvider(ethereum)
      const balance = await provider.getBalance(accounts[0])

      const wallet: ConnectedWallet = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        provider: 'Coinbase Wallet',
        balance: ethers.formatEther(balance),
        providerInstance: provider
      }

      this.connectedWallets.set(accounts[0], wallet)
      this.setupEventListeners(ethereum, wallet)
      return wallet
    } catch (error) {
      throw new Error(`Failed to connect Coinbase Wallet: ${error}`)
    }
  }

  // Connect to Trust Wallet
  async connectTrustWallet(): Promise<ConnectedWallet> {
    if (!this.isTrustWalletAvailable()) {
      throw new Error('Trust Wallet not installed')
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })

      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(accounts[0])

      const wallet: ConnectedWallet = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        provider: 'Trust Wallet',
        balance: ethers.formatEther(balance),
        providerInstance: provider
      }

      this.connectedWallets.set(accounts[0], wallet)
      this.setupEventListeners(window.ethereum, wallet)
      return wallet
    } catch (error) {
      throw new Error(`Failed to connect Trust Wallet: ${error}`)
    }
  }

  // Setup event listeners for wallet changes
  private setupEventListeners(ethereum: any, wallet: ConnectedWallet): void {
    if (!ethereum.on) return

    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet(wallet.address)
      } else {
        wallet.address = accounts[0]
        this.connectedWallets.set(accounts[0], wallet)
      }
    })

    ethereum.on('chainChanged', (chainId: string) => {
      wallet.chainId = parseInt(chainId, 16)
      this.connectedWallets.set(wallet.address, wallet)
    })
  }

  // Setup WalletConnect v2.0 specific listeners
  private setupWalletConnectListeners(wallet: ConnectedWallet): void {
    if (!this.walletConnectProvider) return

    this.walletConnectProvider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet(wallet.address)
      } else {
        wallet.address = accounts[0]
        this.connectedWallets.set(accounts[0], wallet)
      }
    })

    this.walletConnectProvider.on('chainChanged', (chainId: string | number) => {
      wallet.chainId = typeof chainId === 'string' ? parseInt(chainId as string, 16) : chainId
      this.connectedWallets.set(wallet.address, wallet)
    })

    this.walletConnectProvider.on('disconnect', () => {
      this.disconnectWallet(wallet.address)
    })

    this.walletConnectProvider.on('session_delete', () => {
      this.disconnectWallet(wallet.address)
    })
  }

  // Get connected wallets
  getConnectedWallets(): ConnectedWallet[] {
    return Array.from(this.connectedWallets.values())
  }

  // Disconnect wallet
  async disconnectWallet(address: string): Promise<void> {
    const wallet = this.connectedWallets.get(address)
    
    if (wallet && wallet.provider === 'WalletConnect' && this.walletConnectProvider) {
      try {
        await this.walletConnectProvider.disconnect()
      } catch (error) {
        console.warn('Error disconnecting WalletConnect:', error)
      }
    }
    
    this.connectedWallets.delete(address)
  }

  // Switch network
  async switchNetwork(chainId: number): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet provider found')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await this.addNetwork(chainId)
      } else {
        throw error
      }
    }
  }

  // Add network to wallet
  private async addNetwork(chainId: number): Promise<void> {
    const networkConfigs = this.getNetworkConfigs()
    const config = networkConfigs[chainId]
    
    if (!config) {
      throw new Error(`Unsupported network: ${chainId}`)
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [config]
    })
  }

  // Network configurations
  private getNetworkConfigs(): Record<number, any> {
    return {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
        blockExplorerUrls: ['https://etherscan.io']
      },
      56: {
        chainId: '0x38',
        chainName: 'BNB Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com']
      }
    }
  }
}

// Global wallet connector instance
export const walletConnector = WalletConnector.getInstance()