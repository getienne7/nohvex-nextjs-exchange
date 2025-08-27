import { NextRequest, NextResponse } from 'next/server'
import { institutionalPortfolioManager } from '@/lib/institutional-portfolio-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const portfolioId = searchParams.get('portfolioId')

    if (portfolioId) {
      // Get specific portfolio analytics
      const portfolio = await institutionalPortfolioManager.getPortfolioAnalytics(portfolioId)
      if (!portfolio) {
        return NextResponse.json(
          { success: false, error: 'Portfolio not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        data: portfolio
      })
    }

    if (institutionId) {
      // Get compliance dashboard
      const dashboard = await institutionalPortfolioManager.getComplianceDashboard(institutionId)
      return NextResponse.json({
        success: true,
        data: dashboard
      })
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Institutional portfolios API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { institutionId, name, description, currency, riskLevel, benchmark, allocations, rebalancing } = body

    if (!institutionId || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const portfolio = await institutionalPortfolioManager.createPortfolio(institutionId, {
      name,
      description,
      totalValue: 0,
      totalInvested: 0,
      pnl: 0,
      pnlPercentage: 0,
      currency: currency || 'USD',
      riskLevel: riskLevel || 'moderate',
      benchmark: benchmark || 'CRYPTO_INDEX',
      allocations: allocations || [],
      rebalancing: rebalancing || {
        isEnabled: true,
        frequency: 'weekly',
        threshold: 5,
        method: 'risk-parity',
        constraints: {
          maxTurnover: 20,
          minTradeSize: 10000,
          maxTradeSize: 5000000,
          allowedSlippage: 1.0
        },
        lastRebalance: Date.now(),
        nextRebalance: Date.now() + 7 * 24 * 60 * 60 * 1000
      }
    })

    return NextResponse.json({
      success: true,
      data: portfolio,
      message: 'Portfolio created successfully'
    })
  } catch (error) {
    console.error('Portfolio creation API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create portfolio'
      },
      { status: 500 }
    )
  }
}