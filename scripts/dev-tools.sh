#!/bin/bash

# NOHVEX Enhanced Development Tools Script
# Comprehensive development environment management, testing, and monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.dev.yml"
ADMIN_PROFILE="admin"

echo -e "${BLUE}🛠️  NOHVEX Development Tools${NC}"
echo "==========================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Function to show help
show_help() {
    echo ""
    echo "Usage: ./scripts/dev-tools.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start development environment"
    echo "  stop      - Stop development environment"
    echo "  restart   - Restart development environment"
    echo "  status    - Show environment status"
    echo "  logs      - View application logs"
    echo "  shell     - Open container shell"
    echo "  db        - Database tools menu"
    echo "  test      - Run tests"
    echo "  health    - Health check"
    echo "  clean     - Clean environment"
    echo "  admin     - Start admin interfaces"
    echo "  monitor   - Monitor services"
    echo "  backup    - Backup data"
    echo "  restore   - Restore data"
    echo ""
}

# Function to check environment file
check_env_file() {
    if [ ! -f ".env.docker" ]; then
        echo -e "${RED}❌ .env.docker file not found${NC}"
        echo "Please copy .env.docker.example to .env.docker and configure it"
        return 1
    fi

    if grep -q "your-nownodes-api-key-here" .env.docker; then
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: You need to configure your API keys${NC}"
        echo "    Edit .env.docker and update:"
        echo "    - NOWNODES_API_KEY (required for crypto data)"
        echo "    - NEXTAUTH_SECRET (required for authentication)"
        echo ""
        read -p "Have you updated the API keys? (y/n): " answer
        if [[ ! "$answer" =~ ^[Yy]$ ]]; then
            echo "Please update .env.docker first"
            return 1
        fi
    fi
    return 0
}

# Function to wait for service
wait_for_service() {
    local service_name=$1
    local display_name=$2
    echo "Waiting for $display_name..."
    
    local retry_count=0
    while ! docker-compose -f $COMPOSE_FILE ps "$service_name" | grep -q "Up"; do
        retry_count=$((retry_count + 1))
        if [ $retry_count -ge 30 ]; then
            echo -e "${RED}❌ $display_name failed to start after 30 attempts${NC}"
            return 1
        fi
        sleep 2
    done
    echo -e "${GREEN}✅ $display_name is ready${NC}"
    return 0
}

# Function to start development environment
start_dev() {
    echo ""
    echo -e "${BLUE}🚀 Starting development environment...${NC}"
    
    if ! check_env_file; then
        return 1
    fi

    echo "Building and starting containers..."
    docker-compose -f $COMPOSE_FILE up --build -d

    echo "Waiting for services to be ready..."
    sleep 15

    wait_for_service "postgres" "PostgreSQL"
    wait_for_service "redis" "Redis"
    wait_for_service "web" "Web Application"

    echo ""
    echo -e "${GREEN}✅ Development environment is ready!${NC}"
    echo ""
    echo -e "${CYAN}📱 Application: http://localhost:3000${NC}"
    echo -e "${CYAN}🗄️  Database: localhost:5434${NC}"
    echo -e "${CYAN}🔴 Redis: localhost:6379${NC}"
    echo ""
    echo "Use './scripts/dev-tools.sh logs' to view logs"
    echo "Use './scripts/dev-tools.sh admin' to access admin interfaces"
}

# Function to stop development environment
stop_dev() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping development environment...${NC}"
    docker-compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✅ Development environment stopped${NC}"
}

# Function to restart development environment
restart_dev() {
    echo ""
    echo -e "${BLUE}🔄 Restarting development environment...${NC}"
    docker-compose -f $COMPOSE_FILE restart
    echo -e "${GREEN}✅ Development environment restarted${NC}"
}

# Function to show status
show_status() {
    echo ""
    echo -e "${BLUE}📊 Development Environment Status:${NC}"
    echo "================================="
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "Container Health:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=nohvex-exchange"
}

# Function to show logs
show_logs() {
    echo ""
    echo -e "${BLUE}📋 Application Logs (Press Ctrl+C to exit):${NC}"
    echo "=========================================="
    docker-compose -f $COMPOSE_FILE logs -f web
}

# Function to open shell
open_shell() {
    echo ""
    echo -e "${BLUE}🐚 Opening container shell...${NC}"
    echo "Type 'exit' to return to host"
    docker-compose -f $COMPOSE_FILE exec web sh
}

# Function for database tools
db_tools() {
    while true; do
        echo ""
        echo -e "${BLUE}🗄️  Database Tools:${NC}"
        echo "================"
        echo ""
        echo "  1. Open Prisma Studio"
        echo "  2. Run database migrations"
        echo "  3. Seed database"
        echo "  4. Reset database"
        echo "  5. Open Adminer (Web UI)"
        echo "  6. Database backup"
        echo "  7. Database shell"
        echo "  0. Back to main menu"
        echo ""
        read -p "Enter your choice (0-7): " db_choice

        case $db_choice in
            0) return ;;
            1) 
                echo ""
                echo -e "${BLUE}🎨 Opening Prisma Studio...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm run db:studio
                ;;
            2)
                echo ""
                echo -e "${BLUE}🔄 Running database migrations...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm run db:push
                echo -e "${GREEN}✅ Database migrations complete${NC}"
                ;;
            3)
                echo ""
                echo -e "${BLUE}🌱 Seeding database...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm run db:seed
                echo -e "${GREEN}✅ Database seeded${NC}"
                ;;
            4)
                echo ""
                echo -e "${YELLOW}⚠️  This will RESET ALL DATA in the database!${NC}"
                read -p "Are you sure? (y/N): " confirm
                if [[ "$confirm" =~ ^[Yy]$ ]]; then
                    echo -e "${BLUE}🔄 Resetting database...${NC}"
                    docker-compose -f $COMPOSE_FILE exec web npm run db:reset
                    echo -e "${GREEN}✅ Database reset complete${NC}"
                fi
                ;;
            5)
                echo ""
                echo -e "${BLUE}🌐 Opening Adminer web interface...${NC}"
                echo "Starting admin services..."
                docker-compose -f $COMPOSE_FILE --profile $ADMIN_PROFILE up -d adminer
                echo ""
                echo "Adminer is available at: http://localhost:8080"
                echo "Server: postgres"
                echo "Username: nohvex"
                echo "Database: nohvex"
                echo "Password: (check your .env.docker file)"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            6)
                echo ""
                echo -e "${BLUE}💾 Creating database backup...${NC}"
                mkdir -p backups
                backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
                docker-compose -f $COMPOSE_FILE exec postgres pg_dump -U nohvex nohvex > "backups/$backup_file"
                echo -e "${GREEN}✅ Database backed up to: backups/$backup_file${NC}"
                ;;
            7)
                echo ""
                echo -e "${BLUE}🐚 Opening database shell...${NC}"
                docker-compose -f $COMPOSE_FILE exec postgres psql -U nohvex -d nohvex
                ;;
        esac
    done
}

# Function for test runner
run_tests() {
    while true; do
        echo ""
        echo -e "${BLUE}🧪 Test Runner:${NC}"
        echo "============="
        echo ""
        echo "  1. Run all tests"
        echo "  2. Unit tests only"
        echo "  3. Integration tests only"
        echo "  4. E2E tests only"
        echo "  5. Test with coverage"
        echo "  6. Watch mode"
        echo "  0. Back to main menu"
        echo ""
        read -p "Enter your choice (0-6): " test_choice

        case $test_choice in
            0) return ;;
            1)
                echo ""
                echo -e "${BLUE}🧪 Running all tests...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm test
                ;;
            2)
                echo ""
                echo -e "${BLUE}🧪 Running unit tests...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm run test:unit
                ;;
            3)
                echo ""
                echo -e "${BLUE}🧪 Running integration tests...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm run test:integration
                ;;
            4)
                echo ""
                echo -e "${BLUE}🧪 Running E2E tests...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm run test:e2e
                ;;
            5)
                echo ""
                echo -e "${BLUE}📊 Running tests with coverage...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm run test:coverage
                ;;
            6)
                echo ""
                echo -e "${BLUE}👀 Running tests in watch mode...${NC}"
                docker-compose -f $COMPOSE_FILE exec web npm run test:watch
                ;;
        esac
    done
}

# Function for health check
health_check() {
    echo ""
    echo -e "${BLUE}🏥 Health Check:${NC}"
    echo "=============="
    echo ""
    
    echo "Checking application health..."
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy${NC}"
    else
        echo -e "${RED}❌ Application health check failed${NC}"
    fi

    echo ""
    echo "Checking database connection..."
    if docker-compose -f $COMPOSE_FILE exec postgres pg_isready -U nohvex >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is healthy${NC}"
    else
        echo -e "${RED}❌ Database health check failed${NC}"
    fi

    echo ""
    echo "Checking Redis connection..."
    if docker-compose -f $COMPOSE_FILE exec redis redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}✅ Redis is healthy${NC}"
    else
        echo -e "${RED}❌ Redis health check failed${NC}"
    fi
}

# Function to clean environment
clean_env() {
    echo ""
    echo -e "${BLUE}🧹 Cleaning Development Environment:${NC}"
    echo "=================================="
    echo ""
    echo "  1. Clean containers only"
    echo "  2. Clean containers and volumes"
    echo "  3. Clean everything (DANGEROUS)"
    echo "  0. Cancel"
    echo ""
    read -p "Enter your choice (0-3): " clean_choice

    case $clean_choice in
        0) return ;;
        1)
            echo ""
            echo -e "${BLUE}🧹 Cleaning containers...${NC}"
            docker-compose -f $COMPOSE_FILE down
            docker system prune -f
            echo -e "${GREEN}✅ Containers cleaned${NC}"
            ;;
        2)
            echo ""
            echo -e "${YELLOW}⚠️  This will remove all database data!${NC}"
            read -p "Are you sure? (y/N): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                echo -e "${BLUE}🧹 Cleaning containers and volumes...${NC}"
                docker-compose -f $COMPOSE_FILE down -v
                docker system prune -f
                echo -e "${GREEN}✅ Containers and volumes cleaned${NC}"
            fi
            ;;
        3)
            echo ""
            echo -e "${RED}⚠️  DANGER: This will remove EVERYTHING!${NC}"
            echo "This includes all Docker images, containers, volumes, and networks."
            read -p "Are you ABSOLUTELY sure? (y/N): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                echo -e "${BLUE}🧹 Nuclear cleaning...${NC}"
                docker-compose -f $COMPOSE_FILE down -v --rmi all
                docker system prune -a -f --volumes
                echo -e "${GREEN}✅ Everything cleaned${NC}"
            fi
            ;;
    esac
}

# Function to start admin interfaces
start_admin() {
    echo ""
    echo -e "${BLUE}📊 Starting admin interfaces...${NC}"
    docker-compose -f $COMPOSE_FILE --profile $ADMIN_PROFILE up -d
    echo ""
    echo -e "${GREEN}✅ Admin interfaces started:${NC}"
    echo -e "${CYAN}  📊 Adminer (Database): http://localhost:8080${NC}"
    echo -e "${CYAN}  🔴 Redis Commander: http://localhost:8081${NC}"
    echo ""
    echo "To stop admin interfaces:"
    echo "  docker-compose -f $COMPOSE_FILE --profile $ADMIN_PROFILE down"
}

# Function to monitor services
monitor_services() {
    echo ""
    echo -e "${BLUE}📊 Service Monitoring:${NC}"
    echo "===================="
    echo ""
    echo "Real-time container stats (Press Ctrl+C to exit):"
    docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Function to backup data
backup_data() {
    echo ""
    echo -e "${BLUE}💾 Data Backup:${NC}"
    echo "============="
    mkdir -p backups
    timestamp=$(date +%Y%m%d_%H%M%S)
    echo ""
    echo "Creating backup with timestamp: $timestamp"
    echo ""
    echo "Backing up PostgreSQL database..."
    docker-compose -f $COMPOSE_FILE exec postgres pg_dump -U nohvex nohvex > "backups/postgres_$timestamp.sql"
    echo ""
    echo "Backing up Redis data..."
    docker-compose -f $COMPOSE_FILE exec redis redis-cli --rdb "backups/redis_$timestamp.rdb"
    echo ""
    echo -e "${GREEN}✅ Backup complete:${NC}"
    echo -e "${CYAN}  📊 PostgreSQL: backups/postgres_$timestamp.sql${NC}"
    echo -e "${CYAN}  🔴 Redis: backups/redis_$timestamp.rdb${NC}"
}

# Function to restore data
restore_data() {
    echo ""
    echo -e "${BLUE}🔄 Data Restore:${NC}"
    echo "=============="
    echo "Available backups:"
    ls -la backups/*.sql 2>/dev/null || echo "No SQL backups found"
    echo ""
    read -p "Enter backup filename (without path): " backup_file
    
    if [ ! -f "backups/$backup_file" ]; then
        echo -e "${RED}❌ Backup file not found: backups/$backup_file${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}⚠️  This will REPLACE current database data!${NC}"
    read -p "Continue with restore? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${BLUE}🔄 Restoring database...${NC}"
        docker-compose -f $COMPOSE_FILE exec -T postgres psql -U nohvex -d nohvex < "backups/$backup_file"
        echo -e "${GREEN}✅ Database restored from: backups/$backup_file${NC}"
    fi
}

# Main script logic
if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        echo ""
        echo "Select an option:"
        echo ""
        echo -e "${GREEN}🚀 Environment Management:${NC}"
        echo "  1. Start development environment"
        echo "  2. Stop development environment"
        echo "  3. Restart development environment"
        echo "  4. Show environment status"
        echo "  5. View application logs"
        echo ""
        echo -e "${BLUE}🔧 Development Tools:${NC}"
        echo "  6. Open container shell"
        echo "  7. Database tools"
        echo "  8. Run tests"
        echo "  9. Health check"
        echo "  10. Clean environment"
        echo ""
        echo -e "${PURPLE}📊 Monitoring & Admin:${NC}"
        echo "  11. Start admin interfaces"
        echo "  12. Monitor services"
        echo "  13. Backup data"
        echo "  14. Restore data"
        echo ""
        echo "  0. Exit"
        echo ""
        read -p "Enter your choice (0-14): " choice

        case $choice in
            0) exit 0 ;;
            1) start_dev ;;
            2) stop_dev ;;
            3) restart_dev ;;
            4) show_status ;;
            5) show_logs ;;
            6) open_shell ;;
            7) db_tools ;;
            8) run_tests ;;
            9) health_check ;;
            10) clean_env ;;
            11) start_admin ;;
            12) monitor_services ;;
            13) backup_data ;;
            14) restore_data ;;
            *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
        esac
    done
else
    # Command line mode
    case $1 in
        start) start_dev ;;
        stop) stop_dev ;;
        restart) restart_dev ;;
        status) show_status ;;
        logs) show_logs ;;
        shell) open_shell ;;
        db) db_tools ;;
        test) run_tests ;;
        health) health_check ;;
        clean) clean_env ;;
        admin) start_admin ;;
        monitor) monitor_services ;;
        backup) backup_data ;;
        restore) restore_data ;;
        help|--help|-h) show_help ;;
        *) 
            echo -e "${RED}Unknown command: $1${NC}"
            show_help
            exit 1
            ;;
    esac
fi