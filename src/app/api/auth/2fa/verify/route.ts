import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import { dbService } from '@/lib/db-service'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { code, useBackupCode, action }: { code: string; useBackupCode?: boolean; action?: string } = await req.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
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

    let verified = false

    if (useBackupCode) {
      const codes = (user as { twoFABackupCodes?: Array<{ code: string; used: boolean; createdAt: string | Date; usedAt?: string | Date }> }).twoFABackupCodes ?? null
      const found = codes?.find(c => c.code === String(code).toUpperCase() && !c.used)
      if (found) {
        verified = true
        await dbService.markBackupCodeUsed(user.id, found.code)
      }
    } else {
      // Verify TOTP code
      verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: code,
        window: 2
      })

      if (verified) {
        await dbService.set2FA(user.id, { enabled: true, secret: user.twoFASecret, backupCodes: (user as { twoFABackupCodes?: Array<{ code: string; used: boolean; createdAt: Date; usedAt?: Date }> }).twoFABackupCodes, lastUsed: new Date() })
      }
    }

    if (!verified) {
      return NextResponse.json(
        { success: false, error: useBackupCode ? 'Invalid or already used backup code' : 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Security action logged (simplified for demo)
    if (action) {
      console.log(`2FA verification: ${session.user.email} performed ${action} using ${useBackupCode ? 'backup_code' : 'totp'}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      method: useBackupCode ? 'backup_code' : 'totp'
    })

  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
