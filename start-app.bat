@echo off
title Oregon Tenant Guard - Local Server
echo ===================================================
echo Starting Oregon Tenant Guard on http://localhost:3001
echo ===================================================
cd /d "%~dp0"
call npm run dev
pause
