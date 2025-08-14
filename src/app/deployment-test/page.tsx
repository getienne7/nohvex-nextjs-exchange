import Link from 'next/link'

export default function DeploymentTestPage() {
  const buildTime = new Date().toISOString()
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🚀 Deployment Test Page</h1>
        
        <div className="bg-white/10 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">✅ Verification Status</h2>
          <div className="space-y-2">
            <p>🗓️ <strong>Build Time:</strong> {buildTime}</p>
            <p>🔧 <strong>Node Version:</strong> {process.version}</p>
            <p>📦 <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
            <p>🔐 <strong>NextAuth URL:</strong> {process.env.NEXTAUTH_URL || 'Not Set'}</p>
            <p>🗄️ <strong>Database:</strong> {process.env.DATABASE_URL ? 'Connected' : 'Not Set'}</p>
            <p>🌐 <strong>NOWNodes API:</strong> {process.env.NOWNODES_API_KEY ? 'Configured' : 'Not Set'}</p>
          </div>
        </div>

        <div className="bg-green-900/50 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">🌟 Available Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Core Pages:</h3>
              <ul className="space-y-1">
                <li>✅ <Link href="/" className="text-blue-400 hover:underline">Homepage</Link></li>
                <li>✅ <Link href="/trading" className="text-blue-400 hover:underline">Trading Interface</Link></li>
                <li>✅ <Link href="/portfolio" className="text-blue-400 hover:underline">Portfolio Dashboard</Link></li>
                <li>✅ <Link href="/dashboard" className="text-blue-400 hover:underline">User Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">API Endpoints:</h3>
              <ul className="space-y-1">
                <li>✅ <Link href="/api/prices?symbols=BTC,ETH" className="text-blue-400 hover:underline">/api/prices</Link></li>
                <li>✅ <Link href="/api/portfolio" className="text-blue-400 hover:underline">/api/portfolio</Link></li>
                <li>✅ <Link href="/api/transactions" className="text-blue-400 hover:underline">/api/transactions</Link></li>
                <li>✅ <Link href="/api/db-test" className="text-blue-400 hover:underline">/api/db-test</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">🔥 Latest Commit Info</h2>
          <p>📊 <strong>Features Added:</strong></p>
          <ul className="mt-2 space-y-1 ml-4">
            <li>• 3 Portfolio Modes (Simple, Advanced, Real-Time)</li>
            <li>• Chart.js Interactive Charts</li>
            <li>• NOWNodes + CoinGecko API Integration</li>
            <li>• WebSocket Real-Time Simulation</li>
            <li>• Market Alerts System</li>
            <li>• Technical Analysis Indicators</li>
            <li>• 15+ Cryptocurrency Support</li>
          </ul>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-400 hover:to-emerald-400 transition-all font-semibold"
          >
            🏠 Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
