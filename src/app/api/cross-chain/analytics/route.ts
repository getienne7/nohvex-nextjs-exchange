import { NextRequest, NextResponse } from 'next/server'
import { crossChainAggregator } from '@/lib/cross-chain-aggregator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'
    const userId = searchParams.get('userId')

    const analytics = await crossChainAggregator.getBridgeAnalytics()

    // Generate time-series data for charts
    const generateTimeSeriesData = (days: number) => {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
        return {
          date: date.toISOString().split('T')[0],
          volume: Math.floor(Math.random() * 2000000) + 500000,
          transactions: Math.floor(Math.random() * 300) + 50,
          avgCost: Math.floor(Math.random() * 30) + 10,
          avgTime: Math.floor(Math.random() * 600) + 300,
          successRate: Math.floor(Math.random() * 10) + 90
        }
      })
    }

    const timeframeDays = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }

    const days = timeframeDays[timeframe as keyof typeof timeframeDays] || 7
    const timeSeriesData = generateTimeSeriesData(days)

    // Enhanced analytics with time-series data
    const enhancedAnalytics = {
      ...analytics,
      timeframe,
      timeSeries: timeSeriesData,
      summary: {
        totalVolume: analytics.totalVolume,
        totalTransactions: analytics.totalTransactions,
        averageTime: analytics.averageTime,
        successRate: analytics.successRate,
        growthMetrics: {
          volumeGrowth: Math.floor(Math.random() * 30) + 5, // 5-35% growth
          transactionGrowth: Math.floor(Math.random() * 25) + 8, // 8-33% growth
          efficiencyImprovement: Math.floor(Math.random() * 15) + 5 // 5-20% improvement
        }
      },
      topRoutes: [
        { from: 'ethereum', to: 'polygon', volume: 5000000, transactions: 1200, avgCost: 25 },
        { from: 'ethereum', to: 'arbitrum', volume: 3500000, transactions: 980, avgCost: 18 },
        { from: 'bsc', to: 'polygon', volume: 2800000, transactions: 850, avgCost: 12 },
        { from: 'polygon', to: 'avalanche', volume: 2200000, transactions: 650, avgCost: 15 },
        { from: 'ethereum', to: 'optimism', volume: 1900000, transactions: 420, avgCost: 22 }
      ]
    }

    // Add user-specific analytics if userId provided
    if (userId) {
      (enhancedAnalytics as any).userStats = {
        totalBridged: Math.floor(Math.random() * 100000) + 10000,
        transactionCount: Math.floor(Math.random() * 50) + 5,
        favoriteRoute: 'ethereum → polygon',
        avgTransactionSize: Math.floor(Math.random() * 5000) + 1000,
        totalSaved: Math.floor(Math.random() * 500) + 50 // savings from optimal routing
      }
    }

    return NextResponse.json({
      success: true,
      data: enhancedAnalytics,
      metadata: {
        timeframe,
        userId,
        generatedAt: new Date().toISOString(),
        dataPoints: timeSeriesData.length
      }
    })
  } catch (error) {
    console.error('Cross-chain analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}