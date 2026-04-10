# Phase 1 — Completion review & recovery snapshot

**Last reviewed:** March 2026  

Use this document to **recover context** after time away or a new machine: what was agreed for Phase 1, what exists in the repo, and what remains **polish / integration** (not Phase 2 scope creep).

---

## 1. Verdict: Phase 1 scope (from `PHASE1_SCOPE.md`)

| Deliverable | In repo? | Notes |
|-------------|----------|--------|
| Homepage | Yes | `src/app/(main)/page.tsx` |
| About (static + team CMS path) | Yes | `src/app/(main)/about/page.tsx` — baseline copy in `site-content` until expanded |
| Citizens Voice — preview + early access | Yes | `citizens-voice/page.tsx`, `EarlyAccessForm` → `/api/early-access` |
| Situational Alerts — preview | Yes | `situational-alerts/page.tsx` |
| Parliament tracker — preview + signup | Yes | `parliament-tracker/page.tsx`, `TrackerSignupForm` → `/api/tracker-signup` |
| News & Updates | Yes | `news/page.tsx`, `news/[slug]/page.tsx` — driven by **Prisma** when `DATABASE_URL` works; otherwise static fallbacks |
| Resources | Yes | `resources/page.tsx` — may stay static until you add a content model |
| Partners | Yes | `partners/page.tsx` |
| Contact + form | Yes | `contact/page.tsx`, `ContactForm` → `/api/contact` |
| Privacy & Terms | Yes | `privacy/page.tsx`, `terms/page.tsx` |
| Admin (posts + media library) | Yes | `/admin/login`, `/admin/posts`, `/admin/media`; JWT cookie; seed creates first admin |
| Phase 1 exclusions (no public auth, no complaints, no MP data) | Respected | Preview-only pillars |

**Conclusion:** For **product and engineering scope** as written in `PHASE1_SCOPE.md` — **Phase 1 is complete in the codebase** (pages, flows, admin CMS for news, API stubs, Docker, docs).  

**Optional follow-ups** (still “Phase 1 polish”, not Phase 2 features): wire **email/newsletter** providers, **reCAPTCHA**, **GA4**, richer Resources/Partners editing. Those are handover items in `README.md`, not missing pages.

---

## 2. Recover the project on a new machine

1. **Prerequisites:** Node.js 20+ (matches Docker), npm, optional Docker Desktop.

2. **Install**
   ```bash
   cd mbkru-website
   npm install
   ```

3. **Environment** — copy `.env.example` → `.env.local` and set at minimum:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_PLATFORM_PHASE=1`
   - `DATABASE_URL` (local Postgres or Docker)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (for admin login + seed)

4. **Database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run locally**
   ```bash
   npm run dev
   ```
   Open **http://localhost:1100** (dev port is set in `package.json`). Admin: **http://localhost:1100/admin/login**.

6. **Production build (smoke test)**
   ```bash
   npm run build && npm start
   ```

7. **Docker**
   - App + Postgres: `docker compose up -d --build` — entrypoint runs **migrate + seed** when `DATABASE_URL` is set. If anything failed, use **Admin → Settings** or `docker compose exec mbkru-web npx prisma db seed` → **http://localhost:1100**
   - App + Postgres + Redis:  
     `docker compose -f docker-compose.fullstack.yml up -d --build` (same entrypoint behaviour).  
   Use a `.env` beside compose so **build args** get `NEXT_PUBLIC_*` (see `docs/ARCHITECTURE.md`).

8. **Health**
   - `GET /api/health` — JSON with `phase` and dependency hints.

---

## 3. Where important things live

| Area | Location |
|------|----------|
| Phase boundaries & stack | `docs/ARCHITECTURE.md` |
| Product scope (what Phase 1 is / isn’t) | `PHASE1_SCOPE.md` |
| Business roadmap | `ROADMAP_2028_ELECTION.md` |
| Phase 2 & 3 engineering + research | `docs/PHASES_2_3_IMPLEMENTATION.md` |
| Platform phase flags | `src/config/platform.ts` |
| Server env | `src/lib/env.server.ts` |
| API routes | `src/app/api/*` |
| Prisma schema & migrations | `prisma/` |
| Docker | `Dockerfile`, `docker-compose*.yml`, `docker-entrypoint.sh` |

---

## 4. If something feels “missing”

- **“News is empty”** — Add posts in `/admin/posts` after DB migrate + seed; ensure `DATABASE_URL` is set in the environment running Next.js.
- **“Can’t log in to admin”** — Run `npx prisma db seed` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` set; use a strong `ADMIN_SESSION_SECRET` (≥32 chars in production).
- **“Forms don’t send email”** — Phase 1 handlers are stubs; configure providers per `README.md`.
- **“localhost refused”** — Start the dev server or Docker; nothing listens until you run one of the commands above.

This file is the **single recovery checklist** for Phase 1 status and next polish steps.
