/**
 * NOWNodes Asset Scanner - Enhanced Multi-Chain Asset Discovery
 * Uses NOWNodes infrastructure for reliable blockchain data access
 */

import { NOWNodesService, TokenBalance } from './nownodes-service'

export interface AssetScanResult {
  walletAddress: string
  chainId: number
  chainName: string
  assets: TokenBalance[]
  totalUsdValue: number
  scanTimestamp: string
  success: boolean
  error?: string
}

export interface MultiChainScanResult {
  walletAddress: string
  chains: AssetScanResult[]
  totalPortfolioValue: number
  totalAssets: number
  scanTimestamp: string
}

export class NOWNodesAssetScanner {
  private nowNodes: NOWNodesService

  constructor(apiKey: string) {
    this.nowNodes = new NOWNodesService(apiKey)
  }

  /**
   * Scan assets on a single chain
   */
  public async scanChainAssets(
    walletAddress: string,
    chainId: number
  ): Promise<AssetScanResult> {
    const startTime = Date.now()
    const chainConfig = NOWNodesService.CHAINS[chainId]
    
    if (!chainConfig) {
      return {
        walletAddress,
        chainId,
        chainName: `Unknown Chain ${chainId}`,
        assets: [],
        totalUsdValue: 0,
        scanTimestamp: new Date().toISOString(),
        success: false,
        error: `Unsupported chain ID: ${chainId}`
      }
    }

    try {
      console.log(`🔍 Scanning ${chainConfig.name} for wallet ${walletAddress}...`)

      // Get all token balances for this chain
      const assets = await this.nowNodes.getAllTokenBalances(walletAddress, chainId)
      
      // Filter out zero balances
      const nonZeroAssets = assets.filter(asset => 
        parseFloat(asset.balanceFormatted) > 0
      )

      // Calculate total USD value
      const totalUsdValue = nonZeroAssets.reduce((sum, asset) => 
        sum + asset.usdValue, 0
      )

      const scanTime = Date.now() - startTime
      console.log(`✅ ${chainConfig.name} scan completed in ${scanTime}ms - Found ${nonZeroAssets.length} assets worth $${totalUsdValue.toFixed(2)}`)

      return {
        walletAddress,
        chainId,
        chainName: chainConfig.name,
        assets: nonZeroAssets,
        totalUsdValue,
        scanTimestamp: new Date().toISOString(),
        success: true
      }

    } catch (error) {
      console.error(`❌ Error scanning ${chainConfig.name}:`, error)
      
      return {
        walletAddress,
        chainId,
        chainName: chainConfig.name,
        assets: [],
        totalUsdValue: 0,
        scanTimestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Scan assets across multiple chains
   */
  public async scanMultiChainAssets(
    walletAddress: string,
    chainIds?: number[]
  ): Promise<MultiChainScanResult> {
    const startTime = Date.now()
    
    // Use provided chain IDs or default to all supported chains
    const targetChains = chainIds || Object.keys(NOWNodesService.CHAINS).map(Number)
    
    console.log(`🚀 Starting multi-chain scan for ${walletAddress} across ${targetChains.length} chains...`)

    // Scan all chains in parallel for better performance
    const scanPromises = targetChains.map(chainId => 
      this.scanChainAssets(walletAddress, chainId)
    )

    const chainResults = await Promise.all(scanPromises)

    // Calculate totals
    const totalPortfolioValue = chainResults.reduce((sum, result) => 
      sum + result.totalUsdValue, 0
    )
    
    const totalAssets = chainResults.reduce((sum, result) => 
      sum + result.assets.length, 0
    )

    // Filter out chains with no assets (optional - you might want to keep them for UI)
    const chainsWithAssets = chainResults.filter(result => 
      result.assets.length > 0 || !result.success // Keep failed scans for error reporting
    )

    const scanTime = Date.now() - startTime
    console.log(`🎉 Multi-chain scan completed in ${scanTime}ms`)
    console.log(`📊 Portfolio Summary: ${totalAssets} assets worth $${totalPortfolioValue.toFixed(2)} across ${chainsWithAssets.length} chains`)

    return {
      walletAddress,
      chains: chainResults, // Return all results, not just chains with assets
      totalPortfolioValue,
      totalAssets,
      scanTimestamp: new Date().toISOString()
    }
  }

  /**
   * Quick balance check for a specific token
   */
  public async getTokenBalance(
    walletAddress: string,
    tokenAddress: string,
    chainId: number
  ): Promise<TokenBalance | null> {
    try {
      return await this.nowNodes.getTokenBalance(walletAddress, tokenAddress, chainId)
    } catch (error) {
      console.error(`Error getting token balance:`, error)
      return null
    }
  }

  /**
   * Get native token balance only
   */
  public async getNativeBalance(
    walletAddress: string,
    chainId: number
  ): Promise<{ balance: string; usdValue: number; chainName: string } | null> {
    try {
      const chainConfig = NOWNodesService.CHAINS[chainId]
      if (!chainConfig) return null

      const balance = await this.nowNodes.getNativeBalance(walletAddress, chainId)
      const price = await this.nowNodes.getTokenPrice(chainConfig.symbol)
      const usdValue = parseFloat(balance) * (price?.price || 0)

      return {
        balance,
        usdValue,
        chainName: chainConfig.name
      }
    } catch (error) {
      console.error(`Error getting native balance:`, error)
      return null
    }
  }

  /**
   * Refresh prices for existing assets
   */
  public async refreshAssetPrices(assets: TokenBalance[]): Promise<TokenBalance[]> {
    try {
      // Get unique symbols
      const symbols = [...new Set(assets.map(asset => asset.symbol))]
      
      // Fetch updated prices
      const prices = await this.nowNodes.getMultipleTokenPrices(symbols)
      
      // Update asset USD values
      return assets.map(asset => ({
        ...asset,
        usdValue: parseFloat(asset.balanceFormatted) * (prices[asset.symbol]?.price || 0)
      }))
    } catch (error) {
      console.error('Error refreshing asset prices:', error)
      return assets // Return original assets if price refresh fails
    }
  }

  /**
   * Get portfolio distribution by chain
   */
  public getChainDistribution(scanResult: MultiChainScanResult): Array<{
    chainId: number
    chainName: string
    value: number
    percentage: number
    assetCount: number
  }> {
    const { chains, totalPortfolioValue } = scanResult
    
    return chains
      .filter(chain => chain.success && chain.totalUsdValue > 0)
      .map(chain => ({
        chainId: chain.chainId,
        chainName: chain.chainName,
        value: chain.totalUsdValue,
        percentage: totalPortfolioValue > 0 ? (chain.totalUsdValue / totalPortfolioValue) * 100 : 0,
        assetCount: chain.assets.length
      }))
      .sort((a, b) => b.value - a.value) // Sort by value descending
  }

  /**
   * Get top assets across all chains
   */
  public getTopAssets(
    scanResult: MultiChainScanResult,
    limit: number = 10
  ): Array<TokenBalance & { chainName: string }> {
    const allAssets: Array<TokenBalance & { chainName: string }> = []
    
    for (const chain of scanResult.chains) {
      if (chain.success) {
        for (const asset of chain.assets) {
          allAssets.push({
            ...asset,
            chainName: chain.chainName
          })
        }
      }
    }
    
    return allAssets
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, limit)
  }

  /**
   * Health check for the scanner
   */
  public async healthCheck(): Promise<boolean> {
    return await this.nowNodes.healthCheck()
  }

  /**
   * Get supported chains
   */
  public static getSupportedChains() {
    return NOWNodesService.getSupportedChains()
  }
}