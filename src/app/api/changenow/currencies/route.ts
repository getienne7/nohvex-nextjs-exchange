import { NextRequest, NextResponse } from 'next/server'

// Define types for ChangeNOW currency data
interface ChangeNowCurrency {
  ticker: string
  name: string
  image: string
  hasExternalId?: boolean
  isFiat?: boolean
  featured?: boolean
  isStable?: boolean
  supportsFixedRate?: boolean
}

const CHANGENOW_API_KEY = process.env.CHANGENOW_API_KEY || 'demo-key'
const CHANGENOW_BASE_URL = 'https://api.changenow.io/v1'

export async function GET() {
  try {
    console.log('Fetching currencies from ChangeNOW API...')
    const response = await fetch(`${CHANGENOW_BASE_URL}/currencies?active=true&fixedRate=true`, {
      headers: {
        'x-changenow-api-key': CHANGENOW_API_KEY,
      },
    })

    if (!response.ok) {
      console.error(`ChangeNOW API error: ${response.status}`)
      throw new Error(`ChangeNOW API error: ${response.status}`)
    }

    const currencies: ChangeNowCurrency[] = await response.json()
    console.log(`Received ${currencies.length} currencies from ChangeNOW`)
    
    // Filter and enhance currency data - remove isAvailable filter as it might not exist
    const enhancedCurrencies = currencies
      .map((currency: ChangeNowCurrency) => ({
        ticker: currency.ticker,
        name: currency.name,
        image: currency.image || `https://changenow.io/images/sprite/currencies/${currency.ticker}.svg`,
        hasExternalId: currency.hasExternalId || false,
        isFiat: currency.isFiat || false,
        featured: currency.featured || false,
        isStable: currency.isStable || false,
        supportsFixedRate: currency.supportsFixedRate || false,
      }))
      .sort((a: { featured: boolean; name: string }, b: { featured: boolean; name: string }) => {
        // Sort by featured first, then by name
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return a.name.localeCompare(b.name)
      })
      .slice(0, 100) // Limit to top 100 for performance

    console.log(`Returning ${enhancedCurrencies.length} processed currencies`)
    return NextResponse.json(enhancedCurrencies)
  } catch (error) {
    console.error('Error fetching currencies:', error)
    
    // Return fallback currencies if API fails
    const fallbackCurrencies = [
      {
        ticker: 'btc',
        name: 'Bitcoin',
        image: 'https://changenow.io/images/sprite/currencies/btc.svg',
        hasExternalId: false,
        isFiat: false,
        featured: true,
        isStable: false,
        supportsFixedRate: true,
      },
      {
        ticker: 'eth',
        name: 'Ethereum',
        image: 'https://changenow.io/images/sprite/currencies/eth.svg',
        hasExternalId: false,
        isFiat: false,
        featured: true,
        isStable: false,
        supportsFixedRate: true,
      },
      {
        ticker: 'usdt',
        name: 'Tether',
        image: 'https://changenow.io/images/sprite/currencies/usdt.svg',
        hasExternalId: false,
        isFiat: false,
        featured: true,
        isStable: true,
        supportsFixedRate: true,
      },
      {
        ticker: 'bnb',
        name: 'BNB',
        image: 'https://changenow.io/images/sprite/currencies/bnb.svg',
        hasExternalId: false,
        isFiat: false,
        featured: true,
        isStable: false,
        supportsFixedRate: true,
      },
    ]

    return NextResponse.json(fallbackCurrencies)
  }
}