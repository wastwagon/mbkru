@echo off
REM Windows Command Prompt: full local setup (same as npm run setup:local)
cd /d "%~dp0.."
call npm run setup:local
if errorlevel 1 exit /b 1
