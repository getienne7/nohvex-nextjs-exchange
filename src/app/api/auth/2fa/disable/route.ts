import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db-service'

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if 2FA is currently enabled in DB
    const user = await dbService.findUserByEmail(session.user.email)
    if (!user || !user.twoFAEnabled) {
      return NextResponse.json(
        { success: false, error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      )
    }

    // Disable 2FA in DB
    await dbService.set2FA(user.id, { enabled: false, secret: null, backupCodes: [] })

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
