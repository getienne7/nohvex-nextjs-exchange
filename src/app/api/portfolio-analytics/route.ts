import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { portfolioAnalytics } from '@/lib/portfolio-analytics'
import { z } from 'zod'

const getAnalyticsSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  timeframe: z.enum(['1d', '7d', '30d', '90d', '1y', 'all']).default('30d'),
  includeRecommendations: z.boolean().default(true),
  includeAttribution: z.boolean().default(true)
})

const createSnapshotSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address')
})

// Get portfolio analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'summary') {
      const queryParams = {
        walletAddress: searchParams.get('walletAddress') || '',
        timeframe: searchParams.get('timeframe') as any || '30d',
        includeRecommendations: searchParams.get('includeRecommendations') !== 'false',
        includeAttribution: searchParams.get('includeAttribution') !== 'false'
      }

      const validatedParams = getAnalyticsSchema.parse(queryParams)

      const summary = await portfolioAnalytics.getPortfolioSummary(validatedParams.walletAddress)

      return NextResponse.json({
        success: true,
        data: {
          currentSnapshot: summary.currentSnapshot,
          performanceAttribution: validatedParams.includeAttribution ? summary.performanceAttribution : null,
          recommendations: validatedParams.includeRecommendations ? summary.recommendations : null,
          timeframe: validatedParams.timeframe
        }
      })
    }

    if (action === 'snapshots') {
      const walletAddress = searchParams.get('walletAddress')
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
      }

      const snapshots = portfolioAnalytics.getSnapshots(walletAddress, limit)

      return NextResponse.json({
        success: true,
        snapshots,
        total: snapshots.length
      })
    }

    if (action === 'historical') {
      const walletAddress = searchParams.get('walletAddress')

      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
      }

      const historicalData = portfolioAnalytics.getHistoricalData(walletAddress)

      return NextResponse.json({
        success: true,
        historicalData
      })
    }

    if (action === 'attribution') {
      const walletAddress = searchParams.get('walletAddress')

      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
      }

      const attribution = await portfolioAnalytics.calculatePerformanceAttribution(walletAddress)

      return NextResponse.json({
        success: true,
        attribution
      })
    }

    if (action === 'recommendations') {
      const walletAddress = searchParams.get('walletAddress')

      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
      }

      const recommendations = await portfolioAnalytics.generateRebalancingRecommendations(walletAddress)

      return NextResponse.json({
        success: true,
        recommendations
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Portfolio analytics error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get portfolio analytics' },
      { status: 500 }
    )
  }
}

// Create portfolio snapshot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { walletAddress } = createSnapshotSchema.parse(body)

    const snapshot = await portfolioAnalytics.createSnapshot(walletAddress)

    return NextResponse.json({
      success: true,
      message: 'Portfolio snapshot created',
      snapshot: {
        id: snapshot.id,
        timestamp: snapshot.timestamp,
        totalValue: snapshot.totalValue,
        assetCount: snapshot.assets.length,
        chainCount: snapshot.chains.length,
        performance: snapshot.performance,
        riskMetrics: snapshot.riskMetrics
      }
    })

  } catch (error) {
    console.error('Create snapshot error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portfolio snapshot' },
      { status: 500 }
    )
  }
}