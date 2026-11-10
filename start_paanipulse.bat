@echo off
title PAANIPULSE - Local Development Runner
echo =================================================================
echo   STARTING PAANIPULSE CIVIC WATER INTELLIGENCE PLATFORM
echo   Techfest 2026-27 Campus to Cloud Hackathon (AWS)
echo =================================================================
echo.
echo [1/2] Starting Python Serverless Backend Engine on port 5000...
start "PAANIPULSE Backend (Port 5000)" cmd /k "cd /d %~dp0backend && python server.py"

echo [2/2] Starting React + TypeScript Frontend on port 5173...
start "PAANIPULSE Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =================================================================
echo   Both services are launching!
echo   Frontend will be available at: http://localhost:5173
echo   Backend API will be available at: http://127.0.0.1:5000
echo =================================================================
pause
