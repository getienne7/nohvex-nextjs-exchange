import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

// GET /api/notifications/test-alert
// Optional query params: to, symbol, op (GT|LT), threshold, price
export async function GET(request: Request) {
  const url = new URL(request.url)
  const to = url.searchParams.get('to') ?? 'getienne@nohvech.com'
  const symbol = (url.searchParams.get('symbol') ?? 'BTC').toUpperCase()
  const operator = (url.searchParams.get('op') === 'LT' ? 'LT' : 'GT') as 'GT' | 'LT'
  const threshold = Number(url.searchParams.get('threshold') ?? 50000)
  const price = Number(url.searchParams.get('price') ?? 50050.12)

  try {
    const sent = await emailService.sendAlertTriggered(to, symbol, operator, threshold, price)
    return NextResponse.json({ ok: sent, to, symbol, operator, threshold, price })
  } catch (e) {
    console.error('Failed to send test alert email:', e)
    return NextResponse.json({ ok: false, error: 'Failed to send test alert email' }, { status: 500 })
  }
}

