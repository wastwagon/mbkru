@echo off
REM Windows Command Prompt: full local setup (Docker Desktop + Postgres/Redis + npm + migrate + seed)
cd /d "%~dp0.."
echo.
echo === MBKRU setup (same as: npm run setup:local) ===
echo.
call npm run setup:local
if errorlevel 1 exit /b 1
echo.
echo Done. Start app: npm run dev
