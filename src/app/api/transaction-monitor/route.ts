import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { transactionMonitor, MonitoringConfig, AlertType } from '@/lib/transaction-monitor'
import { z } from 'zod'

const startMonitoringSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  chainIds: z.array(z.number().int().positive()).min(1).max(10),
  alertThresholds: z.object({
    largeTransactionUSD: z.number().min(1).max(1000000).default(100),
    portfolioPercentage: z.number().min(0.1).max(100).default(10),
    gasThresholdUSD: z.number().min(1).max(1000).default(50)
  }).default({
    largeTransactionUSD: 100,
    portfolioPercentage: 10,
    gasThresholdUSD: 50
  }),
  enabledAlerts: z.array(z.nativeEnum(AlertType)).default([
    AlertType.LARGE_TRANSACTION,
    AlertType.DEFI_POSITION_CHANGE,
    AlertType.UNUSUAL_GAS
  ]),
  notificationMethods: z.array(z.enum(['browser', 'email', 'webhook'])).default(['browser'])
})

const getHistorySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0)
})

// Start monitoring a wallet
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = startMonitoringSchema.parse(body)

    const config: MonitoringConfig = {
      walletAddress: validatedData.walletAddress,
      chainIds: validatedData.chainIds,
      alertThresholds: validatedData.alertThresholds,
      enabledAlerts: validatedData.enabledAlerts,
      notificationMethods: validatedData.notificationMethods
    }

    // Start monitoring
    await transactionMonitor.startMonitoring(config)

    return NextResponse.json({
      success: true,
      message: 'Transaction monitoring started',
      config: {
        walletAddress: config.walletAddress,
        chainIds: config.chainIds,
        alertThresholds: config.alertThresholds,
        enabledAlerts: config.enabledAlerts.length,
        notificationMethods: config.notificationMethods
      }
    })

  } catch (error) {
    console.error('Start monitoring error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to start monitoring' },
      { status: 500 }
    )
  }
}

// Get transaction history and alerts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'history') {
      const queryParams = {
        walletAddress: searchParams.get('walletAddress') || '',
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
      }

      const validatedParams = getHistorySchema.parse(queryParams)

      const transactions = transactionMonitor.getStoredTransactionHistory(validatedParams.walletAddress)
      const paginatedTransactions = transactions.slice(
        validatedParams.offset,
        validatedParams.offset + validatedParams.limit
      )

      return NextResponse.json({
        success: true,
        transactions: paginatedTransactions,
        total: transactions.length,
        pagination: {
          limit: validatedParams.limit,
          offset: validatedParams.offset,
          hasMore: validatedParams.offset + validatedParams.limit < transactions.length
        }
      })
    }

    if (action === 'alerts') {
      const walletAddress = searchParams.get('walletAddress')
      const alerts = transactionMonitor.getAlertHistory(walletAddress || undefined)

      return NextResponse.json({
        success: true,
        alerts,
        total: alerts.length,
        unacknowledged: alerts.filter(alert => !alert.acknowledged).length
      })
    }

    if (action === 'status') {
      const walletAddress = searchParams.get('walletAddress')
      if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
      }

      const isMonitoring = transactionMonitor.getMonitoringStatus(walletAddress)

      return NextResponse.json({
        success: true,
        isMonitoring,
        walletAddress
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Get monitoring data error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get monitoring data' },
      { status: 500 }
    )
  }
}

// Stop monitoring or acknowledge alerts
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const walletAddress = searchParams.get('walletAddress')
    const alertId = searchParams.get('alertId')

    if (action === 'stop' && walletAddress) {
      transactionMonitor.stopMonitoring(walletAddress)
      
      return NextResponse.json({
        success: true,
        message: 'Transaction monitoring stopped',
        walletAddress
      })
    }

    if (action === 'acknowledge' && alertId) {
      transactionMonitor.acknowledgeAlert(alertId)
      
      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged',
        alertId
      })
    }

    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 })

  } catch (error) {
    console.error('Delete monitoring action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}