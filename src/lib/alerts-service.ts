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
      operator: data.operator as any,
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
      ...(data.operator ? { operator: data.operator as any } : {}),
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
export async function checkAndTriggerAlerts() {
  const active = await prisma.alert.findMany({ where: { active: true } })
  if (active.length === 0) return { checked: 0, triggered: 0, items: [] as Array<{symbol:string, operator:Operator, threshold:number, price:number}> }

  // Group by symbol
  const symbols = Array.from(new Set(active.map(a => a.symbol)))
  const priceMap = await nowNodesService.getCryptoPrices(symbols)

  let triggered = 0
  const now = new Date()
  const items: Array<{symbol:string, operator:Operator, threshold:number, price:number}> = []

  for (const alert of active) {
    const price = priceMap[alert.symbol]
    if (!price || typeof price.usd !== 'number') continue

    const shouldTrigger = (
      (alert.operator === 'GT' && price.usd > alert.threshold) ||
      (alert.operator === 'LT' && price.usd < alert.threshold)
    )

    if (!shouldTrigger) continue

    // Cooldown check
    if (alert.lastTriggeredAt) {
      const nextAllowed = new Date(alert.lastTriggeredAt.getTime() + alert.cooldownMinutes * 60 * 1000)
      if (now < nextAllowed) continue
    }

    await prisma.alert.update({ where: { id: alert.id }, data: { lastTriggeredAt: now } })
    triggered++
    items.push({ symbol: alert.symbol, operator: alert.operator as Operator, threshold: alert.threshold, price: price.usd })
    // TODO: enqueue email/push; for now, just log
    console.log(`Price alert triggered: ${alert.symbol} ${alert.operator} ${alert.threshold} (price=${price.usd}) user=${alert.userId}`)
  }

  return { checked: active.length, triggered, items }
}
