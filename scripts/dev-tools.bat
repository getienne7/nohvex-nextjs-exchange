@echo off
REM NOHVEX Enhanced Development Tools Script
REM Comprehensive development environment management, testing, and monitoring

setlocal enabledelayedexpansion

echo 🛠️  NOHVEX Development Tools
echo ===========================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

if "%1"=="" goto show_menu

REM Handle command line arguments
if /i "%1"=="start" goto start_dev
if /i "%1"=="stop" goto stop_dev
if /i "%1"=="restart" goto restart_dev
if /i "%1"=="status" goto show_status
if /i "%1"=="logs" goto show_logs
if /i "%1"=="shell" goto open_shell
if /i "%1"=="db" goto db_tools
if /i "%1"=="test" goto run_tests
if /i "%1"=="health" goto health_check
if /i "%1"=="clean" goto clean_env
if /i "%1"=="admin" goto start_admin
if /i "%1"=="monitor" goto monitor_services
if /i "%1"=="backup" goto backup_data
if /i "%1"=="restore" goto restore_data
goto show_help

:show_menu
echo.
echo Select an option:
echo.
echo 🚀 Environment Management:
echo   1. Start development environment
echo   2. Stop development environment  
echo   3. Restart development environment
echo   4. Show environment status
echo   5. View application logs
echo.
echo 🔧 Development Tools:
echo   6. Open container shell
echo   7. Database tools
echo   8. Run tests
echo   9. Health check
echo   10. Clean environment
echo.
echo 📊 Monitoring & Admin:
echo   11. Start admin interfaces
echo   12. Monitor services
echo   13. Backup data
echo   14. Restore data
echo.
echo   0. Exit
echo.
set /p choice="Enter your choice (0-14): "

if "%choice%"=="0" exit /b 0
if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto stop_dev
if "%choice%"=="3" goto restart_dev
if "%choice%"=="4" goto show_status
if "%choice%"=="5" goto show_logs
if "%choice%"=="6" goto open_shell
if "%choice%"=="7" goto db_tools
if "%choice%"=="8" goto run_tests
if "%choice%"=="9" goto health_check
if "%choice%"=="10" goto clean_env
if "%choice%"=="11" goto start_admin
if "%choice%"=="12" goto monitor_services
if "%choice%"=="13" goto backup_data
if "%choice%"=="14" goto restore_data
goto show_menu

:start_dev
echo.
echo 🚀 Starting development environment...
call :check_env_file
if %errorlevel% neq 0 exit /b 1

echo Building and starting containers...
docker-compose -f docker-compose.dev.yml up --build -d

echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

call :wait_for_service "postgres" "PostgreSQL"
call :wait_for_service "redis" "Redis"
call :wait_for_service "web" "Web Application"

echo.
echo ✅ Development environment is ready!
echo.
echo 📱 Application: http://localhost:3000
echo 🗄️  Database: localhost:5434
echo 🔴 Redis: localhost:6379
echo.
echo Use 'scripts\dev-tools.bat logs' to view logs
echo Use 'scripts\dev-tools.bat admin' to access admin interfaces
goto end

:stop_dev
echo.
echo 🛑 Stopping development environment...
docker-compose -f docker-compose.dev.yml down
echo ✅ Development environment stopped
goto end

:restart_dev
echo.
echo 🔄 Restarting development environment...
docker-compose -f docker-compose.dev.yml restart
echo ✅ Development environment restarted
goto end

:show_status
echo.
echo 📊 Development Environment Status:
echo =================================
docker-compose -f docker-compose.dev.yml ps
echo.
echo Container Health:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=nohvex-exchange"
goto end

:show_logs
echo.
echo 📋 Application Logs (Press Ctrl+C to exit):
echo ==========================================
docker-compose -f docker-compose.dev.yml logs -f web
goto end

:open_shell
echo.
echo 🐚 Opening container shell...
echo Type 'exit' to return to host
docker-compose -f docker-compose.dev.yml exec web sh
goto end

:db_tools
echo.
echo 🗄️  Database Tools:
echo ================
echo.
echo   1. Open Prisma Studio
echo   2. Run database migrations
echo   3. Seed database
echo   4. Reset database
echo   5. Open Adminer (Web UI)
echo   6. Database backup
echo   7. Database shell
echo   0. Back to main menu
echo.
set /p db_choice="Enter your choice (0-7): "

if "%db_choice%"=="0" goto show_menu
if "%db_choice%"=="1" goto prisma_studio
if "%db_choice%"=="2" goto db_migrate
if "%db_choice%"=="3" goto db_seed
if "%db_choice%"=="4" goto db_reset
if "%db_choice%"=="5" goto open_adminer
if "%db_choice%"=="6" goto db_backup
if "%db_choice%"=="7" goto db_shell
goto db_tools

:prisma_studio
echo.
echo 🎨 Opening Prisma Studio...
docker-compose -f docker-compose.dev.yml exec web npm run db:studio
goto db_tools

:db_migrate
echo.
echo 🔄 Running database migrations...
docker-compose -f docker-compose.dev.yml exec web npm run db:push
echo ✅ Database migrations complete
goto db_tools

:db_seed
echo.
echo 🌱 Seeding database...
docker-compose -f docker-compose.dev.yml exec web npm run db:seed
echo ✅ Database seeded
goto db_tools

:db_reset
echo.
echo ⚠️  This will RESET ALL DATA in the database!
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" goto db_tools
echo 🔄 Resetting database...
docker-compose -f docker-compose.dev.yml exec web npm run db:reset
echo ✅ Database reset complete
goto db_tools

:open_adminer
echo.
echo 🌐 Opening Adminer web interface...
echo Starting admin services...
docker-compose -f docker-compose.dev.yml --profile admin up -d adminer
echo.
echo Adminer is available at: http://localhost:8080
echo Server: postgres
echo Username: nohvex
echo Database: nohvex
echo Password: (check your .env.docker file)
echo.
pause
goto db_tools

:db_backup
echo.
echo 💾 Creating database backup...
set backup_file=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U nohvex nohvex > backups\%backup_file%
echo ✅ Database backed up to: backups\%backup_file%
goto db_tools

:db_shell
echo.
echo 🐚 Opening database shell...
docker-compose -f docker-compose.dev.yml exec postgres psql -U nohvex -d nohvex
goto db_tools

:run_tests
echo.
echo 🧪 Test Runner:
echo =============
echo.
echo   1. Run all tests
echo   2. Unit tests only
echo   3. Integration tests only
echo   4. E2E tests only
echo   5. Test with coverage
echo   6. Watch mode
echo   0. Back to main menu
echo.
set /p test_choice="Enter your choice (0-6): "

if "%test_choice%"=="0" goto show_menu
if "%test_choice%"=="1" goto test_all
if "%test_choice%"=="2" goto test_unit
if "%test_choice%"=="3" goto test_integration
if "%test_choice%"=="4" goto test_e2e
if "%test_choice%"=="5" goto test_coverage
if "%test_choice%"=="6" goto test_watch
goto run_tests

:test_all
echo.
echo 🧪 Running all tests...
docker-compose -f docker-compose.dev.yml exec web npm test
goto run_tests

:test_unit
echo.
echo 🧪 Running unit tests...
docker-compose -f docker-compose.dev.yml exec web npm run test:unit
goto run_tests

:test_integration
echo.
echo 🧪 Running integration tests...
docker-compose -f docker-compose.dev.yml exec web npm run test:integration
goto run_tests

:test_e2e
echo.
echo 🧪 Running E2E tests...
docker-compose -f docker-compose.dev.yml exec web npm run test:e2e
goto run_tests

:test_coverage
echo.
echo 📊 Running tests with coverage...
docker-compose -f docker-compose.dev.yml exec web npm run test:coverage
goto run_tests

:test_watch
echo.
echo 👀 Running tests in watch mode...
docker-compose -f docker-compose.dev.yml exec web npm run test:watch
goto run_tests

:health_check
echo.
echo 🏥 Health Check:
echo ==============
echo.
echo Checking application health...
curl -f http://localhost:3000/api/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Application is healthy
) else (
    echo ❌ Application health check failed
)

echo.
echo Checking database connection...
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U nohvex 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database is healthy
) else (
    echo ❌ Database health check failed
)

echo.
echo Checking Redis connection...
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping 2>nul | findstr "PONG" >nul
if %errorlevel% equ 0 (
    echo ✅ Redis is healthy
) else (
    echo ❌ Redis health check failed
)
goto end

:clean_env
echo.
echo 🧹 Cleaning Development Environment:
echo ==================================
echo.
echo   1. Clean containers only
echo   2. Clean containers and volumes
echo   3. Clean everything (DANGEROUS)
echo   0. Cancel
echo.
set /p clean_choice="Enter your choice (0-3): "

if "%clean_choice%"=="0" goto show_menu
if "%clean_choice%"=="1" goto clean_containers
if "%clean_choice%"=="2" goto clean_volumes
if "%clean_choice%"=="3" goto clean_all
goto clean_env

:clean_containers
echo.
echo 🧹 Cleaning containers...
docker-compose -f docker-compose.dev.yml down
docker system prune -f
echo ✅ Containers cleaned
goto end

:clean_volumes
echo.
echo ⚠️  This will remove all database data!
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" goto clean_env
echo 🧹 Cleaning containers and volumes...
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
echo ✅ Containers and volumes cleaned
goto end

:clean_all
echo.
echo ⚠️  DANGER: This will remove EVERYTHING!
echo This includes all Docker images, containers, volumes, and networks.
set /p confirm="Are you ABSOLUTELY sure? (y/N): "
if /i not "%confirm%"=="y" goto clean_env
echo 🧹 Nuclear cleaning...
docker-compose -f docker-compose.dev.yml down -v --rmi all
docker system prune -a -f --volumes
echo ✅ Everything cleaned
goto end

:start_admin
echo.
echo 📊 Starting admin interfaces...
docker-compose -f docker-compose.dev.yml --profile admin up -d
echo.
echo ✅ Admin interfaces started:
echo   📊 Adminer (Database): http://localhost:8080
echo   🔴 Redis Commander: http://localhost:8081
echo.
echo To stop admin interfaces:
echo   docker-compose -f docker-compose.dev.yml --profile admin down
goto end

:monitor_services
echo.
echo 📊 Service Monitoring:
echo ====================
echo.
echo Real-time container stats (Press Ctrl+C to exit):
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
goto end

:backup_data
echo.
echo 💾 Data Backup:
echo =============
if not exist "backups" mkdir backups
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
echo.
echo Creating backup with timestamp: %timestamp%
echo.
echo Backing up PostgreSQL database...
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U nohvex nohvex > backups\postgres_%timestamp%.sql
echo.
echo Backing up Redis data...
docker-compose -f docker-compose.dev.yml exec redis redis-cli --rdb backups\redis_%timestamp%.rdb
echo.
echo ✅ Backup complete:
echo   📊 PostgreSQL: backups\postgres_%timestamp%.sql
echo   🔴 Redis: backups\redis_%timestamp%.rdb
goto end

:restore_data
echo.
echo 🔄 Data Restore:
echo ==============
echo Available backups:
dir /b backups\*.sql 2>nul
echo.
set /p backup_file="Enter backup filename (without path): "
if not exist "backups\%backup_file%" (
    echo ❌ Backup file not found: backups\%backup_file%
    goto end
)
echo.
echo ⚠️  This will REPLACE current database data!
set /p confirm="Continue with restore? (y/N): "
if /i not "%confirm%"=="y" goto end
echo.
echo 🔄 Restoring database...
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U nohvex -d nohvex < backups\%backup_file%
echo ✅ Database restored from: backups\%backup_file%
goto end

REM Helper functions
:check_env_file
if not exist ".env.docker" (
    echo ❌ .env.docker file not found
    echo Please copy .env.docker.example to .env.docker and configure it
    exit /b 1
)

findstr /C:"your-nownodes-api-key-here" .env.docker >nul
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  IMPORTANT: You need to configure your API keys
    echo    Edit .env.docker and update:
    echo    - NOWNODES_API_KEY (required for crypto data)
    echo    - NEXTAUTH_SECRET (required for authentication)
    echo.
    set /p answer="Have you updated the API keys? (y/n): "
    if /i not "%answer%"=="y" (
        echo Please update .env.docker first
        exit /b 1
    )
)
exit /b 0

:wait_for_service
set service_name=%~1
set display_name=%~2
echo Waiting for %display_name%...
set retry_count=0
:wait_loop
docker-compose -f docker-compose.dev.yml ps %service_name% | findstr "Up" >nul
if %errorlevel% equ 0 goto wait_done
set /a retry_count+=1
if %retry_count% geq 30 (
    echo ❌ %display_name% failed to start after 30 attempts
    exit /b 1
)
timeout /t 2 /nobreak >nul
goto wait_loop
:wait_done
echo ✅ %display_name% is ready
exit /b 0

:show_help
echo.
echo Usage: scripts\dev-tools.bat [command]
echo.
echo Commands:
echo   start     - Start development environment
echo   stop      - Stop development environment
echo   restart   - Restart development environment
echo   status    - Show environment status
echo   logs      - View application logs
echo   shell     - Open container shell
echo   db        - Database tools menu
echo   test      - Run tests
echo   health    - Health check
echo   clean     - Clean environment
echo   admin     - Start admin interfaces
echo   monitor   - Monitor services
echo   backup    - Backup data
echo   restore   - Restore data
echo.
goto end

:end
echo.
if "%1"=="" pause