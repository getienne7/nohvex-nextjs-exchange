import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db-service'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const portfolio = await dbService.getPortfolio(session.user.id)

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

    // Add to portfolio using database service
    const portfolioItem = await dbService.addToPortfolio(
      session.user.id,
      symbol,
      name,
      amount,
      price
    )

    return NextResponse.json(portfolioItem)
  } catch (error) {
    console.error('Portfolio update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
