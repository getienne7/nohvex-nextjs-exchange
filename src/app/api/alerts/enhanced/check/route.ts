import { NextResponse } from 'next/server'
import { enhancedPriceAlertsService } from '@/lib/enhanced-price-alerts-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Require auth to avoid public hammering
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await enhancedPriceAlertsService.checkAndTriggerAlerts()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Enhanced alerts check error:', error)
    return NextResponse.json({ error: 'Failed to check alerts' }, { status: 500 })
  }
}