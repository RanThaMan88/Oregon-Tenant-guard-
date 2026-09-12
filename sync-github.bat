@echo off
echo ===================================================
echo   Oregon TenantGuard - Automatic GitHub Sync
echo ===================================================
echo.
echo [1/3] Bundling entire codebase for Gemini Pro AI audit...
node scripts/bundleCodebaseForGemini.mjs

echo.
echo [2/3] Staging changes and committing...
git add .
set /p commit_msg="Enter commit message (press Enter for 'update: major changes'): "
if "%commit_msg%"=="" set commit_msg=update: major application updates and legal features
git commit -m "%commit_msg%"

echo.
echo [3/3] Pushing to GitHub (origin main)...
git push origin main

echo.
echo ===================================================
echo   Sync Complete! Your GitHub repository is updated.
echo   https://github.com/RanThaMan88/Oregon-Tenant-guard-
echo ===================================================
pause
