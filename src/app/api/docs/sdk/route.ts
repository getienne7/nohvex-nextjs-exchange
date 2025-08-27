import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sdkDocumentation = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOHVEX SDK Documentation</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism-tomorrow.min.css" rel="stylesheet" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f8fafc;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 2.5rem;
    }
    .header p {
      margin: 0.5rem 0 0 0;
      font-size: 1.2rem;
      opacity: 0.9;
    }
    .section {
      background: white;
      padding: 2rem;
      margin-bottom: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      color: #1a202c;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .section h3 {
      color: #2d3748;
      margin-top: 2rem;
    }
    .code-block {
      background: #2d3748;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
      overflow-x: auto;
    }
    .install-command {
      background: #1a202c;
      color: #68d391;
      padding: 1rem;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      margin: 1rem 0;
    }
    .method {
      background: #f7fafc;
      border-left: 4px solid #4299e1;
      padding: 1rem;
      margin: 1rem 0;
    }
    .method-name {
      font-weight: bold;
      color: #2b6cb0;
      font-size: 1.1rem;
    }
    .param {
      background: #edf2f7;
      padding: 0.5rem;
      margin: 0.5rem 0;
      border-radius: 4px;
    }
    .param-name {
      font-weight: bold;
      color: #4a5568;
    }
    .param-type {
      color: #805ad5;
      font-style: italic;
    }
    .nav {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .nav a {
      display: inline-block;
      margin-right: 1rem;
      color: #4299e1;
      text-decoration: none;
      font-weight: 500;
    }
    .nav a:hover {
      text-decoration: underline;
    }
    .example {
      background: #f0fff4;
      border: 1px solid #9ae6b4;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
    }
    .warning {
      background: #fffbeb;
      border: 1px solid #f6e05e;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
      text-align: left;
    }
    th {
      background: #f7fafc;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>NOHVEX SDK Documentation</h1>
    <p>Official SDK for NOHVEX DeFi Platform API</p>
  </div>

  <div class="nav">
    <a href="#installation">Installation</a>
    <a href="#quickstart">Quick Start</a>
    <a href="#authentication">Authentication</a>
    <a href="#portfolio">Portfolio Management</a>
    <a href="#crosschain">Cross-Chain</a>
    <a href="#institutional">Institutional</a>
    <a href="#examples">Examples</a>
    <a href="/api/docs">Back to API Docs</a>
  </div>

  <div class="section" id="installation">
    <h2>Installation</h2>
    <p>Install the NOHVEX SDK using your preferred package manager:</p>
    
    <div class="install-command">npm install @nohvex/sdk</div>
    <div class="install-command">yarn add @nohvex/sdk</div>
    <div class="install-command">pnpm add @nohvex/sdk</div>

    <h3>Requirements</h3>
    <ul>
      <li>Node.js 16+ or modern browser environment</li>
      <li>TypeScript 4.5+ (for TypeScript projects)</li>
      <li>NOHVEX API key (get one from your dashboard)</li>
    </ul>
  </div>

  <div class="section" id="quickstart">
    <h2>Quick Start</h2>
    <p>Get started with the NOHVEX SDK in just a few lines of code:</p>

    <div class="code-block">
<pre><code>import { NohvexSDK } from '@nohvex/sdk';

// Initialize the SDK
const nohvex = new NohvexSDK({
  apiKey: 'your-api-key-here',
  environment: 'production', // or 'staging', 'development'
  baseUrl: 'https://api.nohvex.com/v1'
});

// Get user portfolios
async function getPortfolios() {
  try {
    const portfolios = await nohvex.portfolio.list();
    console.log('User portfolios:', portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
  }
}</code></pre>
    </div>
  </div>

  <div class="section" id="authentication">
    <h2>Authentication</h2>
    <p>The NOHVEX SDK supports multiple authentication methods:</p>

    <h3>API Key Authentication</h3>
    <div class="code-block">
<pre><code>const nohvex = new NohvexSDK({
  apiKey: 'nohvex_key_...',
  environment: 'production'
});</code></pre>
    </div>

    <h3>JWT Token Authentication</h3>
    <div class="code-block">
<pre><code>const nohvex = new NohvexSDK({
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  environment: 'production'
});</code></pre>
    </div>

    <h3>OAuth2 Flow</h3>
    <div class="code-block">
<pre><code>// Initialize OAuth2 flow
const authUrl = nohvex.auth.getOAuth2Url({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  scopes: ['portfolio:read', 'trading:execute']
});

// Exchange code for token
const tokens = await nohvex.auth.exchangeCode(authCode);</code></pre>
    </div>
  </div>

  <div class="section" id="portfolio">
    <h2>Portfolio Management</h2>
    <p>Comprehensive portfolio management capabilities:</p>

    <div class="method">
      <div class="method-name">portfolio.list(options?)</div>
      <p>Retrieve all portfolios for the authenticated user</p>
      <div class="param">
        <span class="param-name">options</span> <span class="param-type">(object, optional)</span>
        - Filtering and pagination options
      </div>
    </div>

    <div class="code-block">
<pre><code>// Get all portfolios
const portfolios = await nohvex.portfolio.list();

// Get portfolios with filters
const filteredPortfolios = await nohvex.portfolio.list({
  riskLevel: 'moderate',
  page: 1,
  limit: 10
});

// Get portfolio by ID
const portfolio = await nohvex.portfolio.get('portfolio-123');

// Create new portfolio
const newPortfolio = await nohvex.portfolio.create({
  name: 'My DeFi Portfolio',
  description: 'Diversified DeFi investment portfolio',
  riskLevel: 'moderate',
  currency: 'USD'
});

// Update portfolio
const updatedPortfolio = await nohvex.portfolio.update('portfolio-123', {
  name: 'Updated Portfolio Name'
});

// Delete portfolio
await nohvex.portfolio.delete('portfolio-123');</code></pre>
    </div>

    <h3>Portfolio Analytics</h3>
    <div class="code-block">
<pre><code>// Get portfolio analytics
const analytics = await nohvex.portfolio.getAnalytics('portfolio-123', {
  timeRange: '30d',
  includeRisk: true,
  includeBenchmark: true
});

// Get performance metrics
const performance = await nohvex.portfolio.getPerformance('portfolio-123');

// Get risk metrics
const riskMetrics = await nohvex.portfolio.getRiskMetrics('portfolio-123');</code></pre>
    </div>
  </div>

  <div class="section" id="crosschain">
    <h2>Cross-Chain Operations</h2>
    <p>Seamless cross-chain asset transfers and yield optimization:</p>

    <div class="method">
      <div class="method-name">crossChain.findRoutes(params)</div>
      <p>Find optimal routes for cross-chain transfers</p>
    </div>

    <div class="code-block">
<pre><code>// Find cross-chain routes
const routes = await nohvex.crossChain.findRoutes({
  sourceChain: 'ethereum',
  targetChain: 'polygon',
  sourceAsset: 'USDC',
  targetAsset: 'USDC',
  amount: 1000,
  prioritize: 'cost' // or 'time', 'security'
});

// Execute cross-chain transfer
const transfer = await nohvex.crossChain.execute({
  routeId: routes[0].id,
  amount: 1000,
  slippageTolerance: 0.5,
  deadline: Date.now() + 1800000 // 30 minutes
});

// Track transfer status
const status = await nohvex.crossChain.getTransferStatus(transfer.id);

// Get supported chains and assets
const chains = await nohvex.crossChain.getSupportedChains();
const assets = await nohvex.crossChain.getSupportedAssets('ethereum');</code></pre>
    </div>
  </div>

  <div class="section" id="institutional">
    <h2>Institutional Features</h2>
    <p>Advanced features for institutional clients:</p>

    <div class="code-block">
<pre><code>// Get institutional portfolios
const institutionalPortfolios = await nohvex.institutional.getPortfolios({
  institutionId: 'inst-123',
  includeRisk: true,
  includeCompliance: true
});

// Generate compliance report
const complianceReport = await nohvex.institutional.generateComplianceReport({
  portfolioId: 'portfolio-123',
  reportType: 'quarterly',
  includeRiskMetrics: true
});

// Set portfolio limits
await nohvex.institutional.setPortfolioLimits('portfolio-123', {
  maxConcentration: 0.2, // 20% max in single asset
  maxDrawdown: 0.15,     // 15% max drawdown
  rebalanceThreshold: 0.05 // 5% rebalance threshold
});

// Get risk attribution
const riskAttribution = await nohvex.institutional.getRiskAttribution('portfolio-123');</code></pre>
    </div>
  </div>

  <div class="section" id="examples">
    <h2>Complete Examples</h2>

    <h3>Portfolio Dashboard</h3>
    <div class="example">
      <p>Build a complete portfolio dashboard with real-time updates:</p>
    </div>
    <div class="code-block">
<pre><code>import { NohvexSDK } from '@nohvex/sdk';

class PortfolioDashboard {
  constructor(apiKey) {
    this.nohvex = new NohvexSDK({ apiKey });
    this.portfolios = [];
    this.websocket = null;
  }

  async initialize() {
    // Load initial portfolio data
    await this.loadPortfolios();
    
    // Set up real-time updates
    await this.setupRealTimeUpdates();
    
    // Start periodic refresh
    this.startPeriodicRefresh();
  }

  async loadPortfolios() {
    try {
      this.portfolios = await this.nohvex.portfolio.list({
        includeAnalytics: true,
        includeRisk: true
      });
      this.updateUI();
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    }
  }

  async setupRealTimeUpdates() {
    this.websocket = await this.nohvex.websocket.connect({
      topics: ['portfolio.updates', 'price.changes'],
      onMessage: (data) => this.handleRealTimeUpdate(data),
      onError: (error) => console.error('WebSocket error:', error)
    });
  }

  handleRealTimeUpdate(data) {
    if (data.type === 'portfolio.update') {
      this.updatePortfolio(data.portfolioId, data.changes);
    } else if (data.type === 'price.change') {
      this.updatePrices(data.prices);
    }
  }

  updatePortfolio(portfolioId, changes) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      Object.assign(portfolio, changes);
      this.updateUI();
    }
  }

  startPeriodicRefresh() {
    setInterval(async () => {
      await this.loadPortfolios();
    }, 60000); // Refresh every minute
  }

  updateUI() {
    // Update your UI components here
    console.log('Portfolios updated:', this.portfolios);
  }
}</code></pre>
    </div>

    <h3>Cross-Chain Arbitrage Bot</h3>
    <div class="example">
      <p>Example arbitrage bot that finds and executes profitable cross-chain opportunities:</p>
    </div>
    <div class="code-block">
<pre><code>class ArbitrageBot {
  constructor(apiKey) {
    this.nohvex = new NohvexSDK({ apiKey });
    this.isRunning = false;
    this.minProfitThreshold = 50; // $50 minimum profit
  }

  async start() {
    this.isRunning = true;
    console.log('Arbitrage bot started');
    
    while (this.isRunning) {
      try {
        await this.scanForOpportunities();
        await this.sleep(5000); // Check every 5 seconds
      } catch (error) {
        console.error('Bot error:', error);
        await this.sleep(10000); // Wait longer on error
      }
    }
  }

  async scanForOpportunities() {
    const chains = ['ethereum', 'polygon', 'arbitrum', 'optimism'];
    const assets = ['USDC', 'USDT', 'DAI'];

    for (const sourceChain of chains) {
      for (const targetChain of chains) {
        if (sourceChain === targetChain) continue;
        
        for (const asset of assets) {
          await this.checkArbitrageOpportunity(
            sourceChain, 
            targetChain, 
            asset
          );
        }
      }
    }
  }

  async checkArbitrageOpportunity(sourceChain, targetChain, asset) {
    try {
      const routes = await this.nohvex.crossChain.findRoutes({
        sourceChain,
        targetChain,
        sourceAsset: asset,
        targetAsset: asset,
        amount: 10000, // $10k test amount
        prioritize: 'cost'
      });

      if (routes.length === 0) return;

      const bestRoute = routes[0];
      const profit = bestRoute.estimatedOutput - bestRoute.amount - bestRoute.estimatedCost;

      if (profit > this.minProfitThreshold) {
        console.log(\`Opportunity found: \${profit} profit\`);
        await this.executeArbitrage(bestRoute);
      }
    } catch (error) {
      console.error('Error checking arbitrage:', error);
    }
  }

  async executeArbitrage(route) {
    try {
      const transfer = await this.nohvex.crossChain.execute({
        routeId: route.id,
        amount: route.amount,
        slippageTolerance: 1.0,
        deadline: Date.now() + 1800000
      });

      console.log(\`Arbitrage executed: \${transfer.id}\`);
      
      // Monitor execution
      await this.monitorTransfer(transfer.id);
    } catch (error) {
      console.error('Arbitrage execution failed:', error);
    }
  }

  async monitorTransfer(transferId) {
    let status = 'pending';
    
    while (status === 'pending' || status === 'executing') {
      await this.sleep(10000); // Check every 10 seconds
      
      const transfer = await this.nohvex.crossChain.getTransferStatus(transferId);
      status = transfer.status;
      
      console.log(\`Transfer \${transferId} status: \${status}\`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isRunning = false;
    console.log('Arbitrage bot stopped');
  }
}</code></pre>
    </div>

    <h3>Risk Management System</h3>
    <div class="example">
      <p>Comprehensive risk management and monitoring system:</p>
    </div>
    <div class="code-block">
<pre><code>class RiskManager {
  constructor(apiKey) {
    this.nohvex = new NohvexSDK({ apiKey });
    this.riskLimits = {
      maxPortfolioRisk: 75,
      maxConcentration: 20,
      maxDrawdown: 15,
      stopLoss: 10
    };
  }

  async monitorPortfolios() {
    const portfolios = await this.nohvex.portfolio.list();
    
    for (const portfolio of portfolios) {
      await this.assessPortfolioRisk(portfolio.id);
    }
  }

  async assessPortfolioRisk(portfolioId) {
    const riskMetrics = await this.nohvex.portfolio.getRiskMetrics(portfolioId);
    const violations = [];

    // Check risk limits
    if (riskMetrics.overallScore > this.riskLimits.maxPortfolioRisk) {
      violations.push({
        type: 'portfolio_risk',
        value: riskMetrics.overallScore,
        limit: this.riskLimits.maxPortfolioRisk
      });
    }

    if (riskMetrics.concentrationRisk > this.riskLimits.maxConcentration) {
      violations.push({
        type: 'concentration_risk',
        value: riskMetrics.concentrationRisk,
        limit: this.riskLimits.maxConcentration
      });
    }

    // Handle violations
    if (violations.length > 0) {
      await this.handleRiskViolations(portfolioId, violations);
    }
  }

  async handleRiskViolations(portfolioId, violations) {
    console.log(\`Risk violations detected for portfolio \${portfolioId}:\`, violations);
    
    // Send alerts
    await this.sendRiskAlert(portfolioId, violations);
    
    // Auto-rebalance if configured
    if (this.autoRebalanceEnabled) {
      await this.rebalancePortfolio(portfolioId);
    }
  }

  async sendRiskAlert(portfolioId, violations) {
    await this.nohvex.alerts.create({
      type: 'risk_violation',
      portfolioId,
      violations,
      severity: 'high',
      channels: ['email', 'sms', 'webhook']
    });
  }

  async rebalancePortfolio(portfolioId) {
    try {
      const rebalanceResult = await this.nohvex.portfolio.rebalance(portfolioId, {
        strategy: 'risk_reduction',
        maxDeviation: 5,
        executeImmediately: false // Review before execution
      });
      
      console.log('Rebalance plan created:', rebalanceResult);
    } catch (error) {
      console.error('Rebalancing failed:', error);
    }
  }
}</code></pre>
    </div>
  </div>

  <div class="section">
    <h2>Error Handling</h2>
    <p>The SDK provides comprehensive error handling and retry mechanisms:</p>

    <div class="code-block">
<pre><code>import { NohvexError, NetworkError, AuthenticationError } from '@nohvex/sdk';

try {
  const portfolios = await nohvex.portfolio.list();
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Please check your API credentials');
  } else if (error instanceof NetworkError) {
    console.log('Network error, retrying...');
    // Implement retry logic
  } else if (error instanceof NohvexError) {
    console.log('API error:', error.message, error.code);
  } else {
    console.log('Unexpected error:', error);
  }
}</code></pre>
    </div>

    <div class="warning">
      <strong>Note:</strong> Always implement proper error handling in production applications. 
      The SDK automatically retries certain types of failures, but your application should 
      handle authentication errors and rate limiting appropriately.
    </div>
  </div>

  <div class="section">
    <h2>TypeScript Support</h2>
    <p>The SDK is built with TypeScript and provides comprehensive type definitions:</p>

    <div class="code-block">
<pre><code>import { NohvexSDK, Portfolio, RiskMetrics, CrossChainRoute } from '@nohvex/sdk';

const nohvex = new NohvexSDK({ apiKey: 'your-key' });

// Full type safety
const portfolios: Portfolio[] = await nohvex.portfolio.list();
const riskMetrics: RiskMetrics = await nohvex.portfolio.getRiskMetrics('portfolio-123');
const routes: CrossChainRoute[] = await nohvex.crossChain.findRoutes({
  sourceChain: 'ethereum',
  targetChain: 'polygon',
  sourceAsset: 'USDC',
  targetAsset: 'USDC',
  amount: 1000
});</code></pre>
    </div>
  </div>

  <div class="section">
    <h2>Rate Limiting</h2>
    <p>The SDK automatically handles rate limiting with exponential backoff:</p>

    <table>
      <thead>
        <tr>
          <th>Endpoint Category</th>
          <th>Rate Limit</th>
          <th>Burst Limit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Portfolio Management</td>
          <td>100 requests/minute</td>
          <td>20 requests/second</td>
        </tr>
        <tr>
          <td>Cross-Chain Operations</td>
          <td>50 requests/minute</td>
          <td>10 requests/second</td>
        </tr>
        <tr>
          <td>Institutional APIs</td>
          <td>200 requests/minute</td>
          <td>40 requests/second</td>
        </tr>
        <tr>
          <td>Analytics & Reporting</td>
          <td>150 requests/minute</td>
          <td>30 requests/second</td>
        </tr>
      </tbody>
    </table>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-core.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/autoloader/prism-autoloader.min.js"></script>
</body>
</html>
    `

    return new NextResponse(sdkDocumentation, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('SDK documentation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load SDK documentation'
      },
      { status: 500 }
    )
  }
}