'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeSelector() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isActive = (t: 'light' | 'dark' | 'system') => theme === t

  if (!mounted) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <button onClick={() => setTheme('dark')}
        className={`p-4 rounded-lg border-2 ${isActive('dark') ? 'border-blue-500' : 'border-transparent'} text-white bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900`}
      >
        <div className="text-sm font-medium">Dark {resolvedTheme==='dark' && theme==='system' ? '(System)' : isActive('dark') ? '(Current)' : ''}</div>
        <div className="text-xs text-gray-400 mt-1">Default dark theme</div>
      </button>
      <button onClick={() => setTheme('light')}
        className={`p-4 rounded-lg border-2 ${isActive('light') ? 'border-blue-500' : 'border-transparent'} text-gray-700 bg-gray-200`}
      >
        <div className="text-sm font-medium">Light {resolvedTheme==='light' && theme==='system' ? '(System)' : isActive('light') ? '(Current)' : ''}</div>
        <div className="text-xs text-gray-500 mt-1">Clean light theme</div>
      </button>
      <button onClick={() => setTheme('system')}
        className={`p-4 rounded-lg border-2 ${isActive('system') ? 'border-blue-500' : 'border-transparent'} text-white bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900`}
      >
        <div className="text-sm font-medium">System</div>
        <div className="text-xs text-gray-400 mt-1">Match OS preference</div>
      </button>
    </div>
  )
}
