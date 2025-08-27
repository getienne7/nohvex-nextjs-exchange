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

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUptime.mockReturnValue(3600); // 1 hour
    mockMemoryUsage.mockReturnValue({
      heapUsed: 50 * 1024 * 1024, // 50MB
      heapTotal: 100 * 1024 * 1024, // 100MB
      external: 10 * 1024 * 1024,
      arrayBuffers: 5 * 1024 * 1024,
    });
  });

  it('should return healthy status', async () => {
    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime', 3600);
    expect(data).toHaveProperty('memory');
    expect(data.memory).toHaveProperty('used', 50);
    expect(data.memory).toHaveProperty('total', 100);
    expect(data).toHaveProperty('environment', 'test');
  });

  it('should handle errors gracefully', async () => {
    mockUptime.mockImplementation(() => {
      throw new Error('System error');
    });

    const { NextRequest } = require('next/server');
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('status', 'unhealthy');
    expect(data).toHaveProperty('error', 'Health check failed');
  });
});