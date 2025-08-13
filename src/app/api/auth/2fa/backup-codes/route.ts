import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import { twoFactorStore } from '../setup/route'

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
    if (!user2FA || !user2FA.isEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    const unusedCodes = user2FA.backupCodes 
      ? user2FA.backupCodes.filter(code => !code.used).map(code => code.code)
      : []

    return NextResponse.json({
      success: true,
      codes: unusedCodes,
      total: user2FA.backupCodes?.length || 0,
      used: (user2FA.backupCodes?.length || 0) - unusedCodes.length
    })

  } catch (error) {
    console.error('Backup codes fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { verificationCode } = await req.json()

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required to regenerate backup codes' },
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

    // Generate new backup codes
    const newBackupCodes: string[] = []
    for (let i = 0; i < 8; i++) {
      newBackupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
    }

    // Update user 2FA data with new backup codes
    user2FA.backupCodes = newBackupCodes.map(code => ({
      code,
      used: false,
      createdAt: new Date()
    }))
    
    twoFactorStore.set(session.user.email, user2FA)

    // Security action logged (simplified for demo)
    console.log(`Backup codes regenerated for: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      codes: newBackupCodes,
      message: 'New backup codes have been generated. Please save them securely.'
    })

  } catch (error) {
    console.error('Backup codes regeneration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
