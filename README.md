# MBKRU Advocates — Phase 1 Website

Civic Accountability & Citizens Engagement Platform for Ghana.

**Source:** [github.com/wastwagon/mbkru](https://github.com/wastwagon/mbkru)

## Architecture & phases

- **Full write-up:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Phase 1 vs 2 vs 3 boundaries, Sanity vs Postgres, Docker build args, extension checklist.
- **Phase 1 completion & recovery:** [`docs/PHASE1_STATUS.md`](docs/PHASE1_STATUS.md) — verified against scope, how to run/restore the project.
- **Phase 1 product scope:** [`PHASE1_SCOPE.md`](PHASE1_SCOPE.md)
- **Business roadmap (2028 election):** [`ROADMAP_2028_ELECTION.md`](ROADMAP_2028_ELECTION.md)
- **Health check:** `GET /api/health` — use for Coolify/uptime (extend in Phase 2 for DB/Redis probes).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **CMS:** Sanity.io (headless)
- **Forms:** React Hook Form + Zod
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:1100](http://localhost:1100) (see `package.json` dev script).

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (sitemap, OG, `metadataBase`) |
| `NEXT_PUBLIC_PLATFORM_PHASE` | `1` (Phase 1) — use `2`/`3` when those phases launch |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID from sanity.io/manage |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (default: production) |

**Docker / Coolify:** `NEXT_PUBLIC_*` variables must be passed as **build arguments** when building the image (see `Dockerfile` and `docker-compose.yml`), not only at container runtime.

## Sanity CMS Setup

1. Create a project at [sanity.io/manage](https://sanity.io/manage)
2. Add `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` to `.env.local`
3. Update `sanity.config.ts` with your project ID
4. Access Sanity Studio at `/studio` after running the dev server

### Content Types

- **Blog Post** — News & Updates
- **Resource** — Downloadable reports, policy briefs
- **Team Member** — Leadership profiles (for About page)
- **Partner** — Partner logos and info

## Pages (Phase 1)

| # | Page | Route |
|---|------|-------|
| 1 | Homepage | `/` |
| 2 | About Us | `/about` |
| 3 | Citizens Voice (Preview) | `/citizens-voice` |
| 4 | Situational Alerts (Preview) | `/situational-alerts` |
| 5 | Parliament & Ministers Tracker (Preview) | `/parliament-tracker` |
| 6 | News & Updates | `/news` |
| 7 | Resources | `/resources` |
| 8 | Partners & Supporters | `/partners` |
| 9 | Contact Us | `/contact` |
| 10 | Privacy Policy | `/privacy` |
| 11 | Terms of Use | `/terms` |

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
```

App runs at http://localhost:1100 (port 1100 → container 3000). Use a `.env` file in the project root so `build.args` pick up `NEXT_PUBLIC_*` for the image build.

### Full stack (Postgres + Redis for Phase 2+)

```bash
docker compose -f docker-compose.fullstack.yml up -d --build
```

Same URL; database and cache are on the Docker network for when you add Prisma/queues.

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
5. **Environment variables** — Add in Coolify dashboard:
   - `NEXT_PUBLIC_SITE_URL` = https://yourdomain.com
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
6. **Deploy** — Coolify will build and run the container

Coolify handles SSL (Let's Encrypt), restarts, and zero-downtime deploys automatically.

## Deploy to Vercel (Alternative)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

## Client Handover Checklist

- [ ] Add final content (About, Contact details, etc.)
- [ ] Configure Sanity and add team/partner content
- [ ] Set up email (contact form, newsletter)
- [ ] Add reCAPTCHA to contact form
- [ ] Configure custom domain
- [ ] Set up Google Analytics 4 & Search Console
- [ ] CMS training session (1 hour)

---

Built by OceanCyber for MBKRU Advocates. Reference: OC-WEB-2025-001
