# NOHVEX Enhanced Development Environment Guide

Comprehensive guide for the enhanced Docker-based development environment with Redis, monitoring, admin tools, and production-matching capabilities.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Development Tools](#development-tools)
4. [Services & Components](#services--components)
5. [Monitoring & Health Checks](#monitoring--health-checks)
6. [Database Management](#database-management)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Features](#advanced-features)

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (latest version)
- **Node.js** v20+ (for local development)
- **Git** (for version control)
- **Windows**: PowerShell or Command Prompt
- **macOS/Linux**: Terminal with bash support

### 1. Clone and Setup

```bash
git clone <repository-url>
cd nohvex-nextjs-exchange

# Copy environment template
cp .env.docker .env.docker.local

# Edit your environment variables
# Add your NOWNODES_API_KEY, NEXTAUTH_SECRET, etc.
```

### 2. Start Development Environment

**Windows (Command Prompt):**

```cmd
scripts\\dev-tools.bat start
```

**Windows (PowerShell):**

```powershell
scripts\\dev-tools.ps1 start
```

**macOS/Linux:**

```bash
./scripts/dev-tools.sh start
```

**Using npm scripts:**

```bash
npm run docker:dev:start
```

### 3. Access Your Application

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Development Metrics**: http://localhost:3000/api/dev-metrics
- **Database Admin**: http://localhost:8080 (when admin profile is running)
- **Redis Admin**: http://localhost:8081 (when admin profile is running)

## 🛠️ Environment Setup

### Environment Variables Configuration

The enhanced development environment uses `.env.docker` with comprehensive configuration options:

#### Required Variables

```env
# API Keys (REQUIRED)
NOWNODES_API_KEY=your-nownodes-api-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here

# Database (Auto-configured for Docker)
DATABASE_URL=postgresql://nohvex:your-password@postgres:5432/nohvex?schema=public
DIRECT_URL=postgresql://nohvex:your-password@postgres:5432/nohvex?schema=public
```

#### Optional Integrations

```env
# Redis Configuration
REDIS_URL=redis://:dev-redis-password@redis:6379
REDIS_PASSWORD=dev-redis-password

# WalletConnect
WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Email Service
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Trading APIs
CHANGENOW_API_KEY=your-changenow-api-key
MORALIS_API_KEY=your-moralis-api-key
```

### Docker Services Architecture

The development environment includes:

- **Web Application** (Node.js 20, Next.js 15.4.6)
- **PostgreSQL 16** (Primary database)
- **Redis 7** (Caching and session storage)
- **Adminer** (Database web interface)
- **Redis Commander** (Redis web interface)

## 🛠️ Development Tools

### Main Development Scripts

Three cross-platform development tool scripts are available:

1. **`scripts/dev-tools.bat`** - Windows Command Prompt
2. **`scripts/dev-tools.ps1`** - Windows PowerShell
3. **`scripts/dev-tools.sh`** - macOS/Linux bash

### Available Commands

```bash
# Environment Management
scripts/dev-tools.bat start      # Start development environment
scripts/dev-tools.bat stop       # Stop development environment
scripts/dev-tools.bat restart    # Restart development environment
scripts/dev-tools.bat status     # Show environment status
scripts/dev-tools.bat logs       # View application logs

# Development Tools
scripts/dev-tools.bat shell      # Open container shell
scripts/dev-tools.bat db         # Database tools menu
scripts/dev-tools.bat test       # Run tests
scripts/dev-tools.bat health     # Health check
scripts/dev-tools.bat clean      # Clean environment

# Monitoring & Admin
scripts/dev-tools.bat admin      # Start admin interfaces
scripts/dev-tools.bat monitor    # Monitor services
scripts/dev-tools.bat backup     # Backup data
scripts/dev-tools.bat restore    # Restore data
```

### NPM Script Shortcuts

```bash
# Quick Docker commands
npm run docker:dev:start        # Start development containers
npm run docker:dev:stop         # Stop development containers
npm run docker:logs             # View web application logs
npm run docker:shell            # Open container shell
npm run docker:admin            # Start admin interfaces
npm run docker:health           # Quick health check
npm run docker:metrics          # Development metrics

# Development utilities
npm run dev:tools               # Launch development tools menu
npm run dev:test                # Test development environment
npm run dev:health              # Pretty health check output
npm run dev:metrics             # Pretty metrics output
```

## 🔧 Services & Components

### Web Application

- **Port**: 3000
- **Technology**: Next.js 15.4.6 with Turbopack
- **Features**: Hot reload, TypeScript, Tailwind CSS
- **Health Check**: http://localhost:3000/api/health

### PostgreSQL Database

- **Port**: 5434 (host) → 5432 (container)
- **Version**: PostgreSQL 16
- **Database**: `nohvex`
- **User**: `nohvex`
- **Management**: Prisma ORM + Adminer web interface

### Redis Cache

- **Port**: 6379
- **Version**: Redis 7 Alpine
- **Features**: Persistence enabled, password protected
- **Management**: Redis Commander web interface

### Admin Interfaces

- **Adminer** (Database): http://localhost:8080
- **Redis Commander**: http://localhost:8081
- **Activation**: Use `admin` profile or run `npm run docker:admin`

## 📊 Monitoring & Health Checks

### Health Check Endpoint

**URL**: http://localhost:3000/api/health

**Features**:

- Application status and uptime
- Memory usage statistics
- Database connectivity test
- Redis connectivity test
- External API configuration status
- Feature configuration status

**Example Response**:

```json
{
  \"status\": \"healthy\",
  \"timestamp\": \"2024-01-15T10:30:00.000Z\",
  \"uptime\": 3600,
  \"memory\": {
    \"used\": 256,
    \"total\": 512,
    \"rss\": 280,
    \"external\": 45
  },
  \"services\": {
    \"application\": { \"status\": \"healthy\", \"latency\": 0 },
    \"database\": { \"status\": \"healthy\", \"latency\": 15 },
    \"redis\": { \"status\": \"configured\", \"latency\": 5 },
    \"external_apis\": { \"status\": \"configured\" }
  }
}
```

### Development Metrics Endpoint

**URL**: http://localhost:3000/api/dev-metrics

**Query Parameters**:

- `include`: Comma-separated list (system,database,redis,performance,features,tools,env)
- `format`: Response format (json,prometheus)

**Example**:

```bash
# Get all metrics
curl http://localhost:3000/api/dev-metrics

# Get specific metrics
curl \"http://localhost:3000/api/dev-metrics?include=system,database\"

# Get Prometheus format
curl \"http://localhost:3000/api/dev-metrics?format=prometheus\"
```

## 🗄️ Database Management

### Prisma Operations

```bash
# Database schema operations
npm run db:push          # Push schema changes
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and apply migration
npm run db:reset         # Reset database (DESTRUCTIVE)

# Data operations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio

# Container-based operations
npm run docker:db:shell  # Open PostgreSQL shell in container
scripts/dev-tools.bat db # Interactive database tools menu
```

### Database Tools Menu

The development tools include an interactive database management menu:

```bash
scripts/dev-tools.bat db
```

Options include:

1. Open Prisma Studio
2. Run database migrations
3. Seed database
4. Reset database
5. Open Adminer (Web UI)
6. Database backup
7. Database shell

### Backup and Restore

```bash
# Create backup
scripts/dev-tools.bat backup
# Creates: backups/postgres_YYYYMMDD_HHMMSS.sql

# Restore from backup
scripts/dev-tools.bat restore
# Lists available backups and prompts for selection
```

## 🧪 Testing

### Test Environment Validation

```bash
# Test the development environment setup
npm run dev:test
# or
scripts/test-dev-env.bat
```

This runs a comprehensive test suite that validates:

- Docker availability
- Configuration files
- Container startup
- Service connectivity
- Health endpoints
- Admin interfaces

### Application Testing

```bash
# Run all tests
npm test

# Specific test types
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # End-to-end tests only
npm run test:coverage    # Tests with coverage report
npm run test:watch       # Watch mode

# Container-based testing
scripts/dev-tools.bat test  # Interactive test menu
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Containers Won't Start

```bash
# Check Docker is running
docker info

# Check logs
npm run docker:logs

# Clean and rebuild
npm run docker:dev:clean
npm run docker:dev:build
npm run docker:dev:start
```

#### 2. Database Connection Issues

```bash
# Check database container
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U nohvex

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Reset database
scripts/dev-tools.bat db  # Select option 4 (Reset database)
```

#### 3. Application Health Check Fails

```bash
# Check application logs
npm run docker:logs

# Check health endpoint directly
curl -v http://localhost:3000/api/health

# Restart web container
docker-compose -f docker-compose.dev.yml restart web
```

#### 4. API Keys Not Working

```bash
# Verify environment configuration
scripts/dev-tools.bat  # Will prompt if keys need configuration

# Test specific APIs
curl http://localhost:3000/api/nownodes-test
```

### Debug Mode

Enable verbose logging by setting in `.env.docker`:

```env
DEBUG_MODE=true
VERBOSE_LOGGING=true
```

### Container Resource Issues

If containers are slow or failing:

```bash
# Check resource usage
npm run docker:monitor
# or
scripts/dev-tools.bat monitor

# Adjust resource limits in docker-compose.dev.yml:
# deploy.resources.limits.memory and deploy.resources.limits.cpus
```

## 🚀 Advanced Features

### Custom Profiles

The Docker Compose setup supports profiles for optional services:

```bash
# Start with admin interfaces
docker-compose -f docker-compose.dev.yml --profile admin up -d

# Start everything
docker-compose -f docker-compose.dev.yml --profile admin up -d
```

### Network Configuration

Services communicate over a custom bridge network:

- **Network**: `nohvex-dev-network`
- **Subnet**: `172.20.0.0/16`
- **DNS**: Automatic service discovery

### Volume Management

Persistent volumes for data:

- **postgres_data**: Database files
- **redis_data**: Redis persistence
- **node_modules**: Node.js dependencies (performance)
- **next_cache**: Next.js build cache

### Performance Optimization

#### Development Features

- **Turbopack**: Faster builds (enabled by default)
- **Hot Reload**: File watching with polling for containers
- **Incremental Builds**: TypeScript incremental compilation
- **Caching**: Multi-layer Docker build caching

#### Container Optimizations

- **Resource Limits**: Configured for development workloads
- **Health Checks**: Automatic service health monitoring
- **Restart Policies**: `unless-stopped` for reliability

### Integration with Production

The development environment mirrors production capabilities:

- **Same services**: PostgreSQL, Redis, Next.js
- **Same APIs**: NOWNodes, WalletConnect, ChangeNow
- **Same monitoring**: Health checks and metrics
- **Same security**: Environment variable patterns

### Custom Development Scripts

You can extend the development tools by:

1. **Adding npm scripts** in `package.json`
2. **Extending dev-tools scripts** in `scripts/` directory
3. **Creating custom Docker Compose overrides**

```bash
# Example: Custom development command
npm run docker:custom
```

## 📚 Additional Resources

- **Production Deployment**: See `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **CI/CD Setup**: See `CI_CD_SETUP_GUIDE.md`
- **NOWNodes Integration**: See `NOWNODES_INTEGRATION_GUIDE.md`
- **Docker Production**: See `docker-compose.yml`
- **Database Setup**: See `DATABASE_SETUP.md`

## 🤝 Support

For issues with the development environment:

1. **Run diagnostics**: `npm run dev:test`
2. **Check logs**: `npm run docker:logs`
3. **Review health**: `npm run dev:health`
4. **Clean and rebuild**: Use development tools clean options

---

**Happy coding! 🚀**

Your enhanced NOHVEX development environment is now ready for building amazing DeFi applications.
