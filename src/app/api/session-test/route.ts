import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      user: session?.user || null,
      sessionData: session || null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Session test error:', error)
    
    return NextResponse.json(
      {
        error: 'Session test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}