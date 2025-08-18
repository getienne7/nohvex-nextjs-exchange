import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import { checkLimit, clientIpFromHeaders } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'
import { inc } from '@/lib/metrics'
import { dbService } from '@/lib/db-service'

export async function POST(req: NextRequest) {
  // Basic rate limiting per IP/user
  const ip = clientIpFromHeaders(req.headers)
  const rl = checkLimit(`2fa_verify:${ip}`, 10, 60_000)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { code, useBackupCode, action, trustDevice }: { code: string; useBackupCode?: boolean; action?: string; trustDevice?: boolean } = await req.json()

    // Rate limit verification attempts: 5 per 5 minutes per user+ip
    {
      const key = `2fa:verify:${session.user.email}:${ip}:${useBackupCode ? 'backup' : 'totp'}`
      const rl = checkLimit(key, 5, 5 * 60 * 1000)
      if (!rl.allowed) {
        logAudit({ event: '2fa_verify_rate_limited', user: { email: session.user.email }, ip, route: '/api/auth/2fa/verify', method: 'POST', outcome: 'failure', reason: 'rate_limited', meta: { method: useBackupCode ? 'backup' : 'totp', retryAfterMs: rl.retryAfterMs } })
        inc('2fa_verify_attempts_total', { method: useBackupCode ? 'backup' : 'totp', outcome: 'rate_limited' })
        return NextResponse.json({ success: false, error: 'Too many attempts. Please try again later.' }, { status: 429 })
      }
    }

    if (!code) {
      inc('2fa_verify_attempts_total', { method: useBackupCode ? 'backup' : 'totp', outcome: 'missing_code' })
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
      inc('2fa_verify_attempts_total', { method: useBackupCode ? 'backup' : 'totp', outcome: 'failure' })
      logAudit({ event: '2fa_verify', user: { email: session.user.email }, ip, route: '/api/auth/2fa/verify', method: 'POST', outcome: 'failure', reason: useBackupCode ? 'invalid_or_used_backup_code' : 'invalid_totp', meta: { action: action || 'login', method: useBackupCode ? 'backup' : 'totp' } })
      return NextResponse.json(
        { success: false, error: useBackupCode ? 'Invalid or already used backup code' : 'Invalid verification code' },
        { status: 400 }
      )
    }

    inc('2fa_verify_attempts_total', { method: useBackupCode ? 'backup' : 'totp', outcome: 'success', trusted: !!trustDevice })
    // Structured audit for success
    logAudit({ event: '2fa_verify', user: { id: user.id, email: session.user.email }, ip, route: '/api/auth/2fa/verify', method: 'POST', outcome: 'success', meta: { action: action || 'login', method: useBackupCode ? 'backup' : 'totp', trustDevice: !!trustDevice } })

    // Mark this browser as 2FA-verified for a short window (30 minutes)
    const res = NextResponse.json({
      success: true,
      message: 'Verification successful',
      method: useBackupCode ? 'backup_code' : 'totp'
    })
    // Set verification cookie; extend to 30 days if user trusts this device
    const maxAge = trustDevice ? 60 * 60 * 24 * 30 : 60 * 30
    res.cookies.set('nx_twofa_verified', trustDevice ? 'trusted' : '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge
    })
    return res

  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
