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
    if (!user || !user.twoFAEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    const codes = (user as { twoFABackupCodes?: Array<{ code: string; used: boolean }> }).twoFABackupCodes ?? null
    const unusedCodes = codes ? codes.filter(c => !c.used).map(c => c.code) : []

    return NextResponse.json({
      success: true,
      codes: unusedCodes,
      total: codes?.length || 0,
      used: (codes?.length || 0) - unusedCodes.length
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

    // Generate new backup codes
    const newBackupCodes: string[] = []
    for (let i = 0; i < 8; i++) {
      newBackupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
    }

    // Update user 2FA data with new backup codes in DB
    await dbService.set2FA(user.id, {
      enabled: true,
      secret: user.twoFASecret!,
      backupCodes: newBackupCodes.map(code => ({ code, used: false, createdAt: new Date() }))
    })

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
