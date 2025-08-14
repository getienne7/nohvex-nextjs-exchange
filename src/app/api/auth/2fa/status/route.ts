import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { twoFactorStore } from '../setup/route'
import speakeasy from 'speakeasy'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user2FA = twoFactorStore.get(session.user.email)

    // Quick-unblock: if memory store lost, report disabled so UI doesn't block
    const enabled = !!(user2FA && user2FA.isEnabled && user2FA.secret)

    return NextResponse.json({ success: true, enabled })

  } catch (error) {
    console.error('2FA status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
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

    const user2FA = twoFactorStore.get(session.user.email)
    if (!user2FA || !user2FA.isEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: user2FA.secret!,
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

    // Disable 2FA by removing from store
    twoFactorStore.delete(session.user.email)

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
