import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const portfolio = await prisma.portfolio.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        totalValue: 'desc'
      }
    })

    const totalValue = portfolio.reduce((sum, asset) => sum + asset.totalValue, 0)

    return NextResponse.json({
      portfolio,
      totalValue
    })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { symbol, name, amount, price } = await req.json()

    // Check if user already has this asset
    const existingAsset = await prisma.portfolio.findUnique({
      where: {
        userId_symbol: {
          userId: session.user.id,
          symbol
        }
      }
    })

    if (existingAsset) {
      // Update existing asset
      const newAmount = existingAsset.amount + amount
      const newTotalValue = newAmount * price
      const newAveragePrice = ((existingAsset.averagePrice * existingAsset.amount) + (price * amount)) / newAmount

      const updatedAsset = await prisma.portfolio.update({
        where: {
          id: existingAsset.id
        },
        data: {
          amount: newAmount,
          averagePrice: newAveragePrice,
          totalValue: newTotalValue
        }
      })

      return NextResponse.json(updatedAsset)
    } else {
      // Create new asset
      const newAsset = await prisma.portfolio.create({
        data: {
          userId: session.user.id,
          symbol,
          name,
          amount,
          averagePrice: price,
          totalValue: amount * price
        }
      })

      return NextResponse.json(newAsset)
    }
  } catch (error) {
    console.error('Portfolio update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
