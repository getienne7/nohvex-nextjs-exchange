# Docker Development Environment Guide

This guide will help you set up and use the Docker development environment for NOHVEX.

## 🚀 Quick Start

### Prerequisites

- Docker Engine installed and running
- Docker Compose (usually included with Docker Desktop)

### First Time Setup

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd nohvex-nextjs-exchange
   ```

2. **Configure environment variables**:

   ```bash
   # Copy the Docker environment template
   cp .env.docker .env.docker.local

   # Edit .env.docker.local with your actual API keys
   # At minimum, update NOWNODES_API_KEY and NEXTAUTH_SECRET
   ```

3. **Start the development environment**:

   ```bash
   npm run docker:dev
   ```

   This will:

   - Build the development Docker image
   - Start PostgreSQL database
   - Start the Next.js development server with Turbopack
   - Set up hot reloading for code changes

4. **Initialize the database** (in a new terminal):

   ```bash
   # Push the Prisma schema to the database
   docker-compose -f docker-compose.dev.yml exec web npm run db:push

   # Seed the database with demo data
   docker-compose -f docker-compose.dev.yml exec web npm run db:seed
   ```

5. **Access the application**:
   - Application: http://localhost:3000
   - Database: localhost:5434 (if you need direct access)

## 📋 Daily Development Commands

### Container Management

```bash
# Start containers (after first setup)
npm run docker:dev

# Start in detached mode (background)
docker-compose -f docker-compose.dev.yml up -d

# Stop containers
npm run docker:down

# View logs
npm run docker:logs

# View only web container logs
docker-compose -f docker-compose.dev.yml logs -f web

# View only database logs
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Development Tasks

```bash
# Shell into the web container
docker-compose -f docker-compose.dev.yml exec web sh

# Install new packages
docker-compose -f docker-compose.dev.yml exec web npm install <package-name>

# Run TypeScript check
docker-compose -f docker-compose.dev.yml exec web npm run typecheck

# Run linting
docker-compose -f docker-compose.dev.yml exec web npm run lint

# Open Prisma Studio
docker-compose -f docker-compose.dev.yml exec web npm run db:studio
```

### Database Operations

```bash
# Push schema changes
docker-compose -f docker-compose.dev.yml exec web npm run db:push

# Reset database
docker-compose -f docker-compose.dev.yml exec web npm run db:reset

# Seed database
docker-compose -f docker-compose.dev.yml exec web npm run db:seed

# Generate Prisma client (after schema changes)
docker-compose -f docker-compose.dev.yml exec web npm run db:generate
```

## 🔧 Configuration

### Environment Variables

The Docker environment uses `.env.docker` for configuration. Key variables:

- `NOWNODES_API_KEY`: Your NOWNodes API key for crypto data
- `NEXTAUTH_SECRET`: Secret for JWT signing (change from default)
- `DATABASE_URL`: Automatically configured for Docker PostgreSQL
- `CHOKIDAR_USEPOLLING`: Enables hot reloading in Docker

### Ports

- **3000**: Next.js application
- **5434**: PostgreSQL database (mapped from container port 5432)

### Volumes

- **Source code**: Live mounted for hot reloading
- **node_modules**: Cached in named volume for performance
- **postgres_data**: Persistent database storage
- **.next**: Build cache for faster rebuilds

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**:

   ```bash
   # Check what's using port 3000
   lsof -i :3000

   # Or change the port in docker-compose.dev.yml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

2. **Database connection issues**:

   ```bash
   # Check database health
   docker-compose -f docker-compose.dev.yml ps

   # Restart database
   docker-compose -f docker-compose.dev.yml restart postgres
   ```

3. **Node modules issues**:

   ```bash
   # Clear node_modules volume
   docker-compose -f docker-compose.dev.yml down -v
   docker volume rm nohvex-nextjs-exchange_node_modules
   npm run docker:dev
   ```

4. **Hot reloading not working**:
   - Ensure `CHOKIDAR_USEPOLLING=1` is set
   - Check that source code is properly mounted
   - Try restarting the web container

### Performance Tips

1. **Use .dockerignore**: Already configured to exclude unnecessary files
2. **Volume optimization**: node_modules and .next are cached in volumes
3. **Polling enabled**: For reliable hot reloading on all platforms

## 🔄 Development Workflow

1. **Start Docker environment**: `npm run docker:dev`
2. **Make code changes**: Files are live-reloaded
3. **Database changes**: Run migrations with `docker-compose exec`
4. **Testing**: Use container environment for consistent testing
5. **Stop environment**: `npm run docker:down` when done

## 🚀 Moving to Production

When ready to deploy:

1. **Test build**: `docker-compose -f docker-compose.dev.yml exec web npm run build`
2. **Run tests**: When implemented, use `npm test`
3. **Commit changes**: Git workflow with CI/CD pipeline
4. **Deploy**: Automatic deployment via GitHub Actions

## 📝 Notes

- The development environment is isolated from your local Node.js installation
- Database data persists between container restarts
- All npm scripts can be run inside the container using `docker-compose exec`
- The environment closely matches production for consistency
