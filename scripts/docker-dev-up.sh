#!/usr/bin/env sh
# Restore / start the local Docker Desktop stack: Postgres + Redis + Next.js (hot reload).
# This does not deploy mbkru.org. Production is git push to main → Coolify.
# Usage: from repo root,  ./scripts/docker-dev-up.sh
set -e
cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found. Install Docker Desktop (or Docker Engine + Compose v2)."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example — set ADMIN_* and session secrets before production."
  cp .env.example .env
fi

# Bind-mount overwrites image chmod; host file must be readable by `sh`.
chmod +x docker-dev-entrypoint.sh 2>/dev/null || true

echo "Building and starting: postgres, redis, mbkru-dev …"
if ! docker compose -f docker-compose.dev.yml up -d --build; then
  echo ""
  echo "Docker failed. If the error mentions blob … input/output error or containerd:"
  echo "  1. Restart Docker Desktop (or: sudo systemctl restart docker on Linux)"
  echo "  2. Free disk space; then try again"
  echo "  3. Docker Desktop → Troubleshoot → Clean / Reset data (removes local images)"
  exit 1
fi

echo ""
echo "Waiting for Postgres…"
i=0
while [ "$i" -lt 45 ]; do
  if docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U mbkru -d mbkru >/dev/null 2>&1; then
    echo "Postgres is ready."
    break
  fi
  i=$((i + 1))
  if [ "$i" -eq 45 ]; then
    echo "Postgres did not become ready. Check: docker compose -f docker-compose.dev.yml ps"
    exit 1
  fi
  sleep 1
done

echo "Waiting for the app container, then seeding (admin + starter data)…"
i=0
seeded=0
while [ "$i" -lt 30 ]; do
  if docker compose -f docker-compose.dev.yml exec -T mbkru-dev npx prisma db seed; then
    seeded=1
    break
  fi
  i=$((i + 1))
  sleep 3
done

if [ "$seeded" -ne 1 ]; then
  echo "WARNING: automatic seed did not finish. Retry with:"
  echo "  docker compose -f docker-compose.dev.yml exec mbkru-dev npx prisma db seed"
fi

echo ""
echo "Stack is up."
echo "  Site:   http://localhost:1100"
echo "  Admin:  http://localhost:1100/admin/login"
echo "  Health: http://localhost:1100/api/health"
echo "  Logs:   docker compose -f docker-compose.dev.yml logs -f mbkru-dev"
echo ""
echo "Production (mbkru.org) is unchanged. Ship code with: git push origin main"
