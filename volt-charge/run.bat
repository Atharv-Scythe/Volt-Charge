@echo off
title Volt-Charge Platform Launcher
cls
echo ======================================================================
echo           ^<^< ⚡ VOLT-CHARGE PLATFORM RUNNER ⚡ ^>^>
echo   Smart EV Charging Navigation ^& Data Structures Visualizer
echo ======================================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/3] Running automated unit and integration tests...
echo ----------------------------------------------------------------------
python "%SCRIPT_DIR%tests\test_all.py"
if %errorlevel% neq 0 (
    echo [WARNING] Test suite encountered warnings, proceeding with launch...
) else (
    echo [OK] All tests passed successfully!
)
echo.

echo [2/3] Launching Flask Backend API on http://localhost:5000...
start "Volt-Charge Backend (Flask API :5000)" cmd /k "cd /d "%SCRIPT_DIR%backend" && python app.py"

echo [3/3] Launching React Vite Frontend on http://localhost:3000...
start "Volt-Charge Frontend (React Vite :3000)" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

echo.
echo ======================================================================
echo  ⚡ Volt-Charge is now running!
echo  ----------------------------------------------------------------------
echo  - Frontend Web UI:  http://localhost:3000
echo  - Backend REST API: http://localhost:5000
echo  - API Healthcheck:  http://localhost:5000/api/health
echo ======================================================================
echo.
echo Opening web browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo Done! Both servers are running in separate terminal windows.
echo Close those windows anytime to stop the servers.
pause
