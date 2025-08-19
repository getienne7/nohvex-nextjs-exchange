import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { yieldOptimizer } from '@/lib/web3/yield-optimizer'
import { z } from 'zod'

const optimizePortfolioSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  chainId: z.number().int().positive(),
  riskTolerance: z.number().int().min(1).max(10).default(5)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { walletAddress, chainId, riskTolerance } = optimizePortfolioSchema.parse(body)

    // Verify wallet belongs to user and get assets
    const walletConnection = await prisma.walletConnection.findUnique({
      where: {
        userId_address_chainId: {
          userId: session.user.id,
          address: walletAddress.toLowerCase(),
          chainId
        }
      },
      include: {
        assets: true
      }
    })

    if (!walletConnection) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (walletConnection.assets.length === 0) {
      return NextResponse.json({ 
        error: 'No assets found. Please scan wallet assets first.' 
      }, { status: 400 })
    }

    // Convert database assets to WalletAsset format
    const assets = walletConnection.assets.map(asset => ({
      address: asset.tokenAddress,
      symbol: asset.symbol,
      name: asset.name,
      balance: asset.balance,
      decimals: asset.decimals,
      usdValue: asset.usdValue || 0,
      logoUrl: asset.logoUrl || undefined
    }))

    // Optimize portfolio
    const optimization = await yieldOptimizer.optimizePortfolio(
      assets,
      chainId,
      riskTolerance
    )

    // Store optimization results for analytics
    try {
      await prisma.portfolioOptimization.create({
        data: {
          userId: session.user.id,
          walletId: walletConnection.id,
          chainId,
          riskTolerance,
          currentYield: optimization.currentYield,
          optimizedYield: optimization.optimizedYield,
          potentialGain: optimization.potentialGain,
          recommendationsCount: optimization.recommendations.length,
          overallRisk: optimization.riskAssessment.overallRisk,
          diversificationScore: optimization.riskAssessment.diversificationScore,
          createdAt: new Date()
        }
      })
    } catch (dbError) {
      // Don't fail the request if we can't store analytics
      console.warn('Failed to store optimization analytics:', dbError)
    }

    return NextResponse.json({
      success: true,
      optimization,
      metadata: {
        walletAddress,
        chainId,
        riskTolerance,
        assetsAnalyzed: assets.length,
        totalValue: assets.reduce((sum, asset) => 
          sum + (parseFloat(asset.balance) * (asset.usdValue || 0)), 0
        )
      }
    })

  } catch (error) {
    console.error('Portfolio optimization error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to optimize portfolio' },
      { status: 500 }
    )
  }
}