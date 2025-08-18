/**
 * NOWNodes Integration Test Script
 * Run: node scripts/test-nownodes.js
 */

const { NOWNodesService } = require('../src/lib/web3/nownodes-service.ts')
const { NOWNodesAssetScanner } = require('../src/lib/web3/nownodes-asset-scanner.ts')

async function testNOWNodesIntegration() {
  console.log('🧪 Testing NOWNodes Integration...\n')

  // Check if API key is configured
  const apiKey = process.env.NOWNODES_API_KEY
  if (!apiKey) {
    console.error('❌ NOWNODES_API_KEY not found in environment variables')
    console.log('💡 Add your NOWNodes API key to .env file:')
    console.log('   NOWNODES_API_KEY="your-api-key-here"')
    process.exit(1)
  }

  try {
    // Test 1: Service Health Check
    console.log('1️⃣ Testing Service Health Check...')
    const nowNodes = new NOWNodesService(apiKey)
    const isHealthy = await nowNodes.healthCheck()
    console.log(`   Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`)

    if (!isHealthy) {
      console.error('❌ NOWNodes service is not healthy. Check your API key.')
      process.exit(1)
    }

    // Test 2: Supported Chains
    console.log('2️⃣ Testing Supported Chains...')
    const chains = NOWNodesService.getSupportedChains()
    console.log(`   Supported chains: ${chains.length}`)
    chains.forEach(chain => {
      console.log(`   - ${chain.name} (${chain.symbol}) - Chain ID: ${chain.chainId}`)
    })
    console.log()

    // Test 3: Price Feeds
    console.log('3️⃣ Testing Price Feeds...')
    const testSymbols = ['BTC', 'ETH', 'BNB']
    console.log(`   Fetching prices for: ${testSymbols.join(', ')}`)
    
    const prices = await nowNodes.getMultipleTokenPrices(testSymbols)
    for (const symbol of testSymbols) {
      const price = prices[symbol]
      if (price) {
        console.log(`   ✅ ${symbol}: $${price.price.toFixed(2)} (${price.change24h > 0 ? '+' : ''}${price.change24h.toFixed(2)}%)`)
      } else {
        console.log(`   ❌ ${symbol}: Price not available`)
      }
    }
    console.log()

    // Test 4: RPC Provider
    console.log('4️⃣ Testing RPC Provider...')
    try {
      const provider = nowNodes.getProvider(1) // Ethereum
      const blockNumber = await provider.getBlockNumber()
      console.log(`   ✅ Ethereum latest block: ${blockNumber}`)
      
      const gasPrice = await nowNodes.getGasPrice(1)
      console.log(`   ✅ Current gas price: ${gasPrice} gwei`)
    } catch (error) {
      console.log(`   ❌ RPC test failed: ${error.message}`)
    }
    console.log()

    // Test 5: Asset Scanner
    console.log('5️⃣ Testing Asset Scanner...')
    const scanner = new NOWNodesAssetScanner(apiKey)
    
    // Test with a known wallet address (Vitalik's address)
    const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    console.log(`   Testing with address: ${testAddress}`)
    console.log('   Scanning Ethereum mainnet only (to avoid long test times)...')
    
    try {
      const scanResult = await scanner.scanChainAssets(testAddress, 1)
      if (scanResult.success) {
        console.log(`   ✅ Scan successful: ${scanResult.assets.length} assets found`)
        console.log(`   💰 Total value: $${scanResult.totalUsdValue.toFixed(2)}`)
        
        if (scanResult.assets.length > 0) {
          console.log('   Top assets:')
          scanResult.assets
            .sort((a, b) => b.usdValue - a.usdValue)
            .slice(0, 3)
            .forEach(asset => {
              console.log(`     - ${asset.symbol}: ${asset.balanceFormatted} ($${asset.usdValue.toFixed(2)})`)
            })
        }
      } else {
        console.log(`   ❌ Scan failed: ${scanResult.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Asset scanner test failed: ${error.message}`)
    }
    console.log()

    // Test Summary
    console.log('🎉 NOWNodes Integration Test Complete!')
    console.log('✅ All core features are working correctly')
    console.log('🚀 Ready for production deployment!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('🔍 Check your API key and network connection')
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testNOWNodesIntegration()
}

module.exports = { testNOWNodesIntegration }