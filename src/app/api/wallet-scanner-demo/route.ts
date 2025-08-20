/**
 * Demo Wallet Scanner - Mock data for demonstration
 * GET /api/wallet-scanner-demo - Returns mock portfolio data for testing
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock portfolio data based on the demo address
    const mockPortfolioData = {
      walletAddress: address,
      scanTimestamp: new Date().toISOString(),
      chains: [
        {
          chainId: 1,
          chainName: 'Ethereum',
          symbol: 'ETH',
          success: true,
          nativeBalance: {
            wei: '2500000000000000000',
            formatted: '2.5',
            usdValue: 8250.0,
            price: 3300.0
          },
          transactionCount: 156,
          assets: [
            {
              symbol: 'USDC',
              name: 'USD Coin',
              balance: '15000.0',
              usdValue: 15000.0,
              contractAddress: '0xA0b86a33E6441E6C7D3E4C5B4B6B8B8B8B8B8B8B',
              decimals: 6,
              type: 'erc20'
            },
            {
              symbol: 'WBTC',
              name: 'Wrapped Bitcoin',
              balance: '0.25',
              usdValue: 16250.0,
              contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
              decimals: 8,
              type: 'erc20'
            }
          ],
          totalAssets: 2,
          totalUsdValue: 39500.0,
          scanDuration: 1200,
          lastActivity: 'Active'
        },
        {
          chainId: 56,
          chainName: 'BNB Smart Chain',
          symbol: 'BNB',
          success: true,
          nativeBalance: {
            wei: '5000000000000000000',
            formatted: '5.0',
            usdValue: 2000.0,
            price: 400.0
          },
          transactionCount: 89,
          assets: [
            {
              symbol: 'CAKE',
              name: 'PancakeSwap Token',
              balance: '1000.0',
              usdValue: 3500.0,
              contractAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
              decimals: 18,
              type: 'erc20'
            }
          ],
          totalAssets: 1,
          totalUsdValue: 5500.0,
          scanDuration: 800,
          lastActivity: 'Active'
        },
        {
          chainId: 137,
          chainName: 'Polygon',
          symbol: 'MATIC',
          success: true,
          nativeBalance: {
            wei: '1000000000000000000000',
            formatted: '1000.0',
            usdValue: 800.0,
            price: 0.8
          },
          transactionCount: 45,
          assets: [
            {
              symbol: 'AAVE',
              name: 'Aave Token',
              balance: '25.0',
              usdValue: 2750.0,
              contractAddress: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
              decimals: 18,
              type: 'erc20'
            }
          ],
          totalAssets: 1,
          totalUsdValue: 3550.0,
          scanDuration: 600,
          lastActivity: 'Active'
        }
      ],
      summary: {
        totalChains: 3,
        successfulChains: 3,
        totalAssets: 4,
        totalPortfolioValue: 48550.0,
        totalNativeBalance: 11050.0
      },
      analytics: {
        chainDistribution: [
          {
            chainId: 1,
            chainName: 'Ethereum',
            value: 39500.0,
            percentage: 81.4,
            assetCount: 3
          },
          {
            chainId: 56,
            chainName: 'BNB Smart Chain',
            value: 5500.0,
            percentage: 11.3,
            assetCount: 2
          },
          {
            chainId: 137,
            chainName: 'Polygon',
            value: 3550.0,
            percentage: 7.3,
            assetCount: 2
          }
        ],
        topAssets: [
          {
            symbol: 'WBTC',
            name: 'Wrapped Bitcoin',
            balance: '0.25',
            usdValue: 16250.0,
            chainId: 1,
            chainName: 'Ethereum',
            type: 'erc20',
            contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            balance: '15000.0',
            usdValue: 15000.0,
            chainId: 1,
            chainName: 'Ethereum',
            type: 'erc20',
            contractAddress: '0xA0b86a33E6441E6C7D3E4C5B4B6B8B8B8B8B8B8B'
          },
          {
            symbol: 'ETH',
            name: 'Ethereum Native Token',
            balance: '2.5',
            usdValue: 8250.0,
            chainId: 1,
            chainName: 'Ethereum',
            type: 'native',
            contractAddress: 'native'
          },
          {
            symbol: 'CAKE',
            name: 'PancakeSwap Token',
            balance: '1000.0',
            usdValue: 3500.0,
            chainId: 56,
            chainName: 'BNB Smart Chain',
            type: 'erc20',
            contractAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
          },
          {
            symbol: 'AAVE',
            name: 'Aave Token',
            balance: '25.0',
            usdValue: 2750.0,
            chainId: 137,
            chainName: 'Polygon',
            type: 'erc20',
            contractAddress: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B'
          },
          {
            symbol: 'BNB',
            name: 'BNB Smart Chain Native Token',
            balance: '5.0',
            usdValue: 2000.0,
            chainId: 56,
            chainName: 'BNB Smart Chain',
            type: 'native',
            contractAddress: 'native'
          },
          {
            symbol: 'MATIC',
            name: 'Polygon Native Token',
            balance: '1000.0',
            usdValue: 800.0,
            chainId: 137,
            chainName: 'Polygon',
            type: 'native',
            contractAddress: 'native'
          }
        ],
        assetTypes: {
          native: 3,
          erc20: 4,
          nfts: 0,
          defi: 0
        },
        riskAnalysis: {
          diversificationScore: 60,
          concentrationRisk: 'MEDIUM',
          chainRisk: 'LOW'
        }
      },
      advanced: {
        transactionActivity: {
          'Ethereum': {
            transactionCount: 156,
            status: 'Active'
          },
          'BNB Smart Chain': {
            transactionCount: 89,
            status: 'Active'
          },
          'Polygon': {
            transactionCount: 45,
            status: 'Active'
          }
        },
        crossChainAssets: [],
        portfolioHealth: {
          totalValue: 48550.0,
          activeChains: 3,
          diversification: 60,
          riskLevel: 'MEDIUM'
        }
      }
    }

    console.log(`✅ Demo wallet scan completed for ${address}`)
    console.log(`📊 Portfolio: $${mockPortfolioData.summary.totalPortfolioValue.toFixed(2)} across ${mockPortfolioData.summary.successfulChains} chains`)

    return NextResponse.json({
      success: true,
      data: mockPortfolioData,
      metadata: {
        provider: 'Demo',
        scanDuration: '2000ms',
        timestamp: new Date().toISOString(),
        version: '1.0.0-demo'
      }
    })

  } catch (error) {
    console.error('❌ Demo wallet scanner error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Demo wallet scan failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}