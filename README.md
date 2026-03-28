# MBKRU Advocates — Phase 1 Website

Civic Accountability & Citizens Engagement Platform for Ghana.

**Source:** [github.com/wastwagon/mbkru](https://github.com/wastwagon/mbkru)

## Architecture & phases

- **Sprint plan (Phase 1 polish → Phase 3):** [`docs/SPRINT_BACKLOG.md`](docs/SPRINT_BACKLOG.md)
- **Full write-up:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Phase 1 vs 2 vs 3 boundaries, Postgres + built-in admin, Docker build args, extension checklist.
- **Phase 1 completion & recovery:** [`docs/PHASE1_STATUS.md`](docs/PHASE1_STATUS.md) — verified against scope, how to run/restore the project.
- **Phase 1 product scope:** [`PHASE1_SCOPE.md`](PHASE1_SCOPE.md)
- **Business roadmap (2028 election):** [`ROADMAP_2028_ELECTION.md`](ROADMAP_2028_ELECTION.md)
- **Health check:** `GET /api/health` — probes Postgres (`SELECT 1`) and Redis (`PING`) when URLs are set; returns **503** only when Postgres is configured but unreachable (**unhealthy**). Redis failure yields **degraded** with HTTP 200 so optional Redis does not fail the container.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Content:** PostgreSQL + Prisma; built-in admin at `/admin` (posts + shared media library)
- **Forms:** React Hook Form + Zod
- **Deployment:** **Docker / Coolify (recommended)** — `output: "standalone"` in `next.config.ts`. Vercel is possible with a managed Postgres URL and the same env vars.

## Getting Started

### Prerequisites

- Node.js **20+** (see `.nvmrc`)
- npm

### Install & Run

```bash
npm install
# Start Postgres (e.g. docker compose up -d postgres) and set DATABASE_URL in .env.local
npx prisma migrate dev
npx prisma db seed   # creates/updates first admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev
```

Open [http://localhost:1100](http://localhost:1100) (see `package.json` dev script). **Admin:** [http://localhost:1100/admin/login](http://localhost:1100/admin/login) after seeding.

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` (or `.env` for Docker Compose) and fill in. See the file for the full list.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (sitemap, OG, `metadataBase`) |
| `NEXT_PUBLIC_PLATFORM_PHASE` | `1` (Phase 1) — use `2`/`3` when those phases launch |
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

**Docker / Coolify:** `NEXT_PUBLIC_*` variables must be passed as **build arguments** when building the image (see `Dockerfile` and `docker-compose.yml`), not only at container runtime.

### Database on deploy (Docker / Coolify)

On container start, `docker-entrypoint.sh` runs **`prisma migrate deploy`** and then **`prisma db seed`** when `DATABASE_URL` is set. Set **`SKIP_DB_SEED=1`** to run migrations only. If migrate or seed fails, the app still starts so you can fix the database and use **Admin → Settings** to run **Run migrations**, **Seed database**, or **Migrate + seed** manually (same Prisma commands, admin session required).

**Production operations** (backups, when to skip seed, secret rotation, `NEXT_PUBLIC_*` rebuilds): see [`docs/OPS_RUNBOOK.md`](docs/OPS_RUNBOOK.md).

## Admin & content (news + media library)

1. Set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in `.env.local`.
2. Run `npx prisma migrate dev` (or `migrate deploy` in production).
3. Run `npx prisma db seed` once to create or update the admin password hash.
4. Sign in at **`/admin/login`**. Manage **posts** (public news), **Lead capture** (newsletter / early access / Parliament tracker waitlists), **Citizen reports**, and upload images once in **Media**; pick a featured image per post from the library.

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
| 8 | Resources | `/resources` |
| 9 | Partners & Supporters | `/partners` |
| 10 | Contact Us | `/contact` |
| 11 | Privacy Policy | `/privacy` |
| 12 | Terms of Use | `/terms` |

## Integrations (To Configure)

- **Contact form** — Connect to Resend, SendGrid, or similar
- **Newsletter** — Mailchimp or ConvertKit API
- **reCAPTCHA** — For form spam protection
- **Google Analytics 4** — Add GA4 script to layout
- **Google Search Console** — Verify domain

## Docker

### Production (Docker Desktop or Coolify)

```bash
docker compose up -d --build
docker compose exec mbkru-web npx prisma db seed
```

App runs at http://localhost:1100 (port 1100 → container 3000). The image runs **`prisma migrate deploy`** on start when `DATABASE_URL` is set. **Seed** creates the first admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Uploaded files persist in the **`mbkru_uploads`** volume (`public/uploads`).

Use a `.env` file in the project root so `build.args` pick up `NEXT_PUBLIC_*` for the image build, and set `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

### Full stack (Postgres + Redis for Phase 2+)

```bash
docker compose -f docker-compose.fullstack.yml up -d --build
docker compose exec mbkru-web npx prisma db seed
```

Same URL; Postgres backs the app; Redis is on the Docker network for rate limiting and future queues.

### Development with Docker

```bash
docker compose -f docker-compose.dev.yml up
```

Hot reload enabled. Edit code and see changes at http://localhost:1100.

### Build image only

```bash
docker build -t mbkru-website .
docker run -p 1100:3000 mbkru-website
```

## Deploy to Coolify (VPS)

1. **Push to GitHub** — Ensure the repo has the Dockerfile and docker-compose.yml
2. **Add Resource in Coolify** — New Resource → Docker Compose (or Dockerfile)
3. **Connect repo** — Link your GitHub repo
4. **Configure:**
   - Build: Use existing Dockerfile (or Coolify will detect it)
   - Port: Map container `3000` → host `1100` (or your preferred port)
   - Domain: Add your domain (e.g. mbkruadvocates.org) for SSL
5. **Environment variables** — Add in Coolify (build + runtime as needed):
   - `NEXT_PUBLIC_SITE_URL` = https://yourdomain.com
   - `NEXT_PUBLIC_PLATFORM_PHASE` = `1`
   - `DATABASE_URL` (Postgres service on the same stack or managed DB)
   - `ADMIN_SESSION_SECRET` (long random string)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (then run seed once, or run seed in a deploy hook)
6. **Persistent volume** — Mount or use a named volume for `/app/public/uploads` so media survives redeploys.
7. **Deploy** — Coolify will build and run the container; ensure migrations run (entrypoint runs `prisma migrate deploy` when `DATABASE_URL` is set).

Coolify handles SSL (Let's Encrypt), restarts, and zero-downtime deploys automatically.

## Deploy to Vercel (Alternative)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

## Production hardening (included)

- **HTTP security headers** — Set in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and **HSTS** when `NEXT_PUBLIC_SITE_URL` uses `https://`.
- **Rate limiting** — `POST` handlers for contact, newsletter, early access, tracker signup, **auth**, and **report submit / track** limit requests per IP (shared via **Redis** when `REDIS_URL` is set; otherwise in-memory for single-instance/dev).
- **Phase 2+ (`NEXT_PUBLIC_PLATFORM_PHASE` ≥ 2 at build)** — Public **member** auth (`/login`, `/register`, `/account`), **MBKRU Voice** `POST /api/reports` (optional **Turnstile** when `TURNSTILE_SECRET_KEY` is set), **attachments** `POST /api/reports/[id]/attachments`, **track** `GET /api/reports/track/[code]`, **`/citizens-voice/submit`**, **`/track-report`**, and admin **Citizen reports** queue at `/admin/reports`. Requires **`MEMBER_SESSION_SECRET`** for member APIs; optional **`REPORT_ATTACHMENT_HMAC_SECRET`** (≥32 chars) enables anonymous attachment uploads via a short-lived token after submit.
- **Input validation** — Zod schemas in `src/lib/validation/public-forms.ts`.
- **CI** — `.github/workflows/ci.yml` runs `npm ci`, `lint`, and `build` on push/PR to `main` or `master`.

## Client Handover Checklist

- [ ] Add final content (About, Contact details, etc.)
- [ ] Run DB migrations + seed; add news posts and media in `/admin`
- [ ] Set up email (contact form, newsletter)
- [ ] Add reCAPTCHA to contact form
- [ ] Configure custom domain
- [ ] Set up Google Analytics 4 & Search Console
- [ ] Admin walkthrough (login, posts, media library)

---

Built by OceanCyber for MBKRU Advocates. Reference: OC-WEB-2025-001
