import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for production Docker builds
  output: 'standalone',
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Do not expose secrets or server-only env at build time. Access process.env directly in server code.
  trailingSlash: false,
  generateEtags: false,
  eslint: {
    // Re-enable ESLint checks now that we've fixed the major issues
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Re-enable TypeScript checks now that we've fixed the major issues
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://verify.walletconnect.com https://verify.walletconnect.org https://explorer-api.walletconnect.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: ws:",
              "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;