import { NextRequest, NextResponse } from 'next/server'
import { institutionalPortfolioManager } from '@/lib/institutional-portfolio-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')
    const period = searchParams.get('period') || '1M'

    if (!portfolioId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID required' },
        { status: 400 }
      )
    }

    // Get performance attribution analysis
    const attribution = await institutionalPortfolioManager.getPerformanceAttribution(portfolioId, period)

    return NextResponse.json({
      success: true,
      data: attribution
    })
  } catch (error) {
    console.error('Performance attribution API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance attribution' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { portfolioId, type, period, userId } = body

    if (!portfolioId || !type || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const report = await institutionalPortfolioManager.generateReport(
      portfolioId,
      type,
      period || '1M',
      userId
    )

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report generation initiated'
    })
  } catch (error) {
    console.error('Report generation API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate report'
      },
      { status: 500 }
    )
  }
}