/**
 * Production Monitoring and Logging Service
 * Provides comprehensive application monitoring, error tracking, and performance metrics
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  service: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: string;
  labels?: Record<string, string>;
}

class ProductionLogger {
  private service: string;
  private environment: string;

  constructor(service: string = 'nohvex-exchange') {
    this.service = service;
    this.environment = process.env.NODE_ENV || 'development';
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      metadata,
      error,
      requestId: this.getRequestId(),
    };
  }

  private getRequestId(): string | undefined {
    // In a real implementation, this would extract from request context
    return typeof window === 'undefined' ? 
      process.env.REQUEST_ID || undefined : 
      undefined;
  }

  private async sendLog(entry: LogEntry): Promise<void> {
    if (this.environment === 'production') {
      // Send to external logging service (e.g., Sentry, LogRocket, etc.)
      await this.sendToExternalService(entry);
    } else {
      // Local development logging
      console.log(JSON.stringify(entry, null, 2));
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // Example: Send to Sentry
      if (process.env.SENTRY_DSN && entry.level === 'error') {
        // Sentry.captureException(entry.error || new Error(entry.message));
      }

      // Example: Send to custom logging endpoint
      if (process.env.LOGGING_ENDPOINT) {
        await fetch(process.env.LOGGING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  async error(message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry('ERROR', message, metadata, error);
    await this.sendLog(entry);
  }

  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry('WARN', message, metadata);
    await this.sendLog(entry);
  }

  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry('INFO', message, metadata);
    await this.sendLog(entry);
  }

  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry('DEBUG', message, metadata);
    await this.sendLog(entry);
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  recordMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' | 'percent',
    labels?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      labels
    };

    this.metrics.push(metric);

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendMetric(metric);
    }
  }

  private async sendMetric(metric: PerformanceMetric): Promise<void> {
    try {
      // Example: Send to monitoring service
      if (process.env.MONITORING_ENDPOINT) {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric)
        });
      }
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  }

  measureExecutionTime<T>(fn: () => Promise<T>, name: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const startTime = Date.now();
      
      try {
        const result = await fn();
        const duration = Date.now() - startTime;
        
        this.recordMetric(`${name}_duration`, duration, 'ms');
        this.recordMetric(`${name}_success`, 1, 'count');
        
        resolve(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.recordMetric(`${name}_duration`, duration, 'ms');
        this.recordMetric(`${name}_error`, 1, 'count');
        
        reject(error);
      }
    });
  }
}

class HealthChecker {
  private checks: Map<string, () => Promise<boolean>> = new Map();

  addCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(name, checkFn);
  }

  async runHealthChecks(): Promise<Record<string, { status: 'healthy' | 'unhealthy'; error?: string }>> {
    const results: Record<string, { status: 'healthy' | 'unhealthy'; error?: string }> = {};

    for (const [name, checkFn] of this.checks) {
      try {
        const isHealthy = await checkFn();
        results[name] = { status: isHealthy ? 'healthy' : 'unhealthy' };
      } catch (error) {
        results[name] = { 
          status: 'unhealthy', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    return results;
  }
}

// Initialize monitoring services
export const logger = new ProductionLogger();
export const performanceMonitor = new PerformanceMonitor();
export const healthChecker = new HealthChecker();

// Add default health checks
healthChecker.addCheck('database', async () => {
  try {
    // Check database connection
    if (process.env.DATABASE_URL) {
      // In a real implementation, you'd test the actual connection
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

healthChecker.addCheck('external_apis', async () => {
  try {
    // Check external API availability
    if (process.env.NOWNODES_API_KEY) {
      // In a real implementation, you'd make a test request
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

// Export monitoring utilities
export const withMonitoring = {
  async api<T>(
    name: string,
    fn: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      await logger.info(`API call started: ${name}`, { userId });
      
      const result = await performanceMonitor.measureExecutionTime(fn, `api_${name}`);
      
      await logger.info(`API call completed: ${name}`, { 
        userId, 
        duration: Date.now() - startTime 
      });
      
      return result;
    } catch (error) {
      await logger.error(`API call failed: ${name}`, error as Error, { userId });
      throw error;
    }
  },

  async database<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return performanceMonitor.measureExecutionTime(fn, `db_${name}`);
  },

  async external<T>(service: string, fn: () => Promise<T>): Promise<T> {
    return performanceMonitor.measureExecutionTime(fn, `external_${service}`);
  }
};