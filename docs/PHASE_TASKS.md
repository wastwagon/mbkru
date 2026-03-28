# All tasks & features by phase — execution backlog

**Purpose:** Single place to **start and track** work grouped by **Phase 1 / 2 / 3** and **cross-cutting** themes. Sprints in [`SPRINT_BACKLOG.md`](./SPRINT_BACKLOG.md) record *history*; this file is the **living queue** for what to do next.

**Rules of thumb**

1. Finish **ops, legal, and data governance** before scaling public intake or publishing accountability claims.
2. Match **build-time** `NEXT_PUBLIC_PLATFORM_PHASE` to what you are allowed to show in production (`1` → marketing + admin; `2` → + Voice + members + promises; `3` → + report card flagship).
3. **Demo data:** `SEED_ACCOUNTABILITY_DEMO=1 npx prisma db seed` (fictional MPs/promises/report card year **2099**). **Real data:** verified CSV via **`POST /api/admin/parliament-members/import`** + admin promises/report card.

**Companion docs:** [`PHASES_2_3_IMPLEMENTATION.md`](./PHASES_2_3_IMPLEMENTATION.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`PHASE1_SCOPE.md`](../PHASE1_SCOPE.md) · [`ROADMAP_2028_ELECTION.md`](../ROADMAP_2028_ELECTION.md)

---

## Phase 1 — Marketing, CMS, trust (mostly shipped)

**Goal:** Credible public site + admin news + leads/contact without member reporting.

| Status | Task |
|--------|------|
| [x] | Public pages per [`PHASE1_SCOPE.md`](../PHASE1_SCOPE.md) (home, about, pillars preview, news, resources, partners, contact, legal) |
| [x] | Postgres **`Post`** / **`Media`** + `/admin` CMS |
| [x] | **`LeadCapture`** + contact **`ContactSubmission`** + APIs + admin lists |
| [x] | Optional Resend, Turnstile, GA4/Plausible, Redis rate limits |
| [ ] | **Verify** production: backups, `SKIP_DB_SEED`, secrets rotation ([`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md)) |
| [ ] | **Content:** replace/refresh seeded posts for live voice; legal pages reviewed by counsel |
| [ ] | **Phase 1 polish:** Lighthouse/a11y spot-check on `/contact`, `/news`, homepage |

---

## Phase 2 — Identity, Voice, alerts, parliament data prep (core shipped)

**Goal:** Members can register; reports + tracking + admin queue; situational intake; promises/MPs surfaced when flags allow.

| Status | Task |
|--------|------|
| [x] | **`Member`** auth APIs, JWT cookie, Redis `jti` optional, **`src/proxy.ts`** gates |
| [x] | **`/login`**, **`/register`**, **`/account`**, header + homepage **session-aware** auth UI |
| [x] | **`POST /api/reports`**, **`GET /api/reports/me`**, track API, attachments, admin reports |
| [x] | Situational / election kinds + admin filters + submit routes |
| [x] | Parliament **CSV import**, **`/admin/parliament`**, public **`/promises`**, **`GET /api/mps`**, **`GET /api/promises`** |
| [x] | Maps (lazy Leaflet), region centroids, rate limits on public POSTs |
| [x] | **Privacy policy** — Voice: location, attachments, anonymous/email + tracking, moderation; retention expanded *(counsel review still recommended)* |
| [x] | **Vitest:** `GET /api/health` JSON handler test (mock `getHealthStatus`) |
| [x] | **Vitest:** partner JSON routes — `/api/mps`, `/api/promises`, `/api/report-card/[year]` (mocks) |
| [ ] | **Tracker leads:** operational email “pilot open” or ESP export ([`SPRINT_BACKLOG`](./SPRINT_BACKLOG.md) Sprint 4) |
| [ ] | **Situational:** playbooks / SLA fields (schema + admin) — *if product wants beyond MVP* |
| [ ] | **Stretch:** SMS or second-channel notifications |
| [ ] | **Stretch:** offline / retry queue for report submit (mobile charter) |

---

## Phase 3 — Report card flagship, election UX, partner APIs (core shipped)

**Goal:** Published scorecard cycles + public `/report-card` + partner **`Cache-Control`** JSON; election-season copy and governance.

| Status | Task |
|--------|------|
| [x] | **`ReportCardCycle`** + **`ScorecardEntry`**, admin CRUD, public pages + **`GET /api/report-card/[year]`** |
| [x] | Tagged cache + `revalidateTag`; accountability **HTTP** helpers tested |
| [x] | **`/methodology`**, election-observation form notices, OPS notes in docs |
| [x] | Pillar routes **`/legal-empowerment`**, **`/town-halls`** when phase ≥ 2 |
| [x] | **Partner programme (draft):** [`docs/PARTNER_API.md`](PARTNER_API.md) — attribution, caching, rate limits, versioning *recommendation* *(final terms with legal + public page when launching)* |
| [ ] | **Real datasets:** vetted CSV import + editorial sign-off before toggling Phase 3 in prod — procedure: [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) |
| [ ] | **Optional:** public CSV/JSON export for researchers (scope + rate limit) |
| [ ] | **Stretch:** PMO-style modules (bills, votes, plenary) — *new product verticals; scope separately* |

---

## Cross-phase — platform & engineering

| Status | Task |
|--------|------|
| [x] | `prisma.config.ts`, CI `prisma validate`, Next **proxy**, Vitest for pure helpers |
| [ ] | **Prisma 7** migration when planned (clears `effect` audit chain) — spike checklist: [`PRISMA7_NOTES.md`](./PRISMA7_NOTES.md) |
| [x] | **Security review (checklist):** [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md) — sessions, admin, APIs, deps *(execute checks each release)* |
| [x] | **`.env` / Coolify:** changing `NEXT_PUBLIC_PLATFORM_PHASE` (or other `NEXT_PUBLIC_*`) requires a **rebuild** of the web image — see [`ARCHITECTURE.md`](./ARCHITECTURE.md) §5 and `Dockerfile` build args |
| [x] | **Observability (guidance):** [`OBSERVABILITY.md`](./OBSERVABILITY.md) — health, CI, log retention, 429 signals, Sentry optional *(implement tools when scale requires)* |

---

## Suggested execution order (next 4–6 weeks)

Work **top to bottom** within your target phase; do not skip legal/ops items if going live.

1. **Phase 1 verify** — run quarterly checklist in [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) + content/legal pass  
2. **Phase 2 tests** — `/api/health` + partner JSON routes in Vitest *(done — `src/app/api/**/route.test.ts`)*  
3. **Phase 2 privacy** — expanded on site *(counsel review)*  
4. **Data** — `SEED_ACCOUNTABILITY_DEMO=1` on staging; then real CSV import dry-run  
5. **Phase 3 partner** — draft [`PARTNER_API.md`](./PARTNER_API.md) *(sign-off + public terms page when launching)*  
6. **Prisma 7** — schedule upgrade spike  

---

## Updating this file

When you ship a row, change `[ ]` → `[x]` and mention it in [`SPRINT_BACKLOG.md`](./SPRINT_BACKLOG.md) or a short PR description so history stays traceable.
