import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import { dbService } from '@/lib/db-service'
import { checkLimit, clientIpFromHeaders } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'
import { inc } from '@/lib/metrics'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const ip = clientIpFromHeaders(new Headers(req.headers))

    // Rate limit fetching backup codes (10 per 5 minutes per user)
    {
      const rl = checkLimit(`2fa:backup_codes:get:${session.user.email}`, 10, 5 * 60 * 1000)
      if (!rl.allowed) {
        logAudit({ event: '2fa_backup_codes_get_rate_limited', user: { email: session.user.email }, ip, route: '/api/auth/2fa/backup-codes', method: 'GET', outcome: 'failure', reason: 'rate_limited', meta: { retryAfterMs: rl.retryAfterMs } })
        inc('2fa_backup_codes_requests_total', { route: 'get', outcome: 'rate_limited' })
        return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
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

    logAudit({ event: '2fa_backup_codes_list', user: { id: user.id, email: session.user.email }, ip, route: '/api/auth/2fa/backup-codes', method: 'GET', outcome: 'success', meta: { returned: unusedCodes.length } })
    inc('2fa_backup_codes_requests_total', { route: 'get', outcome: 'success' })

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
    const ip = clientIpFromHeaders(new Headers(req.headers))
    
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

    // Rate limit regeneration (5 per hour per user)
    {
      const rl = checkLimit(`2fa:backup_codes:regen:${session.user.email}`, 5, 60 * 60 * 1000)
      if (!rl.allowed) {
        logAudit({ event: '2fa_backup_codes_regen_rate_limited', user: { email: session.user.email }, ip, route: '/api/auth/2fa/backup-codes', method: 'POST', outcome: 'failure', reason: 'rate_limited', meta: { retryAfterMs: rl.retryAfterMs } })
        inc('2fa_backup_codes_requests_total', { route: 'regen', outcome: 'rate_limited' })
        return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
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
      inc('2fa_backup_codes_requests_total', { route: 'regen', outcome: 'invalid_code' })
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

    logAudit({ event: '2fa_backup_codes_regenerated', user: { id: user.id, email: session.user.email }, ip, route: '/api/auth/2fa/backup-codes', method: 'POST', outcome: 'success', meta: { count: newBackupCodes.length } })
    inc('2fa_backup_codes_requests_total', { route: 'regen', outcome: 'success' })

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
