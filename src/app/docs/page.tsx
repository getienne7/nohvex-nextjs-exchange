'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  PlayIcon, 
  CodeBracketIcon,
  BookOpenIcon,
  CubeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import APIDocumentation from '@/components/docs/APIDocumentation'
import APIPlayground from '@/components/docs/APIPlayground'

type TabType = 'overview' | 'documentation' | 'playground' | 'sdk'

export default function APIDocsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BookOpenIcon },
    { id: 'documentation', name: 'API Reference', icon: DocumentTextIcon },
    { id: 'playground', name: 'API Playground', icon: PlayIcon },
    { id: 'sdk', name: 'SDK & Tools', icon: CubeIcon }
  ]

  const quickLinks = [
    { name: 'Portfolio Management', path: '/api/portfolio', method: 'GET' },
    { name: 'Cross-Chain Routing', path: '/api/cross-chain/routes', method: 'GET' },
    { name: 'Yield Optimization', path: '/api/cross-chain/yield', method: 'GET' },
    { name: 'Institutional Features', path: '/api/institutional/portfolios', method: 'GET' },
    { name: 'Analytics & Reports', path: '/api/cross-chain/analytics', method: 'GET' }
  ]

  const sdkExamples = [
    {
      language: 'JavaScript',
      code: `import { NOHVEXClient } from '@nohvex/sdk'

const client = new NOHVEXClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.nohvex.com/v1'
})

// Get user portfolios
const portfolios = await client.portfolio.list()

// Find cross-chain routes
const routes = await client.crossChain.findRoutes({
  sourceChain: 'ethereum',
  targetChain: 'polygon',
  sourceAsset: 'USDC',
  targetAsset: 'USDC',
  amount: 1000
})`
    },
    {
      language: 'Python',
      code: `from nohvex import NOHVEXClient

client = NOHVEXClient(
    api_key='your-api-key',
    base_url='https://api.nohvex.com/v1'
)

# Get user portfolios
portfolios = client.portfolio.list()

# Find cross-chain routes
routes = client.cross_chain.find_routes(
    source_chain='ethereum',
    target_chain='polygon',
    source_asset='USDC',
    target_asset='USDC',
    amount=1000
)`
    },
    {
      language: 'cURL',
      code: `# Get portfolios
curl -X GET "https://api.nohvex.com/v1/portfolio" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json"

# Find cross-chain routes
curl -X GET "https://api.nohvex.com/v1/cross-chain/routes?sourceChain=ethereum&targetChain=polygon&sourceAsset=USDC&targetAsset=USDC&amount=1000" \\
  -H "Authorization: Bearer your-jwt-token"`
    }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <CodeBracketIcon className="h-8 w-8" />
                Developer Documentation
              </h1>
              <p className="text-gray-400 mt-2">
                Comprehensive API documentation and developer tools for the NOHVEX DeFi platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                v1.0.0
              </span>
              <a
                href="https://github.com/nohvex/api-examples"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>GitHub Examples</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 space-y-12"
          >
            {/* Introduction */}
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                Build the Future of DeFi with NOHVEX APIs
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Integrate powerful DeFi portfolio management, cross-chain operations, and institutional-grade 
                features into your applications with our comprehensive REST APIs.
              </p>
            </div>

            {/* Quick Start */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🚀 Quick Start</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-gray-300">Get your API key from the dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-gray-300">Choose your integration method (REST API or SDK)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-gray-300">Start building with our comprehensive documentation</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('playground')}
                  className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try API Playground
                </button>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📚 Popular Endpoints</h3>
                <div className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{link.name}</div>
                        <div className="text-sm text-gray-400 font-mono">{link.path}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        link.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {link.method}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Portfolio Management',
                  description: 'Create, manage, and analyze DeFi portfolios with advanced risk metrics',
                  icon: '📊',
                  features: ['Risk Analytics', 'Performance Attribution', 'Asset Allocation']
                },
                {
                  title: 'Cross-Chain Operations',
                  description: 'Bridge assets across multiple blockchains with optimal route finding',
                  icon: '🌉',
                  features: ['Multi-Protocol Support', 'Cost Optimization', 'Yield Integration']
                },
                {
                  title: 'Institutional Features',
                  description: 'Enterprise-grade portfolio management with compliance monitoring',
                  icon: '🏛️',
                  features: ['Compliance Dashboard', 'Risk Management', 'Automated Rebalancing']
                },
                {
                  title: 'Yield Optimization',
                  description: 'Discover and optimize yield farming opportunities across protocols',
                  icon: '🌾',
                  features: ['Yield Discovery', 'Strategy Optimization', 'Risk Assessment']
                },
                {
                  title: 'Real-time Analytics',
                  description: 'Get live market data and portfolio analytics with WebSocket connections',
                  icon: '⚡',
                  features: ['Live Data Feeds', 'Price Alerts', 'Performance Tracking']
                },
                {
                  title: 'Security & Authentication',
                  description: 'Enterprise-grade security with JWT tokens and API key management',
                  icon: '🔒',
                  features: ['JWT Authentication', 'API Key Management', 'Rate Limiting']
                }
              ].map((feature, index) => (
                <div key={index} className="bg-slate-800 rounded-xl p-6">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.features.map((item, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* SDK Preview */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Official SDKs</h2>
                <p className="text-gray-400">
                  Use our official SDKs for seamless integration in your preferred programming language
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">JavaScript/TypeScript</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Full-featured SDK with TypeScript support for Node.js and browser environments
                  </p>
                  <code className="text-xs text-green-400">npm install @nohvex/sdk</code>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Python</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Pythonic SDK with async support and comprehensive data models
                  </p>
                  <code className="text-xs text-green-400">pip install nohvex-python</code>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Go</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    High-performance Go SDK with built-in error handling and retries
                  </p>
                  <code className="text-xs text-green-400">go get github.com/nohvex/go-sdk</code>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'documentation' && <APIDocumentation />}
        {activeTab === 'playground' && <APIPlayground />}

        {activeTab === 'sdk' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">SDKs & Developer Tools</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Choose from our official SDKs and tools to integrate NOHVEX APIs into your applications
              </p>
            </div>

            {/* SDK Examples */}
            <div className="space-y-8">
              {sdkExamples.map((example, index) => (
                <div key={index} className="bg-slate-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">{example.language}</h3>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🔧 Developer Tools</h3>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-gray-300">Postman Collection</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Download</button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-300">OpenAPI Spec</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Download</button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-300">Insomnia Collection</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Download</button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-300">Code Generators</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📞 Support & Community</h3>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-gray-300">Discord Community</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Join</button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-300">GitHub Discussions</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Visit</button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-300">Stack Overflow</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Ask</button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-300">Email Support</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Contact</button>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}