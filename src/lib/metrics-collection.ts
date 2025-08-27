/**
 * Production Metrics Collection Service
 * Automated collection of system metrics, performance data, and business KPIs
 */

import { productionAnalytics } from './production-analytics'

export interface MetricCollector {
  name: string
  collect: () => Promise<Record<string, number>>
  interval: number // in milliseconds
  enabled: boolean
}

export class MetricsCollectionService {
  private collectors: Map<string, MetricCollector> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  constructor() {
    this.initializeDefaultCollectors()
  }

  /**
   * Start metrics collection
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Starting production metrics collection...')

    for (const [name, collector] of this.collectors.entries()) {
      if (collector.enabled) {
        this.startCollector(name, collector)
      }
    }
  }

  /**
   * Stop metrics collection
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    console.log('Stopping production metrics collection...')

    for (const [name, interval] of this.intervals.entries()) {
      clearInterval(interval)
      this.intervals.delete(name)
    }
  }

  /**
   * Add a custom metric collector
   */
  addCollector(collector: MetricCollector): void {
    this.collectors.set(collector.name, collector)
    
    if (this.isRunning && collector.enabled) {
      this.startCollector(collector.name, collector)
    }
  }

  /**
   * Remove a metric collector
   */
  removeCollector(name: string): void {
    const interval = this.intervals.get(name)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(name)
    }
    this.collectors.delete(name)
  }

  /**
   * Enable/disable a collector
   */
  toggleCollector(name: string, enabled: boolean): void {
    const collector = this.collectors.get(name)
    if (!collector) return

    collector.enabled = enabled

    if (this.isRunning) {
      if (enabled) {
        this.startCollector(name, collector)
      } else {
        const interval = this.intervals.get(name)
        if (interval) {
          clearInterval(interval)
          this.intervals.delete(name)
        }
      }
    }
  }

  /**
   * Get collector status
   */
  getCollectorStatus(): Record<string, { enabled: boolean; interval: number; lastRun?: number }> {
    const status: Record<string, any> = {}
    
    for (const [name, collector] of this.collectors.entries()) {
      status[name] = {
        enabled: collector.enabled,
        interval: collector.interval,
        isRunning: this.intervals.has(name)
      }
    }
    
    return status
  }

  /**
   * Manually trigger collection for a specific collector
   */
  async collectNow(collectorName: string): Promise<void> {
    const collector = this.collectors.get(collectorName)
    if (!collector) {
      throw new Error(`Collector '${collectorName}' not found`)
    }

    try {
      const metrics = await collector.collect()
      await this.recordMetrics(metrics)
    } catch (error) {
      console.error(`Failed to collect metrics for '${collectorName}':`, error)
    }
  }

  /**
   * Collect all metrics now
   */
  async collectAll(): Promise<void> {
    const promises = Array.from(this.collectors.keys()).map(name => 
      this.collectNow(name).catch(error => 
        console.error(`Failed to collect ${name}:`, error)
      )
    )
    
    await Promise.all(promises)
  }

  private startCollector(name: string, collector: MetricCollector): void {
    // Clear existing interval if any
    const existingInterval = this.intervals.get(name)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Start new collection interval
    const interval = setInterval(async () => {
      try {
        const metrics = await collector.collect()
        await this.recordMetrics(metrics)
      } catch (error) {
        console.error(`Error collecting metrics for '${name}':`, error)
      }
    }, collector.interval)

    this.intervals.set(name, interval)
    
    // Collect immediately
    this.collectNow(name).catch(error => 
      console.error(`Initial collection failed for '${name}':`, error)
    )
  }

  private async recordMetrics(metrics: Record<string, number>): Promise<void> {
    const promises = Object.entries(metrics).map(([metricName, value]) =>
      productionAnalytics.recordMetric(metricName, value)
    )
    
    await Promise.all(promises)
  }

  private initializeDefaultCollectors(): void {
    // System Performance Collector
    this.addCollector({
      name: 'system_performance',
      interval: 60000, // 1 minute
      enabled: true,
      collect: async () => {
        const metrics: Record<string, number> = {}

        try {
          // CPU Usage (mock implementation)
          metrics.cpu_usage = await this.getCPUUsage()
          metrics.memory_usage = await this.getMemoryUsage()
          metrics.disk_usage = await this.getDiskUsage()
          metrics.load_average = await this.getLoadAverage()
        } catch (error) {
          console.error('System performance collection error:', error)
        }

        return metrics
      }
    })

    // Database Performance Collector
    this.addCollector({
      name: 'database_performance',
      interval: 30000, // 30 seconds
      enabled: true,
      collect: async () => {
        const metrics: Record<string, number> = {}

        try {
          metrics.db_connections_active = await this.getActiveDBConnections()
          metrics.db_connections_total = await this.getTotalDBConnections()
          metrics.db_query_duration_avg = await this.getAverageQueryDuration()
          metrics.db_slow_queries = await this.getSlowQueryCount()
          metrics.db_deadlocks = await this.getDeadlockCount()
        } catch (error) {
          console.error('Database performance collection error:', error)
        }

        return metrics
      }
    })

    // Application Performance Collector
    this.addCollector({
      name: 'application_performance',
      interval: 60000, // 1 minute
      enabled: true,
      collect: async () => {
        const metrics: Record<string, number> = {}

        try {
          metrics.response_time_avg = await this.getAverageResponseTime()
          metrics.response_time_p95 = await this.getP95ResponseTime()
          metrics.requests_per_minute = await this.getRequestsPerMinute()
          metrics.error_rate = await this.getErrorRate()
          metrics.cache_hit_rate = await this.getCacheHitRate()
        } catch (error) {
          console.error('Application performance collection error:', error)
        }

        return metrics
      }
    })

    // Business Metrics Collector
    this.addCollector({
      name: 'business_metrics',
      interval: 300000, // 5 minutes
      enabled: true,
      collect: async () => {
        const metrics: Record<string, number> = {}

        try {
          metrics.active_users_current = await this.getCurrentActiveUsers()
          metrics.transactions_per_minute = await this.getTransactionsPerMinute()
          metrics.revenue_current_hour = await this.getCurrentHourRevenue()
          metrics.total_value_locked = await this.getTotalValueLocked()
          metrics.yield_generated_hourly = await this.getHourlyYieldGenerated()
        } catch (error) {
          console.error('Business metrics collection error:', error)
        }

        return metrics
      }
    })

    // DeFi Protocol Metrics Collector
    this.addCollector({
      name: 'defi_protocols',
      interval: 120000, // 2 minutes
      enabled: true,
      collect: async () => {
        const metrics: Record<string, number> = {}

        try {
          metrics.arbitrage_opportunities = await this.getArbitrageOpportunities()
          metrics.liquidity_pools_active = await this.getActiveLiquidityPools()
          metrics.yield_strategies_active = await this.getActiveYieldStrategies()
          metrics.cross_chain_volume = await this.getCrossChainVolume()
          metrics.protocol_health_score = await this.getProtocolHealthScore()
        } catch (error) {
          console.error('DeFi protocols collection error:', error)
        }

        return metrics
      }
    })

    // Security Metrics Collector
    this.addCollector({
      name: 'security_metrics',
      interval: 60000, // 1 minute
      enabled: true,
      collect: async () => {
        const metrics: Record<string, number> = {}

        try {
          metrics.failed_login_attempts = await this.getFailedLoginAttempts()
          metrics.suspicious_activities = await this.getSuspiciousActivities()
          metrics.blocked_ips = await this.getBlockedIPCount()
          metrics.security_alerts = await this.getSecurityAlertCount()
          metrics.active_sessions = await this.getActiveSessionCount()
        } catch (error) {
          console.error('Security metrics collection error:', error)
        }

        return metrics
      }
    })

    // Network & Infrastructure Collector
    this.addCollector({
      name: 'network_infrastructure',
      interval: 30000, // 30 seconds
      enabled: true,
      collect: async () => {
        const metrics: Record<string, number> = {}

        try {
          metrics.network_latency = await this.getNetworkLatency()
          metrics.bandwidth_usage = await this.getBandwidthUsage()
          metrics.cdn_hit_rate = await this.getCDNHitRate()
          metrics.external_api_latency = await this.getExternalAPILatency()
          metrics.websocket_connections = await this.getWebSocketConnections()
        } catch (error) {
          console.error('Network infrastructure collection error:', error)
        }

        return metrics
      }
    })
  }

  // Mock implementations of metric collection methods
  // In a real implementation, these would connect to actual monitoring systems

  private async getCPUUsage(): Promise<number> {
    // Mock: simulate CPU usage between 20-80%
    return Math.random() * 60 + 20
  }

  private async getMemoryUsage(): Promise<number> {
    // Mock: simulate memory usage between 40-90%
    return Math.random() * 50 + 40
  }

  private async getDiskUsage(): Promise<number> {
    // Mock: simulate disk usage between 30-70%
    return Math.random() * 40 + 30
  }

  private async getLoadAverage(): Promise<number> {
    // Mock: simulate load average between 0.5-3.0
    return Math.random() * 2.5 + 0.5
  }

  private async getActiveDBConnections(): Promise<number> {
    // Mock: simulate 10-50 active connections
    return Math.floor(Math.random() * 40) + 10
  }

  private async getTotalDBConnections(): Promise<number> {
    // Mock: simulate 100-200 total connections
    return Math.floor(Math.random() * 100) + 100
  }

  private async getAverageQueryDuration(): Promise<number> {
    // Mock: simulate 5-50ms average query duration
    return Math.random() * 45 + 5
  }

  private async getSlowQueryCount(): Promise<number> {
    // Mock: simulate 0-5 slow queries per minute
    return Math.floor(Math.random() * 6)
  }

  private async getDeadlockCount(): Promise<number> {
    // Mock: simulate 0-2 deadlocks per hour
    return Math.floor(Math.random() * 3)
  }

  private async getAverageResponseTime(): Promise<number> {
    // Mock: simulate 50-300ms average response time
    return Math.random() * 250 + 50
  }

  private async getP95ResponseTime(): Promise<number> {
    // Mock: simulate 200-800ms P95 response time
    return Math.random() * 600 + 200
  }

  private async getRequestsPerMinute(): Promise<number> {
    // Mock: simulate 100-1000 requests per minute
    return Math.floor(Math.random() * 900) + 100
  }

  private async getErrorRate(): Promise<number> {
    // Mock: simulate 0.1-5% error rate
    return Math.random() * 4.9 + 0.1
  }

  private async getCacheHitRate(): Promise<number> {
    // Mock: simulate 85-99% cache hit rate
    return Math.random() * 14 + 85
  }

  private async getCurrentActiveUsers(): Promise<number> {
    // Mock: simulate 50-500 active users
    return Math.floor(Math.random() * 450) + 50
  }

  private async getTransactionsPerMinute(): Promise<number> {
    // Mock: simulate 10-100 transactions per minute
    return Math.floor(Math.random() * 90) + 10
  }

  private async getCurrentHourRevenue(): Promise<number> {
    // Mock: simulate $100-$10000 revenue per hour
    return Math.random() * 9900 + 100
  }

  private async getTotalValueLocked(): Promise<number> {
    // Mock: simulate $1M-$50M TVL
    return Math.random() * 49000000 + 1000000
  }

  private async getHourlyYieldGenerated(): Promise<number> {
    // Mock: simulate $50-$5000 yield per hour
    return Math.random() * 4950 + 50
  }

  private async getArbitrageOpportunities(): Promise<number> {
    // Mock: simulate 5-50 arbitrage opportunities
    return Math.floor(Math.random() * 45) + 5
  }

  private async getActiveLiquidityPools(): Promise<number> {
    // Mock: simulate 20-200 active liquidity pools
    return Math.floor(Math.random() * 180) + 20
  }

  private async getActiveYieldStrategies(): Promise<number> {
    // Mock: simulate 10-100 active yield strategies
    return Math.floor(Math.random() * 90) + 10
  }

  private async getCrossChainVolume(): Promise<number> {
    // Mock: simulate $10K-$1M cross-chain volume per hour
    return Math.random() * 990000 + 10000
  }

  private async getProtocolHealthScore(): Promise<number> {
    // Mock: simulate 70-99 protocol health score
    return Math.random() * 29 + 70
  }

  private async getFailedLoginAttempts(): Promise<number> {
    // Mock: simulate 0-20 failed login attempts per minute
    return Math.floor(Math.random() * 21)
  }

  private async getSuspiciousActivities(): Promise<number> {
    // Mock: simulate 0-5 suspicious activities per minute
    return Math.floor(Math.random() * 6)
  }

  private async getBlockedIPCount(): Promise<number> {
    // Mock: simulate 0-100 blocked IPs
    return Math.floor(Math.random() * 101)
  }

  private async getSecurityAlertCount(): Promise<number> {
    // Mock: simulate 0-10 security alerts per hour
    return Math.floor(Math.random() * 11)
  }

  private async getActiveSessionCount(): Promise<number> {
    // Mock: simulate 20-200 active sessions
    return Math.floor(Math.random() * 180) + 20
  }

  private async getNetworkLatency(): Promise<number> {
    // Mock: simulate 10-100ms network latency
    return Math.random() * 90 + 10
  }

  private async getBandwidthUsage(): Promise<number> {
    // Mock: simulate 1-100 Mbps bandwidth usage
    return Math.random() * 99 + 1
  }

  private async getCDNHitRate(): Promise<number> {
    // Mock: simulate 80-99% CDN hit rate
    return Math.random() * 19 + 80
  }

  private async getExternalAPILatency(): Promise<number> {
    // Mock: simulate 100-1000ms external API latency
    return Math.random() * 900 + 100
  }

  private async getWebSocketConnections(): Promise<number> {
    // Mock: simulate 10-100 WebSocket connections
    return Math.floor(Math.random() * 90) + 10
  }
}

// Singleton instance
export const metricsCollectionService = new MetricsCollectionService()

// Auto-start in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  metricsCollectionService.start()
}