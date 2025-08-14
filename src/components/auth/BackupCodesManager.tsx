'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowPathIcon, ClipboardIcon, EyeIcon, EyeSlashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface CodesState {
  codes: string[]
  total: number
  used: number
}

export function BackupCodesManager() {
  // 'loading' reserved if we later add a skeleton
  const [/* loading */, setLoading] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCodes, setShowCodes] = useState(false)
  const [codesState, setCodesState] = useState<CodesState>({ codes: [], total: 0, used: 0 })

  const remaining = useMemo(() => Math.max(0, codesState.codes.length), [codesState.codes.length])

  useEffect(() => {
    let cancelled = false
    const fetchCodes = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/auth/2fa/backup-codes', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch backup codes')
        }
        if (!cancelled) {
          setCodesState({ codes: data.codes || [], total: data.total ?? (data.codes?.length || 0), used: data.used ?? 0 })
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to fetch backup codes')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCodes()
    return () => {
      cancelled = true
    }
  }, [])

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText((codesState.codes || []).join('\n'))
      setSuccess('Backup codes copied to clipboard')
      setTimeout(() => setSuccess(null), 4000)
    } catch {
      setError('Could not copy to clipboard')
      setTimeout(() => setError(null), 4000)
    }
  }

  const downloadCodes = () => {
    const blob = new Blob([(codesState.codes || []).join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nohvex-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const regenerateCodes = async () => {
    const code = prompt('To regenerate backup codes, enter a current 6-digit authenticator code. This will invalidate all existing backup codes.')
    if (!code) return
    setRegenLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode: code.replace(/\s/g, '') })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to regenerate backup codes')
      }
      setCodesState({ codes: data.codes || [], total: data.codes?.length || 0, used: 0 })
      setShowCodes(true)
      setSuccess('Backup codes regenerated. Save them securely!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to regenerate backup codes')
      setTimeout(() => setError(null), 5000)
    } finally {
      setRegenLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Backup Codes</h3>
          <p className="text-gray-400 text-sm">Use these if you can’t access your authenticator.</p>
        </div>
        <span className="text-sm text-gray-300">Remaining: <span className="text-blue-300 font-medium">{remaining}</span></span>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">{success}</div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => setShowCodes(s => !s)} className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-200">
            {showCodes ? (<><EyeSlashIcon className="w-5 h-5 mr-2" /> Hide</>) : (<><EyeIcon className="w-5 h-5 mr-2" /> Reveal</>)}
          </button>
          <button onClick={copyCodes} disabled={!codesState.codes.length} className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-200 disabled:opacity-50">
            <ClipboardIcon className="w-5 h-5 mr-2" /> Copy
          </button>
          <button onClick={downloadCodes} disabled={!codesState.codes.length} className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-200 disabled:opacity-50">
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" /> Download
          </button>
          <button onClick={regenerateCodes} disabled={regenLoading} className="flex items-center justify-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-200 disabled:opacity-50">
            {regenLoading ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-300" />) : (<><ArrowPathIcon className="w-5 h-5 mr-2" /> Regenerate</>)}
          </button>
        </div>

        <div className="mt-2">
          {showCodes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {codesState.codes.length ? codesState.codes.map((c) => (
                <div key={c} className="px-3 py-2 bg-black/30 rounded border border-white/10 font-mono text-gray-200 tracking-widest text-center">{c}</div>
              )) : (
                <p className="text-gray-400 text-sm">No backup codes available. Generate to create new ones.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Codes are hidden. Click Reveal to view them.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
