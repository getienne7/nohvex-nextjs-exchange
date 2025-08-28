import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Development Environment Metrics API
 * Provides comprehensive monitoring data for local development
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include')?.split(',') || ['all'];
    const format = searchParams.get('format') || 'json';

    const metrics: {
      timestamp: string;
      environment: string;
      uptime: number;
      metrics: {
        system?: any;
        database?: any;
        redis?: any;
        performance?: any;
        features?: any;
        development?: any;
        environment?: any;
      };
    } = {
      timestamp: new Date().toISOString(),
      environment: 'development',
      uptime: process.uptime(),
      metrics: {}
    };

    // System Metrics
    if (include.includes('all') || include.includes('system')) {
      metrics.metrics.system = {
        nodejs: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime(),
          memory: {
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024),
            arrayBuffers: Math.round(process.memoryUsage().arrayBuffers / 1024 / 1024)
          },
          cpu: {
            usage: process.cpuUsage(),
            loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
          }
        },
        container: {
          hostname: require('os').hostname(),
          type: process.env.DOCKER_ENV ? 'docker' : 'native',
          network: process.env.DOCKER_ENV ? 'nohvex-dev-network' : 'host'
        }
      };
    }

    // Database Metrics
    if (include.includes('all') || include.includes('database')) {
      try {
        const dbStart = Date.now();
        const result = await prisma.$queryRaw`
          SELECT 
            current_database() as database_name,
            version() as postgres_version,
            pg_database_size(current_database()) as database_size
        ` as Array<{ database_name: string; postgres_version: string; database_size: bigint }>;
        const dbLatency = Date.now() - dbStart;

        // Get connection stats
        const connectionStats = await prisma.$queryRaw`
          SELECT 
            count(*) as total_connections,
            count(*) FILTER (WHERE state = 'active') as active_connections,
            count(*) FILTER (WHERE state = 'idle') as idle_connections
          FROM pg_stat_activity
          WHERE datname = current_database()
        ` as Array<{ total_connections: bigint; active_connections: bigint; idle_connections: bigint }>;

        metrics.metrics.database = {
          status: 'healthy',
          latency: dbLatency,
          info: result[0],
          connections: connectionStats[0],
          prisma: {
            version: '6.14.0',
            engine: 'query-engine'
          }
        };
      } catch (dbError) {
        metrics.metrics.database = {
          status: 'error',
          error: dbError instanceof Error ? dbError.message : 'Database query failed'
        };
      }
    }

    // Redis Metrics (if configured)
    if (include.includes('all') || include.includes('redis')) {
      if (process.env.REDIS_URL) {
        metrics.metrics.redis = {
          status: 'configured',
          url: process.env.REDIS_URL.replace(/:[^:]*@/, ':****@'), // Hide password
          note: 'Redis client metrics require redis package installation'
        };
      } else {
        metrics.metrics.redis = {
          status: 'not_configured',
          note: 'Redis is available in docker-compose but not configured in application'
        };
      }
    }

    // API Performance Metrics
    if (include.includes('all') || include.includes('performance')) {
      metrics.metrics.performance = {
        response_times: {
          note: 'Live performance monitoring would require middleware implementation'
        },
        endpoints: {
          health: '/api/health',
          monitoring: '/api/monitoring',
          development_metrics: '/api/dev-metrics',
          nownodes_test: '/api/nownodes-test'
        }
      };
    }

    // Feature Status
    if (include.includes('all') || include.includes('features')) {
      metrics.metrics.features = {
        authentication: {
          nextauth: process.env.NEXTAUTH_SECRET ? 'configured' : 'not_configured',
          providers: ['credentials', 'oauth']
        },
        blockchain: {
          nownodes: process.env.NOWNODES_API_KEY ? 'configured' : 'not_configured',
          walletconnect: process.env.WALLETCONNECT_PROJECT_ID ? 'configured' : 'not_configured',
          supported_chains: ['ethereum', 'bsc', 'polygon', 'avalanche']
        },
        trading: {
          dex_aggregator: 'enabled',
          changenow: process.env.CHANGENOW_API_KEY ? 'configured' : 'not_configured',
          supported_dexs: ['uniswap_v3', 'pancakeswap_v3']
        },
        notifications: {
          email: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'not_configured',
          slack: process.env.SLACK_WEBHOOK_URL ? 'configured' : 'not_configured'
        }
      };
    }

    // Development Tools Status
    if (include.includes('all') || include.includes('tools')) {
      metrics.metrics.development = {
        hot_reload: process.env.FAST_REFRESH === 'true',
        polling: process.env.CHOKIDAR_USEPOLLING === '1',
        turbopack: true, // Enabled by default in package.json
        typescript: true,
        eslint: true,
        prettier: false, // Not configured
        testing: {
          jest: true,
          playwright: true,
          coverage: true
        },
        docker: {
          compose_file: 'docker-compose.dev.yml',
          services: ['postgres', 'redis', 'web', 'adminer', 'redis-commander'],
          network: 'nohvex-dev-network'
        }
      };
    }

    // Environment Variables Status
    if (include.includes('all') || include.includes('env')) {
      const envVars = {
        required: {
          NOWNODES_API_KEY: !!process.env.NOWNODES_API_KEY,
          NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
          DATABASE_URL: !!process.env.DATABASE_URL
        },
        optional: {
          REDIS_URL: !!process.env.REDIS_URL,
          AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
          WALLETCONNECT_PROJECT_ID: !!process.env.WALLETCONNECT_PROJECT_ID,
          CHANGENOW_API_KEY: !!process.env.CHANGENOW_API_KEY,
          MORALIS_API_KEY: !!process.env.MORALIS_API_KEY,
          SLACK_WEBHOOK_URL: !!process.env.SLACK_WEBHOOK_URL
        },
        development: {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
          CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING,
          WATCHPACK_POLLING: process.env.WATCHPACK_POLLING
        }
      };

      const requiredCount = Object.values(envVars.required).filter(Boolean).length;
      const requiredTotal = Object.keys(envVars.required).length;
      const optionalCount = Object.values(envVars.optional).filter(Boolean).length;
      const optionalTotal = Object.keys(envVars.optional).length;

      metrics.metrics.environment = {
        status: requiredCount === requiredTotal ? 'complete' : 'incomplete',
        required: {
          configured: requiredCount,
          total: requiredTotal,
          missing: requiredTotal - requiredCount,
          variables: envVars.required
        },
        optional: {
          configured: optionalCount,
          total: optionalTotal,
          variables: envVars.optional
        },
        development: envVars.development
      };
    }

    // Format response
    if (format === 'prometheus') {
      // Simple Prometheus-style metrics
      const prometheusMetrics = [];
      prometheusMetrics.push('# HELP nohvex_uptime_seconds Application uptime in seconds');
      prometheusMetrics.push('# TYPE nohvex_uptime_seconds gauge');
      prometheusMetrics.push(`nohvex_uptime_seconds ${process.uptime()}`);
      
      prometheusMetrics.push('# HELP nohvex_memory_used_mb Memory used in megabytes');
      prometheusMetrics.push('# TYPE nohvex_memory_used_mb gauge');
      prometheusMetrics.push(`nohvex_memory_used_mb ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}`);

      return new NextResponse(prometheusMetrics.join('\n'), {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4'
        }
      });
    }

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Metrics-Version': '1.0',
        'X-Environment': 'development'
      }
    });

  } catch (error) {
    console.error('Development metrics error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate development metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST endpoint for logging custom metrics (development only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value, tags = {} } = body;

    if (!metric || value === undefined) {
      return NextResponse.json(
        { error: 'metric and value are required' },
        { status: 400 }
      );
    }

    // In development, just log the metric
    console.log(`📊 Custom Metric: ${metric} = ${value}`, tags);

    return NextResponse.json({
      success: true,
      message: 'Metric logged',
      data: { metric, value, tags, timestamp: new Date().toISOString() }
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to log metric',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}