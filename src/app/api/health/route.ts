import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Enhanced health check endpoint for Docker container monitoring
 * Returns 200 OK with comprehensive system status including database and Redis
 */
export async function GET(request: NextRequest) {
  try {
    const healthChecks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      environment: process.env.NODE_ENV || 'unknown',
      services: {
        application: { status: 'healthy', latency: 0 },
        database: { status: 'unknown', latency: 0, provider?: string, error?: string },
        redis: { status: 'unknown', latency: 0, provider?: string, error?: string },
        external_apis: { status: 'unknown', latency: 0, provider?: string, error?: string, note?: string }
      },
      features: {
        wallet_connection: process.env.WALLETCONNECT_PROJECT_ID ? 'configured' : 'not_configured',
        blockchain_apis: process.env.NOWNODES_API_KEY ? 'configured' : 'not_configured',
        email_service: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'not_configured',
        dex_trading: 'enabled',
        portfolio_tracking: 'enabled'
      }
    };

    // Test Database Connection
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - dbStart;
      healthChecks.services.database = {
        status: 'healthy',
        latency: dbLatency,
        provider: 'PostgreSQL'
      };
    } catch (dbError) {
      healthChecks.services.database = {
        status: 'unhealthy',
        latency: 0,
        error: dbError instanceof Error ? dbError.message : 'Database connection failed'
      };
      healthChecks.status = 'degraded';
    }

    // Test Redis Connection (if configured)
    if (process.env.REDIS_URL) {
      try {
        const redisStart = Date.now();
        // For development, we'll use a simple check
        // In production, you'd use an actual Redis client
        const redisLatency = Date.now() - redisStart;
        healthChecks.services.redis = {
          status: 'configured',
          latency: redisLatency,
          provider: 'Redis 7'
        };
      } catch (redisError) {
        healthChecks.services.redis = {
          status: 'unhealthy',
          latency: 0,
          error: redisError instanceof Error ? redisError.message : 'Redis connection failed'
        };
        healthChecks.status = 'degraded';
      }
    } else {
      healthChecks.services.redis = {
        status: 'not_configured',
        latency: 0
      };
    }

    // Test External APIs (NOWNodes if configured)
    if (process.env.NOWNODES_API_KEY) {
      try {
        const apiStart = Date.now();
        // For development, we'll just check if the key is configured
        const apiLatency = Date.now() - apiStart;
        healthChecks.services.external_apis = {
          status: 'configured',
          latency: apiLatency,
          provider: 'NOWNodes',
          note: 'Key configured, live test available at /api/nownodes-test'
        };
      } catch (apiError) {
        healthChecks.services.external_apis = {
          status: 'error',
          latency: 0,
          error: apiError instanceof Error ? apiError.message : 'API test failed'
        };
      }
    } else {
      healthChecks.services.external_apis = {
        status: 'not_configured',
        latency: 0,
        provider: 'NOWNodes'
      };
    }

    // Determine overall status
    const hasUnhealthyServices = Object.values(healthChecks.services)
      .some(service => service.status === 'unhealthy');
    
    if (hasUnhealthyServices) {
      healthChecks.status = 'unhealthy';
    } else if (healthChecks.status !== 'degraded') {
      healthChecks.status = 'healthy';
    }

    // Return appropriate HTTP status
    const httpStatus = healthChecks.status === 'healthy' ? 200 : 
                      healthChecks.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthChecks, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': healthChecks.status,
        'X-Environment': healthChecks.environment
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  } finally {
    // Clean up Prisma connection
    await prisma.$disconnect();
  }
}

/**
 * HEAD endpoint for simple health check (used by Docker)
 */
export async function HEAD(request: NextRequest) {
  try {
    // Quick health check without detailed response
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Health-Status': 'healthy',
        'X-Environment': process.env.NODE_ENV || 'unknown'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}