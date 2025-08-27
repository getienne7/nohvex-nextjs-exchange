# NOHVEX Production Deployment Guide - Vercel

This guide provides step-by-step instructions for deploying the NOHVEX exchange to production using Vercel.

## Overview

Vercel is the recommended production deployment platform for NOHVEX due to:

- Native Next.js optimization
- Edge computing capabilities
- Automatic HTTPS and CDN
- Built-in CI/CD integration
- Serverless function support

## Prerequisites

### Required Accounts

- ✅ GitHub account with repository access
- ✅ Vercel account (free tier available)
- ✅ Production database (PostgreSQL)
- ✅ External API keys (NOWNodes, etc.)

### Required Tools

- ✅ Vercel CLI (`npm i -g vercel`)
- ✅ GitHub CLI (optional but recommended)

## Production Environment Setup

### 1. Database Configuration

**Recommended Providers:**

- **Neon** (PostgreSQL, serverless)
- **PlanetScale** (MySQL-compatible)
- **Supabase** (PostgreSQL with additional features)

**Setup Steps:**

```bash
# Example with Neon
1. Go to https://neon.tech
2. Create new project: "nohvex-production"
3. Create database: "nohvex_prod"
4. Note connection strings:
   - DATABASE_URL (for app)
   - DIRECT_URL (for migrations)
```

### 2. External Services Setup

**NOWNodes API:**

```bash
1. Register at https://nownodes.io
2. Subscribe to appropriate plan
3. Generate API key for production
4. Set rate limits and monitoring
```

**Email Service (Optional):**

```bash
# AWS SES
1. Set up AWS SES account
2. Verify domain/email addresses
3. Generate access keys
4. Configure in production environment
```

## Vercel Deployment Process

### Step 1: Project Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Navigate to project directory
cd nohvex-nextjs-exchange

# 4. Initialize Vercel project
vercel --yes
```

### Step 2: Environment Variables

**Critical Production Variables:**

```bash
# Database
DATABASE_URL=postgresql://username:password@host/database
DIRECT_URL=postgresql://username:password@host/database

# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-32-chars-min

# External APIs
NOWNODES_API_KEY=your-production-api-key
NOWNODES_BASE_URL=https://bsc.nownodes.io

# Email (if using AWS SES)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1

# Optional: Error tracking
SENTRY_DSN=your-sentry-dsn
```

**Setting Variables in Vercel:**

```bash
# Method 1: Vercel CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NOWNODES_API_KEY production

# Method 2: Vercel Dashboard
1. Go to vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable with "Production" environment
```

### Step 3: Domain Configuration

**Custom Domain Setup:**

```bash
# 1. Add domain in Vercel dashboard
# Settings → Domains → Add domain

# 2. Configure DNS records:
# Type: CNAME
# Name: @ (or subdomain)
# Value: cname.vercel-dns.com

# 3. SSL certificate (automatic)
# Vercel handles SSL automatically
```

### Step 4: Database Migration

```bash
# 1. Run migrations on production database
npx prisma db push --force-reset

# 2. Generate Prisma client for production
npx prisma generate

# 3. Seed production database (optional)
npx prisma db seed
```

### Step 5: Production Deployment

```bash
# Deploy to production
vercel --prod

# Or with specific configuration
vercel --prod --force
```

## Post-Deployment Configuration

### 1. Health Check Verification

```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": { "used": 50, "total": 100 },
  "environment": "production"
}
```

### 2. API Endpoint Testing

```bash
# Test prices endpoint
curl "https://your-domain.vercel.app/api/prices?symbols=BTC,ETH"

# Test with authentication required
curl -H "Authorization: Bearer token" \
     https://your-domain.vercel.app/api/wallet/balance
```

### 3. Performance Verification

```bash
# Run lighthouse audit
npx lighthouse https://your-domain.vercel.app --output json

# Check Core Web Vitals
# - Largest Contentful Paint < 2.5s
# - First Input Delay < 100ms
# - Cumulative Layout Shift < 0.1
```

## Security Configuration

### 1. Environment Security

```bash
# Verify no secrets in logs
vercel logs your-project-name --since 1h

# Check environment variables
vercel env ls
```

### 2. Content Security Policy

Already configured in `next.config.ts`:

```typescript
// CSP headers are automatically applied
"default-src 'self'",
"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
"connect-src 'self' https: wss: ws:",
```

### 3. HTTPS Enforcement

```bash
# Vercel automatically enforces HTTPS
# All HTTP requests are redirected to HTTPS
```

## Monitoring and Maintenance

### 1. Vercel Analytics

```bash
# Enable in Vercel dashboard
# Settings → Analytics → Enable

# Monitor:
# - Page views
# - Performance metrics
# - Error rates
# - Function execution time
```

### 2. Database Monitoring

```bash
# Monitor database performance
# - Connection pool usage
# - Query performance
# - Storage usage
# - Backup status
```

### 3. External API Monitoring

```bash
# Monitor NOWNodes usage
# - Request count
# - Rate limit status
# - Error rates
# - Response times
```

## Scaling Configuration

### 1. Vercel Function Limits

```javascript
// vercel.json configuration
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 256
    }
  }
}
```

### 2. Database Scaling

```bash
# Configure connection pooling
DATABASE_URL="postgresql://user:pass@host/db?pgbouncer=true&connection_limit=20"

# Enable read replicas (provider-specific)
# - Neon: Automatic read replicas
# - PlanetScale: Built-in scaling
```

### 3. CDN Configuration

```bash
# Vercel Edge Network automatically configured
# Static assets cached globally
# API responses can be cached with headers:

// In API routes
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

## Backup and Disaster Recovery

### 1. Database Backups

```bash
# Automated backups (provider-dependent)
# Neon: Automatic daily backups
# PlanetScale: Automatic backups + branching
# Supabase: Point-in-time recovery

# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 2. Code Deployment Rollback

```bash
# Rollback to previous deployment
vercel rollback

# Or specific deployment
vercel rollback https://your-app-hash.vercel.app
```

### 3. Environment Restoration

```bash
# Backup environment variables
vercel env pull .env.backup

# Restore from backup
# Manually re-add via dashboard or CLI
```

## Troubleshooting

### Common Issues

**1. Build Failures**

```bash
# Check build logs
vercel logs --since 1h

# Common fixes:
# - Update dependencies
# - Check TypeScript errors
# - Verify environment variables
```

**2. Database Connection Issues**

```bash
# Test connection locally
npm run db:test

# Check connection string format
# Ensure IP whitelist includes Vercel IPs
```

**3. API Rate Limiting**

```bash
# Monitor NOWNodes usage
# Implement caching
# Add request queuing
```

### Performance Issues

**1. Cold Start Optimization**

```typescript
// Keep functions warm (premium feature)
export const config = {
  runtime: "nodejs18.x",
  maxDuration: 30,
};
```

**2. Bundle Size Optimization**

```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Optimize imports
# Use dynamic imports for large components
```

## Cost Optimization

### 1. Vercel Usage

```bash
# Monitor usage in dashboard
# - Function invocations
# - Bandwidth usage
# - Build minutes

# Optimize:
# - Implement caching
# - Use Edge Functions for simple logic
# - Optimize images with next/image
```

### 2. Database Costs

```bash
# Monitor connection usage
# Implement connection pooling
# Use read replicas for analytics
# Archive old data
```

### 3. External API Costs

```bash
# Implement response caching
# Use webhooks instead of polling
# Batch requests where possible
```

## Support and Resources

### Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)

### Support Channels

- Vercel Support (Pro plans)
- Community Discord servers
- GitHub Issues for platform-specific problems

### Emergency Contacts

- Database provider support
- Domain registrar support
- External API provider support

---

**Next Steps:** After successful deployment, proceed to implement monitoring and logging for production observability.
