/**
 * NOWNodes Price Feed API - Real-time Cryptocurrency Prices
 * GET /api/nownodes-prices - Get real-time crypto prices from NOWNodes Market Data API
 */

import { NextRequest, NextResponse } from 'next/server'
import { NOWNodesService } from '@/lib/web3/nownodes-service'
import { z } from 'zod'

// Request validation schema
const PriceRequestSchema = z.object({
  symbols: z.array(z.string()).min(1).max(50), // Limit to 50 symbols per request
  fiat: z.string().optional().default('USD')
})

// Cache for price data (5 minute cache)
const priceCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
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
    const symbolsParam = searchParams.get('symbols')
    const fiat = searchParams.get('fiat') || 'USD'

    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'symbols parameter is required (comma-separated list)' },
        { status: 400 }
      )
    }

    // Parse symbols
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase())
    
    // Validate request
    const validationResult = PriceRequestSchema.safeParse({ symbols, fiat })
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { symbols: validSymbols } = validationResult.data

    console.log(`💰 NOWNodes price request for: ${validSymbols.join(', ')}`)

    // Check cache first
    const cacheKey = `${validSymbols.join(',')}_${fiat}`
    const cached = priceCache.get(cacheKey)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('📊 Returning cached price data')
      return NextResponse.json({
        success: true,
        data: cached.data,
        metadata: {
          provider: 'NOWNodes',
          cached: true,
          cacheAge: Math.round((now - cached.timestamp) / 1000),
          timestamp: new Date().toISOString()
        }
      })
    }

    // Initialize NOWNodes service
    const nowNodes = new NOWNodesService(nowNodesApiKey)

    // Fetch prices
    const prices = await nowNodes.getMultipleTokenPrices(validSymbols)
    
    // Format response data
    const priceData = validSymbols.map(symbol => {
      const price = prices[symbol]
      return {
        symbol,
        price: price?.price || null,
        change24h: price?.change24h || null,
        marketCap: price?.marketCap || null,
        volume24h: price?.volume24h || null,
        lastUpdated: price?.lastUpdated || new Date().toISOString(),
        available: !!price
      }
    })

    // Calculate summary statistics
    const availablePrices = priceData.filter(p => p.available)
    const totalMarketCap = availablePrices.reduce((sum, p) => sum + (p.marketCap || 0), 0)
    const totalVolume = availablePrices.reduce((sum, p) => sum + (p.volume24h || 0), 0)
    const avgChange24h = availablePrices.length > 0 
      ? availablePrices.reduce((sum, p) => sum + (p.change24h || 0), 0) / availablePrices.length
      : 0

    const responseData = {
      prices: priceData,
      summary: {
        totalSymbols: validSymbols.length,
        availablePrices: availablePrices.length,
        unavailablePrices: validSymbols.length - availablePrices.length,
        totalMarketCap,
        totalVolume24h: totalVolume,
        averageChange24h: avgChange24h
      },
      fiat: fiat.toUpperCase()
    }

    // Cache the response
    priceCache.set(cacheKey, {
      data: responseData,
      timestamp: now
    })

    console.log(`✅ Price data fetched: ${availablePrices.length}/${validSymbols.length} symbols available`)

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        provider: 'NOWNodes',
        cached: false,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ NOWNodes price fetch error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const validationResult = PriceRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { symbols, fiat } = validationResult.data

    console.log(`💰 NOWNodes POST price request for: ${symbols.join(', ')}`)

    // Initialize NOWNodes service
    const nowNodes = new NOWNodesService(nowNodesApiKey)

    // Fetch prices (bypass cache for POST requests)
    const prices = await nowNodes.getMultipleTokenPrices(symbols)
    
    // Format response data
    const priceData = symbols.map(symbol => {
      const price = prices[symbol]
      return {
        symbol,
        price: price?.price || null,
        change24h: price?.change24h || null,
        marketCap: price?.marketCap || null,
        volume24h: price?.volume24h || null,
        lastUpdated: price?.lastUpdated || new Date().toISOString(),
        available: !!price
      }
    })

    const availablePrices = priceData.filter(p => p.available)

    return NextResponse.json({
      success: true,
      data: {
        prices: priceData,
        summary: {
          totalSymbols: symbols.length,
          availablePrices: availablePrices.length,
          unavailablePrices: symbols.length - availablePrices.length
        },
        fiat: fiat.toUpperCase()
      },
      metadata: {
        provider: 'NOWNodes',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ NOWNodes POST price fetch error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      return new NextResponse(null, { status: 503 })
    }

    const nowNodes = new NOWNodesService(nowNodesApiKey)
    const isHealthy = await nowNodes.healthCheck()
    
    return new NextResponse(null, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'X-Service-Status': isHealthy ? 'healthy' : 'unhealthy',
        'X-Provider': 'NOWNodes'
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}