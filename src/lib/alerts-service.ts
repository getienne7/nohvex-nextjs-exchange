import { prisma } from '@/lib/db'
import { nowNodesService } from '@/lib/nownodes'

export type Operator = 'GT' | 'LT'

export async function listAlerts(userId: string) {
  return prisma.alert.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
}

export async function createAlert(userId: string, data: { symbol: string; operator: Operator; threshold: number; cooldownMinutes?: number }) {
  const symbol = data.symbol.toUpperCase()
  return prisma.alert.create({
    data: {
      userId,
      symbol,
      operator: data.operator,
      threshold: data.threshold,
      cooldownMinutes: data.cooldownMinutes ?? 10,
    },
  })
}

export async function updateAlert(userId: string, id: string, data: Partial<{ symbol: string; operator: Operator; threshold: number; active: boolean; cooldownMinutes: number }>) {
  return prisma.alert.update({
    where: { id },
    data: {
      ...(data.symbol ? { symbol: data.symbol.toUpperCase() } : {}),
      ...(data.operator ? { operator: data.operator } : {}),
      ...(data.threshold !== undefined ? { threshold: data.threshold } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
      ...(data.cooldownMinutes !== undefined ? { cooldownMinutes: data.cooldownMinutes } : {}),
    },
  })
}

export async function deleteAlert(userId: string, id: string) {
  return prisma.alert.delete({ where: { id } })
}

// One-off check used by poller
import { emailService } from '@/lib/email-service'

export async function checkAndTriggerAlerts() {
  const active = await prisma.alert.findMany({ where: { active: true } })
  if (active.length === 0) return { checked: 0, triggered: 0, items: [] as Array<{symbol:string, operator:Operator, threshold:number, price:number}> }

  // Group by symbol
  const symbols = Array.from(new Set(active.map(a => a.symbol)))
  const priceList = await nowNodesService.getCryptoPrices(symbols)

  let triggered = 0
  const now = new Date()
  const items: Array<{symbol:string, operator:Operator, threshold:number, price:number}> = []

  for (const alert of active) {
    const info = priceList.find(p => p.symbol === alert.symbol)
    const priceUsd = info?.current_price
    if (typeof priceUsd !== 'number') continue

    const shouldTrigger = (
      (alert.operator === 'GT' && priceUsd > alert.threshold) ||
      (alert.operator === 'LT' && priceUsd < alert.threshold)
    )

    if (!shouldTrigger) continue

    // Cooldown check
    if (alert.lastTriggeredAt) {
      const nextAllowed = new Date(alert.lastTriggeredAt.getTime() + alert.cooldownMinutes * 60 * 1000)
      if (now < nextAllowed) continue
    }

    await prisma.alert.update({ where: { id: alert.id }, data: { lastTriggeredAt: now } })
    triggered++
    items.push({ symbol: alert.symbol, operator: alert.operator as Operator, threshold: alert.threshold, price: priceUsd })
    // Fire-and-forget email stub if SMTP/SES configured; otherwise logs
    try {
      const user = await prisma.user.findUnique({ where: { id: alert.userId } })
      if (user?.email) {
        void emailService.sendAlertTriggered(
          user.email,
          alert.symbol,
          alert.operator as Operator,
          alert.threshold,
          priceUsd
        )
      }
    } catch {}
    console.log(`Price alert triggered: ${alert.symbol} ${alert.operator} ${alert.threshold} (price=${priceUsd}) user=${alert.userId}`)
  }

  return { checked: active.length, triggered, items }
}
