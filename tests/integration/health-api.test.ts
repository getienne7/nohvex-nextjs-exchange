import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    method: 'GET',
    headers: new Map(),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    }))
  }
}));

// Mock process.uptime and process.memoryUsage
const mockUptime = jest.fn();
const mockMemoryUsage = jest.fn();

Object.defineProperty(process, 'uptime', {
  value: mockUptime,
});

Object.defineProperty(process, 'memoryUsage', {
  value: mockMemoryUsage,
});

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ version: '14.5' }]),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  }
}));

describe('Integration Tests - Health API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUptime.mockReturnValue(7200); // 2 hours
    mockMemoryUsage.mockReturnValue({
      heapUsed: 75 * 1024 * 1024, // 75MB
      heapTotal: 150 * 1024 * 1024, // 150MB
      external: 15 * 1024 * 1024,
      arrayBuffers: 8 * 1024 * 1024,
    });
  });

  it('should return comprehensive health status', async () => {
    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/health');
    
    // Mock successful database connection
    require('@/lib/db').prisma.$queryRaw.mockResolvedValue([{ version: '14.5' }]);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime', 7200);
    expect(data.system).toHaveProperty('memory');
    expect(data.system).toHaveProperty('cpu');
    expect(data.services).toHaveProperty('database', 'connected');
    expect(data.services).toHaveProperty('redis', 'connected');
    expect(data.services).toHaveProperty('nownodes', 'connected');
  });

  it('should handle system errors gracefully', async () => {
    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/health');
    
    // Mock database error
    require('@/lib/db').prisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(503);
    expect(data).toHaveProperty('status', 'unhealthy');
    expect(data.services).toHaveProperty('database', 'disconnected');
  });

  it('should provide consistent response format', async () => {
    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/health');
    
    // Mock successful database connection
    require('@/lib/db').prisma.$queryRaw.mockResolvedValue([{ version: '14.5' }]);
    
    const response = await GET(request);
    const data = await response.json();
    
    // Check response structure
    expect(data).toEqual({
      status: expect.any(String),
      timestamp: expect.any(Number),
      uptime: expect.any(Number),
      system: {
        memory: {
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number)
        },
        cpu: {
          usage: expect.any(Number)
        }
      },
      services: {
        database: expect.any(String),
        redis: expect.any(String),
        nownodes: expect.any(String)
      },
      version: expect.any(String)
    });
  });
});