import { NextRequest, NextResponse } from 'next/server'
import { productionAnalytics } from '@/lib/production-analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    switch (action) {
      case 'realtime':
        const realTimeMetrics = await productionAnalytics.getRealTimeMetrics()
        return NextResponse.json(realTimeMetrics)
      
      case 'export':
        const format = searchParams.get('format') as 'json' | 'csv' || 'json'
        const timeRange = {
          start: parseInt(searchParams.get('start') || '0'),
          end: parseInt(searchParams.get('end') || Date.now().toString())
        }
        const category = searchParams.getAll('category')
        
        const exportData = await productionAnalytics.exportData(format, {
          timeRange,
          category: category.length > 0 ? category : undefined
        })
        
        return new Response(exportData, {
          headers: {
            'Content-Type': format === 'json' ? 'application/json' : 'text/csv',
            'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.${format}"`
          }
        })
      
      case 'dashboard':
        const dashboardId = searchParams.get('dashboardId')
        if (dashboardId) {
          const dashboardData = await productionAnalytics.getDashboardData(dashboardId)
          return NextResponse.json(dashboardData)
        }
        break
      
      default:
        const start = parseInt(searchParams.get('start') || (Date.now() - 3600000).toString())
        const end = parseInt(searchParams.get('end') || Date.now().toString())
        const categories = searchParams.getAll('category')
        const userId = searchParams.get('userId')
        const limit = parseInt(searchParams.get('limit') || '1000')
        
        const analytics = await productionAnalytics.getAnalytics({
          timeRange: { start, end },
          category: categories.length > 0 ? categories : undefined,
          userId: userId || undefined,
          limit
        })
        
        return NextResponse.json(analytics)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()
    
    switch (action) {
      case 'track':
        productionAnalytics.track(body)
        return NextResponse.json({ success: true })
      
      case 'track-behavior':
        productionAnalytics.trackUserBehavior(body)
        return NextResponse.json({ success: true })
      
      case 'create-dashboard':
        const dashboard = await productionAnalytics.createDashboard(body)
        return NextResponse.json(dashboard)
      
      case 'create-alert':
        const alert = await productionAnalytics.createAlert(body)
        return NextResponse.json(alert)
      
      case 'start-collection':
        const interval = body.intervalMs || 60000
        productionAnalytics.startCollection(interval)
        return NextResponse.json({ success: true, collecting: true })
      
      case 'stop-collection':
        productionAnalytics.stopCollection()
        return NextResponse.json({ success: true, collecting: false })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to process analytics request' },
      { status: 500 }
    )
  }
}