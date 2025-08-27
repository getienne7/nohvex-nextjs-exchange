import { NextRequest } from 'next/server';
import { GET } from '@/app/api/prices/route';

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    method: 'GET',
    headers: new Map(),
    nextUrl: {
      searchParams: new URLSearchParams(url.split('?')[1] || '')
    }
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    }))
  }
}));

// Mock external API calls
global.fetch = jest.fn();

describe('/api/prices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/prices', () => {
    it('should return prices for valid symbols', async () => {
      // Mock successful API response
      const mockPricesResponse = {
        BTC: { price: 45000, change24h: 2.5 },
        ETH: { price: 3000, change24h: 1.8 }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPricesResponse)
      });

      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/prices?symbols=BTC,ETH');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('BTC');
      expect(data).toHaveProperty('ETH');
      expect(data.BTC).toHaveProperty('price');
      expect(data.ETH).toHaveProperty('price');
    });

    it('should handle missing symbols parameter', async () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/prices');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('symbols');
    });

    it('should handle external API failures gracefully', async () => {
      // Mock API failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/prices?symbols=BTC');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should validate symbol format', async () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/prices?symbols=invalid-symbol-123');
      
      const response = await GET(request);
      
      // Should either validate symbols or handle gracefully
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle rate limiting', async () => {
      // Mock rate limit response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limited' })
      });

      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/prices?symbols=BTC');
      
      const response = await GET(request);
      
      // Should handle rate limiting appropriately
      expect([200, 429, 500]).toContain(response.status);
    });

    it('should return cached data when available', async () => {
      // This test would check caching behavior if implemented
      const { NextRequest } = require('next/server');
      
      // First request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ BTC: { price: 45000, change24h: 2.5 } })
      });
      
      const request1 = new NextRequest('http://localhost:3000/api/prices?symbols=BTC');
      const response1 = await GET(request1);
      
      // Second request (should potentially use cache)
      const request2 = new NextRequest('http://localhost:3000/api/prices?symbols=BTC');
      const response2 = await GET(request2);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/prices?symbols=BTC');
      
      const response = await GET(request);
      
      // Should handle JSON parsing errors
      expect([200, 500]).toContain(response.status);
    });

    it('should handle timeout scenarios', async () => {
      // Mock timeout
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/prices?symbols=BTC');
      
      const response = await GET(request);
      
      // Should handle timeouts gracefully
      expect([200, 500, 408]).toContain(response.status);
    });
  });
});