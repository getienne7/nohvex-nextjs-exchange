import { prisma } from '@/lib/db'
import { nowNodesService } from '@/lib/nownodes'
import { emailService } from '@/lib/email-service'
import { 
  PriceAlert, 
  AlertType, 
  AlertOperator, 
  AlertStatus, 
  AlertFrequency, 
  NotificationMethod,
  AlertTriggerData,
  AlertStats,
  AlertTemplate,
  AlertTemplates,
  PriceAlertPreferences,
  DefaultPriceAlertPreferences
} from '@/types/price-alerts'

export class EnhancedPriceAlertsService {
  private static instance: EnhancedPriceAlertsService
  private alertCache: Map<string, PriceAlert[]> = new Map()
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map()
  private notificationQueue: AlertTriggerData[] = []

  static getInstance(): EnhancedPriceAlertsService {
    if (!this.instance) {
      this.instance = new EnhancedPriceAlertsService()
    }
    return this.instance
  }

  // Alert CRUD Operations
  async createAlert(userId: string, alertData: Partial<PriceAlert>): Promise<PriceAlert> {
    // Create alert with existing schema, storing enhanced data in notes/description fields
    const alert = await prisma.alert.create({
      data: {
        userId,
        symbol: alertData.symbol?.toUpperCase(),
        operator: alertData.operator,
        threshold: alertData.threshold,
        cooldownMinutes: alertData.cooldownMinutes ?? 10,
        // Store enhanced metadata in description field as JSON
        description: JSON.stringify({
          name: alertData.name || `${alertData.symbol} Alert`,
          originalDescription: alertData.description || '',
          type: alertData.type || 'price_threshold',
          frequency: alertData.frequency || 'once',
          maxTriggers: alertData.maxTriggers,
          notificationMethods: alertData.notificationMethods || ['browser'],
          emailEnabled: alertData.emailEnabled ?? true,
          browserEnabled: alertData.browserEnabled ?? true,
          smsEnabled: alertData.smsEnabled ?? false,
          soundEnabled: alertData.soundEnabled ?? true,
          priority: alertData.priority || 'medium',
          tags: alertData.tags || [],
          notes: alertData.notes || ''
        })
      },
    })

    // Clear cache for user
    this.alertCache.delete(userId)
    
    return this.mapPrismaAlertToEnhanced(alert)
  }

  async updateAlert(userId: string, alertId: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    const alert = await prisma.alert.update({
      where: { id: alertId, userId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.symbol && { symbol: updates.symbol.toUpperCase() }),
        ...(updates.operator && { operator: updates.operator }),
        ...(updates.threshold !== undefined && { threshold: updates.threshold }),
        ...(updates.status && { status: updates.status }),
        ...(updates.frequency && { frequency: updates.frequency }),
        ...(updates.cooldownMinutes !== undefined && { cooldownMinutes: updates.cooldownMinutes }),
        ...(updates.maxTriggers !== undefined && { maxTriggers: updates.maxTriggers }),
        ...(updates.notificationMethods && { notificationMethods: updates.notificationMethods.join(',') }),
        ...(updates.emailEnabled !== undefined && { emailEnabled: updates.emailEnabled }),
        ...(updates.browserEnabled !== undefined && { browserEnabled: updates.browserEnabled }),
        ...(updates.smsEnabled !== undefined && { smsEnabled: updates.smsEnabled }),
        ...(updates.soundEnabled !== undefined && { soundEnabled: updates.soundEnabled }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.tags && { tags: updates.tags.join(',') }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.expiresAt && { expiresAt: updates.expiresAt }),
        ...(updates.isActive !== undefined && { active: updates.isActive }),
        updatedAt: new Date()
      },
    })

    // Clear cache for user
    this.alertCache.delete(userId)
    
    return this.mapPrismaAlertToEnhanced(alert)
  }

  async deleteAlert(userId: string, alertId: string): Promise<void> {
    await prisma.alert.delete({
      where: { id: alertId, userId }
    })

    // Clear cache for user
    this.alertCache.delete(userId)
  }

  async getAlerts(userId: string, filters?: {
    status?: AlertStatus
    symbol?: string
    type?: AlertType
    priority?: string
    limit?: number
    offset?: number
  }): Promise<PriceAlert[]> {
    // Check cache first
    const cacheKey = `${userId}_${JSON.stringify(filters || {})}`
    if (this.alertCache.has(cacheKey)) {
      return this.alertCache.get(cacheKey)!
    }

    const whereClause: any = { userId }

    if (filters) {
      if (filters.status) whereClause.status = filters.status
      if (filters.symbol) whereClause.symbol = filters.symbol.toUpperCase()
      if (filters.type) whereClause.type = filters.type
      if (filters.priority) whereClause.priority = filters.priority
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    })

    const enhancedAlerts = alerts.map((alert: any) => this.mapPrismaAlertToEnhanced(alert))
    
    // Cache the results
    this.alertCache.set(cacheKey, enhancedAlerts)
    
    return enhancedAlerts
  }

  async getAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
    const alert = await prisma.alert.findFirst({
      where: { id: alertId, userId }
    })

    return alert ? this.mapPrismaAlertToEnhanced(alert) : null
  }

  // Bulk Operations
  async createAlertsFromTemplate(userId: string, templateId: string, symbols: string[], customThresholds?: { [symbol: string]: number }): Promise<PriceAlert[]> {
    const template = AlertTemplates.find(t => t.id === templateId)
    if (!template) {
      throw new Error('Template not found')
    }

    const alerts: PriceAlert[] = []

    for (const symbol of symbols) {
      const threshold = customThresholds?.[symbol] || template.conditions[0].value
      
      const alertData: Partial<PriceAlert> = {
        ...template.defaultSettings,
        symbol: symbol.toUpperCase(),
        name: `${template.name} - ${symbol.toUpperCase()}`,
        description: template.description,
        type: template.conditions[0].type,
        operator: template.conditions[0].operator,
        threshold: threshold
      }

      const alert = await this.createAlert(userId, alertData)
      alerts.push(alert)
    }

    return alerts
  }

  async bulkUpdateAlerts(userId: string, alertIds: string[], updates: Partial<PriceAlert>): Promise<PriceAlert[]> {
    const updatedAlerts: PriceAlert[] = []

    for (const alertId of alertIds) {
      try {
        const alert = await this.updateAlert(userId, alertId, updates)
        updatedAlerts.push(alert)
      } catch (error) {
        console.error(`Failed to update alert ${alertId}:`, error)
      }
    }

    return updatedAlerts
  }

  async bulkDeleteAlerts(userId: string, alertIds: string[]): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const alertId of alertIds) {
      try {
        await this.deleteAlert(userId, alertId)
        success++
      } catch (error) {
        console.error(`Failed to delete alert ${alertId}:`, error)
        failed++
      }
    }

    return { success, failed }
  }

  // Alert Monitoring and Triggering
  async checkAndTriggerAlerts(): Promise<{ checked: number; triggered: number; items: AlertTriggerData[] }> {
    const activeAlerts = await prisma.alert.findMany({ 
      where: { active: true, status: 'active' }
    })

    if (activeAlerts.length === 0) {
      return { checked: 0, triggered: 0, items: [] }
    }

    // Group by symbol to minimize API calls
    const symbols = Array.from(new Set(activeAlerts.map((a: any) => a.symbol as string)))
    const priceList = await nowNodesService.getCryptoPrices(symbols)

    let triggered = 0
    const now = new Date()
    const items: AlertTriggerData[] = []

    for (const alert of activeAlerts) {
      try {
        const priceInfo = priceList.find(p => p.symbol === alert.symbol)
        if (!priceInfo?.current_price) continue

        const currentPrice = priceInfo.current_price
        const shouldTrigger = this.evaluateAlertCondition(alert, currentPrice, priceInfo)

        if (!shouldTrigger) continue

        // Check cooldown
        if (alert.lastTriggeredAt) {
          const nextAllowed = new Date(alert.lastTriggeredAt.getTime() + alert.cooldownMinutes * 60 * 1000)
          if (now < nextAllowed) continue
        }

        // Check max triggers
        if (alert.maxTriggers && alert.triggerCount >= alert.maxTriggers) {
          await this.updateAlert(alert.userId, alert.id, { status: 'expired' })
          continue
        }

        // Update alert
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            lastTriggeredAt: now,
            triggerCount: alert.triggerCount + 1,
            ...(alert.frequency === 'once' ? { status: 'triggered' } : {})
          }
        })

        const triggerData: AlertTriggerData = {
          alertId: alert.id,
          symbol: alert.symbol,
          currentPrice,
          triggeredAt: now.getTime(),
          conditionMet: `${alert.symbol} ${alert.operator} ${alert.threshold}`
        }

        // Send notifications
        await this.sendAlertNotifications(alert, triggerData)

        triggered++
        items.push(triggerData)

        console.log(`Enhanced price alert triggered: ${alert.name || alert.symbol} - ${triggerData.conditionMet}`)
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error)
      }
    }

    return { checked: activeAlerts.length, triggered, items }
  }

  private evaluateAlertCondition(alert: any, currentPrice: number, priceInfo: any): boolean {
    switch (alert.type || 'price_threshold') {
      case 'price_threshold':
        return this.evaluatePriceThreshold(alert.operator, currentPrice, alert.threshold)
      
      case 'price_change':
        // Would need historical price data
        return false
      
      case 'volume_spike':
        // Would need volume data
        return false
      
      case 'volatility':
        // Would need volatility calculation
        return false
      
      default:
        return this.evaluatePriceThreshold(alert.operator, currentPrice, alert.threshold)
    }
  }

  private evaluatePriceThreshold(operator: string, currentPrice: number, threshold: number): boolean {
    switch (operator) {
      case 'GT':
        return currentPrice > threshold
      case 'LT':
        return currentPrice < threshold
      case 'EQ':
        return Math.abs(currentPrice - threshold) < (threshold * 0.001) // 0.1% tolerance
      default:
        return false
    }
  }

  private async sendAlertNotifications(alert: any, triggerData: AlertTriggerData): Promise<void> {
    const notificationMethods = alert.notificationMethods?.split(',') || ['browser']
    
    for (const method of notificationMethods) {
      try {
        switch (method) {
          case 'email':
            if (alert.emailEnabled) {
              await this.sendEmailNotification(alert, triggerData)
            }
            break
          
          case 'browser':
            if (alert.browserEnabled) {
              await this.sendBrowserNotification(alert, triggerData)
            }
            break
          
          case 'sms':
            if (alert.smsEnabled) {
              await this.sendSMSNotification(alert, triggerData)
            }
            break
          
          case 'webhook':
            await this.sendWebhookNotification(alert, triggerData)
            break
        }
      } catch (error) {
        console.error(`Failed to send ${method} notification for alert ${alert.id}:`, error)
      }
    }
  }

  private async sendEmailNotification(alert: any, triggerData: AlertTriggerData): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: alert.userId } })
    if (!user?.email) return

    await emailService.sendAlertTriggered(
      user.email,
      triggerData.symbol,
      alert.operator as any,
      alert.threshold,
      triggerData.currentPrice
    )
  }

  private async sendBrowserNotification(alert: any, triggerData: AlertTriggerData): Promise<void> {
    // This would integrate with WebSocket or push notification service
    console.log('Browser notification:', triggerData)
  }

  private async sendSMSNotification(alert: any, triggerData: AlertTriggerData): Promise<void> {
    // This would integrate with SMS service like Twilio
    console.log('SMS notification:', triggerData)
  }

  private async sendWebhookNotification(alert: any, triggerData: AlertTriggerData): Promise<void> {
    // This would send to configured webhook URL
    console.log('Webhook notification:', triggerData)
  }

  // Statistics and Analytics
  async getAlertStats(userId: string): Promise<AlertStats> {
    const [
      totalAlerts,
      activeAlerts,
      triggeredToday,
      triggeredThisWeek,
      triggeredThisMonth
    ] = await Promise.all([
      prisma.alert.count({ where: { userId } }),
      prisma.alert.count({ where: { userId, active: true, status: 'active' } }),
      this.getTriggeredCount(userId, 1),
      this.getTriggeredCount(userId, 7),
      this.getTriggeredCount(userId, 30)
    ])

    return {
      totalAlerts,
      activeAlerts,
      triggeredToday,
      triggeredThisWeek,
      triggeredThisMonth,
      averageResponseTime: 0, // Would calculate from trigger logs
      successRate: activeAlerts > 0 ? (triggeredThisMonth / activeAlerts) * 100 : 0
    }
  }

  private async getTriggeredCount(userId: string, days: number): Promise<number> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    return await prisma.alert.count({
      where: {
        userId,
        lastTriggeredAt: {
          gte: since
        }
      }
    })
  }

  // Utility Methods
  getAlertTemplates(): AlertTemplate[] {
    return AlertTemplates
  }

  async getUserPreferences(userId: string): Promise<PriceAlertPreferences> {
    // In a real implementation, this would fetch from database
    return DefaultPriceAlertPreferences
  }

  async updateUserPreferences(userId: string, preferences: Partial<PriceAlertPreferences>): Promise<PriceAlertPreferences> {
    // In a real implementation, this would save to database
    return { ...DefaultPriceAlertPreferences, ...preferences }
  }

  private mapPrismaAlertToEnhanced(alert: any): PriceAlert {
    // Parse enhanced metadata from description field
    let metadata: any = {
      name: `${alert.symbol} Alert`,
      originalDescription: '',
      type: 'price_threshold',
      frequency: 'once',
      notificationMethods: ['browser'],
      emailEnabled: true,
      browserEnabled: true,
      smsEnabled: false,
      soundEnabled: true,
      priority: 'medium',
      tags: [],
      notes: ''
    }
    
    try {
      const parsed = JSON.parse(alert.description || '{}')
      metadata = { ...metadata, ...parsed }
    } catch {
      // Use default metadata for legacy alerts
    }

    return {
      id: alert.id,
      userId: alert.userId,
      name: metadata.name || `${alert.symbol} Alert`,
      description: metadata.originalDescription || '',
      symbol: alert.symbol,
      type: metadata.type || 'price_threshold',
      operator: alert.operator,
      threshold: alert.threshold,
      status: 'active',
      frequency: metadata.frequency || 'once',
      cooldownMinutes: alert.cooldownMinutes,
      maxTriggers: metadata.maxTriggers,
      triggerCount: 0,
      notificationMethods: metadata.notificationMethods || ['browser'],
      emailEnabled: metadata.emailEnabled ?? true,
      browserEnabled: metadata.browserEnabled ?? true,
      smsEnabled: metadata.smsEnabled ?? false,
      soundEnabled: metadata.soundEnabled ?? true,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
      lastTriggeredAt: alert.lastTriggeredAt,
      expiresAt: undefined,
      isActive: alert.active,
      priority: metadata.priority || 'medium',
      tags: metadata.tags || [],
      notes: metadata.notes || ''
    }
  }
}

// Export singleton instance
export const enhancedPriceAlertsService = EnhancedPriceAlertsService.getInstance()