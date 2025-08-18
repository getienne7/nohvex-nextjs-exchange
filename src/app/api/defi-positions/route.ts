import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { defiPositionTracker, DeFiProtocol, PositionType } from '@/lib/defi-position-tracker'
import { z } from 'zod'

const scanPositionsSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  forceRefresh: z.boolean().default(false)
})

const getPositionsSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  protocol: z.nativeEnum(DeFiProtocol).optional(),
  type: z.nativeEnum(PositionType).optional(),
  includeInactive: z.boolean().default(false)
})

const impermanentLossSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  positionId: z.string().min(1, 'Position ID required')
})

// Scan wallet for DeFi positions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { walletAddress, forceRefresh } = scanPositionsSchema.parse(body)

    // Check if we have recent data (unless force refresh)
    if (!forceRefresh) {
      const existingPositions = defiPositionTracker.getPositions(walletAddress)
      if (existingPositions.length > 0) {
        const lastUpdate = Math.max(...existingPositions.map(p => p.lastUpdated))
        const isRecent = Date.now() - lastUpdate < 300000 // 5 minutes
        
        if (isRecent) {
          return NextResponse.json({
            success: true,
            message: 'Using cached position data',
            positions: existingPositions,
            summary: {
              totalPositions: existingPositions.length,
              totalValueLocked: defiPositionTracker.getTotalValueLocked(walletAddress),
              totalDailyYield: defiPositionTracker.getTotalDailyYield(walletAddress),
              averageAPY: defiPositionTracker.getAverageAPY(walletAddress),
              protocolCount: new Set(existingPositions.map(p => p.protocol)).size
            },
            cached: true
          })
        }
      }
    }

    // Scan for positions
    const positions = await defiPositionTracker.scanWalletPositions(walletAddress)
    const liquidationAlerts = defiPositionTracker.getLiquidationAlerts(walletAddress)
    const optimizations = await defiPositionTracker.generateYieldOptimizations(walletAddress)

    return NextResponse.json({
      success: true,
      message: 'DeFi positions scanned successfully',
      positions,
      liquidationAlerts,
      optimizations: optimizations.slice(0, 5), // Top 5 optimizations
      summary: {
        totalPositions: positions.length,
        totalValueLocked: defiPositionTracker.getTotalValueLocked(walletAddress),
        totalDailyYield: defiPositionTracker.getTotalDailyYield(walletAddress),
        averageAPY: defiPositionTracker.getAverageAPY(walletAddress),
        protocolCount: new Set(positions.map(p => p.protocol)).size,
        chainCount: new Set(positions.map(p => p.chainId)).size,
        totalClaimableRewards: positions.reduce((sum, p) => sum + p.rewards.totalClaimableUSD, 0),
        atRiskPositions: positions.filter(p => p.status === 'at_risk').length
      },
      cached: false
    })

  } catch (error) {
    console.error('Scan DeFi positions error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to scan DeFi positions' },
      { status: 500 }
    )
  }
}

// Get DeFi positions and analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'positions') {
      const queryParams = {
        walletAddress: searchParams.get('walletAddress') || '',
        protocol: searchParams.get('protocol') as any,
        type: searchParams.get('type') as any,
        includeInactive: searchParams.get('includeInactive') === 'true'
      }

      const validatedParams = getPositionsSchema.parse(queryParams)

      let positions = defiPositionTracker.getPositions(validatedParams.walletAddress)

      // Apply filters
      if (validatedParams.protocol) {
        positions = defiPositionTracker.getPositionsByProtocol(
          validatedParams.walletAddress, 
          validatedParams.protocol
        )
      }

      if (validatedParams.type) {
        positions = defiPositionTracker.getPositionsByType(
          validatedParams.walletAddress, 
          validatedParams.type
        )
      }

      if (!validatedParams.includeInactive) {
        positions = positions.filter(p => p.status === 'active')
      }

      return NextResponse.json({
        success: true,
        positions,
        total: positions.length,
        filters: {
          protocol: validatedParams.protocol,
          type: validatedParams.type,
          includeInactive: validatedParams.includeInactive
        }
      })
    }

    if (action === 'summary') {
      const walletAddress = searchParams.get('walletAddress')
      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
      }

      const positions = defiPositionTracker.getPositions(walletAddress)
      const liquidationAlerts = defiPositionTracker.getLiquidationAlerts(walletAddress)

      // Protocol breakdown
      const protocolBreakdown = positions.reduce((acc, pos) => {
        if (!acc[pos.protocol]) {
          acc[pos.protocol] = {
            protocol: pos.protocol,
            positionCount: 0,
            totalValue: 0,
            totalYield: 0,
            averageAPY: 0
          }
        }
        acc[pos.protocol].positionCount++
        acc[pos.protocol].totalValue += pos.metrics.totalValue
        acc[pos.protocol].totalYield += pos.metrics.dailyYield
        return acc
      }, {} as any)

      // Calculate average APY for each protocol
      Object.values(protocolBreakdown).forEach((breakdown: any) => {
        const protocolPositions = positions.filter(p => p.protocol === breakdown.protocol)
        breakdown.averageAPY = protocolPositions.reduce((sum, pos) => {
          const weight = pos.metrics.totalValue / breakdown.totalValue
          return sum + (pos.metrics.apy * weight)
        }, 0)
      })

      // Risk analysis
      const riskAnalysis = {
        lowRisk: positions.filter(p => p.risks.overallRisk === 'low').length,
        mediumRisk: positions.filter(p => p.risks.overallRisk === 'medium').length,
        highRisk: positions.filter(p => p.risks.overallRisk === 'high').length,
        criticalRisk: positions.filter(p => p.risks.overallRisk === 'critical').length
      }

      return NextResponse.json({
        success: true,
        summary: {
          totalPositions: positions.length,
          totalValueLocked: defiPositionTracker.getTotalValueLocked(walletAddress),
          totalDailyYield: defiPositionTracker.getTotalDailyYield(walletAddress),
          averageAPY: defiPositionTracker.getAverageAPY(walletAddress),
          protocolCount: new Set(positions.map(p => p.protocol)).size,
          chainCount: new Set(positions.map(p => p.chainId)).size,
          totalClaimableRewards: positions.reduce((sum, p) => sum + p.rewards.totalClaimableUSD, 0),
          atRiskPositions: liquidationAlerts.length,
          protocolBreakdown: Object.values(protocolBreakdown),
          riskAnalysis
        }
      })
    }

    if (action === 'alerts') {
      const walletAddress = searchParams.get('walletAddress')
      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
      }

      const alerts = defiPositionTracker.getLiquidationAlerts(walletAddress)

      return NextResponse.json({
        success: true,
        alerts,
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warnings: alerts.filter(a => a.severity === 'warning').length
      })
    }

    if (action === 'optimizations') {
      const walletAddress = searchParams.get('walletAddress')
      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
      }

      const optimizations = await defiPositionTracker.generateYieldOptimizations(walletAddress)

      return NextResponse.json({
        success: true,
        optimizations,
        total: optimizations.length,
        totalPotentialGain: optimizations.reduce((sum, opt) => sum + opt.potentialGain, 0)
      })
    }

    if (action === 'impermanent-loss') {
      const queryParams = {
        walletAddress: searchParams.get('walletAddress') || '',
        positionId: searchParams.get('positionId') || ''
      }

      const validatedParams = impermanentLossSchema.parse(queryParams)

      const positions = defiPositionTracker.getPositions(validatedParams.walletAddress)
      const position = positions.find(p => p.id === validatedParams.positionId)

      if (!position) {
        return NextResponse.json({ error: 'Position not found' }, { status: 404 })
      }

      if (position.type !== 'liquidity_pool') {
        return NextResponse.json({ error: 'Impermanent loss analysis only available for liquidity pool positions' }, { status: 400 })
      }

      const ilAnalysis = await defiPositionTracker.calculateImpermanentLoss(position)

      return NextResponse.json({
        success: true,
        position: {
          id: position.id,
          protocol: position.protocol,
          assets: position.assets.map(a => ({ symbol: a.symbol, weight: a.weight }))
        },
        impermanentLossAnalysis: ilAnalysis
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Get DeFi positions error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get DeFi positions' },
      { status: 500 }
    )
  }
}