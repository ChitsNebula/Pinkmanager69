@echo off
title Pink69 Sports Day Dev Server
echo =======================================================
echo   Pink69 Sports Day Management System (Next.js Dev Server)
echo   Color: Pink (Naree Rat School, Phrae)
echo =======================================================
echo.
echo Checking dependencies...
if not exist node_modules (
    echo [INFO] node_modules not found. Running npm install...
    call npm install
)

echo Starting development server on http://localhost:3000...
echo Press Ctrl+C to stop the server.
echo.
call npm run dev
pause
