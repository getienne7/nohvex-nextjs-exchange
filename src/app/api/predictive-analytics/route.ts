import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  predictiveAnalyticsEngine, 
  PredictionTimeframe,
  RiskLevel,
  RecommendationType
} from '@/lib/predictive-analytics'
import { z } from 'zod'

const generatePredictionsSchema = z.object({
  assets: z.array(z.string()).min(1, 'At least one asset required'),
  timeframes: z.array(z.nativeEnum(PredictionTimeframe)).optional()
})

const generateRecommendationsSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  riskTolerance: z.nativeEnum(RiskLevel).default(RiskLevel.MEDIUM),
  portfolioData: z.any().optional()
})

const optimizePortfolioSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  currentPortfolio: z.any(),
  constraints: z.object({
    maxWeight: z.number().optional(),
    minWeight: z.number().optional(),
    maxAssets: z.number().optional()
  }).optional(),
  objectives: z.array(z.string()).default(['maximize_return', 'minimize_risk'])
})

// Generate predictions and analytics
export async function POST(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const action = body.action

    if (action === 'generate-predictions') {
      const validatedData = generatePredictionsSchema.parse(body)
      
      const predictions = await predictiveAnalyticsEngine.generateMarketPredictions(
        validatedData.assets
      )

      return NextResponse.json({
        success: true,
        message: 'Market predictions generated successfully',
        predictions,
        total: predictions.length
      })
    }

    if (action === 'analyze-sentiment') {
      const { asset } = z.object({
        asset: z.string().min(1, 'Asset required')
      }).parse(body)

      const sentimentAnalysis = await predictiveAnalyticsEngine.analyzeSentiment(asset)

      return NextResponse.json({
        success: true,
        message: 'Sentiment analysis completed',
        sentimentAnalysis
      })
    }

    if (action === 'generate-recommendations') {
      const validatedData = generateRecommendationsSchema.parse(body)

      const recommendations = await predictiveAnalyticsEngine.generateAIRecommendations(
        'test-user',
        validatedData.portfolioData,
        validatedData.riskTolerance
      )

      return NextResponse.json({
        success: true,
        message: 'AI recommendations generated successfully',
        recommendations,
        total: recommendations.length
      })
    }

    if (action === 'analyze-market-regime') {
      const marketRegimes = await predictiveAnalyticsEngine.analyzeMarketRegime()

      return NextResponse.json({
        success: true,
        message: 'Market regime analysis completed',
        marketRegimes,
        total: marketRegimes.length
      })
    }

    if (action === 'optimize-portfolio') {
      const validatedData = optimizePortfolioSchema.parse(body)

      const optimization = await predictiveAnalyticsEngine.optimizePortfolio(
        validatedData.currentPortfolio,
        validatedData.constraints || {},
        validatedData.objectives
      )

      return NextResponse.json({
        success: true,
        message: 'Portfolio optimization completed',
        optimization
      })
    }

    if (action === 'generate-insights') {
      const { marketData } = z.object({
        marketData: z.any().optional()
      }).parse(body)

      const insights = await predictiveAnalyticsEngine.generateAIInsights(marketData || {})

      return NextResponse.json({
        success: true,
        message: 'AI insights generated successfully',
        insights,
        total: insights.length
      })
    }

    if (action === 'update-prediction-accuracy') {
      const { predictionId, actualPrice } = z.object({
        predictionId: z.string(),
        actualPrice: z.number()
      }).parse(body)

      await predictiveAnalyticsEngine.updatePredictionAccuracy(predictionId, actualPrice)

      return NextResponse.json({
        success: true,
        message: 'Prediction accuracy updated successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Predictive analytics API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get analytics data
export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'predictions') {
      const asset = searchParams.get('asset')
      if (!asset) {
        return NextResponse.json({ error: 'Asset parameter required' }, { status: 400 })
      }

      const predictions = predictiveAnalyticsEngine.getPredictions(asset)

      return NextResponse.json({
        success: true,
        predictions,
        total: predictions.length
      })
    }

    if (action === 'sentiment') {
      const asset = searchParams.get('asset')
      if (!asset) {
        return NextResponse.json({ error: 'Asset parameter required' }, { status: 400 })
      }

      const sentimentAnalysis = predictiveAnalyticsEngine.getSentimentAnalysis(asset)

      return NextResponse.json({
        success: true,
        sentimentAnalysis: sentimentAnalysis || null
      })
    }

    if (action === 'recommendations') {
      const type = searchParams.get('type') as RecommendationType | null
      
      let recommendations = predictiveAnalyticsEngine.getRecommendations('test-user')
      
      if (type) {
        recommendations = recommendations.filter(rec => rec.type === type)
      }

      return NextResponse.json({
        success: true,
        recommendations,
        total: recommendations.length
      })
    }

    if (action === 'market-regimes') {
      const marketRegimes = predictiveAnalyticsEngine.getMarketRegimes()

      return NextResponse.json({
        success: true,
        marketRegimes,
        total: marketRegimes.length
      })
    }

    if (action === 'insights') {
      const type = searchParams.get('type')
      const urgency = searchParams.get('urgency')
      
      let insights = predictiveAnalyticsEngine.getAIInsights()
      
      if (type) {
        insights = insights.filter(insight => insight.type === type)
      }
      
      if (urgency) {
        insights = insights.filter(insight => insight.urgency === urgency)
      }

      return NextResponse.json({
        success: true,
        insights,
        total: insights.length
      })
    }

    if (action === 'dashboard') {
      // Generate comprehensive dashboard data
      const assets = ['ETH', 'BTC', 'BNB']
      
      // Get recent predictions
      const allPredictions = assets.flatMap(asset => 
        predictiveAnalyticsEngine.getPredictions(asset).slice(-3)
      )
      
      // Get sentiment for major assets
      const sentimentData: Record<string, any> = {}
      for (const asset of assets) {
        const sentiment = predictiveAnalyticsEngine.getSentimentAnalysis(asset)
        if (sentiment) {
          sentimentData[asset] = sentiment
        }
      }
      
      // Get recommendations
      const recommendations = predictiveAnalyticsEngine.getRecommendations('test-user')
      
      // Get market regimes
      const marketRegimes = predictiveAnalyticsEngine.getMarketRegimes()
      
      // Get insights
      const insights = predictiveAnalyticsEngine.getAIInsights()

      // Calculate summary statistics
      const totalPredictions = allPredictions.length
      const bullishPredictions = allPredictions.filter(p => p.direction === 'bullish').length
      const bearishPredictions = allPredictions.filter(p => p.direction === 'bearish').length
      const averageConfidence = allPredictions.reduce((sum, p) => sum + p.confidence, 0) / totalPredictions || 0
      
      const highImpactInsights = insights.filter(i => i.impact === 'high').length
      const immediateInsights = insights.filter(i => i.urgency === 'immediate').length
      
      const averageSentiment = Object.values(sentimentData).reduce((sum: number, s: any) => 
        sum + s.overallSentiment, 0) / Object.keys(sentimentData).length || 0

      return NextResponse.json({
        success: true,
        dashboard: {
          summary: {
            totalPredictions,
            bullishPredictions,
            bearishPredictions,
            averageConfidence: averageConfidence * 100,
            totalRecommendations: recommendations.length,
            highImpactInsights,
            immediateInsights,
            averageSentiment,
            dominantRegime: marketRegimes.reduce((prev, current) => 
              prev.probability > current.probability ? prev : current, marketRegimes[0])?.name || 'Unknown'
          },
          recentPredictions: allPredictions.slice(-5),
          topRecommendations: recommendations.slice(0, 3),
          criticalInsights: insights.filter(i => i.impact === 'high' || i.urgency === 'immediate').slice(0, 3),
          sentimentOverview: sentimentData,
          marketRegimes: marketRegimes.slice(0, 3)
        }
      })
    }

    if (action === 'performance') {
      // Mock performance tracking data
      const performanceData = {
        predictionAccuracy: {
          overall: 72.5,
          byTimeframe: {
            '1h': 68.2,
            '4h': 71.8,
            '1d': 75.3,
            '1w': 78.1
          },
          byAsset: {
            'ETH': 74.2,
            'BTC': 71.8,
            'BNB': 69.5
          }
        },
        recommendationPerformance: {
          totalRecommendations: 45,
          successfulRecommendations: 32,
          successRate: 71.1,
          averageReturn: 8.7,
          bestRecommendation: {
            asset: 'ETH',
            return: 23.5,
            date: Date.now() - 7 * 24 * 60 * 60 * 1000
          },
          worstRecommendation: {
            asset: 'BNB',
            return: -5.2,
            date: Date.now() - 14 * 24 * 60 * 60 * 1000
          }
        },
        sentimentAccuracy: {
          overall: 69.3,
          correlationWithPrice: 0.65,
          leadTime: '4-6 hours'
        },
        aiInsightsImpact: {
          totalInsights: 28,
          actionableInsights: 19,
          averageImpact: 6.8,
          userEngagement: 0.73
        }
      }

      return NextResponse.json({
        success: true,
        performance: performanceData
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Predictive analytics GET error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}