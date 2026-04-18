#!/usr/bin/env sh
# Start full-stack local dev: Postgres + Redis + Next.js (hot reload).
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
echo "Stack is up. App: http://localhost:1100"
echo "Optional one-time seed (admin + demo data):"
echo "  docker compose -f docker-compose.dev.yml exec mbkru-dev npx prisma db seed"
echo "Logs:"
echo "  docker compose -f docker-compose.dev.yml logs -f mbkru-dev"
