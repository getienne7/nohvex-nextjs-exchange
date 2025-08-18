import { checkAndTriggerAlerts } from '@/lib/alerts-service'

declare global {
  // Augment globalThis with our poller marker
  var __alertsPoller: NodeJS.Timer | undefined
}

if (!globalThis.__alertsPoller) {
  // Run every 60s in dev; in prod, platform may manage execution differently
  const interval = setInterval(() => {
    checkAndTriggerAlerts().catch(() => {})
  }, 60_000)
  globalThis.__alertsPoller = interval
}

export {}
