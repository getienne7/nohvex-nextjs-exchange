import { NextRequest, NextResponse } from 'next/server'
import { productionAnalytics } from '@/lib/production-analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const severity = searchParams.get('severity')

    // In a real implementation, you would filter alerts based on parameters
    // For now, we'll return mock alert data
    const alerts = [
      {
        id: 'alert-1',
        name: 'High Error Rate',
        description: 'Error rate exceeds 5%',
        metric: 'error_rate',
        condition: 'greater_than',
        threshold: 5,
        timeWindow: 300,
        severity: 'high',
        isActive: true,
        actions: [
          { type: 'email', target: 'admin@nohvex.com' }
        ],
        triggerCount: 3,
        lastTriggered: Date.now() - 3600000 // 1 hour ago
      },
      {
        id: 'alert-2',
        name: 'Low System Uptime',
        description: 'System uptime below 99%',
        metric: 'uptime',
        condition: 'less_than',
        threshold: 99,
        timeWindow: 600,
        severity: 'critical',
        isActive: true,
        actions: [
          { type: 'email', target: 'admin@nohvex.com' },
          { type: 'slack', target: '#alerts' }
        ],
        triggerCount: 0
      }
    ]

    let filteredAlerts = alerts

    if (active !== null) {
      const isActive = active === 'true'
      filteredAlerts = filteredAlerts.filter(alert => alert.isActive === isActive)
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
    }

    return NextResponse.json({
      success: true,
      data: filteredAlerts,
      count: filteredAlerts.length
    })
  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      metric,
      condition,
      threshold,
      timeWindow,
      severity,
      actions
    } = body

    // Validate required fields
    if (!name || !metric || !condition || threshold === undefined || !actions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate condition
    const validConditions = ['greater_than', 'less_than', 'equals', 'not_equals', 'percentage_change']
    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { success: false, error: 'Invalid condition' },
        { status: 400 }
      )
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical']
    if (severity && !validSeverities.includes(severity)) {
      return NextResponse.json(
        { success: false, error: 'Invalid severity level' },
        { status: 400 }
      )
    }

    const alertRule = await productionAnalytics.createAlertRule({
      name,
      description: description || '',
      metric,
      condition,
      threshold,
      timeWindow: timeWindow || 300,
      severity: severity || 'medium',
      isActive: true,
      actions
    })

    return NextResponse.json({
      success: true,
      data: alertRule,
      message: 'Alert rule created successfully'
    })
  } catch (error) {
    console.error('Alert creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create alert rule' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would update the alert rule
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Alert rule updated successfully'
    })
  } catch (error) {
    console.error('Alert update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update alert rule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would delete the alert rule
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Alert rule deleted successfully'
    })
  } catch (error) {
    console.error('Alert deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert rule' },
      { status: 500 }
    )
  }
}