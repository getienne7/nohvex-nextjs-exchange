import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
    NOWNODES_API_KEY: process.env.NOWNODES_API_KEY || 'build-fallback-key',
  },
  trailingSlash: false,
  generateEtags: false,
};

export default nextConfig;
