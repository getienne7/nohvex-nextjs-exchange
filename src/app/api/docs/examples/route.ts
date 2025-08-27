import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const examplesPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOHVEX API Code Examples</title>
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
    .section {
      background: white;
      padding: 2rem;
      margin-bottom: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .code-block {
      background: #2d3748;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
      overflow-x: auto;
      position: relative;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 1rem;
    }
    .tab {
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      color: #4a5568;
    }
    .tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #4a5568;
      color: #e2e8f0;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      cursor: pointer;
    }
    .nav {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      text-align: center;
    }
    .nav a {
      display: inline-block;
      margin: 0 1rem;
      color: #4299e1;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>NOHVEX API Code Examples</h1>
    <p>Practical examples for integrating with the NOHVEX DeFi Platform</p>
  </div>

  <div class="nav">
    <a href="/api/docs">API Documentation</a>
    <a href="/api/docs/sdk">SDK Guide</a>
    <a href="/api/docs/changelog">Changelog</a>
  </div>

  <div class="section">
    <h2>Authentication & Setup</h2>
    
    <div class="tabs">
      <button class="tab active" onclick="showTab('auth', 'js')">JavaScript</button>
      <button class="tab" onclick="showTab('auth', 'python')">Python</button>
      <button class="tab" onclick="showTab('auth', 'curl')">cURL</button>
    </div>

    <div class="tab-content active" id="auth-js">
      <div class="code-block">
        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
<pre><code>// Setup NOHVEX API client
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.nohvex.com/v1',
  headers: {
    'Authorization': 'Bearer your-api-key-here',
    'Content-Type': 'application/json'
  }
});

// Get portfolios
const portfolios = await api.get('/portfolio');
console.log(portfolios.data.data);</code></pre>
      </div>
    </div>

    <div class="tab-content" id="auth-python">
      <div class="code-block">
<pre><code>import requests

# Setup API client
headers = {
    'Authorization': 'Bearer your-api-key-here',
    'Content-Type': 'application/json'
}

# Get portfolios
response = requests.get(
    'https://api.nohvex.com/v1/portfolio',
    headers=headers
)
portfolios = response.json()['data']</code></pre>
      </div>
    </div>

    <div class="tab-content" id="auth-curl">
      <div class="code-block">
<pre><code># Get portfolios
curl -X GET "https://api.nohvex.com/v1/portfolio" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"</code></pre>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Portfolio Management</h2>
    
    <div class="code-block">
      <button class="copy-btn" onclick="copyCode(this)">Copy</button>
<pre><code>// Create portfolio
const newPortfolio = await api.post('/portfolio', {
  name: 'My DeFi Portfolio',
  description: 'Diversified crypto portfolio',
  riskLevel: 'moderate',
  currency: 'USD'
});

// Get portfolio analytics
const analytics = await api.get(\`/portfolio/\${portfolioId}/analytics?timeRange=30d\`);

// Update portfolio
const updated = await api.put(\`/portfolio/\${portfolioId}\`, {
  name: 'Updated Portfolio Name'
});</code></pre>
    </div>
  </div>

  <div class="section">
    <h2>Cross-Chain Operations</h2>
    
    <div class="code-block">
      <button class="copy-btn" onclick="copyCode(this)">Copy</button>
<pre><code>// Find cross-chain routes
const routes = await api.get('/cross-chain/routes', {
  params: {
    sourceChain: 'ethereum',
    targetChain: 'polygon',
    sourceAsset: 'USDC',
    targetAsset: 'USDC',
    amount: 1000
  }
});

// Execute cross-chain transfer
const transfer = await api.post('/cross-chain/execute', {
  routeId: routes.data.data[0].id,
  amount: 1000,
  slippageTolerance: 0.5
});

// Monitor transfer status
const status = await api.get(\`/cross-chain/status/\${transfer.data.data.id}\`);</code></pre>
    </div>
  </div>

  <div class="section">
    <h2>Real-time Monitoring</h2>
    
    <div class="code-block">
      <button class="copy-btn" onclick="copyCode(this)">Copy</button>
<pre><code>// WebSocket connection for real-time updates
const ws = new WebSocket('wss://api.nohvex.com/v1/websocket');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    topics: ['portfolio.updates', 'price.changes'],
    auth: 'your-api-key-here'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};</code></pre>
    </div>
  </div>

  <div class="section">
    <h2>Yield Optimization</h2>
    
    <div class="code-block">
      <button class="copy-btn" onclick="copyCode(this)">Copy</button>
<pre><code>// Find yield opportunities
const opportunities = await api.get('/yield-optimization/opportunities', {
  params: {
    minAPY: 5,
    maxRisk: 'medium',
    chains: 'ethereum,polygon'
  }
});

// Execute yield strategy
const strategy = await api.post('/yield-optimization/execute', {
  opportunityId: opportunities.data.data[0].id,
  amount: 1000,
  autoCompound: true
});</code></pre>
    </div>
  </div>

  <div class="section">
    <h2>Error Handling</h2>
    
    <div class="code-block">
      <button class="copy-btn" onclick="copyCode(this)">Copy</button>
<pre><code>try {
  const portfolios = await api.get('/portfolio');
  return portfolios.data.data;
} catch (error) {
  if (error.response) {
    // API error
    console.error('API Error:', error.response.data.error);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
  throw error;
}</code></pre>
    </div>
  </div>

  <script>
    function showTab(section, lang) {
      // Hide all tab contents for this section
      const contents = document.querySelectorAll(\`#\${section}-js, #\${section}-python, #\${section}-curl\`);
      contents.forEach(content => content.classList.remove('active'));
      
      // Remove active class from all tabs
      const tabs = document.querySelectorAll(\`.tab\`);
      tabs.forEach(tab => tab.classList.remove('active'));
      
      // Show selected content and activate tab
      document.getElementById(\`\${section}-\${lang}\`).classList.add('active');
      event.target.classList.add('active');
    }

    function copyCode(button) {
      const codeBlock = button.nextElementSibling.textContent;
      navigator.clipboard.writeText(codeBlock).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      });
    }
  </script>
</body>
</html>
    `

    return new NextResponse(examplesPage, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Examples documentation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load examples'
      },
      { status: 500 }
    )
  }
}