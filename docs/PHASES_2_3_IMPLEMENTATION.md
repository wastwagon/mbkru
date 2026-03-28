# Phase 2 & 3 — Engineering implementation guide

**Purpose:** Expand MBKRU from Phase 1 (marketing + Postgres admin CMS + lead capture) through **Phase 2** (MBKRU Voice, alerts, data pipelines) and **Phase 3** (election readiness, Accountability Scorecards, promise tracking at scale).  
**Companion docs:** [`ROADMAP_2028_ELECTION.md`](../ROADMAP_2028_ELECTION.md) (business timeline), [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) (stack), [`PHASE1_SCOPE.md`](../PHASE1_SCOPE.md) (baseline). **All phase tasks (checkbox backlog):** [`docs/PHASE_TASKS.md`](PHASE_TASKS.md).  
**Last updated:** March 2026

---

## 1. Where Phase 1 ends (clarification)

| Capability | Phase 1 (today) | Phase 2+ |
|------------|-----------------|----------|
| Editorial CMS (news, media) | **Yes** — `/admin`, Prisma `Post` / `Media` | Same; extend for Resources / static pages if desired |
| Public user accounts | No | **Yes** — `Member` model |
| Complaints / geo reports | Preview UI only | **Yes** — `CitizenReport` + attachments + status workflow |
| MP / promise / scorecard data | Preview copy | **Yes** — `ParliamentMember`, `CampaignPromise`, `ReportCardCycle`, `ScorecardEntry` |

The **backend CMS for news is done** in Phase 1. Phases 2–3 add **member-facing products** and **accountability datasets**, not a replacement CMS.

---

## 2. External research (fit for MBKRU pillars)

Use these as **methodology and UX references** — adapt to Ghanaian law, EC structures, and MBKRU’s non-partisan stance.

### 2.1 Citizen reporting & MBKRU Voice (Phase 2)

| Theme | Insight | Source |
|-------|---------|--------|
| **Mobile-first reporting** | Photo/video + GPS are primary evidence channels; keep flows short (category → location → narrative → review). | Civic / grievance platform patterns; field studies favour image-based reporting. |
| **Open data interoperability** | GeoJSON (WGS84), ISO 8601 timestamps, paginated JSON APIs mirror common civic APIs (e.g. Open311-style patterns). | [SeeClickFix Open311 / API docs](https://seeclickfix.com/open311/v2/docs), [SeeClickFix API overview](https://dev.seeclickfix.com/v2) |
| **Trust & feedback** | Public tracking IDs, status transparency, optional anonymity — aligned with CHRAJ-style case tracking. | [CHRAJ Complaints Management System](https://cms.chraj.gov.gh/), [CHRAJ normal complaint process](https://chraj.gov.gh/normal-complaint/) |
| **Grievance UX** | Role separation (citizen vs staff), accessibility (contrast, scalable type), multi-channel intake. | [Grievance platform feature guides](https://grievance.app/customizable-grievance-platform-features) |

MBKRU is **not** a CHRAJ replacement; it **feeds advocacy and report cards** and may **signpost** official channels (CHRAJ, EC) where appropriate.

### 2.2 Parliamentary accountability & scorecards (Phase 2–3)

| Theme | Insight | Source |
|-------|---------|--------|
| **Oversight dimensions** | Six pillars: oversight priority, tools/powers, opposition access, financial oversight, post-legislative scrutiny, external actors. | [Transparency International — Parliamentary Oversight Assessment Tool](https://knowledgehub.transparency.org/product/parliamentary-oversight-assessment-tool), [Agora Parliamentary Oversight Assessment Tool](https://www.agora-parl.org/resources/library/parliamentary-oversight-assessment-tool) |
| **Parliamentary transparency** | Timely publication of legislative and budget processes supports citizen-facing scorecards. | [Inter-Parliamentary Union / democratic parliament indicators](https://www.parliamentaryindicators.org/) (indicator families on transparency) |
| **National-assembly scorecards** | CSOs publish periodic performance scorecards — useful precedent for **methodology comms** (how scores are built, limits of data). | [PILDAT parliamentary score card example](https://pildat.org/parliamentary-monitoring1/pildat-score-card-on-performance-of-the-national-assembly-performance-declines-in-3rd-parliamentary-year-by-5-percentage-points) |

MBKRU should publish a **methodology page** (Phase 3) that cites adapted dimensions, data sources, and independence safeguards.

### 2.3 Election season & situational alerts (Phase 2–3)

| Theme | Insight | Source |
|-------|---------|--------|
| **Citizen election reporting** | NGOs use apps for incident reporting with optional anonymity + dashboard for triage (model for “alerts” pillar). | [Vote Monitor Citizen (Commit Global)](https://www.commitglobal.org/en/vote-monitor-citizen) |
| **Electoral integrity framing** | Observation methodology and ICT-in-elections handbooks set expectations for **verification**, not viral unverified claims. | [OSCE/ODIHR election observation methodology](https://www.osce.org/odihr/elections/68439), [ODIHR ICT in elections handbook](https://www.osce.org/odihr/elections/558318) |
| **Rapid response UX** | Some national apps emphasise **tracking IDs** and **time-bound** feedback — good pattern for trust. | e.g. [cVIGIL-style electoral complaint coverage](https://www.onmanorama.com/news/kerala/2026/03/20/kerala-assembly-election-commission-india-cvigil-app-model-code-violations.html) (pattern reference, not product copy) |

**Product rule:** MBKRU alerts should combine **moderation**, **source attribution**, and **legal disclaimers** to protect users and credibility.

---

## 3. UI/UX charter — “high craft,” mobile-first, unmistakably human

**Goal:** Interfaces that feel **as polished as the best AI-assisted mockups** but grounded in **deliberate art direction** (not generic “slop” templates).

### 3.1 Mobile-first (non-negotiable)

- **Thumb zones:** Primary actions (Submit, Next, Call helpline) in lower half on phones; avoid tiny tap targets (under 44 CSS pixels).
- **Progressive disclosure:** One primary task per screen for reporting flows; advanced fields behind “Add details.”
- **Offline-tolerant patterns:** Queue submissions where possible; clear retry states (Phase 2 implementation detail).
- **Performance:** Lighthouse mobile ≥ 90 where feasible; lazy maps (load map only when user opens location step).

### 3.2 Visual identity (extend Phase 1, do not flatten it)

- **Keep** existing tokens in `globals.css` (teal / gold / deep slate) — they already avoid clichéd “AI purple.”
- **Typography:** Maintain distinct pairs (`Kumbh Sans` + `Lora` + `Playfair` for logo); Phase 2+ screens should use **one display, one body** rule per view to reduce noise.
- **Motion:** Prefer **purposeful** transitions (200–300ms, reduced motion via `prefers-reduced-motion`) — never decorative parallax on forms.
- **Imagery:** Real Ghanaian contexts (town halls, regional diversity); avoid stock that reads as generic global civic tech.

### 3.3 Trust & accessibility

- **Plain-language summaries** beside legal text on reporting flows.
- **WCAG 2.2 AA** target for text contrast; form errors linked to fields with `aria-describedby`.
- **Transparency modules:** “How we use this report” expandable section on submit success.

### 3.4 What to avoid (anti-patterns)

- Centered single-column “SaaS landing” layouts for **every** dashboard view.
- Excessive glassmorphism / neon gradients unrelated to brand.
- Dark patterns (pre-checked share-to-social, hidden data resale).

---

## 4. Data model (foundation in Prisma)

New / planned tables (see `prisma/schema.prisma`):

| Model | Phase | Role |
|-------|-------|------|
| `Region` | 2 | Ghana 16 regions — seeded for geo filters |
| `Constituency` | 2–3 | Optional EC-aligned rows for MP linkage |
| `Member` | 2 | Public registered user |
| `CitizenReport` | 2–3 | Voice + situational + election observation kinds |
| `CitizenReportAttachment` | 2 | Evidence files |
| `ParliamentMember` | 2–3 | MPs, ministers, regional ministers |
| `CampaignPromise` | 2–3 | Promise tracking |
| `ReportCardCycle` | 3 | People’s Report Card annual cycle |
| `ScorecardEntry` | 3 | Per-official scores + narrative + flexible `metrics` JSON until methodology stabilises |

`ScorecardEntry.metrics` holds dimensional scores while you align with TI/IPU-inspired frameworks; normalize into relational tables later if needed.

---

## 5. API & surface map (build order)

### Phase 2 — recommended sequence

1. **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` — separate cookie name from admin; Redis sessions optional (`docker-compose.fullstack.yml`).
2. **Reports:** `POST /api/reports`, `GET /api/reports/me`, `GET /api/reports/track/[code]` (public status).
3. **Uploads:** Reuse or extend admin media patterns with **virus scan / size limits** and **signed URLs** before production.
4. **Rate limiting:** Redis token bucket on all anonymous `POST` (align with `docs/ARCHITECTURE.md`).
5. **Admin moderation:** `/admin/reports` queue (new) — staff roles can wait until after MVP triage.

### Phase 3 — add

6. **Public data:** `GET /api/mps` (active roster + promise counts), `GET /api/promises` (optional `?memberSlug=`), `GET /api/report-card/[year]` — rate-limited; Next **`unstable_cache`** + tags / **`revalidateTag`**; **`Cache-Control`** on **200** (~300s) and **`private, no-store`** on report-card **404**. Browse UI remains **`/promises`**; roster maintenance is admin CSV import.
7. **Maps / aggregates:** Server components + static generation for published scorecards; avoid leaking draft data.

---

## 6. Feature flags (`src/config/platform.ts`)

Use `NEXT_PUBLIC_PLATFORM_PHASE` at build time plus optional `PLATFORM_PHASE` on the server. Finer gates (e.g. `legalEmpowermentDesk`, `townHallDirectory`) should map to **phase ≥ 2** or **≥ 3** explicitly in code — see updated `platformFeatures` in the codebase.

---

## 7. Sprint-style delivery checklist

**Status:** This list tracks **engineering reality** in the repo. For sprint-sized narrative, see [`SPRINT_BACKLOG.md`](SPRINT_BACKLOG.md).

### Phase 2 (engineering) — shipped in codebase

- [x] Member auth + session store (**Redis `jti`** when `REDIS_URL` set; JWT in `mbkru_member`).
- [x] Citizen report flows (MBKRU Voice, situational, election observation) + **`/track-report`** + tracking API.
- [x] Admin report queue + status transitions + optional Resend on status change.
- [x] Lead capture: newsletter, early access, tracker → **`LeadCapture`** / Postgres. **`POST /api/contact`** persists **`ContactSubmission`** when the DB is configured, then delivers via Resend or log-only; admin **`/admin/contact-submissions`**.
- [x] Map picker (lazy Leaflet) + region suggestion from regional centroids (not boundary-accurate).
- [x] Post-submit **trust UX:** expandable **“How we use your report”** on successful submit (Voice form).

### Phase 2 (engineering) — still open / stretch

- [ ] **SMS** or second-channel notifications (if product requires beyond email).
- [ ] **Offline / retry queue** for flaky mobile networks (charter §3.1).

### Phase 3 (engineering) — shipped in codebase

- [x] Parliament CSV import + admin roster (**`/admin/parliament`**).
- [x] Promise tracker UI + admin CRUD + **`GET /api/mps`**, **`GET /api/promises`** + tagged cache / `Cache-Control`.
- [x] People’s Report Card: cycles, publish/unpublish, entries, public **`/report-card`**, **`GET /api/report-card/[year]`**, **`/methodology`**.
- [x] **Election window (MVP):** form + track disclaimers, OPS notes; deeper **playbooks / SLA fields** remain operational design.
- [x] **Partner JSON** surface (rate-limited, cached); **written embed terms + versioning** still with comms / legal.

### Phase 3 — pillar routes (flags in `platform.ts`)

- [x] **`legalEmpowermentDesk`** → public **`/legal-empowerment`** (Phase ≥ 2) + main nav when enabled.
- [x] **`townHallDirectory`** → public **`/town-halls`** (Phase ≥ 2) + main nav when enabled.

### Cross-phase platform (next engineering)

- [x] **Next.js 16:** **`src/proxy.ts`** replaces deprecated **`middleware`** (same matchers and JWT gates).
- [x] **Prisma CLI config:** **`prisma.config.ts`** + seed path (replaces deprecated **`package.json#prisma`**). *Upgrade to **Prisma 7** when ready (separate migration + audit).*
- [x] **Automated tests (partial):** Vitest for **`health-status-from-deps`**, **`public-forms`**, **`client-ip`**, **`rate-limit-config`**, tags, **`platformFeatures`**. *Next:* handler-level tests for **`GET /api/health`** JSON and partner JSON routes with mocks.

---

## 8. Coolify / Docker notes

- Use **`docker-compose.fullstack.yml`** when Redis is required for sessions and rate limits.
- Run **`npx prisma migrate deploy`** on deploy (already scripted in `docker-entrypoint.sh` when `DATABASE_URL` is set).
- After adding this migration, **redeploy** once so Postgres receives new tables before enabling Phase 2 routes in production.

---

## 9. Content strategy (cross-phase)

- **Tone:** Non-partisan, evidence-forward, Ghana-specific examples (regions, institutions).
- **Pillar pages:** Evolve from “preview” to **live** features as flags turn on — use the same URLs for SEO continuity.
- **Legal:** Privacy policy updates for location data, retention, and moderation (Phase 2); election-specific disclaimers (Phase 3).

This document should be updated when methodology is frozen (target: **Q4 2027** per business roadmap) and when first People’s Report Card publishes.
