import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db-service'
import { checkLimit, clientIpFromHeaders } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'
import { inc } from '@/lib/metrics'

export async function POST() {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    const ip = clientIpFromHeaders(new Headers())
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Rate limit disable attempts (3 per hour per user)
    {
      const rl = checkLimit(`2fa:disable:${session.user.email}`, 3, 60 * 60 * 1000)
      if (!rl.allowed) {
        logAudit({ event: '2fa_disable_rate_limited', user: { email: session.user.email }, ip, route: '/api/auth/2fa/disable', method: 'POST', outcome: 'failure', reason: 'rate_limited', meta: { retryAfterMs: rl.retryAfterMs } })
        inc('2fa_disable_requests_total', { outcome: 'rate_limited' })
        return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
    }

    // Check if 2FA is currently enabled in DB
    const user = await dbService.findUserByEmail(session.user.email)
    if (!user || !user.twoFAEnabled) {
      inc('2fa_disable_requests_total', { outcome: 'not_enabled' })
      return NextResponse.json(
        { success: false, error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      )
    }

    // Disable 2FA in DB
    await dbService.set2FA(user.id, { enabled: false, secret: null, backupCodes: [] })

    const res = NextResponse.json({
      success: true,
      message: 'Two-factor authentication has been disabled'
    })
    logAudit({ event: '2fa_disable', user: { id: user.id, email: session.user.email }, ip, route: '/api/auth/2fa/disable', method: 'POST', outcome: 'success' })
    inc('2fa_disable_requests_total', { outcome: 'success' })
    // Clear 2FA verified cookie
    res.cookies.set('nx_twofa_verified', '', { httpOnly: true, path: '/', maxAge: 0 })
    return res

  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disable two-factor authentication' },
      { status: 500 }
    )
  }
}
