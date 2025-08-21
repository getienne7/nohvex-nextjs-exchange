/**
 * DEX Trading API Handlers
 * Individual handlers for each API action with proper typing and validation
 */

import { NextResponse } from 'next/server'
import { DEXAggregator } from './aggregator'
import { TradeParams, Token } from './index'
import {
  GetQuoteRequest,
  FindBestRouteRequest,
  ExecuteTradeRequest,
  GetSupportedTokensRequest,
  GetTokenPriceRequest,
  EstimateGasRequest,
  validateTradeParams,
  validateExecuteTradeParams,
  validateTokenPriceParams,
  validateChainId,
  APIResponse
} from './api-types'
import {
  createSuccessResponse,
  createValidationErrorResponse,
  handleAPIError
} from './api-utils'

const aggregator = new DEXAggregator()

export async function handleGetQuote(params: any): Promise<NextResponse<APIResponse>> {
  try {
    const validation = validateTradeParams(params)
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!)
    }

    const { tokenIn, tokenOut, amountIn, slippageTolerance = 100 } = params as GetQuoteRequest

    const tradeParams: TradeParams = {
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      slippageTolerance
    }

    const quotes = await aggregator.getAllQuotes(tradeParams)

    return createSuccessResponse({
      quotes,
      bestQuote: quotes[0] || null
    })
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function handleFindBestRoute(params: any): Promise<NextResponse<APIResponse>> {
  try {
    const validation = validateTradeParams(params)
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!)
    }

    const { tokenIn, tokenOut, amountIn, slippageTolerance = 100 } = params as FindBestRouteRequest

    const tradeParams: TradeParams = {
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      slippageTolerance
    }

    const bestRoute = await aggregator.findBestRoute(tradeParams)

    return createSuccessResponse(bestRoute)
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function handleExecuteTrade(params: any): Promise<NextResponse<APIResponse>> {
  try {
    const validation = validateExecuteTradeParams(params)
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!)
    }

    const { 
      tokenIn, 
      tokenOut, 
      amountIn, 
      slippageTolerance = 100, 
      privateKey, 
      walletAddress 
    } = params as ExecuteTradeRequest

    // Security warning: In production, private keys should never be sent to the server
    // This should be handled client-side with wallet connections like MetaMask
    if (!privateKey) {
      return createValidationErrorResponse('Trade execution requires client-side wallet connection. Private keys should not be sent to the server.')
    }

    const tradeParams: TradeParams = {
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      slippageTolerance,
      recipient: walletAddress
    }

    // Create signer from private key (for demo purposes only)
    const { ethers } = await import('ethers')
    const provider = new ethers.JsonRpcProvider(
      tokenIn.chainId === 1 ? 'https://eth.nownodes.io' :
      tokenIn.chainId === 56 ? 'https://bsc.nownodes.io' :
      'https://polygon.nownodes.io'
    )
    const signer = new ethers.Wallet(privateKey, provider)

    const result = await aggregator.executeBestTrade(tradeParams, signer)

    return createSuccessResponse(result)
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function handleGetSupportedTokens(params: any): Promise<NextResponse<APIResponse>> {
  try {
    const validation = validateChainId(params)
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!)
    }

    const { chainId } = params as GetSupportedTokensRequest

    const tokens = aggregator.getSupportedTokens(chainId)

    return createSuccessResponse({ tokens })
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function handleGetTokenPrice(params: any): Promise<NextResponse<APIResponse>> {
  try {
    const validation = validateTokenPriceParams(params)
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!)
    }

    const { tokenA, tokenB } = params as GetTokenPriceRequest

    const price = await aggregator.getTokenPrice(tokenA, tokenB)

    return createSuccessResponse({ price })
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function handleEstimateGas(params: any): Promise<NextResponse<APIResponse>> {
  try {
    const validation = validateTradeParams(params)
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!)
    }

    const { tokenIn, tokenOut, amountIn, slippageTolerance = 100 } = params as EstimateGasRequest

    const tradeParams: TradeParams = {
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      slippageTolerance
    }

    const gasCosts = await aggregator.estimateGasCosts(tradeParams)

    return createSuccessResponse({ gasCosts })
  } catch (error) {
    return handleAPIError(error)
  }
}