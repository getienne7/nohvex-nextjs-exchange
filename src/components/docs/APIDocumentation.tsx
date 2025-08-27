'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CodeBracketIcon, 
  DocumentTextIcon, 
  PlayIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { apiDocGenerator } from '@/lib/api-documentation'

interface APIEndpointDisplay {
  method: string
  path: string
  summary: string
  description: string
  tags: string[]
  expanded?: boolean
}

export default function APIDocumentation() {
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set())
  const [apiSpec, setApiSpec] = useState<any>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  useEffect(() => {
    const spec = apiDocGenerator.generateOpenAPISpec()
    setApiSpec(spec)
  }, [])

  const endpoints: APIEndpointDisplay[] = apiSpec ? Object.entries(apiSpec.paths).flatMap(([path, methods]: [string, any]) =>
    Object.entries(methods).map(([method, details]: [string, any]) => ({
      method: method.toUpperCase(),
      path,
      summary: details.summary || '',
      description: details.description || '',
      tags: details.tags || [],
      parameters: details.parameters || [],
      requestBody: details.requestBody,
      responses: details.responses || {}
    }))
  ) : []

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesTag = selectedTag === 'all' || endpoint.tags.includes(selectedTag)
    const matchesSearch = !searchQuery || 
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesTag && matchesSearch
  })

  const toggleEndpoint = (endpointKey: string) => {
    const newExpanded = new Set(expandedEndpoints)
    if (newExpanded.has(endpointKey)) {
      newExpanded.delete(endpointKey)
    } else {
      newExpanded.add(endpointKey)
    }
    setExpandedEndpoints(newExpanded)
  }

  const testEndpoint = async (endpoint: APIEndpointDisplay) => {
    const endpointKey = `${endpoint.method}-${endpoint.path}`
    setTestResults(prev => ({ ...prev, [endpointKey]: { status: 'testing' } }))

    // Simulate API testing
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate for demo
      setTestResults(prev => ({ 
        ...prev, 
        [endpointKey]: { 
          status: success ? 'success' : 'error',
          responseTime: Math.floor(Math.random() * 500) + 100,
          statusCode: success ? 200 : 400,
          response: success ? { success: true, data: 'Mock response' } : { error: 'Mock error' }
        } 
      }))
    }, 1000 + Math.random() * 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-500'
      case 'POST': return 'bg-blue-500'
      case 'PUT': return 'bg-yellow-500'
      case 'DELETE': return 'bg-red-500'
      case 'PATCH': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  if (!apiSpec) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading API Documentation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <DocumentTextIcon className="h-8 w-8" />
                API Documentation
              </h1>
              <p className="text-gray-400 mt-2">
                {apiSpec.info.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Version: {apiSpec.info.version}</span>
                <span>•</span>
                <span>{endpoints.length} Endpoints</span>
                <span>•</span>
                <span>{apiSpec.tags?.length} Categories</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(apiDocGenerator.exportAsJSON())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                Export JSON
              </button>
              <button
                onClick={() => copyToClipboard(apiDocGenerator.exportAsYAML())}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                Export YAML
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800 rounded-xl p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold text-white mb-4">API Categories</h3>
              
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tag Filter */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTag === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  All Endpoints ({endpoints.length})
                </button>
                {apiSpec.tags?.map((tag: any) => {
                  const count = endpoints.filter(e => e.tags.includes(tag.name)).length
                  return (
                    <button
                      key={tag.name}
                      onClick={() => setSelectedTag(tag.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedTag === tag.name 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {tag.name} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Server Info */}
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3">API Servers</h4>
                <div className="space-y-2">
                  {apiSpec.servers?.map((server: any, index: number) => (
                    <div key={index} className="text-xs">
                      <div className="text-blue-400 font-mono">{server.url}</div>
                      <div className="text-gray-500">{server.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {filteredEndpoints.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 text-center">
                  <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No endpoints found</h3>
                  <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                filteredEndpoints.map((endpoint, index) => {
                  const endpointKey = `${endpoint.method}-${endpoint.path}`
                  const isExpanded = expandedEndpoints.has(endpointKey)
                  const testResult = testResults[endpointKey]

                  return (
                    <div key={endpointKey} className="bg-slate-800 rounded-xl overflow-hidden">
                      {/* Endpoint Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-slate-750 transition-colors"
                        onClick={() => toggleEndpoint(endpointKey)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                              )}
                              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </span>
                            </div>
                            <div>
                              <div className="font-mono text-sm text-white">{endpoint.path}</div>
                              <div className="text-sm text-gray-400">{endpoint.summary}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {endpoint.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-slate-700 text-xs text-gray-300 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {testResult && (
                              <div className="flex items-center gap-1">
                                {testResult.status === 'testing' && (
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                )}
                                {testResult.status === 'success' && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                )}
                                {testResult.status === 'error' && (
                                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                )}
                                {testResult.responseTime && (
                                  <span className="text-xs text-gray-400">
                                    {testResult.responseTime}ms
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-700"
                        >
                          <div className="p-6 space-y-6">
                            {/* Description */}
                            <div>
                              <h4 className="text-sm font-medium text-white mb-2">Description</h4>
                              <p className="text-gray-400">{endpoint.description}</p>
                            </div>

                            {/* Parameters */}
                            {endpoint.parameters && endpoint.parameters.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-3">Parameters</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-slate-600">
                                        <th className="text-left text-gray-400 py-2">Name</th>
                                        <th className="text-left text-gray-400 py-2">Type</th>
                                        <th className="text-left text-gray-400 py-2">Required</th>
                                        <th className="text-left text-gray-400 py-2">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {endpoint.parameters.map((param: any, i: number) => (
                                        <tr key={i} className="border-b border-slate-700">
                                          <td className="py-2 font-mono text-blue-400">{param.name}</td>
                                          <td className="py-2 text-gray-300">{param.schema?.type || 'string'}</td>
                                          <td className="py-2">
                                            {param.required ? (
                                              <span className="text-red-400">Required</span>
                                            ) : (
                                              <span className="text-gray-500">Optional</span>
                                            )}
                                          </td>
                                          <td className="py-2 text-gray-400">{param.description}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Request Body */}
                            {endpoint.requestBody && (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-3">Request Body</h4>
                                <div className="bg-slate-900 rounded-lg p-4">
                                  <pre className="text-sm text-gray-300 overflow-x-auto">
                                    {JSON.stringify(endpoint.requestBody.content?.['application/json']?.schema, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Responses */}
                            <div>
                              <h4 className="text-sm font-medium text-white mb-3">Responses</h4>
                              <div className="space-y-3">
                                {Object.entries(endpoint.responses).map(([code, response]: [string, any]) => (
                                  <div key={code} className="border border-slate-600 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        code.startsWith('2') ? 'bg-green-600 text-white' :
                                        code.startsWith('4') ? 'bg-yellow-600 text-white' :
                                        'bg-red-600 text-white'
                                      }`}>
                                        {code}
                                      </span>
                                      <span className="text-gray-400">{response.description}</span>
                                    </div>
                                    {response.content && (
                                      <pre className="text-xs text-gray-300 bg-slate-900 rounded p-2 overflow-x-auto">
                                        {JSON.stringify(response.content['application/json']?.schema, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Test Button */}
                            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                              <button
                                onClick={() => testEndpoint(endpoint)}
                                disabled={testResult?.status === 'testing'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                              >
                                <PlayIcon className="h-4 w-4" />
                                {testResult?.status === 'testing' ? 'Testing...' : 'Test Endpoint'}
                              </button>
                              
                              {testResult && testResult.status !== 'testing' && (
                                <div className="text-sm">
                                  <span className={`font-medium ${
                                    testResult.status === 'success' ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {testResult.status === 'success' ? 'Success' : 'Error'} - {testResult.statusCode}
                                  </span>
                                  <span className="text-gray-400 ml-2">
                                    {testResult.responseTime}ms
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Test Results */}
                            {testResult && testResult.response && (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-2">Response</h4>
                                <pre className="text-sm text-gray-300 bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                  {JSON.stringify(testResult.response, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}