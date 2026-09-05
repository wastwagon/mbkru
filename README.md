# MBKRU Advocates — Phase 1 Website

Civic Accountability & Citizens Engagement Platform for Ghana.

**Source:** [github.com/wastwagon/mbkru](https://github.com/wastwagon/mbkru)

## Architecture & phases

- **Sprint plan (Phase 1 polish → Phase 3):** [`docs/SPRINT_BACKLOG.md`](docs/SPRINT_BACKLOG.md)
- **Phase task backlog (checkboxes):** [`docs/PHASE_TASKS.md`](docs/PHASE_TASKS.md)
- **Safe phased rollout (ops + legal + data order):** [`docs/SAFE_IMPLEMENTATION_PHASES.md`](docs/SAFE_IMPLEMENTATION_PHASES.md) — automated slice: `npm run verify:release-gates`
- **Safe UI/UX phases (copy, less duplication, hub orientation):** [`docs/SAFE_UI_UX_PHASES.md`](docs/SAFE_UI_UX_PHASES.md)
- **Ops & CSV import:** [`docs/OPS_RUNBOOK.md`](docs/OPS_RUNBOOK.md) · [`docs/CSV_IMPORT_RUNBOOK.md`](docs/CSV_IMPORT_RUNBOOK.md) · **Public data sources (MPs, constituencies, manifestos):** [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md)
- **Security & observability:** [`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md) · [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md)
- **Voice + accessibility rollout guide:** [`docs/VOICE_AND_ACCESSIBILITY_GUIDE.md`](docs/VOICE_AND_ACCESSIBILITY_GUIDE.md)
- **Full write-up:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Phase 1 vs 2 vs 3 boundaries, Postgres + built-in admin, Docker build args, extension checklist.
- **Vision expansion (data, manifestos, Queen Mothers communities, backlog):** [`docs/PLATFORM_EXPANSION_PLAN.md`](docs/PLATFORM_EXPANSION_PLAN.md)  
- **Full implementation plan (schema, APIs, UI, workstreams A–O, no MVP trim):** [`docs/FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](docs/FULL_PLATFORM_IMPLEMENTATION_PLAN.md)
- **Phase 1 completion & recovery:** [`docs/PHASE1_STATUS.md`](docs/PHASE1_STATUS.md) — verified against scope, how to run/restore the project.
- **Phase 1 product scope:** [`PHASE1_SCOPE.md`](PHASE1_SCOPE.md)
- **Business roadmap (2028 election):** [`ROADMAP_2028_ELECTION.md`](ROADMAP_2028_ELECTION.md)
- **Health check:** `GET /api/health` — probes Postgres (`SELECT 1`) and Redis (`PING`) when URLs are set; returns **503** only when Postgres is configured but unreachable (**unhealthy**). Redis failure yields **degraded** with HTTP 200 so optional Redis does not fail the container. JSON includes **`accountability.parliamentJson`** and **`accountability.reportCardJson`** (build-time gates for partner **`GET /api/mps`**, **`/api/promises`**, **`/api/report-card/[year]`**).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Content:** PostgreSQL + Prisma; built-in admin at `/admin` (posts + shared media library). Site-wide marketing copy, illustrative image URLs, programme roadmap, and FAQ live in `src/lib/site-content.ts`.
- **Forms:** React Hook Form + Zod
- **Deployment:** **Docker / Coolify (recommended)** — `output: "standalone"` in `next.config.ts`. Vercel is possible with a managed Postgres URL and the same env vars.

## Getting Started

### Prerequisites

- Node.js **20+** (see `.nvmrc`)
- npm

### Restore local preview (Docker Desktop)

This is the laptop stack: **Postgres + Redis + Next.js** at **http://localhost:1100**. It is **not** production. Shipping to [mbkru.org](https://mbkru.org/) is a **git push to `main`** (Coolify rebuilds from GitHub).

```bash
./scripts/docker-dev-up.sh
```

That command recreates the containers and database volumes if they were deleted, applies migrations, and seeds starter/admin data. Then open:

- Site: [http://localhost:1100](http://localhost:1100)
- Admin: [http://localhost:1100/admin/login](http://localhost:1100/admin/login) — `admin@example.com` / `DevAdmin!mbkru-local-2026` (from `.env`)
- Health: [http://localhost:1100/api/health](http://localhost:1100/api/health)

Stop: `docker compose -f docker-compose.dev.yml down`  
Wipe the local database as well: `docker compose -f docker-compose.dev.yml down -v`

### One-command host Next.js (DB still in Docker)

If you prefer Next.js on the host and only Postgres/Redis in Docker:

```bash
npm run setup:local
npm run dev
```

Default admin (when `.env` was created by the script): `admin@example.com` / `DevAdmin!mbkru-local-2026`. Pilot members: see script output.

### Install & Run (manual)

```bash
npm install
# Postgres: docker compose up -d postgres redis — use DATABASE_URL with localhost:55432 (see .env.example)
npx prisma migrate dev
npx prisma db seed   # admin from ADMIN_EMAIL / ADMIN_PASSWORD; public accountability starter unless SEED_ACCOUNTABILITY_DEMO=0; optional SEED_MEMBER_DEMO=1 (see .env.example)
npm run dev
```

Open [http://localhost:1100](http://localhost:1100) (see `package.json` dev script). **Admin:** [http://localhost:1100/admin/login](http://localhost:1100/admin/login) after seeding.

### Build for Production

```bash
npm run build
npm start
```

### Unit tests & release gates

```bash
npm run test
npm run test:e2e:smoke
npm run test:e2e:dashboards
npm run verify:release-gates   # Prisma validate + tsc --noEmit + vitest (CI runs this after lint)
npm run ops:notifications:process  # process queued report email/SMS jobs
```

For automated processing in production, schedule:
- `POST /api/cron/notifications-outbox` with `Authorization: Bearer <CRON_SECRET>`.

Vitest runs fast unit tests for shared helpers (no database).

**Lighthouse (CI):** pushes to `main` / `master` run **@lhci/cli** after production build — **mobile** emulation on `/`, `/about`, `/contact`, `/news` (`lighthouserc.cjs`). Local: `npm run build` then `DATABASE_URL= NEXT_PUBLIC_SITE_URL=http://localhost:3000 npx @lhci/cli autorun`.

## Environment Variables

Copy `.env.example` to `.env.local` (or `.env` for Docker Compose) and fill in. See the file for the full list.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (sitemap, OG, `metadataBase`) |
| `NEXT_PUBLIC_PLATFORM_PHASE` | `3` in `.env.example` / Docker defaults (full platform); use `1` for marketing-only (rebuild after change) |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account; `prisma db seed` upserts this user |
| `ADMIN_SESSION_SECRET` | Secret for signing the admin session cookie (≥32 characters in production) |
| `MEMBER_SESSION_SECRET` | When **Phase 2+** (`NEXT_PUBLIC_PLATFORM_PHASE` ≥ 2): secret for **public member** sessions (≥32 chars); must differ from `ADMIN_SESSION_SECRET` |
| `PLATFORM_PHASE` | Optional server override of phase (otherwise uses `NEXT_PUBLIC_PLATFORM_PHASE`) |
| `RESEND_API_KEY` | Optional; [Resend](https://resend.com) API key — contact form sends email when set with `CONTACT_INBOX_EMAIL` |
| `CONTACT_INBOX_EMAIL` | Inbox that receives contact submissions (required with `RESEND_API_KEY`) |
| `RESEND_FROM_EMAIL` | Optional; default `MBKRU Contact <onboarding@resend.dev>` (use your verified domain in production) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional; [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) site key — shows widget on public forms when set |
| `TURNSTILE_SECRET_KEY` | Optional; Turnstile **secret** — when set, APIs require a valid widget token (use with the site key above) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional; [GA4](https://support.google.com/analytics) measurement ID (`G-…`) — loads on the **public** site only (not `/admin`) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional; [Plausible](https://plausible.io) site domain — can be used alone or alongside GA4 |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` | Optional; defaults to `https://plausible.io/js/script.js` — set for self-hosted Plausible |
| `REDIS_URL` | Optional; **shared rate limits** for public form APIs when set; health check pings Redis |
| `RATE_LIMIT_WINDOW_MS` | Optional; default `60000` (ms window per IP + route) |
| `RATE_LIMIT_MAX` | Optional; default `30` requests per window |
| `OPENAI_API_KEY` | Optional; enables provider-backed MBKRU Voice chatbot responses on `POST /api/mbkru-voice` (fallback replies still work without it) |
| `MBKRU_VOICE_EVENT_TOKEN` | Optional; when set, `/api/analytics/mbkru-voice-event` requires matching token for telemetry ingestion |
| `NEXT_PUBLIC_MBKRU_VOICE_EVENT_TOKEN` | Optional; client telemetry token (must match `MBKRU_VOICE_EVENT_TOKEN` when token mode is enabled) |

**Docker / Coolify:** `NEXT_PUBLIC_*` variables must be passed as **build arguments** when building the image (see `Dockerfile` and `docker-compose.yml`), not only at container runtime.

### Database on deploy (Docker / Coolify)

On container start, `docker-entrypoint.sh` runs **`prisma migrate deploy`** when `DATABASE_URL` is set. In production, startup now **fails fast** on migration errors unless `ALLOW_START_WITH_FAILED_MIGRATION=1` is explicitly set. Seed is **off by default in production**; set `RUN_DB_SEED_ON_BOOT=1` when you intentionally want startup seeding (or use Admin → Settings to run seed manually). In non-production, seed still runs unless `SKIP_DB_SEED=1`.

**Production operations** (backups, when to skip seed, secret rotation, `NEXT_PUBLIC_*` rebuilds): see [`docs/OPS_RUNBOOK.md`](docs/OPS_RUNBOOK.md).

## Admin & content (news + media library)

1. Set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in `.env.local`.
2. Run `npx prisma migrate dev` (or `migrate deploy` in production).
3. Run `npx prisma db seed` once to create or update the admin password hash.
4. Sign in at **`/admin/login`**. Manage **posts** (public news), **Resource library** (PDFs on **`/resources`**), **Parliament & catalogue** (CSV import, tracked commitments per MP), **Members** (identity verification status for Voice accounts), **Town halls & forums** (programme rows for **`/town-halls`** and **`/debates`**), **Report card** (publish cycles + scorecard entries), **Lead capture** (filter tabs + **Download CSV** → **`/api/admin/leads-export`**), **Citizen reports**, and **Media**; pick a featured image per post from the library.

Additional admin accounts can be added later (e.g. new `Admin` rows + the same auth flow, or a small “invite admin” UI in Phase 2).

### Redis (optional, recommended in production)

`docker-compose.yml` includes **Redis** next to Postgres. When **`REDIS_URL`** is set, public lead-capture routes (`/api/contact`, `/api/newsletter`, `/api/early-access`, `/api/tracker-signup`), **report submit / track / attachments**, **member auth**, and **`/api/admin/login`** use **Redis-backed rate limits** so limits apply across multiple app instances. Without Redis, a **per-process memory limiter** is used (fine for single-container dev).

`docker-compose.fullstack.yml` is available if you prefer that layout; behavior is the same once `REDIS_URL` is set.

### One-off import from Sanity (posts only)

There is **no Sanity SDK** in this repo. To copy **blog-style posts** from an existing Sanity project into Prisma (featured image + portable text → markdown), run once with your project credentials:

```bash
export DATABASE_URL="postgresql://..."
export SANITY_PROJECT_ID="yourProjectId"
export SANITY_DATASET="production"   # optional
export SANITY_API_READ_TOKEN="..."   # if the dataset is private
export SANITY_DOC_TYPE="post"        # optional; must match your schema _type
npm run import:sanity
```

Images referenced by `mainImage` are downloaded into `public/uploads`. If your schema uses different field names, edit the GROQ in `scripts/import-sanity-posts.ts` (`buildSanityQuery`). Team, partners, and resources are **not** imported automatically — add models or migrate those separately if needed.

## Pages (Phase 1)

| # | Page | Route |
|---|------|-------|
| 1 | Homepage | `/` |
| 2 | About Us | `/about` |
| 3 | Citizens Voice (Preview) | `/citizens-voice` |
| 4 | Situational Alerts (Preview) | `/situational-alerts` |
| 5 | Parliament & Ministers Tracker (Preview) | `/parliament-tracker` |
| 6 | News & Updates | `/news` |
| 7 | Diaspora — 17th Region (context) | `/diaspora` |
| 8 | Resources | `/resources` · `/resources/[slug]` (per published document) |
| 9 | Partners & Supporters | `/partners` |
| 10 | Contact Us | `/contact` |
| 11 | Privacy Policy | `/privacy` |
| 12 | Terms of Use | `/terms` |

## Integrations (To Configure)

- **Contact form** — **Resend** when `RESEND_API_KEY` and `CONTACT_INBOX_EMAIL` are set (`src/lib/server/send-contact-email.ts`); otherwise log-only
- **Tracker / early-access leads** — Optional staff email when `RESEND_API_KEY` and **`LEADS_STAFF_INBOX_EMAIL`** are set (`send-lead-capture-staff-email.ts`); does not apply to newsletter-only signups
- **Newsletter** — **Postgres `LeadCapture`** always; optional **Mailchimp** (`MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`) or **ConvertKit** (`CONVERTKIT_API_SECRET`, `CONVERTKIT_FORM_ID`) sync after signup — see `.env.example`
- **Bot protection** — **Cloudflare Turnstile** (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`) on public POSTs, not reCAPTCHA
- **Google Analytics 4** — `NEXT_PUBLIC_GA_MEASUREMENT_ID` → `AnalyticsScripts` in `(main)/layout`
- **Google Search Console** — `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (HTML tag content value) on root `metadata.verification`

## Docker

Two different stacks — do not mix them.

| What you want | Command | Result |
|---------------|---------|--------|
| **Local preview on this Mac** | `./scripts/docker-dev-up.sh` | http://localhost:1100 (hot reload). Uses `docker-compose.dev.yml`. |
| **Ship to the live site** | `git push origin main` | Coolify on the VPS rebuilds [mbkru.org](https://mbkru.org/) from GitHub. Local Docker is never production. |

### Local Docker Desktop (restore this after deleting containers)

Recreates **Postgres** (host **55432**), **Redis** (host **56379**), and the **Next.js** dev server on **http://localhost:1100**. Migrations run on start; the script then seeds admin + demo data.

```bash
./scripts/docker-dev-up.sh
```

Host-side `.env` must use those published ports (already set in `.env.example`):

- `DATABASE_URL=postgresql://mbkru:mbkru_dev@localhost:55432/mbkru`
- `REDIS_URL=redis://localhost:56379`

Do **not** point `REDIS_URL` at `localhost:6379` — that port is usually another project’s Redis.

If Docker errors with **blob … input/output error** or **containerd**, restart Docker Desktop, free disk space, or use **Troubleshoot → Clean / Reset data** (local images are removed).

### Production-like image on this Mac (optional)

Use only when you need to test the standalone production image locally. This is **not** how mbkru.org is updated, and it does **not** hot-reload.

```bash
RUN_DB_SEED_ON_BOOT=1 docker compose up -d --build
```

App: http://localhost:1100 (host **1100** → container **3000**). `docker-entrypoint.sh` runs **`prisma migrate deploy`** on start. Because `NODE_ENV=production`, seed needs **`RUN_DB_SEED_ON_BOOT=1`** (or seed once with):

```bash
docker compose exec mbkru-web node /app/node_modules/prisma/build/index.js db seed
```

(`npx prisma` is not available in the production image.)

`docker-compose.fullstack.yml` is an older duplicate of the same three services — prefer `docker-compose.yml` if you need this path.

Sensitive uploads (Voice attachments and community verification docs) live under **`PRIVATE_UPLOADS_DIR`** (`var/private-uploads` by default); public media stays under `public/uploads`.

### Build image only

```bash
docker build -t mbkru-website .
docker run -p 1100:3000 mbkru-website
```

## Deploy to production (Coolify / mbkru.org)

Local Docker Desktop and production are separate. **Code reaches the live site only through GitHub `main`.**

1. Commit on a branch, open a PR (or merge locally), then **`git push origin main`**.
2. Coolify is already connected to [github.com/wastwagon/mbkru](https://github.com/wastwagon/mbkru) and rebuilds the production image from `Dockerfile` / `docker-compose.yml`.
3. Every new container runs **`docker-entrypoint.sh`** → **`prisma migrate deploy`**. Do **not** set `RUN_DB_SEED_ON_BOOT=1` on production (that would re-seed demo content).
4. Confirm [https://mbkru.org/api/health](https://mbkru.org/api/health) after deploy.

Coolify env (already on the VPS — change there, not in local `.env`):

- `NEXT_PUBLIC_SITE_URL` = `https://mbkru.org` (**rebuild** after changing any `NEXT_PUBLIC_*`)
- `NEXT_PUBLIC_PLATFORM_PHASE` = `3`
- `DATABASE_URL`, `ADMIN_SESSION_SECRET`, `MEMBER_SESSION_SECRET`, plus optional Resend / Turnstile / Hubtel keys
- Persistent volumes for `/app/public/uploads` and `/app/var/private-uploads`

**If `/login` or `/register` say member auth is off:** the running image was built with `NEXT_PUBLIC_PLATFORM_PHASE=1`. Set it to `3` in Coolify **build arguments** and **trigger a new build** (not just a restart).

## Deploy to Vercel (Alternative)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

## Production hardening (included)

- **HTTP security headers** — Set in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and **HSTS** when `NEXT_PUBLIC_SITE_URL` uses `https://`.
- **Rate limiting** — `POST` handlers for contact, newsletter, early access, tracker signup, **auth**, and **report submit / track** limit requests per IP; **GET** accountability JSON (`/api/mps`, `/api/promises`, phase 3 `/api/report-card/[year]`) and **`GET /api/export/mps-csv`** / **`GET /api/export/promises-csv`** use the same helper per IP (separate bucket keys per route). Shared via **Redis** when `REDIS_URL` is set; otherwise in-memory for single-instance/dev.
- **Phase 2+ (`NEXT_PUBLIC_PLATFORM_PHASE` ≥ 2 at build)** — Public **member** auth (`/login`, `/register`, `/account`). **MBKRU Voice** requires sign-in: **`POST /api/reports`**, **`/citizens-voice/submit`** (proxy redirects guests to `/login?next=…`), **`GET /api/reports/track/[code]`** / **`/track-report`** (member session + ownership when `memberId` is set). Optional **Turnstile** when `TURNSTILE_SECRET_KEY` is set; **attachments** `POST /api/reports/[id]/attachments`. **`GET /api/mps`** (active roster JSON), **`GET /api/export/mps-csv`** (roster CSV), **`GET /api/export/promises-csv`** (tracked commitments CSV; full list), **`GET /api/promises`**, **`/promises`** (by MP), **`/promises/browse`**, **`/government-commitments`** (public promise catalogue), **`/methodology`**, admin **Citizen reports**, **Parliament & catalogue** (CSV import). Requires **`MEMBER_SESSION_SECRET`** for member APIs; optional **`REPORT_ATTACHMENT_HMAC_SECRET`** (≥32 chars) enables short-lived **`attachmentUploadToken`** after submit (e.g. upload from another device).
- **Phase 2+ (`NEXT_PUBLIC_PLATFORM_PHASE` ≥ 2)** — **`/report-card`**, **`/report-card/[year]`**, **`GET /api/report-card/[year]`** (published cycles only); **`/transparency`** (aggregate Voice statistics). Admin **Report card** at **`/admin/report-card`**.
- **Phase 3 (`NEXT_PUBLIC_PLATFORM_PHASE` ≥ 3 at build)** — Election observation flows and reserved flagship flags; same public report-card routes remain available as in Phase 2.
- **Input validation** — Zod schemas in `src/lib/validation/public-forms.ts`.
- **CI** — `.github/workflows/ci.yml` runs `npm ci`, `lint`, and `build` on push/PR to `main` or `master`.

## Client Handover Checklist

- [ ] Add final content (About, Contact details, etc.)
- [ ] Run DB migrations + seed; add news posts and media in `/admin`
- [ ] Set up email (contact form, newsletter)
- [ ] Add Cloudflare Turnstile to contact form (not reCAPTCHA)
- [ ] Configure custom domain
- [ ] Set up Google Analytics 4 & Search Console
- [ ] Admin walkthrough (login, posts, media library)

---

Built by OceanCyber for MBKRU Advocates. Reference: OC-WEB-2025-001
