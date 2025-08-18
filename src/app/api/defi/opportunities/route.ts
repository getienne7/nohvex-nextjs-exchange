import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { yieldOptimizer, YieldCategory } from '@/lib/web3/yield-optimizer'
import { z } from 'zod'

const getOpportunitiesSchema = z.object({
  chainId: z.number().int().positive().optional(),
  category: z.nativeEnum(YieldCategory).optional(),
  minApy: z.number().min(0).optional(),
  maxRisk: z.number().int().min(1).max(10).optional(),
  limit: z.number().int().min(1).max(50).optional().default(20)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      chainId: searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : undefined,
      category: searchParams.get('category') as YieldCategory | undefined,
      minApy: searchParams.get('minApy') ? parseFloat(searchParams.get('minApy')!) : undefined,
      maxRisk: searchParams.get('maxRisk') ? parseInt(searchParams.get('maxRisk')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    }

    const validatedParams = getOpportunitiesSchema.parse(queryParams)

    let opportunities
    
    if (validatedParams.category) {
      opportunities = await yieldOptimizer.getOpportunitiesByCategory(
        validatedParams.category,
        validatedParams.chainId
      )
    } else if (validatedParams.chainId) {
      opportunities = await yieldOptimizer.getYieldOpportunities(validatedParams.chainId)
    } else {
      opportunities = await yieldOptimizer.getTopOpportunities(50)
    }

    // Apply filters
    let filteredOpportunities = opportunities

    if (validatedParams.minApy) {
      filteredOpportunities = filteredOpportunities.filter(
        opp => opp.apy >= validatedParams.minApy!
      )
    }

    if (validatedParams.maxRisk) {
      filteredOpportunities = filteredOpportunities.filter(
        opp => opp.riskScore <= validatedParams.maxRisk!
      )
    }

    // Limit results
    filteredOpportunities = filteredOpportunities.slice(0, validatedParams.limit)

    return NextResponse.json({
      success: true,
      opportunities: filteredOpportunities,
      total: filteredOpportunities.length,
      filters: validatedParams
    })

  } catch (error) {
    console.error('Get opportunities error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}