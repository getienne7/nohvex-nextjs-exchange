import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { enhancedPriceAlertsService } from '@/lib/enhanced-price-alerts-service'
import { AlertType, AlertOperator, AlertStatus, AlertFrequency } from '@/types/price-alerts'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'templates':
        const templates = enhancedPriceAlertsService.getAlertTemplates()
        return NextResponse.json({ templates })

      case 'stats':
        const stats = await enhancedPriceAlertsService.getAlertStats(session.user.id)
        return NextResponse.json({ stats })

      case 'preferences':
        const preferences = await enhancedPriceAlertsService.getUserPreferences(session.user.id)
        return NextResponse.json({ preferences })

      default:
        // Get alerts with filters
        const filters = {
          status: searchParams.get('status') as AlertStatus | undefined,
          symbol: searchParams.get('symbol') || undefined,
          type: searchParams.get('type') as AlertType | undefined,
          priority: searchParams.get('priority') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
        }

        const alerts = await enhancedPriceAlertsService.getAlerts(session.user.id, filters)
        return NextResponse.json({ alerts })
    }
  } catch (error) {
    console.error('Enhanced alerts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create_from_template':
        const { templateId, symbols, customThresholds } = body
        if (!templateId || !symbols?.length) {
          return NextResponse.json({ error: 'Template ID and symbols required' }, { status: 400 })
        }

        const templateAlerts = await enhancedPriceAlertsService.createAlertsFromTemplate(
          session.user.id,
          templateId,
          symbols,
          customThresholds
        )
        return NextResponse.json({ success: true, alerts: templateAlerts })

      case 'bulk_update':
        const { alertIds, updates } = body
        if (!alertIds?.length || !updates) {
          return NextResponse.json({ error: 'Alert IDs and updates required' }, { status: 400 })
        }

        const updatedAlerts = await enhancedPriceAlertsService.bulkUpdateAlerts(
          session.user.id,
          alertIds,
          updates
        )
        return NextResponse.json({ success: true, alerts: updatedAlerts })

      case 'bulk_delete':
        const { alertIds: deleteIds } = body
        if (!deleteIds?.length) {
          return NextResponse.json({ error: 'Alert IDs required' }, { status: 400 })
        }

        const deleteResult = await enhancedPriceAlertsService.bulkDeleteAlerts(
          session.user.id,
          deleteIds
        )
        return NextResponse.json({ success: true, result: deleteResult })

      case 'update_preferences':
        const { preferences } = body
        if (!preferences) {
          return NextResponse.json({ error: 'Preferences required' }, { status: 400 })
        }

        const updatedPreferences = await enhancedPriceAlertsService.updateUserPreferences(
          session.user.id,
          preferences
        )
        return NextResponse.json({ success: true, preferences: updatedPreferences })

      default:
        // Create single alert
        const { 
          name,
          description,
          symbol, 
          type = 'price_threshold',
          operator, 
          threshold, 
          frequency = 'once',
          cooldownMinutes = 10,
          maxTriggers,
          notificationMethods = ['browser'],
          emailEnabled = true,
          browserEnabled = true,
          smsEnabled = false,
          soundEnabled = true,
          priority = 'medium',
          tags,
          notes,
          expiresAt
        } = body

        if (!symbol || !operator || typeof threshold !== 'number') {
          return NextResponse.json({ 
            error: 'Symbol, operator, and threshold are required' 
          }, { status: 400 })
        }

        const alert = await enhancedPriceAlertsService.createAlert(session.user.id, {
          name,
          description,
          symbol,
          type,
          operator,
          threshold,
          frequency,
          cooldownMinutes,
          maxTriggers,
          notificationMethods,
          emailEnabled,
          browserEnabled,
          smsEnabled,
          soundEnabled,
          priority,
          tags,
          notes,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        })

        return NextResponse.json({ success: true, alert })
    }
  } catch (error) {
    console.error('Enhanced alerts POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { alertId, ...updates } = body

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    const alert = await enhancedPriceAlertsService.updateAlert(
      session.user.id,
      alertId,
      updates
    )

    return NextResponse.json({ success: true, alert })
  } catch (error) {
    console.error('Enhanced alerts PUT error:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    await enhancedPriceAlertsService.deleteAlert(session.user.id, alertId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Enhanced alerts DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}