# NOHVEX - DeFi Portfolio Management Platform

🚀 **Professional DeFi portfolio management platform** built with Next.js 15, React 19, and comprehensive blockchain integration.

[![Production](https://img.shields.io/badge/Production-Live-green)](https://nohvex-nextjs-exchange.vercel.app/)
[![Development](https://img.shields.io/badge/Development-Enhanced-blue)](#🛠️-enhanced-development-environment)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Automated-orange)](#)

> **Latest Update**: Enhanced Docker development environment with Redis, monitoring, and admin tools - August 2025

## 🌟 Production Features

✅ **Live Production**: https://nohvex-nextjs-exchange.vercel.app/

- 🔗 **Wallet Connection**: Multi-wallet support (WalletConnect, Coinbase)
- 📊 **Live Crypto Prices**: Real-time price feeds for BTC, ETH, BNB, ADA, USDT
- 💼 **Portfolio Management**: Non-custodial portfolio tracking and analytics
- 🔄 **Cross-chain Swaps**: DEX aggregation with zero trading fees
- 🛡️ **Bank-level Security**: Military-grade encryption and cold storage
- ⚡ **Instant Execution**: Lightning-fast order execution with real-time updates

## 🛠️ Enhanced Development Environment

**NEW**: Comprehensive Docker-based development environment with Redis, monitoring, admin tools, and production-matching capabilities.

### Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd nohvex-nextjs-exchange

# 2. Configure environment
cp .env.docker .env.docker.local
# Edit .env.docker.local with your API keys

# 3. Start enhanced development environment
scripts/dev-tools.bat start          # Windows
./scripts/dev-tools.sh start         # macOS/Linux
powershell scripts/dev-tools.ps1 start  # PowerShell

# Or using npm
npm run docker:dev:start
```

### 🎯 What's New in Enhanced Environment

- **🔴 Redis Integration**: Caching and session storage
- **📊 Advanced Monitoring**: Comprehensive health checks and metrics
- **🛡️ Admin Interfaces**: Adminer (DB) + Redis Commander web interfaces
- **🔧 Development Tools**: Cross-platform management scripts
- **🧪 Automated Testing**: Environment validation and test suites
- **📈 Performance Monitoring**: Real-time container and service metrics
- **💾 Backup/Restore**: Automated database backup and restore tools

### 🚀 Access Points

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Dev Metrics**: http://localhost:3000/api/dev-metrics
- **Database Admin**: http://localhost:8080 (when admin profile is running)
- **Redis Admin**: http://localhost:8081 (when admin profile is running)

### 🛠️ Development Commands

```bash
# Environment Management
npm run docker:dev:start     # Start development containers
npm run docker:dev:stop      # Stop development containers
npm run docker:logs          # View application logs
npm run docker:admin         # Start admin interfaces
npm run docker:health        # Quick health check

# Development Tools
npm run dev:tools            # Launch interactive tools menu
npm run dev:test             # Test development environment
npm run dev:health           # Pretty health check output
npm run dev:metrics          # Development metrics

# Database Operations
npm run db:studio            # Open Prisma Studio
npm run db:push              # Push schema changes
npm run db:seed              # Seed with sample data

# Testing
npm run test:unit            # Unit tests
npm run test:integration     # Integration tests
npm run test:e2e             # End-to-end tests
npm run test:coverage        # Coverage report
```

## 🔧 Legacy Development Setup

For traditional development without Docker:

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## 📋 Complete Documentation

- **📖 [Enhanced Development Guide](./ENHANCED_DEVELOPMENT_GUIDE.md)** - Comprehensive development setup
- **🐳 [Docker Development Guide](./DOCKER_DEVELOPMENT_GUIDE.md)** - Docker-specific instructions
- **🚀 [Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - Production deployment
- **⚙️ [CI/CD Setup Guide](./CI_CD_SETUP_GUIDE.md)** - Automated deployment pipeline
- **🔗 [NOWNodes Integration Guide](./NOWNODES_INTEGRATION_GUIDE.md)** - Blockchain API setup
- **🗄️ [Database Setup Guide](./DATABASE_SETUP.md)** - Database configuration

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL, Redis (caching)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, Framer Motion
- **API Integration**: NOWNodes for real-time crypto data
- **Development**: Docker, Docker Compose, Turbopack
- **Testing**: Jest, Playwright, GitHub Actions
- **Deployment**: Vercel, Docker production builds

## 🔗 DeFi Integration

This platform integrates with various DeFi protocols and services:

- **Real-time Price Feeds**: Live cryptocurrency pricing for accurate portfolio valuation
- **Cross-Chain Support**: Swap assets across different blockchain networks
- **Yield Farming**: Track and optimize DeFi yield farming strategies
- **Portfolio Analytics**: Advanced metrics for DeFi investment performance

### API Endpoints

- `GET /api/health` - Application health check
- `GET /api/dev-metrics` - Development environment metrics
- `GET /api/prices?symbols=BTC,ETH,BNB` - Fetch multiple cryptocurrency prices
- `POST /api/prices` - Get single cryptocurrency price
- `GET /api/nownodes-test` - Test NOWNodes integration

## 🚀 Deployment

### Production Deployment

The application is deployed on Vercel with automated CI/CD:

- **Production URL**: https://nohvex-nextjs-exchange.vercel.app/
- **Staging**: Automatic preview deployments on PRs
- **CI/CD**: GitHub Actions with automated testing and deployment

### Self-Hosted Deployment

For self-hosted deployment using Docker:

```bash
# Production deployment
npm run docker:prod

# Or manual Docker build
docker build -t nohvex-exchange .
docker run -p 3000:3000 nohvex-exchange
```

## 🌟 Next.js Resources

To learn more about Next.js:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js) - feedback and contributions welcome

## 📝 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the DeFi community**
