import Link from 'next/link'

// Dynamic 404 page to avoid build issues
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-6">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
The page youre looking for doesnt exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-block bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-400 hover:to-emerald-400 transition-all duration-200"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}

// Force dynamic rendering to skip pre-rendering
export const dynamic = 'force-dynamic'
