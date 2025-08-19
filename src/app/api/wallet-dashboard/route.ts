/**
 * Real-Time Wallet Dashboard API - NOWNodes Powered
 * GET /api/wallet-dashboard - Live wallet data for dashboard components
 */

import { NextRequest, NextResponse } from 'next/server'
import { NOWNodesService } from '@/lib/web3/nownodes-service'
import { ethers } from 'ethers'

export async function GET(request: NextRequest) {
  try {
    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      return NextResponse.json({ error: 'NOWNodes API key not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    console.log(`📊 Generating dashboard data for wallet: ${address}`)

    const nowNodes = new NOWNodesService(nowNodesApiKey)
    const startTime = Date.now()

    // Focus on chains that are working reliably
    const workingChains = [
      { chainId: 1, name: 'Ethereum', symbol: 'ETH' },
      { chainId: 56, name: 'BNB Smart Chain', symbol: 'BNB' },
      { chainId: 137, name: 'Polygon', symbol: 'MATIC' }
    ]

    const dashboardData: any = {
      walletAddress: address,
      timestamp: new Date().toISOString(),
      portfolio: {
        totalValue: 0,
        chains: [],
        topAssets: [],
        performance: {
          change24h: 0,
          changePercent: 0
        }
      },
      activity: {
        totalTransactions: 0,
        activeChains: 0,
        lastActivity: null
      },
      analytics: {
        diversification: 0,
        riskLevel: 'LOW',
        chainDistribution: []
      }
    }

    // Scan each working chain
    for (const chain of workingChains) {
      try {
        console.log(`⛓️ Scanning ${chain.name}...`)
        
        const provider = nowNodes.getProvider(chain.chainId)
        const balance = await provider.getBalance(address)
        const balanceFormatted = ethers.formatEther(balance)
        const transactionCount = await provider.getTransactionCount(address)
        
        // Get token price
        const priceData = await nowNodes.getTokenPrice(chain.symbol)
        const tokenPrice = priceData?.price || 0
        const usdValue = parseFloat(balanceFormatted) * tokenPrice

        const chainData = {
          chainId: chain.chainId,
          name: chain.name,
          symbol: chain.symbol,
          balance: balanceFormatted,
          balanceWei: balance.toString(),
          usdValue: usdValue,
          price: tokenPrice,
          transactionCount: transactionCount,
          isActive: transactionCount > 0,
          change24h: priceData?.change24h || 0
        }

        dashboardData.portfolio.chains.push(chainData)
        dashboardData.portfolio.totalValue += usdValue
        dashboardData.activity.totalTransactions += transactionCount
        
        if (transactionCount > 0) {
          dashboardData.activity.activeChains++
        }

        // Add to top assets if has balance
        if (usdValue > 0) {
          dashboardData.portfolio.topAssets.push({
            symbol: chain.symbol,
            name: chain.name,
            balance: balanceFormatted,
            usdValue: usdValue,
            price: tokenPrice,
            change24h: priceData?.change24h || 0,
            chainName: chain.name
          })
        }

      } catch (error) {
        console.error(`❌ Error scanning ${chain.name}:`, error)
        dashboardData.portfolio.chains.push({
          chainId: chain.chainId,
          name: chain.name,
          symbol: chain.symbol,
          balance: '0',
          usdValue: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          isActive: false
        })
      }
    }

    // Sort top assets by value
    dashboardData.portfolio.topAssets.sort((a: any, b: any) => b.usdValue - a.usdValue)

    // Calculate analytics
    const activeChains = dashboardData.portfolio.chains.filter((c: any) => c.usdValue > 0)
    dashboardData.analytics.diversification = Math.min(activeChains.length * 33, 100)
    dashboardData.analytics.riskLevel = activeChains.length < 2 ? 'HIGH' : activeChains.length < 3 ? 'MEDIUM' : 'LOW'
    
    // Chain distribution
    dashboardData.analytics.chainDistribution = activeChains.map((chain: any) => ({
      name: chain.name,
      value: chain.usdValue,
      percentage: dashboardData.portfolio.totalValue > 0 
        ? (chain.usdValue / dashboardData.portfolio.totalValue) * 100 
        : 0
    }))

    // Calculate portfolio performance
    const totalChange24h = dashboardData.portfolio.topAssets.reduce((sum: number, asset: any) => 
      sum + (asset.change24h * (asset.usdValue / dashboardData.portfolio.totalValue)), 0)
    
    dashboardData.portfolio.performance = {
      change24h: totalChange24h,
      changePercent: totalChange24h,
      isPositive: totalChange24h >= 0
    }

    const scanDuration = Date.now() - startTime

    console.log(`✅ Dashboard data generated in ${scanDuration}ms`)
    console.log(`💰 Total portfolio value: $${dashboardData.portfolio.totalValue.toFixed(4)}`)

    return NextResponse.json({
      success: true,
      data: dashboardData,
      metadata: {
        provider: 'NOWNodes',
        scanDuration: `${scanDuration}ms`,
        chainsScanned: workingChains.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Dashboard generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Dashboard generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get current market data for dashboard
export async function POST(request: NextRequest) {
  try {
    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { symbols = ['BTC', 'ETH', 'BNB', 'MATIC'] } = body

    const nowNodes = new NOWNodesService(nowNodesApiKey)
    const prices = await nowNodes.getMultipleTokenPrices(symbols)

    const marketData = {
      timestamp: new Date().toISOString(),
      prices: Object.entries(prices).map(([symbol, data]) => ({
        symbol,
        price: data.price,
        change24h: data.change24h,
        isPositive: data.change24h >= 0
      })),
      summary: {
        totalMarketCap: Object.values(prices).reduce((sum, p) => sum + p.marketCap, 0),
        averageChange: Object.values(prices).reduce((sum, p) => sum + p.change24h, 0) / Object.keys(prices).length
      }
    }

    return NextResponse.json({
      success: true,
      data: marketData
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Market data fetch failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}