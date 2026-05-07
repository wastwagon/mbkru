#!/bin/sh
# Auto-apply migrations and optional seed on container start (Coolify / Docker).
# Production defaults:
# - migrations fail fast (set ALLOW_START_WITH_FAILED_MIGRATION=1 to override)
# - seed is skipped (set RUN_DB_SEED_ON_BOOT=1 to opt in)
#
# Use `node …/prisma/build/index.js` instead of `npx prisma`: the production image
# has no full npm/npx shim, so `npx` can fail with "prisma: not found".

PRISMA_CLI="node /app/node_modules/prisma/build/index.js"

if [ -n "$DATABASE_URL" ]; then
  echo "[mbkru entrypoint] DATABASE_URL is set — running migrations..."
  if $PRISMA_CLI migrate deploy; then
    echo "[mbkru entrypoint] Migrations applied successfully."
    SHOULD_SEED=0
    if [ "${RUN_DB_SEED_ON_BOOT:-}" = "1" ]; then
      SHOULD_SEED=1
    elif [ "${SKIP_DB_SEED:-}" != "1" ] && [ "${NODE_ENV:-}" != "production" ]; then
      SHOULD_SEED=1
    fi

    if [ "$SHOULD_SEED" = "1" ]; then
      echo "[mbkru entrypoint] Running database seed..."
      if $PRISMA_CLI db seed; then
        echo "[mbkru entrypoint] Seed completed successfully."
      else
        echo "[mbkru entrypoint] WARNING: Seed failed. Log in to Admin → Settings → Database and run \"Seed database\" manually."
      fi
    else
      echo "[mbkru entrypoint] Skipping seed (set RUN_DB_SEED_ON_BOOT=1 to enable on startup)."
    fi
  else
    echo "[mbkru entrypoint] ERROR: prisma migrate deploy failed."
    if [ "${ALLOW_START_WITH_FAILED_MIGRATION:-}" = "1" ]; then
      echo "[mbkru entrypoint] ALLOW_START_WITH_FAILED_MIGRATION=1 set — continuing startup."
    else
      echo "[mbkru entrypoint] Exiting to prevent running with an incompatible schema."
      exit 1
    fi
  fi
else
  echo "[mbkru entrypoint] DATABASE_URL unset — skipping migrate/seed."
fi

exec node server.js
