import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const changelogPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOHVEX API Changelog</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
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
    .version {
      background: white;
      padding: 2rem;
      margin-bottom: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #3b82f6;
    }
    .version h2 {
      margin: 0 0 1rem 0;
      color: #1a202c;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .version-tag {
      background: #3b82f6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .date {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .changes {
      margin: 1rem 0;
    }
    .change-type {
      margin: 1rem 0;
    }
    .change-type h4 {
      margin: 0.5rem 0;
      color: #374151;
      font-size: 1rem;
    }
    .change-list {
      margin: 0;
      padding-left: 1.5rem;
    }
    .change-list li {
      margin: 0.5rem 0;
      color: #4b5563;
    }
    .breaking {
      border-left-color: #ef4444;
    }
    .breaking .version-tag {
      background: #ef4444;
    }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-right: 0.5rem;
    }
    .badge.added { background: #d1fae5; color: #065f46; }
    .badge.changed { background: #dbeafe; color: #1e40af; }
    .badge.deprecated { background: #fef3c7; color: #92400e; }
    .badge.removed { background: #fee2e2; color: #991b1b; }
    .badge.fixed { background: #f3e8ff; color: #6b21a8; }
    .badge.security { background: #fecaca; color: #7f1d1d; }
    .summary {
      background: #f0f9ff;
      border: 1px solid #7dd3fc;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .summary h3 {
      margin: 0 0 0.5rem 0;
      color: #0c4a6e;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>NOHVEX API Changelog</h1>
    <p>Track API updates, new features, and breaking changes</p>
  </div>

  <div class="nav">
    <a href="/api/docs">API Documentation</a>
    <a href="/api/docs/sdk">SDK Guide</a>
    <a href="/api/docs/examples">Code Examples</a>
  </div>

  <div class="summary">
    <h3>Current API Version: v1.2.0</h3>
    <p>The NOHVEX API follows semantic versioning. Major version changes may include breaking changes.</p>
  </div>

  <div class="version">
    <h2>
      Version 1.2.0
      <span class="version-tag">Latest</span>
    </h2>
    <div class="date">Released on December 20, 2024</div>
    
    <div class="changes">
      <div class="change-type">
        <h4><span class="badge added">Added</span>New Features</h4>
        <ul class="change-list">
          <li>Enhanced institutional portfolio management with compliance reporting</li>
          <li>Advanced DeFi strategy execution and automation</li>
          <li>Cross-chain yield optimization with 15+ protocols</li>
          <li>Real-time WebSocket connections for portfolio monitoring</li>
          <li>Multi-chain arbitrage detection and execution</li>
          <li>Comprehensive risk metrics and attribution analysis</li>
        </ul>
      </div>

      <div class="change-type">
        <h4><span class="badge changed">Changed</span>Improvements</h4>
        <ul class="change-list">
          <li>Portfolio analytics now include 90-day performance attribution</li>
          <li>Cross-chain routing optimized for lower fees and faster execution</li>
          <li>Enhanced security features with advanced session management</li>
          <li>Improved error handling with detailed error codes</li>
          <li>Rate limiting increased for institutional clients</li>
        </ul>
      </div>

      <div class="change-type">
        <h4><span class="badge fixed">Fixed</span>Bug Fixes</h4>
        <ul class="change-list">
          <li>Fixed issue with cross-chain route estimation accuracy</li>
          <li>Resolved WebSocket connection stability issues</li>
          <li>Fixed portfolio rebalancing calculation edge cases</li>
          <li>Corrected timezone handling in analytics endpoints</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="version">
    <h2>Version 1.1.5</h2>
    <div class="date">Released on December 10, 2024</div>
    
    <div class="changes">
      <div class="change-type">
        <h4><span class="badge added">Added</span>New Features</h4>
        <ul class="change-list">
          <li>Added support for Arbitrum and Optimism networks</li>
          <li>New endpoint for yield farming opportunity discovery</li>
          <li>Enhanced portfolio risk assessment algorithms</li>
        </ul>
      </div>

      <div class="change-type">
        <h4><span class="badge security">Security</span>Security Updates</h4>
        <ul class="change-list">
          <li>Implemented advanced rate limiting per endpoint</li>
          <li>Added request signature validation for sensitive operations</li>
          <li>Enhanced API key rotation capabilities</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="version">
    <h2>Version 1.1.0</h2>
    <div class="date">Released on November 28, 2024</div>
    
    <div class="changes">
      <div class="change-type">
        <h4><span class="badge added">Added</span>New Features</h4>
        <ul class="change-list">
          <li>Cross-chain bridge aggregation with 10+ protocols</li>
          <li>Real-time price feeds and portfolio monitoring</li>
          <li>Advanced trading interface with limit orders</li>
          <li>Institutional-grade compliance and reporting tools</li>
        </ul>
      </div>

      <div class="change-type">
        <h4><span class="badge changed">Changed</span>Breaking Changes</h4>
        <ul class="change-list">
          <li>Portfolio creation now requires explicit risk level specification</li>
          <li>Authentication endpoint moved from /auth to /user/auth</li>
          <li>Asset allocation percentages now returned as decimals (0.15 instead of 15)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="version breaking">
    <h2>
      Version 1.0.0
      <span class="version-tag">Breaking</span>
    </h2>
    <div class="date">Released on November 15, 2024</div>
    
    <div class="changes">
      <div class="change-type">
        <h4><span class="badge added">Added</span>Initial Release</h4>
        <ul class="change-list">
          <li>Complete portfolio management API</li>
          <li>Basic cross-chain functionality</li>
          <li>User authentication and authorization</li>
          <li>Core analytics and reporting</li>
          <li>WebSocket support for real-time updates</li>
        </ul>
      </div>

      <div class="change-type">
        <h4><span class="badge changed">Changed</span>API Structure</h4>
        <ul class="change-list">
          <li>Standardized all response formats to include success/error flags</li>
          <li>Implemented consistent pagination across all list endpoints</li>
          <li>Added comprehensive error codes and messages</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="version">
    <h2>Version 0.9.0-beta</h2>
    <div class="date">Released on October 30, 2024</div>
    
    <div class="changes">
      <div class="change-type">
        <h4><span class="badge added">Added</span>Beta Features</h4>
        <ul class="change-list">
          <li>Beta portfolio management endpoints</li>
          <li>Initial cross-chain bridge integration</li>
          <li>Basic user management and authentication</li>
          <li>Preliminary analytics endpoints</li>
        </ul>
      </div>

      <div class="change-type">
        <h4><span class="badge deprecated">Deprecated</span>Deprecated</h4>
        <ul class="change-list">
          <li>Legacy v0 endpoints (removed in v1.0.0)</li>
          <li>Basic authentication method (replaced with JWT)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="section" style="background: white; padding: 2rem; border-radius: 8px; margin-top: 2rem;">
    <h2>Migration Guides</h2>
    
    <h3>Migrating from v1.0 to v1.1</h3>
    <p><strong>Breaking Changes:</strong></p>
    <ul>
      <li>Update portfolio creation calls to include <code>riskLevel</code> parameter</li>
      <li>Change authentication endpoint from <code>/auth</code> to <code>/user/auth</code></li>
      <li>Update allocation percentage handling (divide by 100 if using old format)</li>
    </ul>

    <h3>Rate Limits</h3>
    <p>Current rate limits by plan:</p>
    <ul>
      <li><strong>Free:</strong> 100 requests/hour</li>
      <li><strong>Pro:</strong> 1,000 requests/hour</li>
      <li><strong>Enterprise:</strong> 10,000 requests/hour</li>
      <li><strong>Institutional:</strong> Custom limits available</li>
    </ul>

    <h3>Support</h3>
    <p>For questions about API changes or migration assistance:</p>
    <ul>
      <li>Email: <a href="mailto:api-support@nohvex.com">api-support@nohvex.com</a></li>
      <li>Documentation: <a href="/api/docs">Full API Documentation</a></li>
      <li>Discord: <a href="#">NOHVEX Developer Community</a></li>
    </ul>
  </div>
</body>
</html>
    `

    return new NextResponse(changelogPage, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Changelog documentation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load changelog'
      },
      { status: 500 }
    )
  }
}