import { NextRequest, NextResponse } from 'next/server'

const CHANGENOW_API_KEY = process.env.CHANGENOW_API_KEY || 'demo-key'
const CHANGENOW_BASE_URL = 'https://api.changenow.io/v1'

export async function POST(request: NextRequest) {
  try {
    const { fromCurrency, toCurrency, fromAmount, address, extraId, refundAddress } = await request.json()

    if (!fromCurrency || !toCurrency || !fromAmount || !address) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create exchange transaction
    const exchangeData = {
      from: fromCurrency,
      to: toCurrency,
      address: address,
      amount: fromAmount,
      extraId: extraId || '',
      refundAddress: refundAddress || '',
      refundExtraId: '',
    }

    const response = await fetch(`${CHANGENOW_BASE_URL}/transactions/${CHANGENOW_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-changenow-api-key': CHANGENOW_API_KEY,
      },
      body: JSON.stringify(exchangeData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `ChangeNOW API error: ${response.status}`)
    }

    const data = await response.json()

    // Format response
    const exchange = {
      id: data.id,
      payinAddress: data.payinAddress,
      payoutAddress: data.payoutAddress,
      fromCurrency: data.fromCurrency,
      toCurrency: data.toCurrency,
      amount: data.amount,
      expectedReceiveAmount: data.expectedReceiveAmount,
      status: data.status,
      payinExtraId: data.payinExtraId,
      payoutExtraId: data.payoutExtraId,
    }

    return NextResponse.json(exchange)
  } catch (error) {
    console.error('Error creating exchange:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create exchange',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}