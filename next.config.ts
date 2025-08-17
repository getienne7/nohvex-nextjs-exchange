import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Do not expose secrets or server-only env at build time. Access process.env directly in server code.
  trailingSlash: false,
  generateEtags: false,
};

export default nextConfig;
