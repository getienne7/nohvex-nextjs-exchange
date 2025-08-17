import { NextResponse } from 'next/server'
import { checkAndTriggerAlerts } from '@/lib/alerts-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  // Require auth to avoid public hammering
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await checkAndTriggerAlerts()
  return NextResponse.json(result)
}
