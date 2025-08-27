# NOHVEX Enhanced Development Tools Script (PowerShell)
# Comprehensive development environment management, testing, and monitoring

param(
    [string]$Command = ""
)

# Configuration
$ComposeFile = "docker-compose.dev.yml"
$AdminProfile = "admin"

function Write-ColoredText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Show-Header {
    Write-ColoredText "🛠️  NOHVEX Development Tools" "Blue"
    Write-Host "==========================="
}

function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-ColoredText "❌ Docker is not running. Please start Docker and try again." "Red"
        return $false
    }
}

function Test-EnvFile {
    if (-not (Test-Path ".env.docker")) {
        Write-ColoredText "❌ .env.docker file not found" "Red"
        Write-Host "Please copy .env.docker.example to .env.docker and configure it"
        return $false
    }

    $envContent = Get-Content ".env.docker" -Raw
    if ($envContent -match "your-nownodes-api-key-here") {
        Write-Host ""
        Write-ColoredText "⚠️  IMPORTANT: You need to configure your API keys" "Yellow"
        Write-Host "    Edit .env.docker and update:"
        Write-Host "    - NOWNODES_API_KEY (required for crypto data)"
        Write-Host "    - NEXTAUTH_SECRET (required for authentication)"
        Write-Host ""
        $answer = Read-Host "Have you updated the API keys? (y/n)"
        if ($answer -notmatch "^[Yy]$") {
            Write-Host "Please update .env.docker first"
            return $false
        }
    }
    return $true
}

function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$DisplayName
    )
    Write-Host "Waiting for $DisplayName..."
    
    $retryCount = 0
    do {
        $status = docker-compose -f $ComposeFile ps $ServiceName 2>$null | Select-String "Up"
        if ($status) {
            Write-ColoredText "✅ $DisplayName is ready" "Green"
            return $true
        }
        $retryCount++
        if ($retryCount -ge 30) {
            Write-ColoredText "❌ $DisplayName failed to start after 30 attempts" "Red"
            return $false
        }
        Start-Sleep 2
    } while ($true)
}

function Start-DevEnvironment {
    Write-Host ""
    Write-ColoredText "🚀 Starting development environment..." "Blue"
    
    if (-not (Test-EnvFile)) {
        return
    }

    Write-Host "Building and starting containers..."
    docker-compose -f $ComposeFile up --build -d

    Write-Host "Waiting for services to be ready..."
    Start-Sleep 15

    Wait-ForService "postgres" "PostgreSQL"
    Wait-ForService "redis" "Redis"
    Wait-ForService "web" "Web Application"

    Write-Host ""
    Write-ColoredText "✅ Development environment is ready!" "Green"
    Write-Host ""
    Write-ColoredText "📱 Application: http://localhost:3000" "Cyan"
    Write-ColoredText "🗄️  Database: localhost:5434" "Cyan"
    Write-ColoredText "🔴 Redis: localhost:6379" "Cyan"
    Write-Host ""
    Write-Host "Use 'scripts\dev-tools.ps1 logs' to view logs"
    Write-Host "Use 'scripts\dev-tools.ps1 admin' to access admin interfaces"
}

function Stop-DevEnvironment {
    Write-Host ""
    Write-ColoredText "🛑 Stopping development environment..." "Yellow"
    docker-compose -f $ComposeFile down
    Write-ColoredText "✅ Development environment stopped" "Green"
}

function Restart-DevEnvironment {
    Write-Host ""
    Write-ColoredText "🔄 Restarting development environment..." "Blue"
    docker-compose -f $ComposeFile restart
    Write-ColoredText "✅ Development environment restarted" "Green"
}

function Show-Status {
    Write-Host ""
    Write-ColoredText "📊 Development Environment Status:" "Blue"
    Write-Host "================================="
    docker-compose -f $ComposeFile ps
    Write-Host ""
    Write-Host "Container Health:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=nohvex-exchange"
}

function Show-Logs {
    Write-Host ""
    Write-ColoredText "📋 Application Logs (Press Ctrl+C to exit):" "Blue"
    Write-Host "=========================================="
    docker-compose -f $ComposeFile logs -f web
}

function Open-Shell {
    Write-Host ""
    Write-ColoredText "🐚 Opening container shell..." "Blue"
    Write-Host "Type 'exit' to return to host"
    docker-compose -f $ComposeFile exec web sh
}

function Show-DatabaseMenu {
    do {
        Write-Host ""
        Write-ColoredText "🗄️  Database Tools:" "Blue"
        Write-Host "================"
        Write-Host ""
        Write-Host "  1. Open Prisma Studio"
        Write-Host "  2. Run database migrations"
        Write-Host "  3. Seed database"
        Write-Host "  4. Reset database"
        Write-Host "  5. Open Adminer (Web UI)"
        Write-Host "  6. Database backup"
        Write-Host "  7. Database shell"
        Write-Host "  0. Back to main menu"
        Write-Host ""
        $choice = Read-Host "Enter your choice (0-7)"

        switch ($choice) {
            "0" { return }
            "1" {
                Write-Host ""
                Write-ColoredText "🎨 Opening Prisma Studio..." "Blue"
                docker-compose -f $ComposeFile exec web npm run db:studio
            }
            "2" {
                Write-Host ""
                Write-ColoredText "🔄 Running database migrations..." "Blue"
                docker-compose -f $ComposeFile exec web npm run db:push
                Write-ColoredText "✅ Database migrations complete" "Green"
            }
            "3" {
                Write-Host ""
                Write-ColoredText "🌱 Seeding database..." "Blue"
                docker-compose -f $ComposeFile exec web npm run db:seed
                Write-ColoredText "✅ Database seeded" "Green"
            }
            "4" {
                Write-Host ""
                Write-ColoredText "⚠️  This will RESET ALL DATA in the database!" "Yellow"
                $confirm = Read-Host "Are you sure? (y/N)"
                if ($confirm -match "^[Yy]$") {
                    Write-ColoredText "🔄 Resetting database..." "Blue"
                    docker-compose -f $ComposeFile exec web npm run db:reset
                    Write-ColoredText "✅ Database reset complete" "Green"
                }
            }
            "5" {
                Write-Host ""
                Write-ColoredText "🌐 Opening Adminer web interface..." "Blue"
                Write-Host "Starting admin services..."
                docker-compose -f $ComposeFile --profile $AdminProfile up -d adminer
                Write-Host ""
                Write-Host "Adminer is available at: http://localhost:8080"
                Write-Host "Server: postgres"
                Write-Host "Username: nohvex"
                Write-Host "Database: nohvex"
                Write-Host "Password: (check your .env.docker file)"
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            "6" {
                Write-Host ""
                Write-ColoredText "💾 Creating database backup..." "Blue"
                if (-not (Test-Path "backups")) {
                    New-Item -ItemType Directory -Path "backups" | Out-Null
                }
                $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
                $backupFile = "backup_$timestamp.sql"
                docker-compose -f $ComposeFile exec postgres pg_dump -U nohvex nohvex > "backups\$backupFile"
                Write-ColoredText "✅ Database backed up to: backups\$backupFile" "Green"
            }
            "7" {
                Write-Host ""
                Write-ColoredText "🐚 Opening database shell..." "Blue"
                docker-compose -f $ComposeFile exec postgres psql -U nohvex -d nohvex
            }
        }
    } while ($true)
}

function Show-TestMenu {
    do {
        Write-Host ""
        Write-ColoredText "🧪 Test Runner:" "Blue"
        Write-Host "============="
        Write-Host ""
        Write-Host "  1. Run all tests"
        Write-Host "  2. Unit tests only"
        Write-Host "  3. Integration tests only"
        Write-Host "  4. E2E tests only"
        Write-Host "  5. Test with coverage"
        Write-Host "  6. Watch mode"
        Write-Host "  0. Back to main menu"
        Write-Host ""
        $choice = Read-Host "Enter your choice (0-6)"

        switch ($choice) {
            "0" { return }
            "1" {
                Write-Host ""
                Write-ColoredText "🧪 Running all tests..." "Blue"
                docker-compose -f $ComposeFile exec web npm test
            }
            "2" {
                Write-Host ""
                Write-ColoredText "🧪 Running unit tests..." "Blue"
                docker-compose -f $ComposeFile exec web npm run test:unit
            }
            "3" {
                Write-Host ""
                Write-ColoredText "🧪 Running integration tests..." "Blue"
                docker-compose -f $ComposeFile exec web npm run test:integration
            }
            "4" {
                Write-Host ""
                Write-ColoredText "🧪 Running E2E tests..." "Blue"
                docker-compose -f $ComposeFile exec web npm run test:e2e
            }
            "5" {
                Write-Host ""
                Write-ColoredText "📊 Running tests with coverage..." "Blue"
                docker-compose -f $ComposeFile exec web npm run test:coverage
            }
            "6" {
                Write-Host ""
                Write-ColoredText "👀 Running tests in watch mode..." "Blue"
                docker-compose -f $ComposeFile exec web npm run test:watch
            }
        }
    } while ($true)
}

function Test-Health {
    Write-Host ""
    Write-ColoredText "🏥 Health Check:" "Blue"
    Write-Host "=============="
    Write-Host ""
    
    Write-Host "Checking application health..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-ColoredText "✅ Application is healthy" "Green"
        } else {
            Write-ColoredText "❌ Application health check failed" "Red"
        }
    } catch {
        Write-ColoredText "❌ Application health check failed" "Red"
    }

    Write-Host ""
    Write-Host "Checking database connection..."
    try {
        $result = docker-compose -f $ComposeFile exec postgres pg_isready -U nohvex 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColoredText "✅ Database is healthy" "Green"
        } else {
            Write-ColoredText "❌ Database health check failed" "Red"
        }
    } catch {
        Write-ColoredText "❌ Database health check failed" "Red"
    }

    Write-Host ""
    Write-Host "Checking Redis connection..."
    try {
        $result = docker-compose -f $ComposeFile exec redis redis-cli ping 2>$null
        if ($result -match "PONG") {
            Write-ColoredText "✅ Redis is healthy" "Green"
        } else {
            Write-ColoredText "❌ Redis health check failed" "Red"
        }
    } catch {
        Write-ColoredText "❌ Redis health check failed" "Red"
    }
}

function Show-CleanMenu {
    Write-Host ""
    Write-ColoredText "🧹 Cleaning Development Environment:" "Blue"
    Write-Host "=================================="
    Write-Host ""
    Write-Host "  1. Clean containers only"
    Write-Host "  2. Clean containers and volumes"
    Write-Host "  3. Clean everything (DANGEROUS)"
    Write-Host "  0. Cancel"
    Write-Host ""
    $choice = Read-Host "Enter your choice (0-3)"

    switch ($choice) {
        "0" { return }
        "1" {
            Write-Host ""
            Write-ColoredText "🧹 Cleaning containers..." "Blue"
            docker-compose -f $ComposeFile down
            docker system prune -f
            Write-ColoredText "✅ Containers cleaned" "Green"
        }
        "2" {
            Write-Host ""
            Write-ColoredText "⚠️  This will remove all database data!" "Yellow"
            $confirm = Read-Host "Are you sure? (y/N)"
            if ($confirm -match "^[Yy]$") {
                Write-ColoredText "🧹 Cleaning containers and volumes..." "Blue"
                docker-compose -f $ComposeFile down -v
                docker system prune -f
                Write-ColoredText "✅ Containers and volumes cleaned" "Green"
            }
        }
        "3" {
            Write-Host ""
            Write-ColoredText "⚠️  DANGER: This will remove EVERYTHING!" "Red"
            Write-Host "This includes all Docker images, containers, volumes, and networks."
            $confirm = Read-Host "Are you ABSOLUTELY sure? (y/N)"
            if ($confirm -match "^[Yy]$") {
                Write-ColoredText "🧹 Nuclear cleaning..." "Blue"
                docker-compose -f $ComposeFile down -v --rmi all
                docker system prune -a -f --volumes
                Write-ColoredText "✅ Everything cleaned" "Green"
            }
        }
    }
}

function Start-AdminInterfaces {
    Write-Host ""
    Write-ColoredText "📊 Starting admin interfaces..." "Blue"
    docker-compose -f $ComposeFile --profile $AdminProfile up -d
    Write-Host ""
    Write-ColoredText "✅ Admin interfaces started:" "Green"
    Write-ColoredText "  📊 Adminer (Database): http://localhost:8080" "Cyan"
    Write-ColoredText "  🔴 Redis Commander: http://localhost:8081" "Cyan"
    Write-Host ""
    Write-Host "To stop admin interfaces:"
    Write-Host "  docker-compose -f $ComposeFile --profile $AdminProfile down"
}

function Monitor-Services {
    Write-Host ""
    Write-ColoredText "📊 Service Monitoring:" "Blue"
    Write-Host "===================="
    Write-Host ""
    Write-Host "Real-time container stats (Press Ctrl+C to exit):"
    docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

function Backup-Data {
    Write-Host ""
    Write-ColoredText "💾 Data Backup:" "Blue"
    Write-Host "============="
    if (-not (Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" | Out-Null
    }
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Write-Host ""
    Write-Host "Creating backup with timestamp: $timestamp"
    Write-Host ""
    Write-Host "Backing up PostgreSQL database..."
    docker-compose -f $ComposeFile exec postgres pg_dump -U nohvex nohvex > "backups\postgres_$timestamp.sql"
    Write-Host ""
    Write-Host "Backing up Redis data..."
    docker-compose -f $ComposeFile exec redis redis-cli --rdb "backups\redis_$timestamp.rdb"
    Write-Host ""
    Write-ColoredText "✅ Backup complete:" "Green"
    Write-ColoredText "  📊 PostgreSQL: backups\postgres_$timestamp.sql" "Cyan"
    Write-ColoredText "  🔴 Redis: backups\redis_$timestamp.rdb" "Cyan"
}

function Restore-Data {
    Write-Host ""
    Write-ColoredText "🔄 Data Restore:" "Blue"
    Write-Host "=============="
    Write-Host "Available backups:"
    Get-ChildItem -Path "backups\*.sql" -ErrorAction SilentlyContinue | ForEach-Object { $_.Name }
    Write-Host ""
    $backupFile = Read-Host "Enter backup filename (without path)"
    
    if (-not (Test-Path "backups\$backupFile")) {
        Write-ColoredText "❌ Backup file not found: backups\$backupFile" "Red"
        return
    }
    
    Write-Host ""
    Write-ColoredText "⚠️  This will REPLACE current database data!" "Yellow"
    $confirm = Read-Host "Continue with restore? (y/N)"
    if ($confirm -match "^[Yy]$") {
        Write-Host ""
        Write-ColoredText "🔄 Restoring database..." "Blue"
        Get-Content "backups\$backupFile" | docker-compose -f $ComposeFile exec -T postgres psql -U nohvex -d nohvex
        Write-ColoredText "✅ Database restored from: backups\$backupFile" "Green"
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "Usage: scripts\dev-tools.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start     - Start development environment"
    Write-Host "  stop      - Stop development environment"
    Write-Host "  restart   - Restart development environment"
    Write-Host "  status    - Show environment status"
    Write-Host "  logs      - View application logs"
    Write-Host "  shell     - Open container shell"
    Write-Host "  db        - Database tools menu"
    Write-Host "  test      - Run tests"
    Write-Host "  health    - Health check"
    Write-Host "  clean     - Clean environment"
    Write-Host "  admin     - Start admin interfaces"
    Write-Host "  monitor   - Monitor services"
    Write-Host "  backup    - Backup data"
    Write-Host "  restore   - Restore data"
    Write-Host ""
}

function Show-InteractiveMenu {
    do {
        Write-Host ""
        Write-Host "Select an option:"
        Write-Host ""
        Write-ColoredText "🚀 Environment Management:" "Green"
        Write-Host "  1. Start development environment"
        Write-Host "  2. Stop development environment"
        Write-Host "  3. Restart development environment"
        Write-Host "  4. Show environment status"
        Write-Host "  5. View application logs"
        Write-Host ""
        Write-ColoredText "🔧 Development Tools:" "Blue"
        Write-Host "  6. Open container shell"
        Write-Host "  7. Database tools"
        Write-Host "  8. Run tests"
        Write-Host "  9. Health check"
        Write-Host "  10. Clean environment"
        Write-Host ""
        Write-ColoredText "📊 Monitoring & Admin:" "Magenta"
        Write-Host "  11. Start admin interfaces"
        Write-Host "  12. Monitor services"
        Write-Host "  13. Backup data"
        Write-Host "  14. Restore data"
        Write-Host ""
        Write-Host "  0. Exit"
        Write-Host ""
        $choice = Read-Host "Enter your choice (0-14)"

        switch ($choice) {
            "0" { exit 0 }
            "1" { Start-DevEnvironment }
            "2" { Stop-DevEnvironment }
            "3" { Restart-DevEnvironment }
            "4" { Show-Status }
            "5" { Show-Logs }
            "6" { Open-Shell }
            "7" { Show-DatabaseMenu }
            "8" { Show-TestMenu }
            "9" { Test-Health }
            "10" { Show-CleanMenu }
            "11" { Start-AdminInterfaces }
            "12" { Monitor-Services }
            "13" { Backup-Data }
            "14" { Restore-Data }
            default { Write-ColoredText "Invalid choice. Please try again." "Red" }
        }
    } while ($true)
}

# Main script execution
Show-Header

if (-not (Test-DockerRunning)) {
    exit 1
}

if ($Command -eq "") {
    # Interactive mode
    Show-InteractiveMenu
} else {
    # Command line mode
    switch ($Command.ToLower()) {
        "start" { Start-DevEnvironment }
        "stop" { Stop-DevEnvironment }
        "restart" { Restart-DevEnvironment }
        "status" { Show-Status }
        "logs" { Show-Logs }
        "shell" { Open-Shell }
        "db" { Show-DatabaseMenu }
        "test" { Show-TestMenu }
        "health" { Test-Health }
        "clean" { Show-CleanMenu }
        "admin" { Start-AdminInterfaces }
        "monitor" { Monitor-Services }
        "backup" { Backup-Data }
        "restore" { Restore-Data }
        "help" { Show-Help }
        default {
            Write-ColoredText "Unknown command: $Command" "Red"
            Show-Help
            exit 1
        }
    }
}