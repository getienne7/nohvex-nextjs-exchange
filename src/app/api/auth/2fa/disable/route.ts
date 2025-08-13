import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { twoFactorStore } from '../setup/route'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if 2FA is currently enabled in memory store
    const user2FA = twoFactorStore.get(session.user.email)
    if (!user2FA || !user2FA.isEnabled) {
      return NextResponse.json(
        { success: false, error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      )
    }

    // Disable 2FA by removing from memory store
    twoFactorStore.delete(session.user.email)

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication has been disabled'
    })

  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disable two-factor authentication' },
      { status: 500 }
    )
  }
}
