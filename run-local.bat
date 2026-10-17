@echo off
title One Reach Website - Local Preview
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js LTS from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing website dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
if not exist .env (
  echo.
  echo NOTE: For local admin access, set ADMIN_PASSWORD in your terminal before starting.
  echo Example: set ADMIN_PASSWORD=ChooseYourOwnStrongPassword
  echo.
)
echo Starting One Reach at http://localhost:3000
echo Keep this window open while using the website.
start "" http://localhost:3000
call npm start
pause
