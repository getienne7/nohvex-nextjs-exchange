import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db-service'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Debug session:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'No session or user ID',
        session: session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id
      })
    }

    // Try to get portfolio
    let portfolio = null
    let portfolioError = null
    
    try {
      portfolio = await dbService.getPortfolio(session.user.id)
    } catch (error) {
      portfolioError = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      session: {
        user: session.user,
        expires: session.expires
      },
      userId: session.user.id,
      portfolio: portfolio,
      portfolioError: portfolioError,
      portfolioCount: portfolio ? portfolio.length : 0
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}