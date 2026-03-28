# Operations runbook — MBKRU website

Short checklist for production Docker / Coolify hosts. Complements `README.md` and `docker-entrypoint.sh`.

## Database backups (Postgres)

- **Volume snapshot:** If Postgres data lives in a named Docker volume (e.g. `postgres_data`), include that volume in your host backup or snapshot strategy.
- **Logical dump (example):**
  ```bash
  docker compose exec postgres pg_dump -U mbkru mbkru | gzip > "mbkru-$(date +%Y%m%d).sql.gz"
  ```
  Adjust user, database, and service name to match your Compose file.

Restore only with a tested procedure; never overwrite production without a rollback plan.

## Migrations vs seed

- **Migrations** run on every container start via `prisma migrate deploy` (see `docker-entrypoint.sh`).
- **Seed** runs after a successful migrate **unless** `SKIP_DB_SEED=1`.

### After the first stable deploy

Set **`SKIP_DB_SEED=1`** in Coolify / Compose so container restarts do not re-run seed. Seed is idempotent for regions, admin password, and starter posts, but skipping avoids unnecessary work and surprises if you edit seeded data in the admin.

You can still run seed manually when needed:

```bash
docker compose exec mbkru-web node /app/node_modules/prisma/build/index.js db seed
```

## Secrets and build-time variables

- Rotate **`ADMIN_SESSION_SECRET`**, **`MEMBER_SESSION_SECRET`** (Phase 2+), **`ADMIN_PASSWORD`**, Resend, Turnstile, and database credentials on any suspected leak.
- **`MEMBER_SESSION_SECRET`** is server-only (≥32 characters), distinct from the admin secret. Member auth is enabled when **`NEXT_PUBLIC_PLATFORM_PHASE`** is **2 or 3** at **build** time (and optional **`PLATFORM_PHASE`** on the server matches).
- Any **`NEXT_PUBLIC_*`** value (site URL, Turnstile site key, analytics IDs) is **baked at image build time**. After changing them, **rebuild and redeploy** the image — runtime env alone is not enough for those.

## Health and incidents

- Use **`GET /api/health`** for load balancers (returns **503** if Postgres is configured but unreachable).
- If migrate fails on start, the app still boots; use **Admin → Settings → Database** to retry migrations or seed.

## Content

- Starter **news posts** are upserted by seed (same slugs as `newsPlaceholders`). Edit or unpublish from **`/admin/posts`** as needed.
- **Citizen reports** (`CitizenReport`) — triage in **`/admin/reports`**. Schema may gain columns via migrations (e.g. `submitterEmail`); always run **`prisma migrate deploy`** on deploy.
- Re-running **seed** will **overwrite** those slugs’ titles and bodies. After go-live, prefer **`SKIP_DB_SEED=1`** and manage content only from the admin UI (or drop starter posts from `prisma/seed.mjs` once you no longer want them refreshed).
