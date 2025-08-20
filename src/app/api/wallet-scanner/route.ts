/**
 * Advanced Multi-Chain Wallet Scanner - NOWNodes Powered
 * GET /api/wallet-scanner - Comprehensive wallet analysis across multiple blockchains
 */

import { NextRequest, NextResponse } from 'next/server'
import { NOWNodesService } from '@/lib/web3/nownodes-service'
import { NOWNodesAssetScanner } from '@/lib/web3/nownodes-asset-scanner'
import { ethers } from 'ethers'
import { z } from 'zod'

// Utility function to handle BigInt serialization
function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ))
}

// Request validation schema
const WalletScanSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  chains: z.array(z.number()).optional().default([1, 56, 137, 42161, 10, 43114, 250, 8453]),
  includeNFTs: z.boolean().optional().default(false),
  includeDeFi: z.boolean().optional().default(true),
  refreshPrices: z.boolean().optional().default(true)
})

export async function GET(request: NextRequest) {
  try {
    // Get NOWNodes API key from environment
    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      return NextResponse.json(
        { error: 'NOWNodes API key not configured' },
        { status: 500 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const chainsParam = searchParams.get('chains')
    const includeNFTs = searchParams.get('includeNFTs') === 'true'
    const includeDeFi = searchParams.get('includeDeFi') !== 'false'
    const refreshPrices = searchParams.get('refreshPrices') !== 'false'

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Parse chains
    let chains = [1, 56, 137, 42161, 10, 43114, 250, 8453] // Default to all supported chains
    if (chainsParam) {
      try {
        chains = chainsParam.split(',').map(c => parseInt(c.trim()))
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid chains parameter' },
          { status: 400 }
        )
      }
    }

    // Validate request
    const validationResult = WalletScanSchema.safeParse({
      address,
      chains,
      includeNFTs,
      includeDeFi,
      refreshPrices
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { address: walletAddress, chains: chainIds } = validationResult.data

    console.log(`🔍 Scanning wallet ${walletAddress} across ${chainIds.length} chains...`)

    // Initialize services
    const nowNodes = new NOWNodesService(nowNodesApiKey)
    const scanner = new NOWNodesAssetScanner(nowNodesApiKey)

    // Start comprehensive scan
    const scanStartTime = Date.now()
    const scanResults: any = {
      walletAddress,
      scanTimestamp: new Date().toISOString(),
      chains: [],
      summary: {
        totalChains: chainIds.length,
        successfulChains: 0,
        totalAssets: 0,
        totalPortfolioValue: 0,
        totalNativeBalance: 0
      },
      analytics: {
        chainDistribution: [],
        topAssets: [],
        assetTypes: {
          native: 0,
          erc20: 0,
          nfts: 0,
          defi: 0
        },
        riskAnalysis: {
          diversificationScore: 0,
          concentrationRisk: 'LOW',
          chainRisk: 'LOW'
        }
      },
      advanced: {
        transactionActivity: {},
        gasUsage: {},
        deFiPositions: [],
        crossChainAssets: []
      }
    }

    // Scan each chain
    for (const chainId of chainIds) {
      try {
        console.log(`⛓️ Scanning chain ${chainId}...`)
        
        const chainResult = await scanner.scanChainAssets(walletAddress, chainId)
        const chainInfo = NOWNodesService.getSupportedChains().find(c => c.chainId === chainId)
        
        if (chainResult.success) {
          // Get additional chain data
          const provider = nowNodes.getProvider(chainId)
          const nativeBalance = await provider.getBalance(walletAddress)
          const nativeBalanceFormatted = ethers.formatEther(nativeBalance)
          const transactionCount = await provider.getTransactionCount(walletAddress)
          
          // Get native token price
          let nativeTokenPrice = 0
          if (chainInfo) {
            const priceData = await nowNodes.getTokenPrice(chainInfo.symbol)
            nativeTokenPrice = priceData?.price || 0
          }
          
          const nativeValueUsd = parseFloat(nativeBalanceFormatted) * nativeTokenPrice

          const chainData = {
            chainId,
            chainName: chainInfo?.name || `Chain ${chainId}`,
            symbol: chainInfo?.symbol || 'UNKNOWN',
            success: true,
            nativeBalance: {
              wei: nativeBalance.toString(),
              formatted: nativeBalanceFormatted,
              usdValue: nativeValueUsd,
              price: nativeTokenPrice
            },
            transactionCount,
            assets: chainResult.assets,
            totalAssets: chainResult.assets.length,
            totalUsdValue: chainResult.totalUsdValue + nativeValueUsd,
            scanDuration: chainResult.scanDuration,
            lastActivity: transactionCount > 0 ? 'Active' : 'Inactive'
          }

          scanResults.chains.push(chainData)
          scanResults.summary.successfulChains++
          scanResults.summary.totalAssets += chainResult.assets.length
          scanResults.summary.totalPortfolioValue += chainData.totalUsdValue
          scanResults.summary.totalNativeBalance += nativeValueUsd

          // Update asset type counts
          scanResults.analytics.assetTypes.native += nativeValueUsd > 0 ? 1 : 0
          scanResults.analytics.assetTypes.erc20 += chainResult.assets.length

        } else {
          scanResults.chains.push({
            chainId,
            chainName: chainInfo?.name || `Chain ${chainId}`,
            success: false,
            error: chainResult.error,
            totalAssets: 0,
            totalUsdValue: 0
          })
        }
      } catch (error) {
        console.error(`❌ Error scanning chain ${chainId}:`, error)
        scanResults.chains.push({
          chainId,
          chainName: `Chain ${chainId}`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          totalAssets: 0,
          totalUsdValue: 0
        })
      }
    }

    // Calculate analytics
    const successfulChains = scanResults.chains.filter((c: any) => c.success)
    
    // Chain distribution
    scanResults.analytics.chainDistribution = successfulChains.map((chain: any) => ({
      chainId: chain.chainId,
      chainName: chain.chainName,
      value: chain.totalUsdValue,
      percentage: scanResults.summary.totalPortfolioValue > 0 
        ? (chain.totalUsdValue / scanResults.summary.totalPortfolioValue) * 100 
        : 0,
      assetCount: chain.totalAssets + (chain.nativeBalance?.usdValue > 0 ? 1 : 0)
    })).sort((a: any, b: any) => b.value - a.value)

    // Top assets across all chains
    const allAssets: any[] = []
    successfulChains.forEach((chain: any) => {
      // Add native token if has balance
      if (chain.nativeBalance?.usdValue > 0) {
        allAssets.push({
          symbol: chain.symbol,
          name: `${chain.chainName} Native Token`,
          balance: chain.nativeBalance.formatted,
          usdValue: chain.nativeBalance.usdValue,
          chainId: chain.chainId,
          chainName: chain.chainName,
          type: 'native',
          contractAddress: 'native'
        })
      }
      
      // Add ERC20 tokens
      chain.assets.forEach((asset: any) => {
        allAssets.push({
          ...asset,
          chainId: chain.chainId,
          chainName: chain.chainName,
          type: 'erc20'
        })
      })
    })

    scanResults.analytics.topAssets = allAssets
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 10)

    // Risk analysis
    const chainCount = scanResults.analytics.chainDistribution.length
    const topAssetPercentage = scanResults.analytics.topAssets.length > 0 
      ? (scanResults.analytics.topAssets[0].usdValue / scanResults.summary.totalPortfolioValue) * 100 
      : 0

    scanResults.analytics.riskAnalysis = {
      diversificationScore: Math.min(chainCount * 20, 100), // Max 100 for 5+ chains
      concentrationRisk: topAssetPercentage > 50 ? 'HIGH' : topAssetPercentage > 25 ? 'MEDIUM' : 'LOW',
      chainRisk: chainCount < 2 ? 'HIGH' : chainCount < 4 ? 'MEDIUM' : 'LOW'
    }

    // Advanced features
    scanResults.advanced = {
      transactionActivity: successfulChains.reduce((acc: any, chain: any) => {
        acc[chain.chainName] = {
          transactionCount: chain.transactionCount,
          status: chain.transactionCount > 0 ? 'Active' : 'Inactive'
        }
        return acc
      }, {}),
      crossChainAssets: scanResults.analytics.topAssets.filter((asset: any) => 
        allAssets.filter(a => a.symbol === asset.symbol).length > 1
      ),
      portfolioHealth: {
        totalValue: scanResults.summary.totalPortfolioValue,
        activeChains: scanResults.summary.successfulChains,
        diversification: scanResults.analytics.riskAnalysis.diversificationScore,
        riskLevel: scanResults.analytics.riskAnalysis.concentrationRisk
      }
    }

    const scanDuration = Date.now() - scanStartTime

    console.log(`✅ Wallet scan completed in ${scanDuration}ms`)
    console.log(`📊 Portfolio: $${scanResults.summary.totalPortfolioValue.toFixed(2)} across ${scanResults.summary.successfulChains} chains`)

    return NextResponse.json(serializeBigInt({
      success: true,
      data: scanResults,
      metadata: {
        provider: 'NOWNodes',
        scanDuration: `${scanDuration}ms`,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }))

  } catch (error) {
    console.error('❌ Wallet scanner error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Wallet scan failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Quick balance check endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, chainId = 1 } = body

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }

    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const nowNodes = new NOWNodesService(nowNodesApiKey)
    const provider = nowNodes.getProvider(chainId)
    const balance = await provider.getBalance(address)
    const balanceEth = ethers.formatEther(balance)

    return NextResponse.json(serializeBigInt({
      success: true,
      data: {
        address,
        chainId,
        balance: balanceEth,
        balanceWei: balance.toString()
      }
    }))
  } catch (error) {
    return NextResponse.json(
      { error: 'Balance check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}