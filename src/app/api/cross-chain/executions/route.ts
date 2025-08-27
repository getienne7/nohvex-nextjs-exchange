import { NextRequest, NextResponse } from 'next/server'
import { crossChainAggregator } from '@/lib/cross-chain-aggregator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let executions = await crossChainAggregator.monitorExecutions(userId || undefined)

    // Filter by status if provided
    if (status) {
      executions = executions.filter(exec => exec.status === status)
    }

    // Apply limit
    executions = executions.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: executions,
      count: executions.length,
      filters: {
        userId,
        status,
        limit
      }
    })
  } catch (error) {
    console.error('Cross-chain monitoring API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch executions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { executionId, action } = body

    if (!executionId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Here you would implement execution control actions like pause, resume, cancel
    // For now, return a success response as this would integrate with actual execution system
    
    return NextResponse.json({
      success: true,
      message: `Execution ${action} request processed`,
      data: {
        executionId,
        action,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Cross-chain execution control API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to control execution'
      },
      { status: 500 }
    )
  }
}