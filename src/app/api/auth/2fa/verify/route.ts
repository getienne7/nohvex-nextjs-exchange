import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import { dbService } from '@/lib/db-service'
import { twoFactorStore } from '../setup/route'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { code, useBackupCode, action } = await req.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      )
    }

    const user = await dbService.findUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const user2FA = twoFactorStore.get(session.user.email)
    if (!user2FA || !user2FA.isEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is not enabled for this user' },
        { status: 400 }
      )
    }

    let verified = false

    if (useBackupCode) {
      // Verify backup code
      const backupCodeIndex = user2FA.backupCodes?.findIndex(
        (backupCode) => backupCode.code === code.toUpperCase() && !backupCode.used
      )

      if (backupCodeIndex !== undefined && backupCodeIndex >= 0 && user2FA.backupCodes) {
        verified = true
        
        // Mark backup code as used
        user2FA.backupCodes[backupCodeIndex].used = true
        user2FA.backupCodes[backupCodeIndex].usedAt = new Date()
        user2FA.lastUsed = new Date()
        
        // Update the store
        twoFactorStore.set(session.user.email, user2FA)
      }
    } else {
      // Verify TOTP code
      verified = speakeasy.totp.verify({
        secret: user2FA.secret!,
        encoding: 'base32',
        token: code,
        window: 2
      })

      if (verified) {
        // Update last used timestamp
        user2FA.lastUsed = new Date()
        twoFactorStore.set(session.user.email, user2FA)
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
