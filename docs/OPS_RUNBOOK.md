# Operations runbook — MBKRU website

Short checklist for production Docker / Coolify hosts. Complements `README.md` and `docker-entrypoint.sh`.

**Related:** [`PHASE_TASKS.md`](./PHASE_TASKS.md) (phase backlog) · [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) (MP roster import) · [`PARTNER_API.md`](./PARTNER_API.md) (embed JSON draft) · [`OBSERVABILITY.md`](./OBSERVABILITY.md) · [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md)

---

## Quarterly / pre-release verification

Use before major traffic (e.g. election window) or after infra changes:

- [ ] **Backups:** restore a `pg_dump` (or volume snapshot) to a scratch instance — confirm app boots and admin login works.
- [ ] **`SKIP_DB_SEED=1`** on production after first stable deploy (see below).
- [ ] **`GET /api/health`:** HTTP **200** (or **503** only if Postgres intentionally down in a test); JSON **`dependencies`** and **`accountability`** flags match the phase you intend.
- [ ] **`NEXT_PUBLIC_*`:** any change (phase, site URL, Turnstile, analytics) required a **full image rebuild** — confirm current image matches env in your registry.
- [ ] **Phase:** `NEXT_PUBLIC_PLATFORM_PHASE` at build time matches what product/legal approved for this environment.

---

## Starter accountability data (seed)

- **Default:** `prisma db seed` loads a **small public sample**: three MPs (verify on [parliament.gh](https://www.parliament.gh/members)), matching constituencies, **NDC + NPP 2024 manifesto PDF links** (themes only — editors add page-level citations), five `CampaignPromise` rows, and a **report-card pilot cycle** (**scores unset** until methodology sign-off). Opt out with **`SEED_ACCOUNTABILITY_DEMO=0`** (see [`.env.example`](../.env.example)). Full roster: CSV import per [`DATA_SOURCES.md`](./DATA_SOURCES.md).
- Optional fictional **public members** (Phase 2+ **`/login`** tests): **`SEED_MEMBER_DEMO=1`** with **`SEED_MEMBER_EMAIL`** / **`SEED_MEMBER_PASSWORD`** (see [`.env.example`](../.env.example)). **Never** ship default demo passwords to production pilots without rotation.
- Build with **Phase 2** or **3** to expose `/promises` and `/report-card`.

---

## Security cadence (recommended)

- Rotate **`ADMIN_SESSION_SECRET`**, **`MEMBER_SESSION_SECRET`**, DB passwords, Resend/Turnstile keys on compromise or per org policy (e.g. annually).
- Run **`npm audit`** periodically; plan **Prisma major** upgrades separately — [`PRISMA7_NOTES.md`](./PRISMA7_NOTES.md).
- Review **upload volume** size and backup retention for **`public/uploads/reports/`**.

---

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

- Use **`GET /api/health`** for load balancers (returns **503** if Postgres is configured but unreachable). JSON includes **`phase`**, **`dependencies`**, and **`accountability`**: **`parliamentJson`** / **`reportCardJson`** mirror which partner **`GET`** routes this build can serve (`/api/mps`, `/api/promises` vs `/api/report-card/[year]`). Data responses still require Postgres **`ok`**.
- If migrate fails on start, the app still boots; use **Admin → Settings → Database** to retry migrations or seed.

## Content

- Starter **news posts** are upserted by seed (same slugs as `newsPlaceholders`). Edit or unpublish from **`/admin/posts`** as needed.
- **Citizen reports** (`CitizenReport`) — triage in **`/admin/reports`**. Schema may gain columns via migrations (e.g. `submitterEmail`); always run **`prisma migrate deploy`** on deploy.
- **Contact form** (`ContactSubmission`) — each **`POST /api/contact`** is appended when **`DATABASE_URL`** is set (before email). Review in **`/admin/contact-submissions`** (migration **`20260329120000_contact_submission`**).
- Re-running **seed** will **overwrite** those slugs’ titles and bodies. After go-live, prefer **`SKIP_DB_SEED=1`** and manage content only from the admin UI (or drop starter posts from `prisma/seed.mjs` once you no longer want them refreshed).

## Report evidence uploads (MBKRU Voice)

- Files are stored on disk under **`public/uploads/reports/{reportId}/`** (same volume as other media in Docker: **`mbkru_uploads`**).
- **Signed-in members** can upload attachments for their own report via the **member session cookie** (no extra secret).
- **Anonymous** reporters need **`REPORT_ATTACHMENT_HMAC_SECRET`** (≥32 characters, server-only). The app returns a short-lived **`attachmentUploadToken`** after **`POST /api/reports`**; without this secret, anonymous users cannot upload (the report is still accepted).
- **Antivirus:** there is **no** in-app scanning. For production at scale, scan the uploads volume on a schedule, use a reverse proxy / WAF with upload inspection, or move to object storage with malware scanning — see comments in `src/lib/server/report-attachment-limits.ts`.

## Election window & legal positioning

- **UI copy** reminds users that MBKRU is **not** the EC or a court; tracking codes and in-app status are **not** formal filings. Keep comms aligned with your legal adviser during live elections.
- **Moderation:** surge staffing for **`ELECTION_OBSERVATION`** and **`SITUATIONAL_ALERT`** queues; defer public reuse of raw submissions until verified.

## Public accountability cache (promises / report card)

- **`unstable_cache`** + tags in **`src/lib/server/accountability-cache.ts`** (default **300s** revalidate). Admin actions and parliament CSV import call **`revalidateTag`** so updates appear without waiting for TTL.
- Partner JSON: **`GET /api/mps`**, **`GET /api/promises`**, **`GET /api/report-card/[year]`** — rate-limited; successful **200** responses send **`Cache-Control`** aligned with the same **300s** TTL (`accountabilityPublicCacheControl` in code). **404** on report-card JSON uses **`private, no-store`** so a “not found” is not pinned in shared caches until a cycle is published. Other errors (**429**, **503**, etc.) are not given long-lived caching. Agree **terms of use** before giving third parties embed access.
- **Creating** a report-card cycle (even draft) runs **`revalidateTag`** for the index and year so server-side caches stay coherent with admin and publish flows.
