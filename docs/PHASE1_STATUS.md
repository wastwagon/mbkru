# Phase 1 — Completion review & recovery snapshot

**Last reviewed:** March 2026  

Use this document to **recover context** after time away or a new machine: what was agreed for Phase 1, what exists in the repo, and what remains **polish / integration** (not Phase 2 scope creep).

---

## 1. Verdict: Phase 1 scope (from `PHASE1_SCOPE.md`)

| Deliverable | In repo? | Notes |
|-------------|----------|--------|
| Homepage | Yes | `src/app/(main)/page.tsx` |
| About (static + team CMS path) | Yes | `src/app/(main)/about/page.tsx` — content may use placeholders until Sanity populated |
| Citizens Voice — preview + early access | Yes | `citizens-voice/page.tsx`, `EarlyAccessForm` → `/api/early-access` |
| Situational Alerts — preview | Yes | `situational-alerts/page.tsx` |
| Parliament tracker — preview + signup | Yes | `parliament-tracker/page.tsx`, `TrackerSignupForm` → `/api/tracker-signup` |
| News & Updates | Yes | `news/page.tsx`, `news/[slug]/page.tsx` — **UI complete**; list/detail currently driven by `placeholders` until GROQ wired to Sanity `post` |
| Resources | Yes | `resources/page.tsx` — same pattern (schema + Studio ready; live fetch optional follow-up) |
| Partners | Yes | `partners/page.tsx` |
| Contact + form | Yes | `contact/page.tsx`, `ContactForm` → `/api/contact` |
| Privacy & Terms | Yes | `privacy/page.tsx`, `terms/page.tsx` |
| Sanity Studio | Yes | `src/app/studio/[[...index]]/page.tsx`, schemas under `sanity/schemas/` |
| Phase 1 exclusions (no auth, no complaints, no MP data) | Respected | No login routes; preview-only pillars |

**Conclusion:** For **product and engineering scope** as written in `PHASE1_SCOPE.md` — **Phase 1 is complete in the codebase** (pages, flows, CMS definitions, API stubs, Docker, docs).  

**Optional follow-ups** (still “Phase 1 polish”, not Phase 2 features): connect News/Resources/About/Partners to **live Sanity queries**, wire **email/newsletter** providers, **reCAPTCHA**, **GA4**. Those are handover items in `README.md`, not missing pages.

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
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_PLATFORM_PHASE=1`

4. **Run locally**
   ```bash
   npm run dev
   ```
   Open **http://localhost:1100** (dev port is set in `package.json`).

5. **Production build (sanity check)**
   ```bash
   npm run build && npm start
   ```

6. **Docker**
   - Single app: `docker compose up -d --build` → **http://localhost:1100**
   - App + Postgres + Redis (future Phase 2):  
     `docker compose -f docker-compose.fullstack.yml up -d --build`  
   Use a `.env` beside compose so **build args** get `NEXT_PUBLIC_*` (see `docs/ARCHITECTURE.md`).

7. **Health**
   - `GET /api/health` — JSON with `phase` and dependency hints.

---

## 3. Where important things live

| Area | Location |
|------|----------|
| Phase boundaries & stack | `docs/ARCHITECTURE.md` |
| Product scope (what Phase 1 is / isn’t) | `PHASE1_SCOPE.md` |
| Business roadmap | `ROADMAP_2028_ELECTION.md` |
| Platform phase flags | `src/config/platform.ts` |
| Server env | `src/lib/env.server.ts` |
| API routes | `src/app/api/*` |
| Sanity schemas | `sanity/schemas/` |
| Docker | `Dockerfile`, `docker-compose*.yml` |

---

## 4. If something feels “missing”

- **“CMS not showing real posts”** — Expected until GROQ queries replace `newsPlaceholders` / similar; Studio + schemas are the Phase 1 CMS **foundation**.
- **“Forms don’t send email”** — Phase 1 handlers are stubs; configure providers per `README.md`.
- **“localhost refused”** — Start the dev server or Docker; nothing listens until you run one of the commands above.

This file is the **single recovery checklist** for Phase 1 status and next polish steps.
