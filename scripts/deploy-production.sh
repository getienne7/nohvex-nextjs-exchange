#!/bin/bash

# Production Deployment Script for NOHVEX Exchange
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running. Please start Docker first."
    fi
    
    success "Prerequisites check passed"
}

# Validate environment configuration
validate_environment() {
    log "Validating environment configuration..."
    
    if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
        error "Production environment file not found. Please copy .env.production from template and configure it."
    fi
    
    # Check for critical environment variables
    source "$PROJECT_ROOT/.env.production"
    
    if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "your-very-strong-database-password" ]; then
        error "POSTGRES_PASSWORD must be set in .env.production"
    fi
    
    if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "your-production-nextauth-secret-change-this-to-a-very-strong-random-string" ]; then
        error "NEXTAUTH_SECRET must be set in .env.production"
    fi
    
    if [ -z "$NOWNODES_API_KEY" ] || [ "$NOWNODES_API_KEY" = "your-production-nownodes-api-key" ]; then
        warning "NOWNODES_API_KEY should be configured in .env.production"
    fi
    
    success "Environment validation passed"
}

# Create backup if containers exist
backup_existing() {
    log "Checking for existing deployment..."
    
    if docker-compose ps | grep -q "nohvex-exchange"; then
        log "Existing deployment found. Creating backup..."
        
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="backup_$(date +'%Y%m%d_%H%M%S')"
        
        # Backup database
        if docker-compose exec -T postgres pg_dump -U nohvex nohvex_production > "$BACKUP_DIR/${BACKUP_NAME}_database.sql" 2>/dev/null; then
            success "Database backup created: ${BACKUP_NAME}_database.sql"
        else
            warning "Could not create database backup (container may not be running)"
        fi
        
        # Backup environment
        cp "$PROJECT_ROOT/.env.production" "$BACKUP_DIR/${BACKUP_NAME}_env.production" 2>/dev/null || true
        
        success "Backup completed"
    else
        log "No existing deployment found"
    fi
}

# Build and deploy
deploy() {
    log "Starting production deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Pull latest images
    log "Pulling latest base images..."
    docker-compose pull postgres redis
    
    # Build application
    log "Building application..."
    docker-compose build --no-cache web
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_health
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose exec -T web npm run db:push
    
    success "Deployment completed successfully!"
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U nohvex -d nohvex_production &> /dev/null; then
        success "PostgreSQL is healthy"
    else
        error "PostgreSQL health check failed"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        success "Redis is healthy"
    else
        warning "Redis health check failed (this is optional)"
    fi
    
    # Check Web Application
    sleep 10  # Give the app time to start
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        success "Web application is healthy"
    else
        error "Web application health check failed"
    fi
}

# Show status
show_status() {
    log "Deployment Status:"
    echo ""
    docker-compose ps
    echo ""
    log "Application URLs:"
    echo "  • Web Application: http://localhost:3000"
    echo "  • Health Check: http://localhost:3000/api/health"
    echo "  • Database: localhost:5434"
    echo ""
    log "Useful commands:"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • Update services: $0"
    echo ""
}

# Main deployment process
main() {
    log "Starting NOHVEX Exchange Production Deployment"
    log "============================================"
    
    check_prerequisites
    validate_environment
    backup_existing
    deploy
    show_status
    
    success "Production deployment completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "status")
        show_status
        ;;
    "health")
        check_health
        ;;
    "backup")
        backup_existing
        ;;
    "logs")
        docker-compose logs -f "${2:-}"
        ;;
    "stop")
        log "Stopping services..."
        docker-compose down
        success "Services stopped"
        ;;
    "restart")
        log "Restarting services..."
        docker-compose restart "${2:-}"
        success "Services restarted"
        ;;
    *)
        echo "Usage: $0 {deploy|status|health|backup|logs|stop|restart}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Run full deployment (default)"
        echo "  status  - Show service status"
        echo "  health  - Check service health"
        echo "  backup  - Create backup"
        echo "  logs    - Show logs (optionally specify service)"
        echo "  stop    - Stop all services"
        echo "  restart - Restart services (optionally specify service)"
        exit 1
        ;;
esac