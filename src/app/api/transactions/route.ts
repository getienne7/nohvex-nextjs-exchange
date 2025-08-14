import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db-service'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transactions = await dbService.getTransactions(session.user.id)

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Transactions fetch error:', error)
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

    const { type, symbol, amount, price, fee = 0 } = await req.json()

    // Create transaction using database service
    const transaction = await dbService.createTransaction(
      session.user.id,
      type,
      symbol,
      amount,
      price,
      fee
    )

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
