import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAlert, listAlerts } from '@/lib/alerts-service'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const alerts = await listAlerts(session.user.id)
  return NextResponse.json({ alerts })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { symbol, operator, threshold, cooldownMinutes } = body
    if (!symbol || !operator || typeof threshold !== 'number') {
      return NextResponse.json({ error: 'symbol, operator, threshold required' }, { status: 400 })
    }
    const alert = await createAlert(session.user.id, {
      symbol,
      operator,
      threshold,
      cooldownMinutes,
    })
    return NextResponse.json({ success: true, alert })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}
