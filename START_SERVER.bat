@echo off
echo ================================================
echo   Educational Portal - Local Server Starter
echo ================================================
echo.
echo Starting local server on port 3000...
echo.
echo Once started, open your browser and go to:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ================================================
echo.

cd /d "%~dp0"

REM Try Python 3 first
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python to start server...
    python -m http.server 3000
    goto :end
)

REM Try Python 2 if Python 3 is not available
python2 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python 2 to start server...
    python2 -m SimpleHTTPServer 3000
    goto :end
)

REM If no Python, try Node.js http-server
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Node.js to start server...
    echo Installing http-server if not already installed...
    call npm install -g http-server
    http-server -p 3000
    goto :end
)

echo ERROR: No Python or Node.js found!
echo.
echo Please install one of the following:
echo  - Python: https://www.python.org/downloads/
echo  - Node.js: https://nodejs.org/
echo.
echo Or use VS Code Live Server extension
pause

:end
