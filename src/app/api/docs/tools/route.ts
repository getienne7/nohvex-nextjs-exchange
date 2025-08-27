import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tool = searchParams.get('tool')

    if (tool === 'test-auth') {
      return handleAuthTest(request)
    } else if (tool === 'validate-key') {
      return handleKeyValidation(request)
    } else if (tool === 'generate-example') {
      return handleExampleGeneration(request)
    }

    // Return developer tools interface
    const toolsPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOHVEX API Developer Tools</title>
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
    .tool-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .tool {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #3b82f6;
    }
    .tool h3 {
      margin: 0 0 1rem 0;
      color: #1a202c;
    }
    .tool-form {
      margin: 1rem 0;
    }
    .form-group {
      margin: 1rem 0;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .form-group textarea {
      height: 100px;
      resize: vertical;
    }
    .btn {
      background: #3b82f6;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      margin: 0.25rem 0.25rem 0.25rem 0;
    }
    .btn:hover {
      background: #2563eb;
    }
    .btn-secondary {
      background: #6b7280;
    }
    .btn-secondary:hover {
      background: #4b5563;
    }
    .result {
      background: #f9fafb;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
      font-family: monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    }
    .success {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }
    .error {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
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
    .explorer {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .endpoint-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }
    .endpoint {
      padding: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .endpoint:hover {
      background: #f9fafb;
    }
    .method {
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: bold;
      min-width: 60px;
      text-align: center;
    }
    .method.GET { background: #dcfce7; color: #166534; }
    .method.POST { background: #dbeafe; color: #1e40af; }
    .method.PUT { background: #fef3c7; color: #92400e; }
    .method.DELETE { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>NOHVEX API Developer Tools</h1>
    <p>Testing utilities and interactive tools for API development</p>
  </div>

  <div class="nav">
    <a href="/api/docs">API Documentation</a>
    <a href="/api/docs/sdk">SDK Guide</a>
    <a href="/api/docs/examples">Code Examples</a>
    <a href="/api/docs/changelog">Changelog</a>
  </div>

  <div class="tool-grid">
    <div class="tool">
      <h3>🔐 Authentication Tester</h3>
      <p>Test your API credentials and check authentication status.</p>
      
      <div class="tool-form">
        <div class="form-group">
          <label for="api-key">API Key:</label>
          <input type="password" id="api-key" placeholder="Enter your API key">
        </div>
        <button class="btn" onclick="testAuthentication()">Test Authentication</button>
        <button class="btn btn-secondary" onclick="clearAuth()">Clear</button>
      </div>
      
      <div id="auth-result" class="result" style="display: none;"></div>
    </div>

    <div class="tool">
      <h3>🔑 API Key Validator</h3>
      <p>Validate API key format and check permissions.</p>
      
      <div class="tool-form">
        <div class="form-group">
          <label for="validate-key">API Key to Validate:</label>
          <input type="text" id="validate-key" placeholder="nohvex_key_...">
        </div>
        <button class="btn" onclick="validateApiKey()">Validate Key</button>
      </div>
      
      <div id="validation-result" class="result" style="display: none;"></div>
    </div>

    <div class="tool">
      <h3>📋 Request Builder</h3>
      <p>Build and test API requests interactively.</p>
      
      <div class="tool-form">
        <div class="form-group">
          <label for="request-method">Method:</label>
          <select id="request-method">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div class="form-group">
          <label for="request-endpoint">Endpoint:</label>
          <input type="text" id="request-endpoint" placeholder="/portfolio" value="/portfolio">
        </div>
        <div class="form-group">
          <label for="request-headers">Headers (JSON):</label>
          <textarea id="request-headers" placeholder='{"Content-Type": "application/json"}'>{"Content-Type": "application/json"}</textarea>
        </div>
        <div class="form-group">
          <label for="request-body">Request Body (JSON):</label>
          <textarea id="request-body" placeholder='{"name": "Test Portfolio"}'></textarea>
        </div>
        <button class="btn" onclick="sendRequest()">Send Request</button>
        <button class="btn btn-secondary" onclick="generateCurl()">Generate cURL</button>
      </div>
      
      <div id="request-result" class="result" style="display: none;"></div>
    </div>

    <div class="tool">
      <h3>🎯 Response Inspector</h3>
      <p>Inspect and format API responses.</p>
      
      <div class="tool-form">
        <div class="form-group">
          <label for="response-data">Paste API Response:</label>
          <textarea id="response-data" placeholder="Paste JSON response here..."></textarea>
        </div>
        <button class="btn" onclick="formatResponse()">Format & Inspect</button>
        <button class="btn btn-secondary" onclick="validateJson()">Validate JSON</button>
      </div>
      
      <div id="inspector-result" class="result" style="display: none;"></div>
    </div>

    <div class="tool">
      <h3>⚡ WebSocket Tester</h3>
      <p>Test WebSocket connections and real-time features.</p>
      
      <div class="tool-form">
        <div class="form-group">
          <label for="ws-url">WebSocket URL:</label>
          <input type="text" id="ws-url" value="wss://api.nohvex.com/v1/websocket">
        </div>
        <div class="form-group">
          <label for="ws-topics">Topics to Subscribe:</label>
          <input type="text" id="ws-topics" placeholder="portfolio.updates,price.changes">
        </div>
        <button class="btn" onclick="connectWebSocket()" id="ws-connect">Connect</button>
        <button class="btn btn-secondary" onclick="disconnectWebSocket()" id="ws-disconnect" disabled>Disconnect</button>
      </div>
      
      <div id="ws-result" class="result" style="display: none;">WebSocket not connected</div>
    </div>

    <div class="tool">
      <h3>📊 Rate Limit Monitor</h3>
      <p>Monitor your API usage and rate limits.</p>
      
      <div class="tool-form">
        <button class="btn" onclick="checkRateLimit()">Check Rate Limits</button>
        <button class="btn btn-secondary" onclick="resetRateLimit()">Reset Monitor</button>
      </div>
      
      <div id="ratelimit-result" class="result" style="display: none;"></div>
    </div>
  </div>

  <div class="explorer">
    <h2>📚 API Explorer</h2>
    <p>Browse available endpoints and test them interactively.</p>
    
    <div class="form-group">
      <input type="text" id="endpoint-search" placeholder="Search endpoints..." onkeyup="filterEndpoints()">
    </div>
    
    <div class="endpoint-list" id="endpoint-list">
      <div class="endpoint" onclick="selectEndpoint('GET', '/portfolio')">
        <span class="method GET">GET</span>
        <span>/portfolio</span>
        <span style="flex: 1; color: #6b7280; font-size: 0.8rem;">Get user portfolios</span>
      </div>
      <div class="endpoint" onclick="selectEndpoint('POST', '/portfolio')">
        <span class="method POST">POST</span>
        <span>/portfolio</span>
        <span style="flex: 1; color: #6b7280; font-size: 0.8rem;">Create new portfolio</span>
      </div>
      <div class="endpoint" onclick="selectEndpoint('GET', '/cross-chain/routes')">
        <span class="method GET">GET</span>
        <span>/cross-chain/routes</span>
        <span style="flex: 1; color: #6b7280; font-size: 0.8rem;">Find cross-chain routes</span>
      </div>
      <div class="endpoint" onclick="selectEndpoint('POST', '/cross-chain/execute')">
        <span class="method POST">POST</span>
        <span>/cross-chain/execute</span>
        <span style="flex: 1; color: #6b7280; font-size: 0.8rem;">Execute cross-chain transfer</span>
      </div>
      <div class="endpoint" onclick="selectEndpoint('GET', '/yield-optimization/opportunities')">
        <span class="method GET">GET</span>
        <span>/yield-optimization/opportunities</span>
        <span style="flex: 1; color: #6b7280; font-size: 0.8rem;">Find yield opportunities</span>
      </div>
      <div class="endpoint" onclick="selectEndpoint('GET', '/analytics')">
        <span class="method GET">GET</span>
        <span>/analytics</span>
        <span style="flex: 1; color: #6b7280; font-size: 0.8rem;">Get analytics data</span>
      </div>
    </div>
  </div>

  <script>
    let websocket = null;
    let apiKey = '';

    // Authentication functions
    async function testAuthentication() {
      const key = document.getElementById('api-key').value;
      const result = document.getElementById('auth-result');
      
      if (!key) {
        showResult('auth-result', 'Please enter an API key', 'error');
        return;
      }

      try {
        const response = await fetch('/api/portfolio', {
          headers: {
            'Authorization': \`Bearer \${key}\`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          apiKey = key;
          showResult('auth-result', \`✅ Authentication successful\\n\${JSON.stringify(data, null, 2)}\`, 'success');
        } else {
          showResult('auth-result', \`❌ Authentication failed\\n\${JSON.stringify(data, null, 2)}\`, 'error');
        }
      } catch (error) {
        showResult('auth-result', \`❌ Network error: \${error.message}\`, 'error');
      }
    }

    function clearAuth() {
      document.getElementById('api-key').value = '';
      document.getElementById('auth-result').style.display = 'none';
      apiKey = '';
    }

    // API Key validation
    async function validateApiKey() {
      const key = document.getElementById('validate-key').value;
      
      if (!key) {
        showResult('validation-result', 'Please enter an API key', 'error');
        return;
      }

      // Basic format validation
      if (!key.startsWith('nohvex_')) {
        showResult('validation-result', '❌ Invalid key format. Keys should start with "nohvex_"', 'error');
        return;
      }

      try {
        const response = await fetch('/api/docs/tools?tool=validate-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ apiKey: key })
        });
        
        const result = await response.json();
        showResult('validation-result', JSON.stringify(result, null, 2), response.ok ? 'success' : 'error');
      } catch (error) {
        showResult('validation-result', \`Error: \${error.message}\`, 'error');
      }
    }

    // Request builder
    async function sendRequest() {
      const method = document.getElementById('request-method').value;
      const endpoint = document.getElementById('request-endpoint').value;
      const headers = document.getElementById('request-headers').value;
      const body = document.getElementById('request-body').value;

      try {
        const requestHeaders = JSON.parse(headers);
        if (apiKey) {
          requestHeaders['Authorization'] = \`Bearer \${apiKey}\`;
        }

        const options = {
          method: method,
          headers: requestHeaders
        };

        if (method !== 'GET' && body.trim()) {
          options.body = body;
        }

        const response = await fetch(\`/api\${endpoint}\`, options);
        const data = await response.json();
        
        const result = \`Status: \${response.status} \${response.statusText}\\n\\n\${JSON.stringify(data, null, 2)}\`;
        showResult('request-result', result, response.ok ? 'success' : 'error');
      } catch (error) {
        showResult('request-result', \`Error: \${error.message}\`, 'error');
      }
    }

    function generateCurl() {
      const method = document.getElementById('request-method').value;
      const endpoint = document.getElementById('request-endpoint').value;
      const headers = document.getElementById('request-headers').value;
      const body = document.getElementById('request-body').value;

      try {
        const requestHeaders = JSON.parse(headers);
        if (apiKey) {
          requestHeaders['Authorization'] = \`Bearer \${apiKey}\`;
        }

        let curl = \`curl -X \${method} "https://api.nohvex.com/v1\${endpoint}" \\\\\`;
        
        Object.entries(requestHeaders).forEach(([key, value]) => {
          curl += \`\\n  -H "\${key}: \${value}" \\\\\`;
        });

        if (method !== 'GET' && body.trim()) {
          curl += \`\\n  -d '\${body}'\`;
        } else {
          curl = curl.slice(0, -3); // Remove trailing backslash
        }

        showResult('request-result', curl, 'success');
      } catch (error) {
        showResult('request-result', \`Error generating cURL: \${error.message}\`, 'error');
      }
    }

    // Response inspector
    function formatResponse() {
      const data = document.getElementById('response-data').value;
      
      try {
        const parsed = JSON.parse(data);
        const formatted = JSON.stringify(parsed, null, 2);
        showResult('inspector-result', formatted, 'success');
      } catch (error) {
        showResult('inspector-result', \`Invalid JSON: \${error.message}\`, 'error');
      }
    }

    function validateJson() {
      const data = document.getElementById('response-data').value;
      
      try {
        JSON.parse(data);
        showResult('inspector-result', '✅ Valid JSON', 'success');
      } catch (error) {
        showResult('inspector-result', \`❌ Invalid JSON: \${error.message}\`, 'error');
      }
    }

    // WebSocket tester
    function connectWebSocket() {
      const url = document.getElementById('ws-url').value;
      const topics = document.getElementById('ws-topics').value.split(',').map(t => t.trim());

      try {
        websocket = new WebSocket(url);
        
        websocket.onopen = () => {
          showResult('ws-result', '✅ WebSocket connected', 'success');
          document.getElementById('ws-connect').disabled = true;
          document.getElementById('ws-disconnect').disabled = false;
          
          // Subscribe to topics
          if (topics.length > 0 && topics[0]) {
            websocket.send(JSON.stringify({
              type: 'subscribe',
              topics: topics,
              auth: apiKey
            }));
          }
        };

        websocket.onmessage = (event) => {
          const current = document.getElementById('ws-result').textContent;
          showResult('ws-result', \`\${current}\\n\\n📨 \${new Date().toLocaleTimeString()}: \${event.data}\`, 'success');
        };

        websocket.onerror = (error) => {
          showResult('ws-result', \`❌ WebSocket error: \${error}\`, 'error');
        };

        websocket.onclose = () => {
          showResult('ws-result', '🔌 WebSocket disconnected', '');
          document.getElementById('ws-connect').disabled = false;
          document.getElementById('ws-disconnect').disabled = true;
        };
      } catch (error) {
        showResult('ws-result', \`Error: \${error.message}\`, 'error');
      }
    }

    function disconnectWebSocket() {
      if (websocket) {
        websocket.close();
        websocket = null;
      }
    }

    // Rate limit monitoring
    let requestCount = 0;
    let requestTimes = [];

    async function checkRateLimit() {
      const now = Date.now();
      requestTimes.push(now);
      requestCount++;
      
      // Clean old requests (older than 1 hour)
      requestTimes = requestTimes.filter(time => now - time < 3600000);
      
      try {
        const response = await fetch('/api/health', {
          headers: apiKey ? { 'Authorization': \`Bearer \${apiKey}\` } : {}
        });
        
        const rateLimitInfo = {
          requestsInLastHour: requestTimes.length,
          totalRequests: requestCount,
          lastRequest: new Date().toISOString(),
          headers: Object.fromEntries([
            ['x-ratelimit-limit', response.headers.get('x-ratelimit-limit')],
            ['x-ratelimit-remaining', response.headers.get('x-ratelimit-remaining')],
            ['x-ratelimit-reset', response.headers.get('x-ratelimit-reset')]
          ].filter(([_, value]) => value !== null))
        };
        
        showResult('ratelimit-result', JSON.stringify(rateLimitInfo, null, 2), 'success');
      } catch (error) {
        showResult('ratelimit-result', \`Error: \${error.message}\`, 'error');
      }
    }

    function resetRateLimit() {
      requestCount = 0;
      requestTimes = [];
      showResult('ratelimit-result', 'Rate limit monitor reset', 'success');
    }

    // Utility functions
    function showResult(elementId, content, type) {
      const element = document.getElementById(elementId);
      element.textContent = content;
      element.style.display = 'block';
      element.className = \`result \${type}\`;
    }

    function selectEndpoint(method, path) {
      document.getElementById('request-method').value = method;
      document.getElementById('request-endpoint').value = path;
    }

    function filterEndpoints() {
      const search = document.getElementById('endpoint-search').value.toLowerCase();
      const endpoints = document.querySelectorAll('.endpoint');
      
      endpoints.forEach(endpoint => {
        const text = endpoint.textContent.toLowerCase();
        endpoint.style.display = text.includes(search) ? 'flex' : 'none';
      });
    }
  </script>
</body>
</html>
    `

    return new NextResponse(toolsPage, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Developer tools error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load developer tools'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tool = searchParams.get('tool')
    const body = await request.json()

    if (tool === 'validate-key') {
      return handleKeyValidation(request, body)
    }

    return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
  } catch (error) {
    console.error('Developer tools POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Tool execution failed'
      },
      { status: 500 }
    )
  }
}

// Helper functions
async function handleAuthTest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      success: false,
      error: 'Missing or invalid authorization header'
    }, { status: 401 })
  }

  const token = authHeader.substring(7)
  
  // Basic token validation (in real implementation, validate against database)
  if (token.startsWith('nohvex_')) {
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      tokenInfo: {
        type: 'API Key',
        prefix: token.substring(0, 10) + '...',
        permissions: ['portfolio:read', 'portfolio:write', 'cross-chain:execute']
      }
    })
  }

  return NextResponse.json({
    success: false,
    error: 'Invalid token format'
  }, { status: 401 })
}

async function handleKeyValidation(request: NextRequest, body?: any) {
  const apiKey = body?.apiKey || request.headers.get('x-api-key')
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'API key is required'
    }, { status: 400 })
  }

  // Validate key format
  const validation: {
    format: string
    length: number
    environment: string
    permissions: string[]
    rateLimit: string
    status: string
  } = {
    format: apiKey.startsWith('nohvex_') ? 'valid' : 'invalid',
    length: apiKey.length,
    environment: apiKey.includes('test_') ? 'test' : 'production',
    permissions: [],
    rateLimit: '1000 requests/hour',
    status: 'active'
  }

  if (validation.format === 'valid') {
    validation.permissions = ['portfolio:read', 'portfolio:write', 'cross-chain:execute', 'analytics:read']
  }

  return NextResponse.json({
    success: validation.format === 'valid',
    validation,
    message: validation.format === 'valid' ? 'API key is valid' : 'API key format is invalid'
  })
}

async function handleExampleGeneration(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const language = searchParams.get('language') || 'javascript'

  // Generate example code for specific endpoint
  const examples: Record<string, Record<string, string>> = {
    '/portfolio': {
      javascript: `
const response = await fetch('/api/portfolio', {
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  }
});
const portfolios = await response.json();
      `,
      python: `
import requests

response = requests.get(
    'https://api.nohvex.com/v1/portfolio',
    headers={
        'Authorization': 'Bearer your-api-key',
        'Content-Type': 'application/json'
    }
)
portfolios = response.json()
      `
    }
  }

  const example = examples[endpoint || '/portfolio']?.[language] || 'Example not available'

  return NextResponse.json({
    success: true,
    example: example.trim(),
    endpoint,
    language
  })
}