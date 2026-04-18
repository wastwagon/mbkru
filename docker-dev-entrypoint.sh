#!/bin/sh
set -e
if [ -n "$DATABASE_URL" ]; then
  echo "[mbkru dev] Applying Prisma migrations..."
  npx prisma migrate deploy
fi
exec npx next dev -H 0.0.0.0 -p 1100 --webpack
