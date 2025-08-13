'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { ChartBarIcon, HomeIcon, ArrowRightOnRectangleIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline'

export default function Navigation() {
  return (
    <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
                <span className="text-sm font-bold text-white">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                NOHVEX
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              href="/trading"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowsRightLeftIcon className="w-4 h-4" />
              <span>Trading</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
