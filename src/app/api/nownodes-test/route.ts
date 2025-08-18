/**
 * NOWNodes Test API - Demonstrate RPC functionality
 * GET /api/nownodes-test - Test NOWNodes RPC connections and basic functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { NOWNodesService } from '@/lib/web3/nownodes-service'
import { ethers } from 'ethers'

export async function GET(request: NextRequest) {
  try {
    // Get NOWNodes API key from environment
    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      return NextResponse.json(
        { error: 'NOWNodes API key not configured' },
        { status: 500 }
      )
    }

    console.log('🧪 Testing NOWNodes integration...')

    // Initialize NOWNodes service
    const nowNodes = new NOWNodesService(nowNodesApiKey)

    // Test results
    const testResults: any = {
      timestamp: new Date().toISOString(),
      apiKey: `${nowNodesApiKey.substring(0, 8)}...${nowNodesApiKey.substring(nowNodesApiKey.length - 4)}`,
      tests: {}
    }

    // Test 1: Health Check
    console.log('1️⃣ Testing health check...')
    try {
      const isHealthy = await nowNodes.healthCheck()
      testResults.tests.healthCheck = {
        status: isHealthy ? 'PASS' : 'FAIL',
        result: isHealthy
      }
    } catch (error) {
      testResults.tests.healthCheck = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test 2: Supported Chains
    console.log('2️⃣ Testing supported chains...')
    try {
      const chains = NOWNodesService.getSupportedChains()
      testResults.tests.supportedChains = {
        status: 'PASS',
        count: chains.length,
        chains: chains.map(c => ({ name: c.name, symbol: c.symbol, chainId: c.chainId }))
      }
    } catch (error) {
      testResults.tests.supportedChains = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test 3: Ethereum RPC Connection
    console.log('3️⃣ Testing Ethereum RPC...')
    try {
      const provider = nowNodes.getProvider(1) // Ethereum
      const blockNumber = await provider.getBlockNumber()
      const network = await provider.getNetwork()
      
      testResults.tests.ethereumRPC = {
        status: 'PASS',
        blockNumber: blockNumber,
        chainId: Number(network.chainId),
        networkName: network.name
      }
    } catch (error) {
      testResults.tests.ethereumRPC = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test 4: Gas Price
    console.log('4️⃣ Testing gas price...')
    try {
      const gasPrice = await nowNodes.getGasPrice(1)
      testResults.tests.gasPrice = {
        status: 'PASS',
        gasPrice: gasPrice,
        gasPriceGwei: `${gasPrice} gwei`
      }
    } catch (error) {
      testResults.tests.gasPrice = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test 5: ETH Balance Check (Vitalik's address)
    console.log('5️⃣ Testing ETH balance...')
    try {
      const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Vitalik's address
      const provider = nowNodes.getProvider(1)
      const balance = await provider.getBalance(testAddress)
      const balanceEth = ethers.formatEther(balance)
      
      testResults.tests.ethBalance = {
        status: 'PASS',
        address: testAddress,
        balanceWei: balance.toString(),
        balanceEth: balanceEth,
        description: "Vitalik's ETH balance"
      }
    } catch (error) {
      testResults.tests.ethBalance = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test 6: Price Data
    console.log('6️⃣ Testing price data...')
    try {
      const prices = await nowNodes.getMultipleTokenPrices(['BTC', 'ETH'])
      testResults.tests.priceData = {
        status: 'PASS',
        prices: prices,
        count: Object.keys(prices).length
      }
    } catch (error) {
      testResults.tests.priceData = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Calculate overall status
    const testStatuses = Object.values(testResults.tests).map((test: any) => test.status)
    const passCount = testStatuses.filter(status => status === 'PASS').length
    const totalTests = testStatuses.length
    
    testResults.summary = {
      totalTests,
      passed: passCount,
      failed: totalTests - passCount,
      successRate: `${Math.round((passCount / totalTests) * 100)}%`,
      overallStatus: passCount === totalTests ? 'ALL_PASS' : passCount > 0 ? 'PARTIAL_PASS' : 'ALL_FAIL'
    }

    console.log(`✅ NOWNodes test completed: ${passCount}/${totalTests} tests passed`)

    return NextResponse.json({
      success: true,
      message: 'NOWNodes integration test completed',
      data: testResults
    })

  } catch (error) {
    console.error('❌ NOWNodes test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'NOWNodes test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    const nowNodesApiKey = process.env.NOWNODES_API_KEY
    if (!nowNodesApiKey) {
      return new NextResponse(null, { status: 503 })
    }

    const nowNodes = new NOWNodesService(nowNodesApiKey)
    const isHealthy = await nowNodes.healthCheck()
    
    return new NextResponse(null, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'X-Service-Status': isHealthy ? 'healthy' : 'unhealthy',
        'X-Provider': 'NOWNodes',
        'X-Test-Endpoint': 'true'
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}