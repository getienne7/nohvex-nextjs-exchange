import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const connectWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  chainId: z.number().int().positive(),
  walletType: z.enum(['METAMASK', 'WALLETCONNECT', 'COINBASE_WALLET', 'TRUST_WALLET', 'OTHER'])
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = connectWalletSchema.parse(body)

    // Check if wallet is already connected
    const existingConnection = await prisma.walletConnection.findUnique({
      where: {
        userId_address_chainId: {
          userId: session.user.id,
          address: validatedData.address.toLowerCase(),
          chainId: validatedData.chainId
        }
      }
    })

    if (existingConnection) {
      // Reactivate if it was deactivated
      const updatedConnection = await prisma.walletConnection.update({
        where: { id: existingConnection.id },
        data: { 
          isActive: true,
          walletType: validatedData.walletType,
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        wallet: updatedConnection,
        message: 'Wallet reconnected successfully'
      })
    }

    // Create new wallet connection
    const walletConnection = await prisma.walletConnection.create({
      data: {
        userId: session.user.id,
        address: validatedData.address.toLowerCase(),
        chainId: validatedData.chainId,
        walletType: validatedData.walletType
      }
    })

    return NextResponse.json({
      success: true,
      wallet: walletConnection,
      message: 'Wallet connected successfully'
    })

  } catch (error) {
    console.error('Wallet connection error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to connect wallet' },
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

    const walletConnections = await prisma.walletConnection.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        assets: {
          orderBy: { usdValue: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      wallets: walletConnections
    })

  } catch (error) {
    console.error('Get wallets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallets' },
      { status: 500 }
    )
  }
}