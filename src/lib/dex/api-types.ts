/**
 * DEX Trading API Types and Validation
 * Centralized type definitions and validation for API requests
 */

import { Token } from './index'

// Request Types
export interface GetQuoteRequest {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  slippageTolerance?: number
}

export interface FindBestRouteRequest {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  slippageTolerance?: number
}

export interface ExecuteTradeRequest {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  slippageTolerance?: number
  privateKey: string
  walletAddress: string
}

export interface GetSupportedTokensRequest {
  chainId: number
}

export interface GetTokenPriceRequest {
  tokenA: Token
  tokenB: Token
}

export interface EstimateGasRequest {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  slippageTolerance?: number
}

// Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Validation Results
export interface ValidationResult {
  isValid: boolean
  error?: string
}

// Validation Functions
export function validateTradeParams(params: any): ValidationResult {
  const { tokenIn, tokenOut, amountIn } = params

  if (!tokenIn || !tokenOut || !amountIn) {
    return {
      isValid: false,
      error: 'Missing required parameters: tokenIn, tokenOut, and amountIn are required'
    }
  }

  if (!isValidToken(tokenIn)) {
    return {
      isValid: false,
      error: 'Invalid tokenIn: must have address, symbol, name, decimals, and chainId'
    }
  }

  if (!isValidToken(tokenOut)) {
    return {
      isValid: false,
      error: 'Invalid tokenOut: must have address, symbol, name, decimals, and chainId'
    }
  }

  if (!isValidAmount(amountIn)) {
    return {
      isValid: false,
      error: 'Invalid amountIn: must be a positive number or string'
    }
  }

  return { isValid: true }
}

export function validateExecuteTradeParams(params: any): ValidationResult {
  const tradeValidation = validateTradeParams(params)
  if (!tradeValidation.isValid) {
    return tradeValidation
  }

  const { privateKey, walletAddress } = params

  if (!privateKey || !walletAddress) {
    return {
      isValid: false,
      error: 'Missing required parameters: privateKey and walletAddress are required for trade execution'
    }
  }

  if (!isValidAddress(walletAddress)) {
    return {
      isValid: false,
      error: 'Invalid walletAddress: must be a valid Ethereum address'
    }
  }

  return { isValid: true }
}

export function validateTokenPriceParams(params: any): ValidationResult {
  const { tokenA, tokenB } = params

  if (!tokenA || !tokenB) {
    return {
      isValid: false,
      error: 'Missing required parameters: tokenA and tokenB are required'
    }
  }

  if (!isValidToken(tokenA)) {
    return {
      isValid: false,
      error: 'Invalid tokenA: must have address, symbol, name, decimals, and chainId'
    }
  }

  if (!isValidToken(tokenB)) {
    return {
      isValid: false,
      error: 'Invalid tokenB: must have address, symbol, name, decimals, and chainId'
    }
  }

  return { isValid: true }
}

export function validateChainId(params: any): ValidationResult {
  const { chainId } = params

  if (!chainId) {
    return {
      isValid: false,
      error: 'Missing required parameter: chainId is required'
    }
  }

  if (!isValidChainId(chainId)) {
    return {
      isValid: false,
      error: 'Invalid chainId: must be a supported chain (1, 56, or 137)'
    }
  }

  return { isValid: true }
}

// Helper Functions
function isValidToken(token: any): token is Token {
  return (
    token &&
    typeof token.address === 'string' &&
    typeof token.symbol === 'string' &&
    typeof token.name === 'string' &&
    typeof token.decimals === 'number' &&
    typeof token.chainId === 'number' &&
    token.address.length > 0 &&
    token.symbol.length > 0 &&
    token.name.length > 0 &&
    token.decimals >= 0 &&
    isValidChainId(token.chainId)
  )
}

function isValidAmount(amount: any): boolean {
  if (typeof amount === 'string') {
    const num = parseFloat(amount)
    return !isNaN(num) && num > 0
  }
  if (typeof amount === 'number') {
    return amount > 0 && !isNaN(amount)
  }
  return false
}

function isValidAddress(address: any): boolean {
  return (
    typeof address === 'string' &&
    address.length === 42 &&
    address.startsWith('0x') &&
    /^0x[a-fA-F0-9]{40}$/.test(address)
  )
}

function isValidChainId(chainId: any): boolean {
  return typeof chainId === 'number' && [1, 56, 137].includes(chainId)
}