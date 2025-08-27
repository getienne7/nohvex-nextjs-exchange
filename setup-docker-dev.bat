@echo off
REM NOHVEX Docker Development Environment Setup Script (Windows)
REM This script helps you get started with the Docker development environment

echo 🚀 NOHVEX Docker Development Environment Setup
echo ==============================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo ✅ Docker is running

REM Check if .env.docker exists
if not exist ".env.docker" (
    echo ❌ .env.docker file not found
    exit /b 1
)

echo ✅ Environment file found

REM Check if user needs to configure API keys
findstr /C:"your-nownodes-api-key-here" .env.docker >nul
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  IMPORTANT: You need to configure your API keys
    echo    Edit .env.docker and update:
    echo    - NOWNODES_API_KEY ^(required for crypto data^)
    echo    - NEXTAUTH_SECRET ^(required for authentication^)
    echo.
    set /p answer="Have you updated the API keys? (y/n): "
    if /i not "%answer%"=="y" (
        echo Please update .env.docker first, then run this script again.
        exit /b 1
    )
)

echo.
echo 🏗️  Building and starting Docker containers...
echo    This may take a few minutes on first run...

REM Build and start containers
docker-compose -f docker-compose.dev.yml up --build -d

REM Wait for containers to be ready
echo.
echo ⏳ Waiting for containers to be ready...
timeout /t 10 /nobreak >nul

REM Check if containers are running
docker-compose -f docker-compose.dev.yml ps | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo ❌ Containers failed to start. Check logs with:
    echo    docker-compose -f docker-compose.dev.yml logs
    exit /b 1
)

echo ✅ Containers are running

REM Initialize database
echo.
echo 🗄️  Setting up database...
docker-compose -f docker-compose.dev.yml exec -T web npm run db:push
docker-compose -f docker-compose.dev.yml exec -T web npm run db:seed

echo.
echo 🎉 Setup complete!
echo.
echo Your NOHVEX development environment is ready:
echo   📱 Application: http://localhost:3000
echo   🗄️  Database: localhost:5434
echo.
echo Useful commands:
echo   npm run docker:logs    # View application logs
echo   npm run docker:down    # Stop containers
echo   docker-compose -f docker-compose.dev.yml exec web sh  # Shell into container
echo.
echo 📖 For more information, see DOCKER_DEVELOPMENT_GUIDE.md

pause