# Volt-Charge Platform Launcher (PowerShell)
$Host.UI.RawUI.WindowTitle = "Volt-Charge Platform Launcher"
Clear-Host

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          << ⚡ VOLT-CHARGE PLATFORM RUNNER ⚡ >>" -ForegroundColor Green
Write-Host "  Smart EV Charging Navigation & Data Structures Visualizer" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot
Set-Location $baseDir

# Step 1: Run automated tests
Write-Host "[1/3] Running automated unit and integration tests..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
python "$baseDir\tests\test_all.py"
Write-Host ""

# Step 2: Start Flask backend
Write-Host "[2/3] Launching Flask Backend API on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend'; python app.py"

# Step 3: Start React Vite frontend
Write-Host "[3/3] Launching React Vite Frontend on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\frontend'; npm run dev"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  ⚡ Volt-Charge is now running!" -ForegroundColor Green
Write-Host "  ----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  - Frontend Web UI:  http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend REST API: http://localhost:5000" -ForegroundColor White
Write-Host "  - API Healthcheck:  http://localhost:5000/api/health" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opening web browser in 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host "Done! Both servers are running in separate terminal windows." -ForegroundColor Green
Write-Host "Close those windows anytime to stop the servers." -ForegroundColor Gray
