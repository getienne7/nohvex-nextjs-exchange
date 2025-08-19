/**
 * NOWNodes Assets API - Enhanced Multi-Chain Asset Discovery
 * GET /api/wallet/nownodes-assets - Scan wallet assets using NOWNodes infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NOWNodesAssetScanner } from '@/lib/web3/nownodes-asset-scanner'
import { z } from 'zod'

// Request validation schema
const AssetScanSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  chainIds: z.array(z.number()).optional(),
  refreshPrices: z.boolean().optional().default(false)
})

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get NOWNodes API key from environment
    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      console.error('❌ NOWNODES_API_KEY not configured')
      return NextResponse.json(
        { error: 'NOWNodes API key not configured' },
        { status: 500 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const chainIdsParam = searchParams.get('chainIds')
    const refreshPrices = searchParams.get('refreshPrices') === 'true'

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress parameter is required' },
        { status: 400 }
      )
    }

    // Parse chain IDs if provided
    let chainIds: number[] | undefined
    if (chainIdsParam) {
      try {
        chainIds = chainIdsParam.split(',').map(id => parseInt(id.trim()))
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid chainIds format. Use comma-separated numbers.' },
          { status: 400 }
        )
      }
    }

    // Validate request data
    const validationResult = AssetScanSchema.safeParse({
      walletAddress,
      chainIds,
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

    const { walletAddress: validAddress, chainIds: validChainIds } = validationResult.data

    console.log(`🔍 NOWNodes asset scan requested for ${validAddress}`)
    console.log(`📊 Target chains: ${validChainIds ? validChainIds.join(', ') : 'All supported'}`)

    // Initialize NOWNodes scanner
    const scanner = new NOWNodesAssetScanner(nowNodesApiKey)

    // Perform health check
    const isHealthy = await scanner.healthCheck()
    if (!isHealthy) {
      console.error('❌ NOWNodes service health check failed')
      return NextResponse.json(
        { error: 'NOWNodes service is currently unavailable' },
        { status: 503 }
      )
    }

    // Perform multi-chain asset scan
    const scanResult = await scanner.scanMultiChainAssets(validAddress, validChainIds)

    // Refresh prices if requested
    if (refreshPrices) {
      console.log('🔄 Refreshing asset prices...')
      for (const chain of scanResult.chains) {
        if (chain.success && chain.assets.length > 0) {
          chain.assets = await scanner.refreshAssetPrices(chain.assets)
          chain.totalUsdValue = chain.assets.reduce((sum, asset) => sum + asset.usdValue, 0)
        }
      }
      
      // Recalculate total portfolio value
      scanResult.totalPortfolioValue = scanResult.chains.reduce(
        (sum, chain) => sum + chain.totalUsdValue, 0
      )
    }

    // Generate additional analytics
    const chainDistribution = scanner.getChainDistribution(scanResult)
    const topAssets = scanner.getTopAssets(scanResult, 10)
    
    // Calculate success metrics
    const successfulScans = scanResult.chains.filter(chain => chain.success).length
    const failedScans = scanResult.chains.filter(chain => !chain.success).length
    const chainsWithAssets = scanResult.chains.filter(chain => 
      chain.success && chain.assets.length > 0
    ).length

    console.log(`✅ Scan completed: ${successfulScans} successful, ${failedScans} failed`)
    console.log(`💰 Total portfolio value: $${scanResult.totalPortfolioValue.toFixed(2)}`)
    console.log(`🏦 Active chains: ${chainsWithAssets}/${scanResult.chains.length}`)

    // Return comprehensive scan results
    return NextResponse.json({
      success: true,
      data: {
        ...scanResult,
        analytics: {
          chainDistribution,
          topAssets,
          scanMetrics: {
            totalChains: scanResult.chains.length,
            successfulScans,
            failedScans,
            chainsWithAssets,
            scanDuration: new Date().toISOString()
          }
        }
      },
      metadata: {
        provider: 'NOWNodes',
        supportedChains: NOWNodesAssetScanner.getSupportedChains().length,
        apiVersion: '1.0',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ NOWNodes asset scan error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during asset scan',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get NOWNodes API key from environment
    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      return NextResponse.json(
        { error: 'NOWNodes API key not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate request data
    const validationResult = AssetScanSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { walletAddress, chainIds, refreshPrices } = validationResult.data

    console.log(`🔍 NOWNodes POST asset scan for ${walletAddress}`)

    // Initialize scanner and perform scan
    const scanner = new NOWNodesAssetScanner(nowNodesApiKey)
    const scanResult = await scanner.scanMultiChainAssets(walletAddress, chainIds)

    // Refresh prices if requested
    if (refreshPrices) {
      for (const chain of scanResult.chains) {
        if (chain.success && chain.assets.length > 0) {
          chain.assets = await scanner.refreshAssetPrices(chain.assets)
          chain.totalUsdValue = chain.assets.reduce((sum, asset) => sum + asset.usdValue, 0)
        }
      }
      
      scanResult.totalPortfolioValue = scanResult.chains.reduce(
        (sum, chain) => sum + chain.totalUsdValue, 0
      )
    }

    // Generate analytics
    const chainDistribution = scanner.getChainDistribution(scanResult)
    const topAssets = scanner.getTopAssets(scanResult, 10)

    return NextResponse.json({
      success: true,
      data: {
        ...scanResult,
        analytics: {
          chainDistribution,
          topAssets
        }
      },
      metadata: {
        provider: 'NOWNodes',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ NOWNodes POST asset scan error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during asset scan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}