'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { GlobalNavigation } from '@/components/GlobalNavigation'

export default function WatchlistsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Array<{ id: string; symbol: string; createdAt: string }>>([])
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [status, session, router])

  const load = async () => {
    const res = await fetch('/api/watchlists', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setItems(data.items || [])
    }
  }
  useEffect(() => { if (session) load() }, [session])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    const s = symbol.trim().toUpperCase()
    if (!s) return
    setLoading(true)
    try {
      const res = await fetch('/api/watchlists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol: s }) })
      if (res.ok) {
        setSymbol('')
        await load()
      }
    } finally {
      setLoading(false)
    }
  }

  const remove = async (s: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/watchlists?symbol=${encodeURIComponent(s)}`, { method: 'DELETE' })
      if (res.ok) await load()
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <>
      <GlobalNavigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-16">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Watchlists</h1>
          <form onSubmit={add} className="flex gap-2 mb-4">
            <input value={symbol} onChange={e=>setSymbol(e.target.value)} placeholder="Symbol e.g. BTC"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
            <button disabled={loading} className="px-4 py-2 bg-blue-600 rounded-lg text-white">{loading? '...' : 'Add'}</button>
          </form>
          <div className="bg-white/10 border border-white/10 rounded-lg">
            {items.length === 0 ? (
              <div className="p-4 text-gray-300">No items yet. Add a symbol to get started.</div>
            ) : (
              <ul>
                {items.map(it => (
                  <li key={it.id} className="flex items-center justify-between px-4 py-2 border-b border-white/10 last:border-b-0">
                    <span className="text-white font-mono">{it.symbol}</span>
                    <button onClick={()=>remove(it.symbol)} className="text-sm px-2 py-1 bg-red-600 rounded text-white">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
