#!/bin/sh
# Auto-apply migrations and seed on container start (Coolify / Docker).
# If migrate fails, the app still starts so an admin can retry from /admin/settings.
# Opt out of seed: SKIP_DB_SEED=1

if [ -n "$DATABASE_URL" ]; then
  echo "[mbkru entrypoint] DATABASE_URL is set — running migrations..."
  if npx prisma migrate deploy; then
    echo "[mbkru entrypoint] Migrations applied successfully."
    if [ "${SKIP_DB_SEED:-}" != "1" ]; then
      echo "[mbkru entrypoint] Running database seed..."
      if npx prisma db seed; then
        echo "[mbkru entrypoint] Seed completed successfully."
      else
        echo "[mbkru entrypoint] WARNING: Seed failed. Log in to Admin → Settings → Database and run \"Seed database\" manually."
      fi
    else
      echo "[mbkru entrypoint] SKIP_DB_SEED=1 — skipping seed."
    fi
  else
    echo "[mbkru entrypoint] ERROR: prisma migrate deploy failed. The app will still start. Fix the database connection or SQL, then use Admin → Settings → Database to run migrations manually."
  fi
else
  echo "[mbkru entrypoint] DATABASE_URL unset — skipping migrate/seed."
fi

exec node server.js
