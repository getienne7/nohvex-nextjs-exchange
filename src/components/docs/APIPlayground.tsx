'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  PlayIcon,
  StopIcon,
  ClipboardDocumentIcon,
  KeyIcon,
  CogIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers: Record<string, string>
  body?: string
  timestamp?: number
}

interface APIResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: any
  responseTime: number
  timestamp: number
}

interface RequestHistory {
  id: string
  request: APIRequest
  response?: APIResponse
  error?: string
}

export default function APIPlayground() {
  const [activeTab, setActiveTab] = useState<'playground' | 'history' | 'settings'>('playground')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET')
  const [url, setUrl] = useState('http://localhost:3000/api/portfolio')
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  })
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState<APIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<RequestHistory[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [jwtToken, setJwtToken] = useState('')
  
  const responseRef = useRef<HTMLPreElement>(null)

  const predefinedEndpoints = [
    { name: 'Get Portfolios', method: 'GET', url: '/api/portfolio' },
    { name: 'Create Portfolio', method: 'POST', url: '/api/portfolio' },
    { name: 'Cross-Chain Routes', method: 'GET', url: '/api/cross-chain/routes' },
    { name: 'Yield Opportunities', method: 'GET', url: '/api/cross-chain/yield' },
    { name: 'Institutional Portfolios', method: 'GET', url: '/api/institutional/portfolios' },
    { name: 'Analytics', method: 'GET', url: '/api/cross-chain/analytics' }
  ]

  const sampleBodies = {
    'POST /api/portfolio': {
      name: 'My DeFi Portfolio',
      description: 'A diversified cryptocurrency portfolio',
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
        }
      ]
    },
    'POST /api/cross-chain/routes': {
      sourceChain: 'ethereum',
      targetChain: 'polygon',
      sourceAsset: 'USDC',
      targetAsset: 'USDC',
      amount: 1000,
      userId: 'user-123'
    }
  }

  const executeRequest = async () => {
    if (!url.trim()) {
      setError('URL is required')
      return
    }

    setIsLoading(true)
    setError(null)
    setResponse(null)

    const startTime = Date.now()
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const requestConfig: APIRequest = {
      method,
      url,
      headers: { ...headers },
      timestamp: startTime
    }

    if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
      requestConfig.body = requestBody
    }

    try {
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: requestConfig.headers
      }

      if (requestConfig.body) {
        fetchOptions.body = requestConfig.body
      }

      // Execute the request
      const fetchResponse = await fetch(url, fetchOptions)
      const responseTime = Date.now() - startTime
      
      let responseBody
      const contentType = fetchResponse.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        responseBody = await fetchResponse.json()
      } else {
        responseBody = await fetchResponse.text()
      }

      const apiResponse: APIResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: Object.fromEntries(fetchResponse.headers.entries()),
        body: responseBody,
        responseTime,
        timestamp: Date.now()
      }

      setResponse(apiResponse)

      // Add to history
      const historyEntry: RequestHistory = {
        id: requestId,
        request: requestConfig,
        response: apiResponse
      }
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]) // Keep last 20 requests

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)

      // Add error to history
      const historyEntry: RequestHistory = {
        id: requestId,
        request: requestConfig,
        error: errorMessage
      }
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)])
    } finally {
      setIsLoading(false)
    }
  }

  const loadPredefinedEndpoint = (endpoint: typeof predefinedEndpoints[0]) => {
    setMethod(endpoint.method as any)
    setUrl(`http://localhost:3000${endpoint.url}`)
    
    const bodyKey = `${endpoint.method} ${endpoint.url}`
    if (sampleBodies[bodyKey as keyof typeof sampleBodies]) {
      setRequestBody(JSON.stringify(sampleBodies[bodyKey as keyof typeof sampleBodies], null, 2))
    } else {
      setRequestBody('')
    }
  }

  const loadFromHistory = (entry: RequestHistory) => {
    setMethod(entry.request.method)
    setUrl(entry.request.url)
    setHeaders(entry.request.headers)
    setRequestBody(entry.request.body || '')
    setActiveTab('playground')
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.body, null, 2))
    }
  }

  const updateHeader = (key: string, value: string) => {
    setHeaders(prev => ({ ...prev, [key]: value }))
  }

  const removeHeader = (key: string) => {
    setHeaders(prev => {
      const newHeaders = { ...prev }
      delete newHeaders[key]
      return newHeaders
    })
  }

  const addHeader = () => {
    const key = prompt('Header name:')
    const value = prompt('Header value:')
    if (key && value) {
      updateHeader(key, value)
    }
  }

  const updateAuth = () => {
    if (jwtToken) {
      updateHeader('Authorization', `Bearer ${jwtToken}`)
    }
    if (apiKey) {
      updateHeader('X-API-Key', apiKey)
    }
    setShowAuthModal(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <PlayIcon className="h-6 w-6" />
              API Playground
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('playground')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'playground' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Playground
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                History ({history.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Request Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Request</h2>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <KeyIcon className="h-4 w-4" />
                    Auth
                  </button>
                </div>

                {/* Predefined Endpoints */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedEndpoints.map((endpoint, index) => (
                      <button
                        key={index}
                        onClick={() => loadPredefinedEndpoint(endpoint)}
                        className="text-left px-3 py-2 bg-slate-700 rounded text-sm hover:bg-slate-600 transition-colors"
                      >
                        <div className="font-medium">{endpoint.name}</div>
                        <div className="text-xs text-gray-400">{endpoint.method} {endpoint.url}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method and URL */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Endpoint
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value as any)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter API endpoint URL"
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Headers */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">Headers</label>
                    <button
                      onClick={addHeader}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      + Add Header
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(headers).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value
                            const newHeaders = { ...headers }
                            delete newHeaders[key]
                            newHeaders[newKey] = value
                            setHeaders(newHeaders)
                          }}
                          className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateHeader(key, e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                        />
                        <button
                          onClick={() => removeHeader(key)}
                          className="px-2 py-1 text-red-400 hover:text-red-300"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Body */}
                {['POST', 'PUT', 'PATCH'].includes(method) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Request Body (JSON)
                    </label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder="Enter JSON request body"
                      rows={8}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                )}

                {/* Execute Button */}
                <button
                  onClick={executeRequest}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <StopIcon className="h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      Execute Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Response Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Response</h2>
                  {response && (
                    <button
                      onClick={copyResponse}
                      className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      Copy
                    </button>
                  )}
                </div>

                {/* Response Status */}
                {(response || error) && (
                  <div className="mb-4 p-3 rounded-lg border">
                    {response && (
                      <div className={`border-l-4 pl-3 ${
                        response.status >= 200 && response.status < 300 
                          ? 'border-green-500 bg-green-500/10' 
                          : response.status >= 400 
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-yellow-500 bg-yellow-500/10'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {response.status >= 200 && response.status < 300 ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">
                            {response.status} {response.statusText}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <ClockIcon className="h-3 w-3" />
                            {response.responseTime}ms
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="border-l-4 border-red-500 bg-red-500/10 pl-3">
                        <div className="flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-red-400">Request Failed</span>
                        </div>
                        <p className="text-red-300 text-sm mt-1">{error}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Response Body */}
                <div className="bg-slate-900 rounded-lg p-4 min-h-[300px]">
                  {response ? (
                    <pre
                      ref={responseRef}
                      className="text-sm text-gray-300 overflow-auto whitespace-pre-wrap"
                    >
                      {JSON.stringify(response.body, null, 2)}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      {isLoading ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p>Executing request...</p>
                        </div>
                      ) : (
                        <p>Response will appear here</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Request History</h2>
            
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No requests in history yet</p>
                <p className="text-sm">Execute some API requests to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors cursor-pointer"
                    onClick={() => loadFromHistory(entry)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          entry.request.method === 'GET' ? 'bg-green-600' :
                          entry.request.method === 'POST' ? 'bg-blue-600' :
                          entry.request.method === 'PUT' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}>
                          {entry.request.method}
                        </span>
                        <span className="font-mono text-sm text-gray-300">{entry.request.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.response ? (
                          <span className={`text-sm ${
                            entry.response.status >= 200 && entry.response.status < 300 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {entry.response.status}
                          </span>
                        ) : entry.error ? (
                          <span className="text-red-400 text-sm">Error</span>
                        ) : null}
                        <span className="text-xs text-gray-500">
                          {new Date(entry.request.timestamp || 0).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    {entry.error && (
                      <p className="text-red-400 text-sm">{entry.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Authentication</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">JWT Token</label>
                    <input
                      type="password"
                      value={jwtToken}
                      onChange={(e) => setJwtToken(e.target.value)}
                      placeholder="Enter JWT token"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter API key"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={updateAuth}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Authentication
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">History</h3>
                <button
                  onClick={() => setHistory([])}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={history.length === 0}
                >
                  Clear History
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Authentication</h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">JWT Token</label>
                <input
                  type="password"
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                  placeholder="Enter JWT token"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={updateAuth}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}