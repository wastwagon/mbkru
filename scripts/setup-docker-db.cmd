@echo off
REM Windows CMD: hydrate DB via Prisma migrate + seed (Docker Postgres expected per .env DATABASE_URL).
cd /d "%~dp0\.."
node scripts\setup-docker-db.mjs
exit /b %ERRORLEVEL%
