# Production Deployment Guide - NOHVEX Exchange

This guide provides comprehensive instructions for deploying NOHVEX Exchange to production using Docker.

## 📋 Prerequisites

### System Requirements

- **OS**: Linux (Ubuntu 20.04+ recommended) or Windows Server 2019+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB SSD
- **CPU**: 2+ cores recommended
- **Network**: HTTPS-capable domain (for SSL)

### Required Software

- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Git**: For code deployment
- **Nginx**: For reverse proxy (optional but recommended)

### Required Services

- **Domain Name**: With DNS configured
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)
- **NOWNodes API Key**: For blockchain data
- **Email Service**: AWS SES or similar
- **PostgreSQL**: (Containerized or external)

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd nohvex-nextjs-exchange

# Copy and configure environment
cp .env.production .env.production.local
nano .env.production.local  # Configure your production values
```

### 2. Configure Environment Variables

Edit `.env.production.local` with your production values:

```bash
# Critical - Must be changed
POSTGRES_PASSWORD=your-very-strong-database-password
NEXTAUTH_SECRET=your-production-nextauth-secret-very-long-random-string
NOWNODES_API_KEY=your-production-nownodes-api-key
NEXTAUTH_URL=https://yourdomain.com

# Required for functionality
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 3. Deploy

```bash
# Linux/macOS
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# Windows
scripts\deploy-production.bat
```

## 🔧 Detailed Configuration

### Environment Configuration

#### Critical Settings (Must Configure)

```bash
# Database Security
POSTGRES_PASSWORD=<generate-strong-password>

# Application Security
NEXTAUTH_SECRET=<generate-64-char-random-string>

# Domain Configuration
NEXTAUTH_URL=https://yourdomain.com

# API Keys
NOWNODES_API_KEY=<your-nownodes-api-key>
```

#### Email Configuration

```bash
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
FROM_EMAIL=noreply@yourdomain.com
```

#### Security Configuration

```bash
# Rate Limiting (Adjust based on traffic)
RATE_LIMIT_MAX_REQUESTS=60
RATE_LIMIT_WINDOW_MS=900000

# Session Security
SESSION_MAX_AGE=43200  # 12 hours
SESSION_UPDATE_AGE=3600  # 1 hour

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### SSL/HTTPS Setup

#### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Configure auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option 2: Custom Certificate

```bash
# Place certificates
mkdir -p nginx/ssl
cp your-certificate.crt nginx/ssl/cert.pem
cp your-private-key.key nginx/ssl/private.key

# Update nginx configuration
nano nginx/nginx.conf
```

### Database Configuration

#### Internal PostgreSQL (Default)

The included PostgreSQL container handles all database needs automatically.

#### External PostgreSQL

```bash
# Update environment
DATABASE_URL=postgresql://user:password@external-host:5432/database
DIRECT_URL=postgresql://user:password@external-host:5432/database

# Remove postgres service from docker-compose.yml
```

## 🐳 Docker Configuration

### Service Architecture

The production deployment includes:

1. **Web Application** (`nohvex-exchange-web`)

   - Next.js application with optimized production build
   - Health checks and resource limits
   - Automatic restarts

2. **PostgreSQL Database** (`nohvex-exchange-postgres`)

   - Persistent data storage
   - Automated backups
   - Health monitoring

3. **Redis Cache** (`nohvex-exchange-redis`)

   - Session storage
   - Application caching
   - Optional but recommended

4. **Nginx Proxy** (`nohvex-exchange-nginx`)
   - SSL termination
   - Rate limiting
   - Static file serving
   - Optional (use profile: nginx)

### Container Management

```bash
# Start all services
docker-compose up -d

# Start with Nginx
docker-compose --profile nginx up -d

# Scale web application (if needed)
docker-compose up -d --scale web=2

# View logs
docker-compose logs -f web
docker-compose logs -f postgres

# Stop services
docker-compose down

# Complete cleanup (removes volumes)
docker-compose down -v
```

### Resource Limits

Production containers include resource limits:

```yaml
web:
  deploy:
    resources:
      limits:
        memory: 1G
        cpus: "0.5"
      reservations:
        memory: 512M
        cpus: "0.25"
```

## 📊 Monitoring & Maintenance

### Health Checks

#### Application Health

```bash
# Check application health
curl -f http://localhost:3000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 256,
    "total": 512
  },
  "environment": "production"
}
```

#### Service Health

```bash
# Check all services
docker-compose ps

# Expected output: All services "Up" and "healthy"
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f web
docker-compose logs -f postgres
docker-compose logs -f redis

# Save logs to file
docker-compose logs --no-color > deployment-$(date +%Y%m%d).log
```

### Backup Strategy

#### Automated Backups

```bash
# Database backup script (add to crontab)
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U nohvex nohvex_production > "$BACKUP_DIR/db_backup_$DATE.sql"

# Retention: Keep last 30 days
find "$BACKUP_DIR" -name "db_backup_*.sql" -mtime +30 -delete
```

#### Manual Backup

```bash
# Create backup
./scripts/deploy-production.sh backup

# Restore from backup
docker-compose exec -T postgres psql -U nohvex nohvex_production < backup_file.sql
```

## 🔄 Updates & Maintenance

### Application Updates

```bash
# 1. Pull latest code
git pull origin main

# 2. Backup current deployment
./scripts/deploy-production.sh backup

# 3. Deploy updates
./scripts/deploy-production.sh deploy

# 4. Verify deployment
./scripts/deploy-production.sh health
```

### Database Migrations

```bash
# Run migrations
docker-compose exec web npm run db:push

# Reset database (destructive)
docker-compose exec web npm run db:reset
```

### Security Updates

```bash
# Update base images
docker-compose pull

# Rebuild application
docker-compose build --no-cache web

# Deploy updates
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
docker-compose logs web

# Common causes:
# - Environment variables not set
# - Database connection failed
# - Port conflicts
```

#### 2. Database Connection Failed

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U nohvex

# Check environment variables
docker-compose exec web env | grep DATABASE

# Reset database container
docker-compose restart postgres
```

#### 3. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew

# Restart Nginx
docker-compose restart nginx
```

#### 4. Performance Issues

```bash
# Check resource usage
docker stats

# Scale web application
docker-compose up -d --scale web=2

# Increase resource limits in docker-compose.yml
```

### Emergency Procedures

#### Rollback Deployment

```bash
# Stop current deployment
docker-compose down

# Restore from backup
# (Follow backup restoration steps)

# Start with previous configuration
docker-compose up -d
```

#### Database Recovery

```bash
# Stop application
docker-compose stop web

# Restore database
docker-compose exec -T postgres psql -U nohvex nohvex_production < latest_backup.sql

# Start application
docker-compose start web
```

## 📞 Support

### Log Collection

When reporting issues, collect:

1. `docker-compose logs --no-color > logs.txt`
2. `docker-compose ps > status.txt`
3. Environment configuration (redacted)
4. Steps to reproduce

### Performance Monitoring

- Monitor container resource usage
- Track application response times
- Monitor database performance
- Set up alerts for critical metrics

---

## 🔐 Security Checklist

- [ ] Strong passwords for all services
- [ ] SSL certificate configured and valid
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Regular security updates applied
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Database access restricted

---

This deployment guide ensures a secure, scalable, and maintainable production environment for NOHVEX Exchange.
