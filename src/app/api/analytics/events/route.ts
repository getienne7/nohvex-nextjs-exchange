import { NextRequest, NextResponse } from 'next/server'
import { productionAnalytics } from '@/lib/production-analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('eventType')
    const userId = searchParams.get('userId')
    const timeframe = searchParams.get('timeframe')
    const limit = searchParams.get('limit')

    const filters = {
      ...(eventType && { eventType }),
      ...(userId && { userId }),
      ...(timeframe && { timeframe }),
      ...(limit && { limit: parseInt(limit) })
    }

    const events = await productionAnalytics.getEvents(filters)

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length
    })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both single event and batch events
    const events = Array.isArray(body) ? body : [body]
    
    for (const eventData of events) {
      const { eventType, userId, sessionId, properties, context } = eventData

      if (!eventType || !sessionId) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: eventType, sessionId' },
          { status: 400 }
        )
      }

      await productionAnalytics.trackEvent({
        eventType,
        userId,
        sessionId,
        properties: properties || {},
        context: {
          userAgent: request.headers.get('user-agent') || 'unknown',
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          device: 'web',
          browser: getBrowserFromUserAgent(request.headers.get('user-agent') || ''),
          ...context
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Tracked ${events.length} event(s)` 
    })
  } catch (error) {
    console.error('Event tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track events' },
      { status: 500 }
    )
  }
}

function getBrowserFromUserAgent(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Unknown'
}