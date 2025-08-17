'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useNotify } from '@/components/notifications'

export default function AlertsWatcher() {
  const { status } = useSession()
  const notify = useNotify()
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    const run = async () => {
      try {
        const res = await fetch('/api/alerts/check', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.items)) {
          for (const it of data.items) {
            notify.success(`${it.symbol} ${it.operator} ${it.threshold} hit`, `Current: ${it.price} USD`)
          }
        }
      } catch {}
    }
    // first run then interval
    run()
    timer.current = setInterval(run, 60_000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [status, notify])

  return null
}
