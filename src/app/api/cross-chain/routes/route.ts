import { NextRequest, NextResponse } from 'next/server'
import { crossChainAggregator } from '@/lib/cross-chain-aggregator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceChain = searchParams.get('sourceChain')
    const targetChain = searchParams.get('targetChain')
    const sourceAsset = searchParams.get('sourceAsset')
    const targetAsset = searchParams.get('targetAsset')
    const amount = searchParams.get('amount')
    const prioritize = searchParams.get('prioritize') as 'cost' | 'time' | 'security' || 'cost'
    const includeYield = searchParams.get('includeYield') === 'true'
    const maxSlippage = parseFloat(searchParams.get('maxSlippage') || '1.0')
    const maxTime = parseInt(searchParams.get('maxTime') || '3600')

    if (!sourceChain || !targetChain || !sourceAsset || !targetAsset || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const numericAmount = parseFloat(amount)
    if (numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const routes = await crossChainAggregator.findOptimalRoutes(
      sourceChain,
      targetChain,
      sourceAsset,
      targetAsset,
      numericAmount,
      {
        prioritize,
        maxSlippage,
        maxTime,
        includeYield
      }
    )

    return NextResponse.json({
      success: true,
      data: routes,
      count: routes.length,
      metadata: {
        sourceChain,
        targetChain,
        sourceAsset,
        targetAsset,
        amount: numericAmount,
        preferences: {
          prioritize,
          maxSlippage,
          maxTime,
          includeYield
        }
      }
    })
  } catch (error) {
    console.error('Cross-chain routes API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to find routes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { routeId, userId, amount } = body

    if (!routeId || !userId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const numericAmount = parseFloat(amount)
    if (numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const execution = await crossChainAggregator.executeCrossChainTransaction(
      routeId,
      userId,
      numericAmount
    )

    return NextResponse.json({
      success: true,
      data: execution,
      message: 'Cross-chain transaction initiated successfully'
    })
  } catch (error) {
    console.error('Cross-chain execution API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to execute transaction'
      },
      { status: 500 }
    )
  }
}