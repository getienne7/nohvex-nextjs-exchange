import { NextResponse } from 'next/server'
import { getCountersSnapshot } from '@/lib/metrics'

export async function GET() {
  try {
    const snapshot = getCountersSnapshot()
    return NextResponse.json({ success: true, metrics: snapshot })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
