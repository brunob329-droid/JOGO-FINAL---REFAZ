@echo off
REM Start script for Refaz - Local Development (Windows)

setlocal enabledelayedexpansion

echo.
echo 🎓 Refaz - Dilemas Contábeis
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION%
echo.

REM Get project directory
set SCRIPT_DIR=%~dp0
cd /d %SCRIPT_DIR%

echo 📁 Project directory: %SCRIPT_DIR%
echo.

echo Choose startup mode:
echo 1) Backend only (node server/server.js)
echo 2) Frontend only (npm start in client/)
echo 3) Production build (npm run build in client/)
echo 4) Docker Compose (requires Docker)
echo.

set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    echo Starting backend...
    node server/server.js
) else if "%choice%"=="2" (
    echo Starting frontend dev server...
    cd client
    call npm install
    call npm start
) else if "%choice%"=="3" (
    echo Building frontend for production...
    cd client
    call npm install
    call npm run build
    echo.
    echo ✓ Production build complete in client\build\
    echo Run 'npx serve -s build -l 3000' to serve
    pause
) else if "%choice%"=="4" (
    echo Starting with Docker Compose...
    where docker >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Docker not found. Install from https://docker.com
        pause
        exit /b 1
    )
    call docker-compose up --build
) else (
    echo Invalid choice
    pause
    exit /b 1
)

pause
