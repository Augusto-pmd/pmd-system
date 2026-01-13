@echo off
echo ========================================
echo PMD System - Starting Backend and Frontend
echo ========================================
echo.

REM Get the current directory (frontend root)
set FRONTEND_DIR=%~dp0
set BACKEND_DIR=%FRONTEND_DIR%..\veamos cursor

echo Frontend Directory: %FRONTEND_DIR%
echo Backend Directory: %BACKEND_DIR%
echo.

REM Check if backend directory exists
if not exist "%BACKEND_DIR%" (
    echo ERROR: Backend directory not found at: %BACKEND_DIR%
    echo Please ensure the backend is located at: ..\veamos cursor
    pause
    exit /b 1
)

REM Start Backend in a new window
echo Starting Backend (NestJS) on port 3001...
start "PMD Backend (Port 3001)" cmd /k "cd /d %BACKEND_DIR% && npm run start:dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in a new window
echo Starting Frontend (Next.js) on port 3000...
start "PMD Frontend (Port 3000)" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo ========================================
echo Both servers are starting in separate windows
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo Swagger: http://localhost:3001/api/docs
echo.
echo Press any key to exit this window (servers will continue running)...
pause >nul

