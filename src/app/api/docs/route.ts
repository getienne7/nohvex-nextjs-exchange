import { NextRequest, NextResponse } from 'next/server'
import { apiDocGenerator } from '@/lib/api-documentation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    // If format is specified, return the raw API spec
    if (format) {
      let content: string
      let contentType: string

      if (format === 'yaml') {
        content = apiDocGenerator.exportAsYAML()
        contentType = 'application/x-yaml'
      } else if (format === 'json') {
        content = apiDocGenerator.exportAsJSON()
        contentType = 'application/json'
      } else {
        return NextResponse.json({ error: 'Unsupported format. Use json or yaml.' }, { status: 400 })
      }

      return new NextResponse(content, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="nohvex-api.${format}"`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    // Return Swagger UI HTML
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOHVEX API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      background-color: #1f2937;
      border-bottom: 1px solid #374151;
    }
    .swagger-ui .topbar .download-url-wrapper .select-label {
      color: #e5e7eb;
    }
    .swagger-ui .topbar .download-url-wrapper input[type=text] {
      background: #374151;
      border: 1px solid #4b5563;
      color: #e5e7eb;
    }
    .swagger-ui .topbar .download-url-wrapper .download-url-button {
      background: #3b82f6;
      color: white;
    }
    .swagger-ui .info {
      margin: 50px 0;
    }
    .swagger-ui .info .title {
      color: #1f2937;
      font-size: 36px;
    }
    .swagger-ui .info .description {
      color: #4b5563;
      font-size: 16px;
    }
    .custom-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
      margin-bottom: 2rem;
    }
    .custom-header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: bold;
    }
    .custom-header p {
      margin: 0.5rem 0 0 0;
      font-size: 1.2rem;
      opacity: 0.9;
    }
    .quick-links {
      background: white;
      padding: 1rem;
      margin: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .quick-links h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
    }
    .quick-links a {
      display: inline-block;
      margin: 0.25rem 0.5rem 0.25rem 0;
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      color: #374151;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }
    .quick-links a:hover {
      background: #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>NOHVEX DeFi Platform API</h1>
    <p>Comprehensive API for decentralized finance portfolio management</p>
  </div>
  
  <div class="quick-links">
    <h3>Quick Links</h3>
    <a href="/api/docs?format=json" target="_blank">Download OpenAPI JSON</a>
    <a href="/api/docs?format=yaml" target="_blank">Download OpenAPI YAML</a>
    <a href="/api/docs/sdk" target="_blank">SDK Documentation</a>
    <a href="/api/docs/examples" target="_blank">Code Examples</a>
    <a href="/api/docs/changelog" target="_blank">API Changelog</a>
    <a href="/api/health" target="_blank">API Health Check</a>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api/docs/openapi?format=json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Add API key or auth token if available
          const token = localStorage.getItem('nohvex_auth_token');
          if (token) {
            request.headers['Authorization'] = 'Bearer ' + token;
          }
          return request;
        },
        responseInterceptor: function(response) {
          // Log API responses for debugging
          console.log('API Response:', response);
          return response;
        },
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        displayOperationId: true,
        showExtensions: true,
        showCommonExtensions: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        validatorUrl: null,
        oauth2RedirectUrl: window.location.origin + '/api/docs/oauth2-redirect.html'
      })

      // Custom styling and behavior
      window.ui = ui;
      
      // Add authentication helper
      setTimeout(() => {
        addAuthenticationHelper();
      }, 2000);
    }

    function addAuthenticationHelper() {
      const topbar = document.querySelector('.swagger-ui .topbar');
      if (topbar && !document.querySelector('.auth-helper')) {
        const authHelper = document.createElement('div');
        authHelper.className = 'auth-helper';
        authHelper.style.cssText = 'position: absolute; right: 20px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 10px;';
        
        const authInput = document.createElement('input');
        authInput.type = 'password';
        authInput.placeholder = 'API Token';
        authInput.style.cssText = 'padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px; background: #374151; color: #e5e7eb; border-color: #4b5563;';
        
        const authButton = document.createElement('button');
        authButton.textContent = 'Set Auth';
        authButton.style.cssText = 'padding: 5px 15px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;';
        
        authButton.onclick = () => {
          if (authInput.value) {
            localStorage.setItem('nohvex_auth_token', authInput.value);
            alert('Authentication token set!');
          } else {
            localStorage.removeItem('nohvex_auth_token');
            alert('Authentication token removed!');
          }
        };
        
        authHelper.appendChild(authInput);
        authHelper.appendChild(authButton);
        topbar.appendChild(authHelper);
      }
    }
  </script>
</body>
</html>
    `

    return new NextResponse(swaggerHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('API documentation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load API documentation'
      },
      { status: 500 }
    )
  }
}