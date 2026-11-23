import { NextRequest, NextResponse } from 'next/server'
import { crossChainAggregator } from '@/lib/cross-chain-aggregator'

// Define interfaces for the analytics data
interface TimeSeriesData {
  date: string;
  volume: number;
  transactions: number;
  avgCost: number;
  avgTime: number;
  successRate: number;
}

interface BridgeAnalytics {
  totalVolume: number;
  totalTransactions: number;
  averageTime: number;
  successRate: number;
  topProtocols: Array<{ name: string; volume: number; transactions: number }>;
  topChains: Array<{ name: string; volume: number; transactions: number }>;
}

interface EnhancedAnalytics extends BridgeAnalytics {
  timeframe: string;
  timeSeries: TimeSeriesData[];
  summary: {
    totalVolume: number;
    totalTransactions: number;
    averageTime: number;
    successRate: number;
    growthMetrics: {
      volumeGrowth: number;
      transactionGrowth: number;
      efficiencyImprovement: number;
    };
  };
  topRoutes: Array<{ 
    from: string; 
    to: string; 
    volume: number; 
    transactions: number; 
    avgCost: number 
  }>;
  userStats?: {
    totalBridged: number;
    transactionCount: number;
    favoriteRoute: string;
    avgTransactionSize: number;
    totalSaved: number;
  };
}

interface AnalyticsResponse {
  success: boolean;
  data: EnhancedAnalytics;
  metadata: {
    timeframe: string;
    userId: string | null;
    generatedAt: string;
    dataPoints: number;
  };
}

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
    const timeSeriesData: TimeSeriesData[] = generateTimeSeriesData(days)

    // Enhanced analytics with time-series data
    const enhancedAnalytics: EnhancedAnalytics = {
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
      enhancedAnalytics.userStats = {
        totalBridged: Math.floor(Math.random() * 100000) + 10000,
        transactionCount: Math.floor(Math.random() * 50) + 5,
        favoriteRoute: 'ethereum → polygon',
        avgTransactionSize: Math.floor(Math.random() * 5000) + 1000,
        totalSaved: Math.floor(Math.random() * 500) + 50 // savings from optimal routing
      }
    }

    const response: AnalyticsResponse = {
      success: true,
      data: enhancedAnalytics,
      metadata: {
        timeframe,
        userId,
        generatedAt: new Date().toISOString(),
        dataPoints: timeSeriesData.length
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Cross-chain analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}