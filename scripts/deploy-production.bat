@echo off
REM Production Deployment Script for NOHVEX Exchange (Windows)
REM This script handles the complete production deployment process

setlocal enabledelayedexpansion

REM Script configuration
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set BACKUP_DIR=%PROJECT_ROOT%\backups
set LOG_FILE=%PROJECT_ROOT%\deployment.log

REM Create log file if it doesn't exist
if not exist "%LOG_FILE%" type nul > "%LOG_FILE%"

echo =========================================== >> "%LOG_FILE%"
echo [%date% %time%] Starting deployment >> "%LOG_FILE%"
echo =========================================== >> "%LOG_FILE%"

echo 🚀 NOHVEX Exchange Production Deployment
echo ==========================================

REM Check prerequisites
echo 📋 Checking prerequisites...

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    echo [%date% %time%] ERROR: Docker not found >> "%LOG_FILE%"
    pause
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    echo [%date% %time%] ERROR: Docker Compose not found >> "%LOG_FILE%"
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker daemon is not running. Please start Docker first.
    echo [%date% %time%] ERROR: Docker daemon not running >> "%LOG_FILE%"
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo [%date% %time%] Prerequisites check passed >> "%LOG_FILE%"

REM Validate environment configuration
echo 🔍 Validating environment configuration...

if not exist "%PROJECT_ROOT%\.env.production" (
    echo ❌ Production environment file not found.
    echo    Please copy .env.production from template and configure it.
    echo [%date% %time%] ERROR: .env.production not found >> "%LOG_FILE%"
    pause
    exit /b 1
)

echo ✅ Environment validation passed
echo [%date% %time%] Environment validation passed >> "%LOG_FILE%"

REM Check for existing deployment
echo 🔍 Checking for existing deployment...

docker-compose ps | findstr "nohvex-exchange" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Existing deployment found. Creating backup...
    
    if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
    
    for /f "tokens=2 delims= " %%i in ('date /t') do set DATE=%%i
    for /f "tokens=1 delims= " %%i in ('time /t') do set TIME=%%i
    set BACKUP_NAME=backup_%DATE:/=%%_%TIME::=%
    set BACKUP_NAME=%BACKUP_NAME: =%
    
    echo [%date% %time%] Creating backup: %BACKUP_NAME% >> "%LOG_FILE%"
    
    REM Backup environment
    copy "%PROJECT_ROOT%\.env.production" "%BACKUP_DIR%\%BACKUP_NAME%_env.production" >nul 2>&1
    
    echo ✅ Backup completed
    echo [%date% %time%] Backup completed >> "%LOG_FILE%"
) else (
    echo 📝 No existing deployment found
    echo [%date% %time%] No existing deployment found >> "%LOG_FILE%"
)

REM Change to project directory
cd /d "%PROJECT_ROOT%"

REM Pull latest images
echo 📥 Pulling latest base images...
echo [%date% %time%] Pulling latest images >> "%LOG_FILE%"
docker-compose pull postgres redis

REM Build application
echo 🏗️  Building application...
echo [%date% %time%] Building application >> "%LOG_FILE%"
docker-compose build --no-cache web

if %errorlevel% neq 0 (
    echo ❌ Application build failed
    echo [%date% %time%] ERROR: Application build failed >> "%LOG_FILE%"
    pause
    exit /b 1
)

REM Start services
echo 🚀 Starting services...
echo [%date% %time%] Starting services >> "%LOG_FILE%"
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    echo [%date% %time%] ERROR: Failed to start services >> "%LOG_FILE%"
    pause
    exit /b 1
)

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🏥 Checking service health...

REM Check PostgreSQL
docker-compose exec -T postgres pg_isready -U nohvex -d nohvex_production >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is healthy
    echo [%date% %time%] PostgreSQL is healthy >> "%LOG_FILE%"
) else (
    echo ❌ PostgreSQL health check failed
    echo [%date% %time%] ERROR: PostgreSQL health check failed >> "%LOG_FILE%"
)

REM Check Web Application
timeout /t 10 /nobreak >nul
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Web application is healthy
    echo [%date% %time%] Web application is healthy >> "%LOG_FILE%"
) else (
    echo ⚠️  Web application health check failed (may still be starting)
    echo [%date% %time%] WARNING: Web application health check failed >> "%LOG_FILE%"
)

REM Run database migrations
echo 📊 Running database migrations...
echo [%date% %time%] Running database migrations >> "%LOG_FILE%"
docker-compose exec -T web npm run db:push

echo.
echo ✅ Production deployment completed successfully!
echo [%date% %time%] Deployment completed successfully >> "%LOG_FILE%"

echo.
echo 📊 Deployment Status:
echo =====================
docker-compose ps

echo.
echo 🌐 Application URLs:
echo   • Web Application: http://localhost:3000
echo   • Health Check: http://localhost:3000/api/health
echo   • Database: localhost:5434

echo.
echo 🛠️  Useful commands:
echo   • View logs: docker-compose logs -f
echo   • Stop services: docker-compose down
echo   • Restart: %~nx0

echo.
echo [%date% %time%] Deployment script completed >> "%LOG_FILE%"

pause