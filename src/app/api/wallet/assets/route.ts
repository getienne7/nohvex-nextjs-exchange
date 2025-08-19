import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { assetScanner } from '@/lib/web3/asset-scanner'
import { z } from 'zod'

const scanAssetsSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  chainId: z.number().int().positive(),
  forceRefresh: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { walletAddress, chainId, forceRefresh } = scanAssetsSchema.parse(body)

    // Verify wallet belongs to user
    const walletConnection = await prisma.walletConnection.findUnique({
      where: {
        userId_address_chainId: {
          userId: session.user.id,
          address: walletAddress.toLowerCase(),
          chainId
        }
      }
    })

    if (!walletConnection) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Check if we have recent data (unless force refresh)
    if (!forceRefresh) {
      const recentAssets = await prisma.walletAsset.findMany({
        where: {
          walletId: walletConnection.id,
          lastUpdated: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
          }
        }
      })

      if (recentAssets.length > 0) {
        return NextResponse.json({
          success: true,
          assets: recentAssets,
          cached: true
        })
      }
    }

    // Scan for assets
    const assets = await assetScanner.scanChainAssets(walletAddress, chainId)

    // Update database
    await prisma.walletAsset.deleteMany({
      where: { walletId: walletConnection.id }
    })

    const assetRecords = await Promise.all(
      assets.map(asset =>
        prisma.walletAsset.create({
          data: {
            walletId: walletConnection.id,
            tokenAddress: asset.address,
            symbol: asset.symbol,
            name: asset.name,
            balance: asset.balance,
            decimals: asset.decimals,
            chainId,
            usdValue: asset.usdValue,
            logoUrl: asset.logoUrl
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      assets: assetRecords,
      cached: false
    })

  } catch (error) {
    console.error('Asset scanning error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to scan assets' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const chainId = searchParams.get('chainId')

    if (!walletAddress || !chainId) {
      return NextResponse.json(
        { error: 'walletAddress and chainId are required' },
        { status: 400 }
      )
    }

    // Get wallet connection
    const walletConnection = await prisma.walletConnection.findUnique({
      where: {
        userId_address_chainId: {
          userId: session.user.id,
          address: walletAddress.toLowerCase(),
          chainId: parseInt(chainId)
        }
      },
      include: {
        assets: {
          orderBy: { usdValue: 'desc' }
        }
      }
    })

    if (!walletConnection) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      assets: walletConnection.assets
    })

  } catch (error) {
    console.error('Get assets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}