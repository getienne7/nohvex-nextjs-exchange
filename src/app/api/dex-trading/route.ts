/**
 * DEX Trading API
 * Handles real DEX trading operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { DEXAggregator } from '@/lib/dex/aggregator'
import { TradeParams, Token } from '@/lib/dex/index'

const aggregator = new DEXAggregator()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'getQuote':
        return await handleGetQuote(params)
      case 'findBestRoute':
        return await handleFindBestRoute(params)
      case 'executeTrade':
        return await handleExecuteTrade(params)
      case 'getSupportedTokens':
        return await handleGetSupportedTokens(params)
      case 'getTokenPrice':
        return await handleGetTokenPrice(params)
      case 'estimateGas':
        return await handleEstimateGas(params)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('DEX Trading API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function handleGetQuote(params: any) {
  const { tokenIn, tokenOut, amountIn, slippageTolerance = 100 } = params

  if (!tokenIn || !tokenOut || !amountIn) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  const tradeParams: TradeParams = {
    tokenIn: tokenIn as Token,
    tokenOut: tokenOut as Token,
    amountIn: amountIn.toString(),
    slippageTolerance
  }

  const quotes = await aggregator.getAllQuotes(tradeParams)

  return NextResponse.json({
    success: true,
    data: {
      quotes,
      bestQuote: quotes[0] || null
    }
  })
}

async function handleFindBestRoute(params: any) {
  const { tokenIn, tokenOut, amountIn, slippageTolerance = 100 } = params

  if (!tokenIn || !tokenOut || !amountIn) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  const tradeParams: TradeParams = {
    tokenIn: tokenIn as Token,
    tokenOut: tokenOut as Token,
    amountIn: amountIn.toString(),
    slippageTolerance
  }

  const bestRoute = await aggregator.findBestRoute(tradeParams)

  return NextResponse.json({
    success: true,
    data: bestRoute
  })
}

async function handleExecuteTrade(params: any) {
  const { tokenIn, tokenOut, amountIn, slippageTolerance = 100, privateKey, walletAddress } = params

  if (!tokenIn || !tokenOut || !amountIn || (!privateKey && !walletAddress)) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  // Security note: In production, you should never send private keys to the server
  // This should be handled client-side with wallet connections
  if (!privateKey) {
    return NextResponse.json(
      { success: false, error: 'Trade execution requires client-side wallet connection' },
      { status: 400 }
    )
  }

  const tradeParams: TradeParams = {
    tokenIn: tokenIn as Token,
    tokenOut: tokenOut as Token,
    amountIn: amountIn.toString(),
    slippageTolerance,
    recipient: walletAddress
  }

  // Create signer from private key (for demo purposes only)
  const provider = new ethers.JsonRpcProvider(
    tokenIn.chainId === 1 ? 'https://eth.nownodes.io' :
    tokenIn.chainId === 56 ? 'https://bsc.nownodes.io' :
    'https://polygon.nownodes.io'
  )
  const signer = new ethers.Wallet(privateKey, provider)

  const result = await aggregator.executeBestTrade(tradeParams, signer)

  return NextResponse.json({
    success: true,
    data: result
  })
}

async function handleGetSupportedTokens(params: any) {
  const { chainId } = params

  if (!chainId) {
    return NextResponse.json(
      { success: false, error: 'Chain ID is required' },
      { status: 400 }
    )
  }

  const tokens = aggregator.getSupportedTokens(chainId)

  return NextResponse.json({
    success: true,
    data: { tokens }
  })
}

async function handleGetTokenPrice(params: any) {
  const { tokenA, tokenB } = params

  if (!tokenA || !tokenB) {
    return NextResponse.json(
      { success: false, error: 'Both tokens are required' },
      { status: 400 }
    )
  }

  const price = await aggregator.getTokenPrice(tokenA as Token, tokenB as Token)

  return NextResponse.json({
    success: true,
    data: { price }
  })
}

async function handleEstimateGas(params: any) {
  const { tokenIn, tokenOut, amountIn, slippageTolerance = 100 } = params

  if (!tokenIn || !tokenOut || !amountIn) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  const tradeParams: TradeParams = {
    tokenIn: tokenIn as Token,
    tokenOut: tokenOut as Token,
    amountIn: amountIn.toString(),
    slippageTolerance
  }

  const gasCosts = await aggregator.estimateGasCosts(tradeParams)

  return NextResponse.json({
    success: true,
    data: { gasCosts }
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'health') {
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supportedChains: [1, 56, 137],
        supportedDEXs: ['Uniswap V3', 'PancakeSwap V3']
      }
    })
  }

  return NextResponse.json(
    { success: false, error: 'Invalid action' },
    { status: 400 }
  )
}