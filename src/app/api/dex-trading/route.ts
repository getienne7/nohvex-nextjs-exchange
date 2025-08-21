/**
 * DEX Trading API
 * Handles real DEX trading operations with proper validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  handleGetQuote,
  handleFindBestRoute,
  handleExecuteTrade,
  handleGetSupportedTokens,
  handleGetTokenPrice,
  handleEstimateGas
} from '@/lib/dex/api-handlers'
import { 
  parseRequestBody, 
  createErrorResponse, 
  createSuccessResponse,
  handleAPIError 
} from '@/lib/dex/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request)
    const { action, ...params } = body

    if (!action) {
      return createErrorResponse('Missing required parameter: action')
    }

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
        return createErrorResponse(`Invalid action: ${action}. Supported actions: getQuote, findBestRoute, executeTrade, getSupportedTokens, getTokenPrice, estimateGas`)
    }
  } catch (error: any) {
    return handleAPIError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'health') {
      return createSuccessResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supportedChains: [1, 56, 137],
        supportedDEXs: ['Uniswap V3', 'PancakeSwap V3']
      })
    }

    return createErrorResponse('Invalid action. Only "health" is supported for GET requests')
  } catch (error: any) {
    return handleAPIError(error)
  }
}