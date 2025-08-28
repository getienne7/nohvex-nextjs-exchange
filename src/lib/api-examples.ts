/**
 * NOHVEX API Code Examples and Tutorials
 * Comprehensive examples for common integration patterns
 */

export const codeExamples = {
  // Basic Authentication
  authentication: {
    title: 'Authentication',
    description: 'How to authenticate with the NOHVEX API',
    examples: [
      {
        language: 'javascript',
        title: 'Using SDK with API Key',
        code: `import { NOHVEXClient } from '@nohvex/sdk'

const client = new NOHVEXClient({
  apiKey: process.env.NOHVEX_API_KEY,
  baseURL: 'https://api.nohvex.com/v1'
})

// Test connection
try {
  await client.utils.ping()
  console.log('Connected successfully!')
} catch (error) {
  console.error('Connection failed:', error.message)
}`
      },
      {
        language: 'curl',
        title: 'Direct API Call with Bearer Token',
        code: `# Using JWT token
curl -X GET "https://api.nohvex.com/v1/portfolio" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json"

# Using API Key
curl -X GET "https://api.nohvex.com/v1/portfolio" \\
  -H "X-API-Key: your-api-key" \\
  -H "Content-Type: application/json"`
      }
    ]
  },

  // Portfolio Management
  portfolioManagement: {
    title: 'Portfolio Management',
    description: 'Create and manage DeFi portfolios',
    examples: [
      {
        language: 'javascript',
        title: 'Create and Manage Portfolio',
        code: `import { NOHVEXClient } from '@nohvex/sdk'

const client = new NOHVEXClient({ apiKey: 'your-api-key' })

// Create a new portfolio
const newPortfolio = await client.portfolio.create({
  name: 'My DeFi Portfolio',
  description: 'Diversified crypto portfolio',
  currency: 'USD',
  riskLevel: 'moderate',
  initialAssets: [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      allocation: 40,
      currentValue: 20000,
      invested: 18000
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'crypto',
      allocation: 35,
      currentValue: 15000,
      invested: 14000
    }
  ]
})

console.log('Portfolio created:', newPortfolio.data.id)

// Get all portfolios
const portfolios = await client.portfolio.list({
  userId: 'user-123',
  riskLevel: 'moderate',
  page: 1,
  limit: 10
})

console.log('Found portfolios:', portfolios.data.length)

// Update portfolio
const updated = await client.portfolio.update(newPortfolio.data.id, {
  description: 'Updated description',
  riskLevel: 'aggressive'
})

// Get portfolio details
const portfolio = await client.portfolio.get(newPortfolio.data.id)
console.log('Portfolio value:', portfolio.data.totalValue)`
      },
      {
        language: 'python',
        title: 'Portfolio Analytics with Python',
        code: `from nohvex import NOHVEXClient
import pandas as pd

client = NOHVEXClient(api_key='your-api-key')

# Get portfolio data
portfolios = client.portfolio.list(user_id='user-123')

# Convert to DataFrame for analysis
portfolio_data = []
for portfolio in portfolios['data']:
    portfolio_data.append({
        'id': portfolio['id'],
        'name': portfolio['name'],
        'total_value': portfolio['totalValue'],
        'pnl': portfolio['pnl'],
        'pnl_percentage': portfolio['pnlPercentage'],
        'risk_level': portfolio['riskLevel']
    })

df = pd.DataFrame(portfolio_data)

# Calculate portfolio metrics
total_value = df['total_value'].sum()
average_pnl = df['pnl_percentage'].mean()
best_performer = df.loc[df['pnl_percentage'].idxmax()]

print(f"Total Portfolio Value: ${total_value:,.2f}")
print(f"Average PnL: {average_pnl:.2f}%")
print(f"Best Performer: {best_performer['name']} (+{best_performer['pnl_percentage']:.2f}%)")
      }
    ]
  },

  // Cross-Chain Operations
  crossChain: {
    title: 'Cross-Chain Operations',
    description: 'Bridge assets across different blockchains',
    examples: [
      {
        language: 'javascript',
        title: 'Find and Execute Cross-Chain Routes',
        code: `import { NOHVEXClient } from '@nohvex/sdk'

const client = new NOHVEXClient({ apiKey: 'your-api-key' })

// Find optimal routes for bridging USDC from Ethereum to Polygon
const routes = await client.crossChain.findRoutes({
  sourceChain: 'ethereum',
  targetChain: 'polygon',
  sourceAsset: 'USDC',
  targetAsset: 'USDC',
  amount: 1000,
  prioritize: 'cost', // or 'time', 'security'
  includeYield: true
})

console.log(\`Found \${routes.data.length} routes\`)

// Select the best route (first one is optimal based on prioritization)
const bestRoute = routes.data[0]
console.log(\`Best route: \${bestRoute.protocol}\`)
console.log(\`Estimated cost: $\${bestRoute.estimatedCost}\`)
console.log(\`Estimated time: \${bestRoute.estimatedTime}s\`)
console.log(\`Security score: \${bestRoute.securityScore}/100\`)

// Execute the cross-chain transaction
try {
  const execution = await client.crossChain.execute({
    routeId: bestRoute.id,
    userId: 'user-123',
    amount: 1000,
    slippageTolerance: 1.0 // 1%
  })
  
  console.log('Transaction submitted:', execution.data.transactionHash)
  
  // Monitor transaction status
  const checkStatus = async () => {
    const status = await client.crossChain.getTransactionStatus(
      execution.data.transactionId
    )
    
    if (status.data.status === 'completed') {
      console.log('Bridge completed successfully!')
    } else if (status.data.status === 'failed') {
      console.error('Bridge failed:', status.data.error)
    } else {
      console.log('Status:', status.data.status)
      setTimeout(checkStatus, 10000) // Check again in 10 seconds
    }
  }
  
  checkStatus()
  
} catch (error) {
  console.error('Bridge execution failed:', error.message)
}`
      },
      {
        language: 'javascript',
        title: 'Yield Optimization Across Chains',
        code: `import { NOHVEXClient } from '@nohvex/sdk'

const client = new NOHVEXClient({ apiKey: 'your-api-key' })

// Find yield opportunities across chains
const opportunities = await client.crossChain.getYieldOpportunities({
  asset: 'USDC',
  minApy: 5.0, // Minimum 5% APY
  maxRisk: 'medium',
  strategy: 'liquidity-mining'
})

console.log(\`Found \${opportunities.data.length} yield opportunities\`)

// Sort by APY descending
const sortedOpportunities = opportunities.data.sort(
  (a, b) => b.apy - a.apy
)

sortedOpportunities.forEach((opportunity, index) => {
  console.log(\`\${index + 1}. \${opportunity.protocol} on \${opportunity.chain}\`)
  console.log(\`   APY: \${opportunity.apy}%\`)
  console.log(\`   Risk Level: \${opportunity.riskLevel}\`)
  console.log(\`   TVL: $\${opportunity.tvl.toLocaleString()}\`)
  console.log(\`   Min Investment: $\${opportunity.minAmount}\`)
  console.log('---')
})

// Optimize yield strategy for a portfolio
const assets = [
  { symbol: 'USDC', amount: 10000, chain: 'ethereum' },
  { symbol: 'DAI', amount: 5000, chain: 'ethereum' }
]

const optimization = await client.crossChain.optimizeYieldStrategy({
  assets,
  targetYield: 8.0, // Target 8% APY
  riskTolerance: 'medium',
  duration: 90 // 90 days
})

console.log('Optimization Results:')
console.log(\`Expected APY: \${optimization.data.expectedApy}%\`)
console.log(\`Risk Score: \${optimization.data.riskScore}/100\`)
console.log('Recommended allocations:')
optimization.data.allocations.forEach(allocation => {
  console.log(\`  \${allocation.amount} \${allocation.asset} → \${allocation.protocol} (\${allocation.apy}% APY)\`)
})`
      }
    ]
  },

  // Institutional Features
  institutional: {
    title: 'Institutional Features',
    description: 'Enterprise-grade portfolio management',
    examples: [
      {
        language: 'javascript',
        title: 'Institutional Portfolio Management',
        code: `import { NOHVEXClient } from '@nohvex/sdk'

const client = new NOHVEXClient({ apiKey: 'your-institutional-api-key' })

// Create institutional portfolio
const portfolio = await client.institutional.createPortfolio({
  institutionId: 'institution-123',
  name: 'Diversified Crypto Fund',
  description: 'Multi-strategy institutional cryptocurrency portfolio',
  totalInvested: 50000000, // $50M
  currency: 'USD',
  riskLevel: 'moderate',
  benchmark: 'CRYPTO_INDEX',
  allocations: [
    {
      category: 'Bitcoin',
      targetPercentage: 30,
      currentPercentage: 35,
      minPercentage: 25,
      maxPercentage: 40,
      tolerance: 5,
      priority: 'high'
    },
    {
      category: 'Ethereum',
      targetPercentage: 25,
      currentPercentage: 25,
      minPercentage: 20,
      maxPercentage: 30,
      tolerance: 3,
      priority: 'high'
    }
  ],
  rebalancing: {
    isEnabled: true,
    frequency: 'weekly',
    threshold: 5,
    method: 'risk-parity'
  }
})

console.log('Institutional portfolio created:', portfolio.data.id)

// Get portfolio analytics with risk metrics
const analytics = await client.institutional.getPortfolios({
  institutionId: 'institution-123',
  includeRisk: true,
  includeCompliance: true
})

const portfolioData = analytics.data.portfolios[0]

console.log('Portfolio Analytics:')
console.log(\`Total AUM: $\${portfolioData.totalValue.toLocaleString()}\`)
console.log(\`PnL: \${portfolioData.pnlPercentage.toFixed(2)}%\`)

// Risk Metrics
const risk = portfolioData.riskMetrics
console.log('\\nRisk Metrics:')
console.log(\`VaR (95%): $\${risk.var95.toLocaleString()}\`)
console.log(\`Sharpe Ratio: \${risk.sharpeRatio.toFixed(2)}\`)
console.log(\`Max Drawdown: \${(risk.maxDrawdown * 100).toFixed(2)}%\`)
console.log(\`Volatility: \${(risk.volatility * 100).toFixed(2)}%\`)

// Compliance Status
const compliance = portfolioData.compliance
console.log(\`\\nCompliance Status: \${compliance.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}\`)
if (compliance.violations.length > 0) {
  console.log('Violations:')
  compliance.violations.forEach(violation => {
    console.log(\`  - \${violation.description} (\${violation.severity})\`)
  })
}`
      },
      {
        language: 'javascript',
        title: 'Automated Rebalancing Workflow',
        code: `import { NOHVEXClient } from '@nohvex/sdk'

const client = new NOHVEXClient({ apiKey: 'your-institutional-api-key' })

// Generate rebalancing proposal
const proposal = await client.institutional.generateRebalancing({
  portfolioId: 'portfolio-456',
  userId: 'portfolio-manager-123',
  method: 'risk-parity'
})

console.log('Rebalancing Proposal Generated:')
console.log(\`Proposal ID: \${proposal.data.id}\`)
console.log(\`Expected Cost: $\${proposal.data.expectedCost.toLocaleString()}\`)
console.log(\`Expected Slippage: \${proposal.data.expectedSlippage.toFixed(2)}%\`)

// Review proposed trades
console.log('\\nProposed Trades:')
proposal.data.trades.forEach((trade, index) => {
  console.log(\`\${index + 1}. \${trade.action.toUpperCase()} \${trade.quantity.toLocaleString()} \${trade.symbol}\`)
  console.log(\`   Current Price: $\${trade.currentPrice}\`)
  console.log(\`   Estimated Cost: $\${trade.estimatedCost}\`)
  console.log(\`   Priority: \${trade.priority}\`)
})

// Check risk impact
const riskImpact = proposal.data.riskImpact
console.log('\\nRisk Impact Analysis:')
console.log(\`VaR Change: \${(riskImpact.varChange * 100).toFixed(2)}%\`)
console.log(\`Sharpe Ratio Change: \${riskImpact.sharpeChange.toFixed(3)}\`)
console.log(\`Tracking Error Change: \${(riskImpact.trackingErrorChange * 100).toFixed(2)}%\`)

// Approve and execute rebalancing (in practice, this would require proper approval workflow)
if (proposal.data.complianceCheck && proposal.data.expectedCost < 50000) {
  console.log('\\nProposal meets criteria, executing rebalancing...')
  
  const execution = await client.institutional.executeRebalancing({
    proposalId: proposal.data.id,
    userId: 'portfolio-manager-123'
  })
  
  console.log('Rebalancing Execution Results:')
  console.log(\`Executed Trades: \${execution.data.executedTrades}\`)
  console.log(\`Total Cost: $\${execution.data.totalCost.toLocaleString()}\`)
  
  if (execution.data.errors.length > 0) {
    console.log('Errors:')
    execution.data.errors.forEach(error => console.log(\`  - \${error}\`))
  }
} else {
  console.log('\\nProposal requires manual review')
}`
      }
    ]
  },

  // Real-time Data with WebSockets
  realTimeData: {
    title: 'Real-time Data with WebSockets',
    description: 'Stream live data for portfolio monitoring',
    examples: [
      {
        language: 'javascript',
        title: 'Portfolio Monitoring with WebSockets',
        code: `import { NOHVEXClient, NOHVEXWebSocket } from '@nohvex/sdk'

const client = new NOHVEXClient({ apiKey: 'your-api-key' })
const ws = new NOHVEXWebSocket({ 
  apiKey: 'your-api-key',
  baseURL: 'wss://api.nohvex.com/v1'
})

// Connect to WebSocket
await ws.connect()

// Subscribe to portfolio updates
ws.subscribe('portfolio-updates', (data) => {
  console.log('Portfolio Update:', data)
  
  if (data.type === 'value_change') {
    console.log(\`Portfolio \${data.portfolioId} value changed to $\${data.newValue.toLocaleString()}\`)
    console.log(\`Change: \${data.change > 0 ? '+' : ''}\${data.change.toFixed(2)}%\`)
  }
  
  if (data.type === 'allocation_drift') {
    console.log(\`Allocation drift detected in portfolio \${data.portfolioId}\`)
    console.log(\`Asset \${data.asset}: target \${data.target}%, current \${data.current}%\`)
  }
})

// Subscribe to price alerts
ws.subscribe('price-alerts', (data) => {
  console.log('Price Alert:', data)
  
  if (data.type === 'price_threshold') {
    console.log(\`\${data.symbol} crossed \${data.direction} threshold: $\${data.price}\`)
  }
  
  if (data.type === 'volatility_spike') {
    console.log(\`High volatility detected for \${data.symbol}: \${data.volatility.toFixed(2)}%\`)
  }
})

// Subscribe to cross-chain transaction updates
ws.subscribe('cross-chain-updates', (data) => {
  console.log('Cross-chain Update:', data)
  
  switch (data.status) {
    case 'initiated':
      console.log(\`Bridge transaction initiated: \${data.transactionId}\`)
      break
    case 'confirmed':
      console.log(\`Source transaction confirmed: \${data.sourceHash}\`)
      break
    case 'bridging':
      console.log(\`Bridging in progress... (\${data.progress}%)\`)
      break
    case 'completed':
      console.log(\`Bridge completed! Target hash: \${data.targetHash}\`)
      break
    case 'failed':
      console.error(\`Bridge failed: \${data.error}\`)
      break
  }
})

// Set up price alerts for specific assets
const setupPriceAlerts = async () => {
  await client.alerts.create({
    type: 'price_threshold',
    symbol: 'BTC',
    condition: 'above',
    threshold: 50000,
    portfolioId: 'portfolio-123'
  })
  
  await client.alerts.create({
    type: 'volatility',
    symbol: 'ETH',
    threshold: 5.0, // 5% volatility
    timeframe: '1h'
  })
}

setupPriceAlerts()

// Handle connection events
ws.onReconnect = () => {
  console.log('WebSocket reconnected')
  // Re-subscribe to channels if needed
}

ws.onDisconnect = () => {
  console.log('WebSocket disconnected')
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...')
  ws.disconnect()
  process.exit(0)
})`
      }
    ]
  },

  // Error Handling and Best Practices
  errorHandling: {
    title: 'Error Handling and Best Practices',
    description: 'Robust error handling and retry strategies',
    examples: [
      {
        language: 'javascript',
        title: 'Comprehensive Error Handling',
        code: `import { NOHVEXClient, NOHVEXAPIError } from '@nohvex/sdk'

const client = new NOHVEXClient({
  apiKey: 'your-api-key',
  retries: 3,
  timeout: 30000,
  debug: true // Enable debug logging
})

// Wrapper function with comprehensive error handling
const safeApiCall = async (operation, ...args) => {
  try {
    return await operation(...args)
  } catch (error) {
    if (error instanceof NOHVEXAPIError) {
      // Handle specific API errors
      switch (error.code) {
        case 'UNAUTHORIZED':
          console.error('Authentication failed. Check your API key.')
          // Implement token refresh logic
          break
          
        case 'RATE_LIMITED':
          console.warn('Rate limit exceeded. Waiting before retry...')
          await delay(error.details?.retryAfter * 1000 || 60000)
          // Retry the operation
          return safeApiCall(operation, ...args)
          
        case 'INSUFFICIENT_BALANCE':
          console.error('Insufficient balance for operation')
          // Handle insufficient balance
          break
          
        case 'INVALID_PORTFOLIO':
          console.error('Portfolio not found or invalid')
          // Handle invalid portfolio
          break
          
        default:
          console.error(\`API Error [\${error.code}]: \${error.message}\`)
          if (error.details) {
            console.error('Error details:', error.details)
          }
      }
    } else if (error.name === 'AbortError') {
      console.error('Request timeout. The operation took too long.')
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error. Check your internet connection.')
    } else {
      console.error('Unexpected error:', error.message)
    }
    
    throw error // Re-throw for caller to handle
  }
}

// Usage examples with error handling
const demonstrateErrorHandling = async () => {
  // Portfolio operations with error handling
  try {
    const portfolios = await safeApiCall(
      client.portfolio.list.bind(client.portfolio),
      { userId: 'user-123' }
    )
    console.log('Portfolios retrieved successfully:', portfolios.data.length)
  } catch (error) {
    console.error('Failed to retrieve portfolios')
    // Implement fallback behavior
  }

  // Cross-chain operations with validation
  try {
    // Validate inputs before API call
    const routeParams = {
      sourceChain: 'ethereum',
      targetChain: 'polygon',
      sourceAsset: 'USDC',
      targetAsset: 'USDC',
      amount: 1000
    }
    
    // Input validation
    if (routeParams.amount <= 0) {
      throw new Error('Amount must be positive')
    }
    
    if (routeParams.sourceChain === routeParams.targetChain) {
      throw new Error('Source and target chains must be different')
    }
    
    const routes = await safeApiCall(
      client.crossChain.findRoutes.bind(client.crossChain),
      routeParams
    )
    
    if (routes.data.length === 0) {
      console.warn('No routes found for the given parameters')
      return
    }
    
    console.log(\`Found \${routes.data.length} routes\`)
    
  } catch (error) {
    console.error('Route finding failed:', error.message)
  }

  // Batch operations with partial failure handling
  const portfolioIds = ['portfolio-1', 'portfolio-2', 'portfolio-3']
  const results = await Promise.allSettled(
    portfolioIds.map(id => 
      safeApiCall(client.portfolio.get.bind(client.portfolio), id)
    )
  )
  
  const successful = results.filter(r => r.status === 'fulfilled')
  const failed = results.filter(r => r.status === 'rejected')
  
  console.log(\`Successfully retrieved \${successful.length} portfolios\`)
  if (failed.length > 0) {
    console.warn(\`Failed to retrieve \${failed.length} portfolios\`)
    failed.forEach((result, index) => {
      console.error(\`Portfolio \${portfolioIds[index]}: \${result.reason.message}\`)
    })
  }
}

// Utility function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Run the demonstration
demonstrateErrorHandling().catch(console.error)`
      }
    ]
  }
}

export default codeExamples