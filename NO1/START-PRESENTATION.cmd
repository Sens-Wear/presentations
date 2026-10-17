@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Opening the offline slides directly.
  echo Speaker notes need a local web server. See README.md.
  start "" "%~dp0index.html"
  pause
  exit /b
)
node server.cjs
pause
