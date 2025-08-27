import { NextRequest, NextResponse } from 'next/server'
import { crossChainAggregator } from '@/lib/cross-chain-aggregator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceChain = searchParams.get('sourceChain')
    const targetChain = searchParams.get('targetChain')
    const asset = searchParams.get('asset')
    const minApy = parseFloat(searchParams.get('minApy') || '0')
    const maxRisk = searchParams.get('maxRisk') as 'low' | 'medium' | 'high'
    const strategy = searchParams.get('strategy')

    const filters = {
      ...(sourceChain && { sourceChain }),
      ...(targetChain && { targetChain }),
      ...(asset && { asset }),
      ...(minApy > 0 && { minApy }),
      ...(maxRisk && { maxRisk }),
      ...(strategy && { strategy })
    }

    const opportunities = await crossChainAggregator.getCrossChainYieldOpportunities(filters)

    return NextResponse.json({
      success: true,
      data: opportunities,
      count: opportunities.length,
      filters
    })
  } catch (error) {
    console.error('Cross-chain yield API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch yield opportunities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assets, targetYield, riskTolerance, duration } = body

    if (!assets || !targetYield || !riskTolerance || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const optimization = await crossChainAggregator.optimizeCrossChainYieldStrategy(
      assets,
      targetYield,
      riskTolerance,
      duration
    )

    return NextResponse.json({
      success: true,
      data: optimization,
      message: 'Yield strategy optimized successfully'
    })
  } catch (error) {
    console.error('Cross-chain yield optimization API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to optimize yield strategy'
      },
      { status: 500 }
    )
  }
}