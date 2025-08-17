import { checkAndTriggerAlerts } from '@/lib/alerts-service'

const globalAny = globalThis as any

if (!globalAny.__alertsPoller) {
  // Run every 60s in dev; in prod, platform may manage execution differently
  const interval = setInterval(() => {
    checkAndTriggerAlerts().catch(() => {})
  }, 60_000)
  globalAny.__alertsPoller = interval
}

export {}
