import { NextRequest, NextResponse } from 'next/server'
import { nowNodesService } from '@/lib/nownodes'

export async function GET(req: NextRequest) {
  try {
    // Handle potential empty URL during build/prerender
    let searchParams: URLSearchParams
    try {
      const url = new URL(req.url || 'http://localhost:3000')
      searchParams = url.searchParams
} catch (_urlError) {
      // Fallback if URL construction fails
      searchParams = new URLSearchParams()
    }
    
    const symbolsParam = searchParams.get('symbols')
    
    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'symbols parameter is required' },
        { status: 400 }
      )
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase())
    const prices = await nowNodesService.getCryptoPrices(symbols)
    
    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Prices API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency prices' },
      { status: 500 }
    )
  }
}

// GET single price
export async function POST(req: NextRequest) {
  try {
    const { symbol } = await req.json()
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'symbol is required' },
        { status: 400 }
      )
    }

    const price = await nowNodesService.getSinglePrice(symbol.toUpperCase())
    
    if (!price) {
      return NextResponse.json(
        { error: 'Price not found for symbol' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: price,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Single price API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency price' },
      { status: 500 }
    )
  }
}
