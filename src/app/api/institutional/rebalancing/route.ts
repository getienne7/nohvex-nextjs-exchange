import { NextRequest, NextResponse } from 'next/server'
import { institutionalPortfolioManager } from '@/lib/institutional-portfolio-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { portfolioId, userId, method, action } = body

    if (!portfolioId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (action === 'generate') {
      // Generate rebalancing proposal
      const proposal = await institutionalPortfolioManager.generateRebalancingProposal(
        portfolioId,
        userId,
        method
      )

      return NextResponse.json({
        success: true,
        data: proposal,
        message: 'Rebalancing proposal generated successfully'
      })
    }

    if (action === 'execute') {
      const { proposalId } = body
      if (!proposalId) {
        return NextResponse.json(
          { success: false, error: 'Proposal ID required for execution' },
          { status: 400 }
        )
      }

      const result = await institutionalPortfolioManager.executeRebalancing(proposalId, userId)

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Rebalancing executed successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Rebalancing API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Rebalancing operation failed'
      },
      { status: 500 }
    )
  }
}