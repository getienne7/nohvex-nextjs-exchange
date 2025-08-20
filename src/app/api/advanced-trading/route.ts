import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  advancedTradingEngine, 
  OrderType, 
  OrderSide, 
  TimeInForce,
  AlgorithmType,
  AdvancedOrder,
  TradingAlgorithm,
  ConditionType
} from '@/lib/advanced-trading'
import { z } from 'zod'

const createOrderSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  pair: z.object({
    id: z.string(),
    baseAsset: z.string(),
    quoteAsset: z.string(),
    symbol: z.string(),
    chainId: z.number(),
    decimals: z.object({
      base: z.number(),
      quote: z.number()
    }),
    minOrderSize: z.number(),
    maxOrderSize: z.number(),
    tickSize: z.number(),
    fees: z.object({
      maker: z.number(),
      taker: z.number()
    }),
    isActive: z.boolean()
  }),
  type: z.nativeEnum(OrderType),
  side: z.nativeEnum(OrderSide),
  quantity: z.string(),
  price: z.string().optional(),
  stopPrice: z.string().optional(),
  limitPrice: z.string().optional(),
  trailingAmount: z.string().optional(),
  trailingPercent: z.number().optional(),
  timeInForce: z.nativeEnum(TimeInForce).default(TimeInForce.GTC),
  conditions: z.array(z.object({
    type: z.nativeEnum(ConditionType),
    asset: z.string(),
    operator: z.enum(['gt', 'lt', 'gte', 'lte', 'eq']),
    value: z.string(),
    timeframe: z.string().optional()
  })).default([]),
  riskParameters: z.object({
    maxPositionSize: z.string(),
    maxDailyLoss: z.string(),
    stopLossPercent: z.number().optional(),
    takeProfitPercent: z.number().optional(),
    maxSlippage: z.number()
  }).optional()
})

const createAlgorithmSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  type: z.nativeEnum(AlgorithmType),
  parameters: z.object({
    // DCA parameters
    interval: z.number().optional(),
    amount: z.string().optional(),
    maxOrders: z.number().optional(),
    priceDeviation: z.number().optional(),
    
    // Grid parameters
    gridLevels: z.number().optional(),
    gridSpacing: z.number().optional(),
    basePrice: z.string().optional(),
    
    // TWAP parameters
    duration: z.number().optional(),
    slices: z.number().optional(),
    
    // Momentum parameters
    lookbackPeriod: z.number().optional(),
    momentumThreshold: z.number().optional(),
    
    // Mean reversion parameters
    bollinger: z.object({
      period: z.number(),
      stdDev: z.number()
    }).optional(),
    rsi: z.object({
      period: z.number(),
      oversold: z.number(),
      overbought: z.number()
    }).optional()
  })
})

// Create advanced order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action

    if (action === 'create-order') {
      const validatedData = createOrderSchema.parse(body)

      const order = await advancedTradingEngine.createAdvancedOrder({
        userId: session.user.id,
        walletAddress: validatedData.walletAddress,
        pair: validatedData.pair,
        type: validatedData.type,
        side: validatedData.side,
        quantity: validatedData.quantity,
        price: validatedData.price,
        stopPrice: validatedData.stopPrice,
        limitPrice: validatedData.limitPrice,
        trailingAmount: validatedData.trailingAmount,
        trailingPercent: validatedData.trailingPercent,
        timeInForce: validatedData.timeInForce,
        conditions: validatedData.conditions,
        metadata: {
          source: 'manual',
          riskParameters: validatedData.riskParameters
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Advanced order created successfully',
        order
      })
    }

    if (action === 'create-algorithm') {
      const validatedData = createAlgorithmSchema.parse(body)

      const algorithm = await advancedTradingEngine.createTradingAlgorithm(
        session.user.id,
        validatedData.walletAddress,
        validatedData.type,
        validatedData.parameters
      )

      return NextResponse.json({
        success: true,
        message: 'Trading algorithm created successfully',
        algorithm
      })
    }

    if (action === 'cancel-order') {
      const { orderId } = z.object({
        orderId: z.string()
      }).parse(body)

      const success = await advancedTradingEngine.cancelOrder(orderId)

      return NextResponse.json({
        success,
        message: success ? 'Order cancelled successfully' : 'Failed to cancel order'
      })
    }

    if (action === 'pause-algorithm') {
      const { algorithmId } = z.object({
        algorithmId: z.string()
      }).parse(body)

      const success = await advancedTradingEngine.pauseAlgorithm(algorithmId)

      return NextResponse.json({
        success,
        message: success ? 'Algorithm paused successfully' : 'Failed to pause algorithm'
      })
    }

    if (action === 'resume-algorithm') {
      const { algorithmId } = z.object({
        algorithmId: z.string()
      }).parse(body)

      const success = await advancedTradingEngine.resumeAlgorithm(algorithmId)

      return NextResponse.json({
        success,
        message: success ? 'Algorithm resumed successfully' : 'Failed to resume algorithm'
      })
    }

    if (action === 'stop-algorithm') {
      const { algorithmId } = z.object({
        algorithmId: z.string()
      }).parse(body)

      const success = await advancedTradingEngine.stopAlgorithm(algorithmId)

      return NextResponse.json({
        success,
        message: success ? 'Algorithm stopped successfully' : 'Failed to stop algorithm'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Advanced trading API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get trading data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'orders') {
      const status = searchParams.get('status')
      
      let orders = advancedTradingEngine.getUserOrders(session.user.id)
      
      if (status === 'active') {
        orders = advancedTradingEngine.getActiveOrders(session.user.id)
      } else if (status) {
        orders = orders.filter(order => order.status === status)
      }

      return NextResponse.json({
        success: true,
        orders,
        total: orders.length
      })
    }

    if (action === 'order') {
      const orderId = searchParams.get('orderId')
      if (!orderId) {
        return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
      }

      const order = advancedTradingEngine.getOrder(orderId)
      if (!order || order.userId !== session.user.id) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        order
      })
    }

    if (action === 'algorithms') {
      const algorithms = advancedTradingEngine.getUserAlgorithms(session.user.id)

      return NextResponse.json({
        success: true,
        algorithms,
        total: algorithms.length
      })
    }

    if (action === 'algorithm') {
      const algorithmId = searchParams.get('algorithmId')
      if (!algorithmId) {
        return NextResponse.json({ error: 'Algorithm ID required' }, { status: 400 })
      }

      const algorithm = advancedTradingEngine.getAlgorithm(algorithmId)
      if (!algorithm) {
        return NextResponse.json({ error: 'Algorithm not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        algorithm
      })
    }

    if (action === 'market-data') {
      const symbol = searchParams.get('symbol')
      if (!symbol) {
        return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
      }

      const marketData = await advancedTradingEngine.getMarketData(symbol)

      return NextResponse.json({
        success: true,
        marketData
      })
    }

    if (action === 'signals') {
      const symbol = searchParams.get('symbol')
      if (!symbol) {
        return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
      }

      const signals = await advancedTradingEngine.generateTradingSignals(symbol)

      return NextResponse.json({
        success: true,
        signals,
        total: signals.length
      })
    }

    if (action === 'positions') {
      const positions = advancedTradingEngine.getPortfolioPositions(session.user.id)

      return NextResponse.json({
        success: true,
        positions,
        total: positions.length
      })
    }

    if (action === 'trading-pairs') {
      // Mock trading pairs data
      const tradingPairs = [
        {
          id: 'eth_usdt',
          baseAsset: 'ETH',
          quoteAsset: 'USDT',
          symbol: 'ETH/USDT',
          chainId: 1,
          decimals: { base: 18, quote: 6 },
          minOrderSize: 0.001,
          maxOrderSize: 1000,
          tickSize: 0.01,
          fees: { maker: 0.001, taker: 0.0015 },
          isActive: true
        },
        {
          id: 'btc_usdt',
          baseAsset: 'BTC',
          quoteAsset: 'USDT',
          symbol: 'BTC/USDT',
          chainId: 1,
          decimals: { base: 8, quote: 6 },
          minOrderSize: 0.0001,
          maxOrderSize: 100,
          tickSize: 0.01,
          fees: { maker: 0.001, taker: 0.0015 },
          isActive: true
        },
        {
          id: 'bnb_usdt',
          baseAsset: 'BNB',
          quoteAsset: 'USDT',
          symbol: 'BNB/USDT',
          chainId: 56,
          decimals: { base: 18, quote: 6 },
          minOrderSize: 0.01,
          maxOrderSize: 10000,
          tickSize: 0.01,
          fees: { maker: 0.001, taker: 0.0015 },
          isActive: true
        }
      ]

      return NextResponse.json({
        success: true,
        tradingPairs,
        total: tradingPairs.length
      })
    }

    if (action === 'dashboard') {
      const orders = advancedTradingEngine.getUserOrders(session.user.id)
      const activeOrders = advancedTradingEngine.getActiveOrders(session.user.id)
      const algorithms = advancedTradingEngine.getUserAlgorithms(session.user.id)
      const positions = advancedTradingEngine.getPortfolioPositions(session.user.id)

      // Calculate summary statistics
      const totalOrders = orders.length
      const filledOrders = orders.filter(o => o.status === 'filled').length
      const totalVolume = orders.reduce((sum, order) => {
        if (order.status === 'filled' && order.averagePrice) {
          return sum + (parseFloat(order.filled) * parseFloat(order.averagePrice))
        }
        return sum
      }, 0)

      const activeAlgorithms = algorithms.filter(a => a.status === 'active').length
      const totalPnL = positions.reduce((sum, pos) => sum + parseFloat(pos.unrealizedPnl), 0)

      return NextResponse.json({
        success: true,
        dashboard: {
          summary: {
            totalOrders,
            activeOrders: activeOrders.length,
            filledOrders,
            totalVolume: totalVolume.toString(),
            activeAlgorithms,
            totalAlgorithms: algorithms.length,
            totalPositions: positions.length,
            totalPnL: totalPnL.toString(),
            winRate: filledOrders > 0 ? (filledOrders / totalOrders * 100) : 0
          },
          recentOrders: orders.slice(-10),
          activeAlgorithms: algorithms.filter(a => a.status === 'active').slice(0, 5),
          topPositions: positions.slice(0, 5)
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Advanced trading GET error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}