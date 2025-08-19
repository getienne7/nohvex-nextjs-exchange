import { NextRequest, NextResponse } from 'next/server'

const CHANGENOW_API_KEY = process.env.CHANGENOW_API_KEY || 'demo-key'
const CHANGENOW_BASE_URL = 'https://api.changenow.io/v1'

export async function POST(request: NextRequest) {
  try {
    const { fromCurrency, toCurrency, fromAmount } = await request.json()

    if (!fromCurrency || !toCurrency || !fromAmount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get exchange estimate from ChangeNOW
    const response = await fetch(
      `${CHANGENOW_BASE_URL}/exchange-amount/${fromAmount}/${fromCurrency}_${toCurrency}?api_key=${CHANGENOW_API_KEY}`,
      {
        headers: {
          'x-changenow-api-key': CHANGENOW_API_KEY,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`ChangeNOW API error: ${response.status}`)
    }

    const data = await response.json()

    // Format response
    const estimate = {
      estimatedAmount: data.estimatedAmount || 0,
      transactionSpeedForecast: data.transactionSpeedForecast || '10-60 minutes',
      warningMessage: data.warningMessage || null,
    }

    return NextResponse.json(estimate)
  } catch (error) {
    console.error('Error getting exchange estimate:', error)
    
    // Return mock estimate if API fails
    const mockEstimate = {
      estimatedAmount: 0.001, // Mock conversion rate
      transactionSpeedForecast: '10-60 minutes',
      warningMessage: 'Demo mode - estimates may not be accurate',
    }

    return NextResponse.json(mockEstimate)
  }
}