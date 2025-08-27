/**
 * Production Analytics Service
 * Comprehensive monitoring and analytics for production insights
 */

export interface AnalyticsEvent {
  id: string
  userId?: string
  sessionId: string
  event: string
  category: 'user' | 'system' | 'defi' | 'business' | 'security' | 'performance'
  properties: Record<string, any>
  timestamp: number
  ipAddress?: string
  userAgent?: string
  path?: string
  duration?: number
  success?: boolean
  errorMessage?: string
}

export interface SystemMetrics {
  timestamp: number
  cpu: {
    usage: number
    load: [number, number, number] // 1min, 5min, 15min
  }
  memory: {
    total: number
    used: number
    free: number
    cached: number
  }
  disk: {
    total: number
    used: number
    free: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    connectionsActive: number
  }
  database: {
    connections: number
    queryTime: number
    cacheHitRatio: number
  }
  api: {
    requestsPerMinute: number
    averageResponseTime: number
    errorRate: number
  }
}

export interface UserBehaviorMetrics {
  userId?: string
  sessionId: string
  timestamp: number
  page: string
  action: string
  timeOnPage: number
  clickDepth: number
  scrollDepth: number
  conversionFunnel: string[]
  deviceType: 'desktop' | 'tablet' | 'mobile'
  browserInfo: {
    name: string
    version: string
    os: string
  }
}

export interface DeFiMetrics {
  timestamp: number
  totalValueLocked: number
  activePositions: number
  dailyVolume: number
  uniqueUsers: number
  transactions: {
    total: number
    successful: number
    failed: number
    pending: number
  }
  protocols: Record<string, {
    tvl: number
    volume: number
    apy: number
    users: number
  }>
  chains: Record<string, {
    volume: number
    transactions: number
    gasUsed: number
    avgGasPrice: number
  }>
}

export interface BusinessMetrics {
  timestamp: number
  revenue: {
    total: number
    fees: number
    subscriptions: number
    trading: number
  }
  users: {
    total: number
    active: number
    new: number
    retained: number
  }
  conversion: {
    signups: number
    walletConnections: number
    firstTransaction: number
    returningUsers: number
  }
  engagement: {
    averageSessionDuration: number
    pagesPerSession: number
    bounceRate: number
    timeToValue: number
  }
}

export interface AlertRule {
  id: string
  name: string
  description: string
  category: 'performance' | 'security' | 'business' | 'defi'
  condition: {
    metric: string
    operator: '>' | '<' | '==' | '!=' | '>=' | '<='
    threshold: number
    timeWindow: number // seconds
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  channels: ('email' | 'slack' | 'discord' | 'webhook')[]
  isActive: boolean
  lastTriggered?: number
  triggerCount: number
}

export interface AnalyticsDashboard {
  id: string
  name: string
  description: string
  isPublic: boolean
  widgets: DashboardWidget[]
  refreshInterval: number
  createdAt: number
  updatedAt: number
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'heatmap' | 'funnel'
  title: string
  position: { x: number; y: number; w: number; h: number }
  dataSource: string
  query: string
  visualization: {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
    timeRange: string
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count'
    groupBy?: string[]
  }
  styling: {
    colors: string[]
    showLegend: boolean
    showTooltip: boolean
  }
}

export class ProductionAnalytics {
  private events: AnalyticsEvent[] = []
  private systemMetrics: SystemMetrics[] = []
  private userBehavior: UserBehaviorMetrics[] = []
  private defiMetrics: DeFiMetrics[] = []
  private businessMetrics: BusinessMetrics[] = []
  private alertRules: Map<string, AlertRule> = new Map()
  private dashboards: Map<string, AnalyticsDashboard> = new Map()
  private isCollecting: boolean = false
  private collectionInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeDefaultAlerts()
    this.initializeDefaultDashboards()
  }

  /**
   * Start analytics collection
   */
  startCollection(intervalMs: number = 60000): void {
    if (this.isCollecting) return

    this.isCollecting = true
    this.collectionInterval = setInterval(() => {
      this.collectSystemMetrics()
      this.collectDeFiMetrics()
      this.collectBusinessMetrics()
      this.checkAlerts()
    }, intervalMs)
  }

  /**
   * Stop analytics collection
   */
  stopCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = null
    }
    this.isCollecting = false
  }

  /**
   * Track an analytics event
   */
  track(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    const analyticsEvent: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...event
    }

    this.events.push(analyticsEvent)

    // Keep only last 10000 events in memory
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000)
    }

    // In production, send to analytics service
    this.sendToAnalyticsService(analyticsEvent)
  }

  /**
   * Track user behavior
   */
  trackUserBehavior(behavior: Omit<UserBehaviorMetrics, 'timestamp'>): void {
    const userBehavior: UserBehaviorMetrics = {
      timestamp: Date.now(),
      ...behavior
    }

    this.userBehavior.push(userBehavior)

    // Keep only last 5000 behavior events in memory
    if (this.userBehavior.length > 5000) {
      this.userBehavior = this.userBehavior.slice(-5000)
    }
  }

  /**
   * Get analytics data with filters
   */
  async getAnalytics(filters: {
    category?: string[]
    userId?: string
    timeRange: { start: number; end: number }
    limit?: number
  }): Promise<{
    events: AnalyticsEvent[]
    systemMetrics: SystemMetrics[]
    userBehavior: UserBehaviorMetrics[]
    defiMetrics: DeFiMetrics[]
    businessMetrics: BusinessMetrics[]
  }> {
    const { timeRange, category, userId, limit = 1000 } = filters

    let filteredEvents = this.events.filter(event => 
      event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    )

    if (category) {
      filteredEvents = filteredEvents.filter(event => category.includes(event.category))
    }

    if (userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === userId)
    }

    const filteredSystemMetrics = this.systemMetrics.filter(metric =>
      metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    )

    const filteredUserBehavior = this.userBehavior.filter(behavior =>
      behavior.timestamp >= timeRange.start && behavior.timestamp <= timeRange.end
    )

    const filteredDeFiMetrics = this.defiMetrics.filter(metric =>
      metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    )

    const filteredBusinessMetrics = this.businessMetrics.filter(metric =>
      metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    )

    return {
      events: filteredEvents.slice(0, limit),
      systemMetrics: filteredSystemMetrics.slice(0, limit),
      userBehavior: filteredUserBehavior.slice(0, limit),
      defiMetrics: filteredDeFiMetrics.slice(0, limit),
      businessMetrics: filteredBusinessMetrics.slice(0, limit)
    }
  }

  /**
   * Get real-time metrics summary
   */
  async getRealTimeMetrics(): Promise<{
    system: Partial<SystemMetrics>
    defi: Partial<DeFiMetrics>
    business: Partial<BusinessMetrics>
    alerts: AlertRule[]
  }> {
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000

    const recentEvents = this.events.filter(event => event.timestamp >= fiveMinutesAgo)
    const latestSystemMetrics = this.systemMetrics[this.systemMetrics.length - 1]
    const latestDeFiMetrics = this.defiMetrics[this.defiMetrics.length - 1]
    const latestBusinessMetrics = this.businessMetrics[this.businessMetrics.length - 1]

    const activeAlerts = Array.from(this.alertRules.values())
      .filter(alert => alert.isActive && alert.lastTriggered && (now - alert.lastTriggered < 24 * 60 * 60 * 1000))

    return {
      system: {
        timestamp: latestSystemMetrics?.timestamp || now,
        cpu: latestSystemMetrics?.cpu,
        memory: latestSystemMetrics?.memory,
        api: {
          requestsPerMinute: recentEvents.length,
          averageResponseTime: this.calculateAverageResponseTime(recentEvents),
          errorRate: this.calculateErrorRate(recentEvents)
        }
      },
      defi: {
        timestamp: latestDeFiMetrics?.timestamp || now,
        totalValueLocked: latestDeFiMetrics?.totalValueLocked || 0,
        activePositions: latestDeFiMetrics?.activePositions || 0,
        transactions: latestDeFiMetrics?.transactions
      },
      business: {
        timestamp: latestBusinessMetrics?.timestamp || now,
        users: latestBusinessMetrics?.users,
        engagement: latestBusinessMetrics?.engagement
      },
      alerts: activeAlerts
    }
  }

  /**
   * Create custom dashboard
   */
  async createDashboard(dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalyticsDashboard> {
    const newDashboard: AnalyticsDashboard = {
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...dashboard
    }

    this.dashboards.set(newDashboard.id, newDashboard)
    return newDashboard
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(dashboardId: string): Promise<{
    dashboard: AnalyticsDashboard
    data: Record<string, any>
  }> {
    const dashboard = this.dashboards.get(dashboardId)
    if (!dashboard) {
      throw new Error('Dashboard not found')
    }

    const data: Record<string, any> = {}

    for (const widget of dashboard.widgets) {
      data[widget.id] = await this.executeWidgetQuery(widget)
    }

    return { dashboard, data }
  }

  /**
   * Create alert rule
   */
  async createAlert(alert: Omit<AlertRule, 'id' | 'triggerCount' | 'lastTriggered'>): Promise<AlertRule> {
    const newAlert: AlertRule = {
      id: this.generateId(),
      triggerCount: 0,
      ...alert
    }

    this.alertRules.set(newAlert.id, newAlert)
    return newAlert
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'json' | 'csv', filters: {
    category?: string[]
    timeRange: { start: number; end: number }
  }): Promise<string> {
    const data = await this.getAnalytics({
      ...filters,
      limit: 100000
    })

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      return this.convertToCSV(data.events)
    }
  }

  // Private methods
  private async collectSystemMetrics(): Promise<void> {
    // In production, this would collect real system metrics
    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      cpu: {
        usage: Math.random() * 100,
        load: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
      },
      memory: {
        total: 8192,
        used: Math.random() * 6000 + 1000,
        free: 0,
        cached: Math.random() * 1000
      },
      disk: {
        total: 1000000,
        used: Math.random() * 800000 + 100000,
        free: 0
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        connectionsActive: Math.floor(Math.random() * 1000)
      },
      database: {
        connections: Math.floor(Math.random() * 100),
        queryTime: Math.random() * 100,
        cacheHitRatio: Math.random() * 100
      },
      api: {
        requestsPerMinute: Math.floor(Math.random() * 1000),
        averageResponseTime: Math.random() * 500,
        errorRate: Math.random() * 5
      }
    }

    metrics.memory.free = metrics.memory.total - metrics.memory.used - metrics.memory.cached
    metrics.disk.free = metrics.disk.total - metrics.disk.used

    this.systemMetrics.push(metrics)

    // Keep only last 1440 entries (24 hours at 1-minute intervals)
    if (this.systemMetrics.length > 1440) {
      this.systemMetrics = this.systemMetrics.slice(-1440)
    }
  }

  private async collectDeFiMetrics(): Promise<void> {
    const metrics: DeFiMetrics = {
      timestamp: Date.now(),
      totalValueLocked: Math.random() * 10000000 + 1000000,
      activePositions: Math.floor(Math.random() * 1000),
      dailyVolume: Math.random() * 5000000,
      uniqueUsers: Math.floor(Math.random() * 10000),
      transactions: {
        total: Math.floor(Math.random() * 10000),
        successful: 0,
        failed: 0,
        pending: Math.floor(Math.random() * 100)
      },
      protocols: {
        'uniswap-v3': {
          tvl: Math.random() * 2000000,
          volume: Math.random() * 1000000,
          apy: Math.random() * 20 + 5,
          users: Math.floor(Math.random() * 5000)
        },
        'compound': {
          tvl: Math.random() * 1500000,
          volume: Math.random() * 800000,
          apy: Math.random() * 15 + 3,
          users: Math.floor(Math.random() * 3000)
        }
      },
      chains: {
        'ethereum': {
          volume: Math.random() * 2000000,
          transactions: Math.floor(Math.random() * 5000),
          gasUsed: Math.random() * 100000000,
          avgGasPrice: Math.random() * 50 + 20
        },
        'polygon': {
          volume: Math.random() * 800000,
          transactions: Math.floor(Math.random() * 2000),
          gasUsed: Math.random() * 50000000,
          avgGasPrice: Math.random() * 5 + 1
        }
      }
    }

    metrics.transactions.successful = Math.floor(metrics.transactions.total * 0.95)
    metrics.transactions.failed = metrics.transactions.total - metrics.transactions.successful - metrics.transactions.pending

    this.defiMetrics.push(metrics)

    if (this.defiMetrics.length > 1440) {
      this.defiMetrics = this.defiMetrics.slice(-1440)
    }
  }

  private async collectBusinessMetrics(): Promise<void> {
    const metrics: BusinessMetrics = {
      timestamp: Date.now(),
      revenue: {
        total: Math.random() * 100000,
        fees: Math.random() * 50000,
        subscriptions: Math.random() * 30000,
        trading: Math.random() * 20000
      },
      users: {
        total: Math.floor(Math.random() * 100000),
        active: Math.floor(Math.random() * 10000),
        new: Math.floor(Math.random() * 1000),
        retained: Math.floor(Math.random() * 8000)
      },
      conversion: {
        signups: Math.floor(Math.random() * 500),
        walletConnections: Math.floor(Math.random() * 300),
        firstTransaction: Math.floor(Math.random() * 200),
        returningUsers: Math.floor(Math.random() * 150)
      },
      engagement: {
        averageSessionDuration: Math.random() * 1800 + 300, // 5-35 minutes
        pagesPerSession: Math.random() * 10 + 2,
        bounceRate: Math.random() * 50 + 20,
        timeToValue: Math.random() * 600 + 60 // 1-11 minutes
      }
    }

    this.businessMetrics.push(metrics)

    if (this.businessMetrics.length > 1440) {
      this.businessMetrics = this.businessMetrics.slice(-1440)
    }
  }

  private async checkAlerts(): Promise<void> {
    for (const alert of this.alertRules.values()) {
      if (!alert.isActive) continue

      const shouldTrigger = await this.evaluateAlertCondition(alert)
      
      if (shouldTrigger) {
        alert.lastTriggered = Date.now()
        alert.triggerCount++
        
        await this.sendAlert(alert)
      }
    }
  }

  private async evaluateAlertCondition(alert: AlertRule): Promise<boolean> {
    const now = Date.now()
    const windowStart = now - alert.condition.timeWindow * 1000

    // Get recent data for evaluation
    const recentSystemMetrics = this.systemMetrics.filter(m => m.timestamp >= windowStart)
    const recentEvents = this.events.filter(e => e.timestamp >= windowStart)

    // Simplified condition evaluation - in production this would be more sophisticated
    switch (alert.condition.metric) {
      case 'cpu_usage':
        const avgCpuUsage = recentSystemMetrics.reduce((sum, m) => sum + m.cpu.usage, 0) / recentSystemMetrics.length
        return this.compareValues(avgCpuUsage, alert.condition.operator, alert.condition.threshold)
      
      case 'error_rate':
        const errorRate = this.calculateErrorRate(recentEvents)
        return this.compareValues(errorRate, alert.condition.operator, alert.condition.threshold)
      
      case 'response_time':
        const avgResponseTime = this.calculateAverageResponseTime(recentEvents)
        return this.compareValues(avgResponseTime, alert.condition.operator, alert.condition.threshold)
      
      default:
        return false
    }
  }

  private compareValues(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold
      case '<': return value < threshold
      case '>=': return value >= threshold
      case '<=': return value <= threshold
      case '==': return value === threshold
      case '!=': return value !== threshold
      default: return false
    }
  }

  private async sendAlert(alert: AlertRule): Promise<void> {
    console.log(`Alert triggered: ${alert.name} - ${alert.description}`)
    
    // In production, send to configured channels
    for (const channel of alert.channels) {
      switch (channel) {
        case 'email':
          // Send email notification
          break
        case 'slack':
          // Send Slack notification
          break
        case 'discord':
          // Send Discord notification
          break
        case 'webhook':
          // Send webhook notification
          break
      }
    }
  }

  private calculateAverageResponseTime(events: AnalyticsEvent[]): number {
    const durationEvents = events.filter(e => e.duration !== undefined)
    if (durationEvents.length === 0) return 0
    
    const totalDuration = durationEvents.reduce((sum, e) => sum + (e.duration || 0), 0)
    return totalDuration / durationEvents.length
  }

  private calculateErrorRate(events: AnalyticsEvent[]): number {
    if (events.length === 0) return 0
    
    const errorEvents = events.filter(e => e.success === false)
    return (errorEvents.length / events.length) * 100
  }

  private async executeWidgetQuery(widget: DashboardWidget): Promise<any> {
    // Simplified widget query execution
    switch (widget.type) {
      case 'metric':
        return { value: Math.random() * 1000, trend: 'up' }
      case 'chart':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: widget.title,
            data: [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100]
          }]
        }
      default:
        return null
    }
  }

  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    // In production, send to external analytics service (e.g., Mixpanel, Amplitude)
    // console.log('Analytics event:', event)
  }

  private convertToCSV(events: AnalyticsEvent[]): string {
    if (events.length === 0) return ''

    const headers = ['id', 'userId', 'sessionId', 'event', 'category', 'timestamp', 'path', 'success']
    const csvRows = [headers.join(',')]

    for (const event of events) {
      const row = [
        event.id,
        event.userId || '',
        event.sessionId,
        event.event,
        event.category,
        event.timestamp,
        event.path || '',
        event.success?.toString() || ''
      ]
      csvRows.push(row.join(','))
    }

    return csvRows.join('\n')
  }

  private initializeDefaultAlerts(): void {
    const defaultAlerts: Omit<AlertRule, 'id' | 'triggerCount' | 'lastTriggered'>[] = [
      {
        name: 'High CPU Usage',
        description: 'CPU usage above 80% for 5 minutes',
        category: 'performance',
        condition: {
          metric: 'cpu_usage',
          operator: '>',
          threshold: 80,
          timeWindow: 300
        },
        severity: 'high',
        channels: ['email', 'slack'],
        isActive: true
      },
      {
        name: 'High Error Rate',
        description: 'Error rate above 5% for 2 minutes',
        category: 'performance',
        condition: {
          metric: 'error_rate',
          operator: '>',
          threshold: 5,
          timeWindow: 120
        },
        severity: 'critical',
        channels: ['email', 'slack', 'webhook'],
        isActive: true
      }
    ]

    defaultAlerts.forEach(alert => {
      this.createAlert(alert)
    })
  }

  private initializeDefaultDashboards(): void {
    const defaultDashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Production Overview',
      description: 'Main production metrics dashboard',
      isPublic: false,
      refreshInterval: 30000,
      widgets: [
        {
          id: 'system-cpu',
          type: 'chart',
          title: 'CPU Usage',
          position: { x: 0, y: 0, w: 6, h: 4 },
          dataSource: 'system',
          query: 'cpu.usage',
          visualization: {
            chartType: 'line',
            timeRange: '1h',
            aggregation: 'avg'
          },
          styling: {
            colors: ['#3B82F6'],
            showLegend: true,
            showTooltip: true
          }
        },
        {
          id: 'api-requests',
          type: 'metric',
          title: 'API Requests/min',
          position: { x: 6, y: 0, w: 3, h: 2 },
          dataSource: 'system',
          query: 'api.requestsPerMinute',
          visualization: {
            timeRange: '5m',
            aggregation: 'sum'
          },
          styling: {
            colors: ['#10B981'],
            showLegend: false,
            showTooltip: false
          }
        }
      ]
    }

    this.createDashboard(defaultDashboard)
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Singleton instance
export const productionAnalytics = new ProductionAnalytics()