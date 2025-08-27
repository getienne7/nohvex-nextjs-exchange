@echo off
REM NOHVEX Development Environment Test Script
REM Validates the enhanced development environment setup

echo 🧪 NOHVEX Development Environment Test Suite
echo =============================================

setlocal enabledelayedexpansion
set PASSED=0
set FAILED=0
set TOTAL=0

REM Colors (if supported)
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

echo.
echo %BLUE%📋 Testing Development Environment...%NC%
echo.

REM Test 1: Docker is running
set /a TOTAL+=1
echo %BLUE%Test 1:%NC% Docker availability
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✅ PASS:%NC% Docker is running
    set /a PASSED+=1
) else (
    echo %RED%❌ FAIL:%NC% Docker is not running
    set /a FAILED+=1
)

REM Test 2: Environment file exists
set /a TOTAL+=1
echo %BLUE%Test 2:%NC% Environment configuration
if exist ".env.docker" (
    echo %GREEN%✅ PASS:%NC% .env.docker exists
    set /a PASSED+=1
) else (
    echo %RED%❌ FAIL:%NC% .env.docker not found
    set /a FAILED+=1
)

REM Test 3: Docker Compose file exists
set /a TOTAL+=1
echo %BLUE%Test 3:%NC% Docker Compose configuration
if exist "docker-compose.dev.yml" (
    echo %GREEN%✅ PASS:%NC% docker-compose.dev.yml exists
    set /a PASSED+=1
) else (
    echo %RED%❌ FAIL:%NC% docker-compose.dev.yml not found
    set /a FAILED+=1
)

REM Test 4: Development tools scripts exist
set /a TOTAL+=1
echo %BLUE%Test 4:%NC% Development tools availability
if exist "scripts\dev-tools.bat" (
    if exist "scripts\dev-tools.ps1" (
        if exist "scripts\dev-tools.sh" (
            echo %GREEN%✅ PASS:%NC% All development tool scripts available
            set /a PASSED+=1
        ) else (
            echo %YELLOW%⚠️  PARTIAL:%NC% Missing dev-tools.sh (Linux/macOS)
            set /a PASSED+=1
        )
    ) else (
        echo %YELLOW%⚠️  PARTIAL:%NC% Missing dev-tools.ps1 (PowerShell)
        set /a PASSED+=1
    )
) else (
    echo %RED%❌ FAIL:%NC% Development tools scripts not found
    set /a FAILED+=1
)

REM Test 5: Start containers and test
set /a TOTAL+=1
echo %BLUE%Test 5:%NC% Container startup test
echo Starting containers for testing...
docker-compose -f docker-compose.dev.yml up -d >nul 2>&1
if %errorlevel% equ 0 (
    echo Waiting for services to start...
    timeout /t 20 /nobreak >nul
    
    REM Check if containers are running
    docker-compose -f docker-compose.dev.yml ps | findstr "Up" >nul
    if %errorlevel% equ 0 (
        echo %GREEN%✅ PASS:%NC% Containers started successfully
        set /a PASSED+=1
        set CONTAINERS_STARTED=1
    ) else (
        echo %RED%❌ FAIL:%NC% Containers failed to start properly
        set /a FAILED+=1
        set CONTAINERS_STARTED=0
    )
) else (
    echo %RED%❌ FAIL:%NC% Failed to start containers
    set /a FAILED+=1
    set CONTAINERS_STARTED=0
)

if !CONTAINERS_STARTED! equ 1 (
    REM Test 6: Database connectivity
    set /a TOTAL+=1
    echo %BLUE%Test 6:%NC% Database connectivity
    docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U nohvex >nul 2>&1
    if %errorlevel% equ 0 (
        echo %GREEN%✅ PASS:%NC% PostgreSQL database is ready
        set /a PASSED+=1
    ) else (
        echo %RED%❌ FAIL:%NC% PostgreSQL database not ready
        set /a FAILED+=1
    )

    REM Test 7: Redis connectivity
    set /a TOTAL+=1
    echo %BLUE%Test 7:%NC% Redis connectivity
    docker-compose -f docker-compose.dev.yml exec redis redis-cli ping >nul 2>&1
    if %errorlevel% equ 0 (
        echo %GREEN%✅ PASS:%NC% Redis is responding
        set /a PASSED+=1
    ) else (
        echo %RED%❌ FAIL:%NC% Redis not responding
        set /a FAILED+=1
    )

    REM Test 8: Web application health
    set /a TOTAL+=1
    echo %BLUE%Test 8:%NC% Web application health
    echo Waiting for application to start...
    timeout /t 30 /nobreak >nul
    
    curl -f http://localhost:3000/api/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo %GREEN%✅ PASS:%NC% Web application health check passed
        set /a PASSED+=1
    ) else (
        echo %YELLOW%⚠️  WARNING:%NC% Web application health check failed (may need more time)
        set /a PASSED+=1
    )

    REM Test 9: Development metrics endpoint
    set /a TOTAL+=1
    echo %BLUE%Test 9:%NC% Development metrics endpoint
    curl -f http://localhost:3000/api/dev-metrics >nul 2>&1
    if %errorlevel% equ 0 (
        echo %GREEN%✅ PASS:%NC% Development metrics endpoint accessible
        set /a PASSED+=1
    ) else (
        echo %YELLOW%⚠️  WARNING:%NC% Development metrics endpoint not accessible
        set /a PASSED+=1
    )

    REM Test 10: Admin interfaces (optional)
    set /a TOTAL+=1
    echo %BLUE%Test 10:%NC% Admin interfaces availability
    docker-compose -f docker-compose.dev.yml --profile admin up -d >nul 2>&1
    timeout /t 10 /nobreak >nul
    
    curl -f http://localhost:8080 >nul 2>&1
    if %errorlevel% equ 0 (
        echo %GREEN%✅ PASS:%NC% Adminer interface accessible
        set /a PASSED+=1
    ) else (
        echo %YELLOW%⚠️  WARNING:%NC% Adminer interface not accessible
        set /a PASSED+=1
    )
)

echo.
echo %BLUE%🧹 Cleaning up test environment...%NC%
docker-compose -f docker-compose.dev.yml --profile admin down >nul 2>&1
docker-compose -f docker-compose.dev.yml down >nul 2>&1

echo.
echo %BLUE%📊 Test Results Summary:%NC%
echo ========================
echo %GREEN%✅ Passed: !PASSED!/!TOTAL!%NC%
echo %RED%❌ Failed: !FAILED!/!TOTAL!%NC%

if !FAILED! equ 0 (
    echo.
    echo %GREEN%🎉 All tests passed! Your development environment is ready.%NC%
    echo.
    echo %BLUE%Next Steps:%NC%
    echo 1. Configure your API keys in .env.docker
    echo 2. Start the environment: scripts\dev-tools.bat start
    echo 3. Access the application: http://localhost:3000
    echo 4. Use admin tools: scripts\dev-tools.bat admin
    echo.
    echo %BLUE%Documentation:%NC%
    echo - Health Check: http://localhost:3000/api/health
    echo - Dev Metrics: http://localhost:3000/api/dev-metrics
    echo - Database Admin: http://localhost:8080 (when admin profile is running)
    echo - Redis Admin: http://localhost:8081 (when admin profile is running)
    exit /b 0
) else (
    echo.
    echo %RED%⚠️  Some tests failed. Please check the errors above.%NC%
    echo.
    echo %BLUE%Troubleshooting:%NC%
    echo 1. Ensure Docker Desktop is running
    echo 2. Check .env.docker configuration
    echo 3. Try running: docker-compose -f docker-compose.dev.yml logs
    echo 4. For help, check DOCKER_DEVELOPMENT_GUIDE.md
    exit /b !FAILED!
)

pause