import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import { dbService } from '@/lib/db-service'

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await dbService.findUserByEmail(session.user.email)
    const enabled = !!(user && user.twoFAEnabled && user.twoFASecret)

    return NextResponse.json({ success: true, enabled })

  } catch (error) {
    console.error('2FA status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { verificationCode, password } = await req.json()

    if (!verificationCode || !password) {
      return NextResponse.json(
        { success: false, error: 'Verification code and password are required' },
        { status: 400 }
      )
    }

    const user = await dbService.findUserByEmail(session.user.email)
    if (!user || !user.twoFAEnabled || !user.twoFASecret) {
      return NextResponse.json(
        { success: false, error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret!,
      encoding: 'base32',
      token: verificationCode,
      window: 2
    })

    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Disable 2FA in DB
    await dbService.set2FA(user.id, { enabled: false, secret: null, backupCodes: [] })

    return NextResponse.json({
      success: true,
      message: '2FA has been successfully disabled'
    })

  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
