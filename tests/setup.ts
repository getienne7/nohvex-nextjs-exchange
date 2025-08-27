import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Mock Headers for web environment
if (!global.Headers) {
  (global as any).Headers = class Headers {
    private headers = new Map<string, string>();
    
    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.headers.set(key.toLowerCase(), value));
        } else if (init instanceof Headers) {
          // Copy from another Headers instance
        } else {
          Object.entries(init).forEach(([key, value]) => this.headers.set(key.toLowerCase(), value));
        }
      }
    }
    
    get(name: string): string | null {
      return this.headers.get(name.toLowerCase()) || null;
    }
    
    set(name: string, value: string): void {
      this.headers.set(name.toLowerCase(), value);
    }
    
    has(name: string): boolean {
      return this.headers.has(name.toLowerCase());
    }
  };
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-secret',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
};