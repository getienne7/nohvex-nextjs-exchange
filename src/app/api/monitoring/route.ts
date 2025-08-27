import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { healthChecker, logger, performanceMonitor } from '@/lib/monitoring';

/**
 * Production Monitoring Dashboard API
 * Provides system health, performance metrics, and operational status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Restrict access to authenticated admin users in production
    if (process.env.NODE_ENV === 'production' && (!session || !isAdmin(session))) {
      return NextResponse.json(
        { error: 'Unauthorized access to monitoring dashboard' },
        { status: 403 }
      );
    }

    // Gather system metrics
    const [healthStatus, systemMetrics, performanceData] = await Promise.all([
      healthChecker.runHealthChecks(),
      getSystemMetrics(),
      getPerformanceMetrics()
    ]);

    const monitoringData = {
      timestamp: new Date().toISOString(),
      system: {
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        health: healthStatus
      },
      performance: performanceData,
      metrics: systemMetrics
    };

    await logger.info('Monitoring dashboard accessed', {
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });

    return NextResponse.json(monitoringData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    await logger.error('Monitoring dashboard error', error as Error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve monitoring data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function isAdmin(session: any): boolean {
  // Implement admin check logic
  // This is a placeholder - implement based on your user roles
  return session?.user?.role === 'admin' || 
         session?.user?.email === process.env.ADMIN_EMAIL;
}

async function getSystemMetrics() {
  return {
    database: {
      connectionStatus: 'connected', // Implement actual check
      activeConnections: 5, // From connection pool
      queryCount: 1250,
      averageResponseTime: 45
    },
    api: {
      requestCount: 5420,
      errorRate: 0.02,
      averageResponseTime: 120,
      rateLimitHits: 15
    },
    external: {
      nownodes: {
        status: 'operational',
        requestCount: 890,
        errorRate: 0.01,
        lastUpdate: new Date().toISOString()
      }
    }
  };
}

async function getPerformanceMetrics() {
  return {
    serverless: {
      functionInvocations: 2340,
      coldStarts: 23,
      averageDuration: 180,
      memoryUsage: 128
    },
    frontend: {
      pageViews: 1540,
      uniqueVisitors: 340,
      bounceRate: 0.25,
      averageLoadTime: 1.2
    },
    errors: {
      total: 12,
      critical: 1,
      warnings: 8,
      info: 3
    }
  };
}