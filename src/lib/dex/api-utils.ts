/**
 * DEX Trading API Utilities
 * Standardized response helpers and error handling
 */

import { NextResponse } from 'next/server'
import { APIResponse } from './api-types'

// Standardized Success Response
export function createSuccessResponse<T>(data: T): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data
  })
}

// Standardized Error Responses
export function createErrorResponse(
  error: string, 
  status: number = 400
): NextResponse<APIResponse> {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status }
  )
}

export function createValidationErrorResponse(error: string): NextResponse<APIResponse> {
  return createErrorResponse(error, 400)
}

export function createServerErrorResponse(error: string): NextResponse<APIResponse> {
  return createErrorResponse(error, 500)
}

export function createNotFoundResponse(resource: string): NextResponse<APIResponse> {
  return createErrorResponse(`${resource} not found`, 404)
}

// Error Handler Wrapper
export function handleAPIError(error: any): NextResponse<APIResponse> {
  console.error('DEX Trading API Error:', error)
  
  // Handle known error types
  if (error.message) {
    return createServerErrorResponse(error.message)
  }
  
  // Generic server error
  return createServerErrorResponse('An unexpected error occurred')
}

// Request Body Parser with Error Handling
export async function parseRequestBody(request: Request): Promise<any> {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }
}