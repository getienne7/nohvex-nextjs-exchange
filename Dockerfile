# Production Dockerfile for NOHVEX Exchange
# Multi-stage build for optimized production image

# =============================================================================
# Stage 1: Dependencies (Base for both builder and runner)
# =============================================================================
FROM node:24-alpine AS base

# Install dependencies only when needed
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    git

WORKDIR /app

# Copy package files
COPY package*.json ./

# =============================================================================
# Stage 2: Builder (Build the application)
# =============================================================================
FROM base AS builder

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# =============================================================================
# Stage 3: Production Runner (Final production image)
# =============================================================================
FROM node:24-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    libc6-compat \
    dumb-init

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from builder stage
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy package.json for version info
COPY --from=builder /app/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]