# All tasks & features by phase — execution backlog

**Purpose:** Single place to **start and track** work grouped by **Phase 1 / 2 / 3** and **cross-cutting** themes. Sprints in [`SPRINT_BACKLOG.md`](./SPRINT_BACKLOG.md) record *history*; this file is the **living queue** for what to do next.

**Rules of thumb**

1. Finish **ops, legal, and data governance** before scaling public intake or publishing accountability claims.
2. Match **build-time** `NEXT_PUBLIC_PLATFORM_PHASE` to what you are allowed to show in production (`1` → marketing + admin; `2` → + Voice + members + promises; `3` → + report card flagship).
3. **Demo data:** `SEED_ACCOUNTABILITY_DEMO=1 npx prisma db seed` (fictional MPs/promises/report card year **2099**). **Pilot members:** `SEED_MEMBER_DEMO=1` (see [`.env.example`](../.env.example)) — two fictional **`Member`** rows for **`/login`**. **Real data:** constituency master via **`POST /api/admin/constituencies/import`**, dry-run **`POST /api/admin/parliament-members/reconcile`**, then MP CSV **`POST /api/admin/parliament-members/import`** — see [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md); admin promises/report card.

**Companion docs:** [`PHASES_2_3_IMPLEMENTATION.md`](./PHASES_2_3_IMPLEMENTATION.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`PHASE1_SCOPE.md`](../PHASE1_SCOPE.md) · [`ROADMAP_2028_ELECTION.md`](../ROADMAP_2028_ELECTION.md) · **[`EARLY_RECOGNITION_LAUNCH_PLAN.md`](./EARLY_RECOGNITION_LAUNCH_PLAN.md)** (sooner public launch vs 2028 calendar — gaps + R-phases) · **[`PHASE_GAPS_CLOSURE_QUEUE.md`](./PHASE_GAPS_CLOSURE_QUEUE.md)** (finish Phases 1–3 before 4+) · [`PLATFORM_EXPANSION_PLAN.md`](./PLATFORM_EXPANSION_PLAN.md) · **[`FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](./FULL_PLATFORM_IMPLEMENTATION_PLAN.md)** (full-scope build order, schema, APIs, UI — workstreams A–O)

---

## Phase 4+ — Full platform implementation (no MVP trim)

**Goal:** Ship the **complete** expansion: manifesto registry + government/opposition promise filters, data reconciliation tooling, **`/whistleblowing`** + **staff** Voice/report aggregates (`/admin/analytics/citizen-reports` + CSV export), and **full communities** (verification, moderation, search, notifications, admin). **Execution order:** workstreams **A→O** in [`FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](./FULL_PLATFORM_IMPLEMENTATION_PLAN.md).

| Status | Task |
|--------|------|
| [x] | **A (docs + product copy)** Citation/claims policy ([`CITATION_AND_CLAIMS_POLICY.md`](./CITATION_AND_CLAIMS_POLICY.md)), interim communities governance ([`COMMUNITIES_PUBLIC_GOVERNANCE.md`](./COMMUNITIES_PUBLIC_GOVERNANCE.md)), on-site summary at **`/methodology#claims-and-citations`**, phase-gated **`/whistleblowing`** |
| [ ] | **A (counsel / public terms)** Privacy, Terms, Voice disclosures, and **public** community/partner terms signed off for production marketing |
| [x] | **B–D** Manifesto schema + admin (`/admin/manifestos`) + public **`/government-commitments`** |
| [x] | **E** Constituency CSV import + MP dry-run reconcile APIs + runbook; EC-aligned bulk constituency file is editorial/ops |
| [x] | **F–M (communities) — Data + APIs** Prisma `Community` / forums / posts (kinds + premoderation) / memberships (incl. Queen Mother verified + moderator roles) / join & leave / **`GET /api/communities/[slug]/posts?kind=`** filters / post reports / verification uploads / membership **ban** fields + admin ban-unban server actions |
| [x] | **F–M (communities) — Public & member UI** **`/communities`** browse, **`[slug]`** overview, forums, **`/portal` council workspace**, thread & post pages; shared **affairs-role** helper (`src/lib/communities/community-affairs-roles.ts`) for UI + APIs |
| [x] | **F–M (communities) — Search** Postgres FTS + GIN indexes — **`GET /api/communities/search?q=`** (`src/lib/server/communities-search.ts`) |
| [x] | **F–M (communities) — Admin** **`/admin/communities`**, per-community admin, **moderation** queue, **community verifications** |
| [x] | **F–M (communities) — In-app notifications** `MemberNotification` rows for join approved, post published/rejected, thread reply, post reported, verification approved/rejected (see `member-notifications` + `notification-labels`) |
| [x] | **F–M (regions + presence)** Public **`/regions/[slug]`**, regional hub JSON **`/api/regions/[slug]/hub`**, **scoped online presence** for region + community (`/api/communities/[slug]/presence`, `POST /api/member/presence`, unified guest-count env in [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md)) |
| [ ] | **F–M (communities) — Delivery extension** Route every community-originated event through **`NotificationDeliveryJob`** with new `NotificationDeliveryKind` values (today the email/SMS **outbox** remains Voice-report-centric); optional **SMS** for announcements per [`FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](./FULL_PLATFORM_IMPLEMENTATION_PLAN.md) §2 |
| [ ] | **F–M (communities) — Full-plan extras** Standalone **`CommunityMembershipBan`** audit table + formal **appeals** workflow from [`FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](./FULL_PLATFORM_IMPLEMENTATION_PLAN.md) §3.3 — *not in schema today; baseline uses membership ban fields* |
| [x] | **N (public)** **`/whistleblowing`** when Phase ≥ 2 (`isWhistleblowerGuidancePageEnabled`) |
| [x] | **N (admin)** Citizen-report **aggregates** for staff — **`/admin/analytics/citizen-reports`**, `GET /api/admin/analytics/citizen-reports`, `GET /api/admin/analytics/citizen-reports/export` (playbook + public-cause counts, UTF-8 CSV; no PII) |
| [x] | **O (baseline shipped)** Broad **Vitest** on APIs + libs; living [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md); [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md); automated preflight **`npm run verify:release-gates`** ([`SAFE_IMPLEMENTATION_PHASES.md`](./SAFE_IMPLEMENTATION_PHASES.md)) |
| [ ] | **O (programme QA)** External penetration test; explicit matrix “every route handler has a Vitest file” — beyond current coverage |
| [ ] | Partner onboarding (200+ communities) runs **after** software DoD — not a code MVP gate |

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
| [x] | **Phase 1 polish (baseline):** mobile PageHeader padding, main `overflow-x` + safe-area, optional `NEXT_PUBLIC_CONTACT_PHONE`, footer gallery alts, `touch-manipulation` on buttons — **Lighthouse CI** (mobile 390×844) on `/`, `/about`, `/contact`, `/news`; *tune thresholds in `lighthouserc.cjs` before major launch* |

---

## Phase 2 — Identity, Voice, alerts, parliament data prep (core shipped)

**Goal:** Members can register; reports + tracking + admin queue; situational intake; promises/MPs surfaced when flags allow.

| Status | Task |
|--------|------|
| [x] | **`Member`** auth APIs, JWT cookie, Redis `jti` optional, **`src/proxy.ts`** gates |
| [x] | **`/login`**, **`/register`**, **`/account`**, header + homepage **session-aware** auth UI |
| [x] | **`POST /api/reports`**, **`GET /api/reports/me`**, track API, attachments, admin reports |
| [x] | Situational / election kinds + admin filters + submit routes |
| [x] | Parliament **CSV import**, **`/admin/parliament`** (Parliament & catalogue), public **`/promises`**, **`GET /api/mps`**, **`GET /api/promises`** |
| [x] | Maps (lazy Leaflet), region centroids, rate limits on public POSTs |
| [x] | **Privacy policy** — Voice: location, attachments, member account + tracking, moderation; retention expanded *(counsel review still recommended)* |
| [x] | **Vitest:** `GET /api/health` JSON handler test (mock `getHealthStatus`) |
| [x] | **Vitest:** partner JSON routes — `/api/mps`, `/api/promises`, `/api/report-card/[year]` (mocks) |
| [x] | **Vitest:** **`POST /api/admin/login`** — rate limit, credentials, cookie (`route.test.ts`) |
| [x] | **Tracker leads:** optional Resend ping — **`LEADS_STAFF_INBOX_EMAIL`** + **`RESEND_API_KEY`** (tracker + early access). **ESP export:** Admin → Lead capture → **Download CSV** (`GET /api/admin/leads-export`, optional `?source=`). Newsletter stays DB-only unless you add separate automation. |
| [x] | **Situational / ops:** `slaDueAt`, `operationsPlaybookKey`, `staffNotes` on `CitizenReport` + admin detail form + SLA overdue hint on queue |
| [x] | **SMS (optional):** `SMS_PROVIDER=log|twilio` + `sendReportStatusSms` on status change; `submitterPhone` on `CitizenReport` + Voice form E.164; prefers member profile phone when signed in |
| [x] | **Offline drafts (MVP):** text-only queue in `localStorage` on network / retryable HTTP errors; restore + Turnstile on submit (`VoiceReportForm`, `src/lib/client/report-submit-queue.ts`) |

---

## Phase 3 — Report card flagship, election UX, partner APIs (core shipped)

**Goal:** Published scorecard cycles + public `/report-card` + partner **`Cache-Control`** JSON; election-season copy and governance.

| Status | Task |
|--------|------|
| [x] | **`ReportCardCycle`** + **`ScorecardEntry`**, admin CRUD, public pages + **`GET /api/report-card/[year]`** |
| [x] | Tagged cache + `revalidateTag`; accountability **HTTP** helpers tested |
| [x] | **`/methodology`**, election-observation form notices, OPS notes in docs |
| [x] | Pillar routes **`/legal-empowerment`**, **`/town-halls`** when phase ≥ 2 |
| [x] | **Partner programme (draft):** [`docs/PARTNER_API.md`](PARTNER_API.md) — attribution, caching, rate limits, versioning *recommendation* · **public summary:** **`/partner-api`** (Phase 2+) *(MOU / contractual terms with legal still TBD)* |
| [ ] | **Real datasets:** vetted CSV import + editorial sign-off before toggling Phase 3 in prod — procedure: [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md); source pointers: [`DATA_SOURCES.md`](./DATA_SOURCES.md) |
| [x] | **Research export:** `GET /api/export/mps-csv` + `GET /api/export/promises-csv` (UTF-8 BOM CSV; promises export is full list) — [`PARTNER_API.md`](./PARTNER_API.md) |
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

## Feature-gap closure programme (post-audit — phased)

**Purpose:** Close gaps from the engineering/product audit (SEO, integrations, editorial CMS, Phase 3 election UX, design metrics) in **ordered waves** without mixing risky changes. **Wave A** is partly code; **B–D** are mostly backlog until you pull them into a sprint.

| Wave | Goal | Key deliverables | Status |
|------|------|------------------|--------|
| **A — Discovery & Phase 3 shell** | Search engines and election-window UX match what you ship | Sitemap includes footer/marketing URLs + phase-gated hubs; `/election-observation` + `/citizens-voice/submit/election` when Phase 3; report-card callout when `accountabilityScorecards`; nav/footer links | [x] Shipped in repo |
| **B — Integrations** | Newsletter and contact behave like production systems | **Shipped:** optional Mailchimp/ConvertKit sync after newsletter `LeadCapture` (`esp-newsletter.ts`); `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` → root metadata. **Still manual:** Resend + inbox staging check; ESP double opt-in / tags per org | [x] Core shipped · [ ] Ops sign-off |
| **C — Resources & editorial** | Resources page matches real assets | **Shipped:** `ResourceDocument` + migration; **`/admin/resources`**; public **`/resources`** + **`/resources/[slug]`** + sitemap entries | [x] Shipped in repo |
| **D — Experience & metrics** | World-class civic UX | **Shipped (baseline):** hero headline scale-up; **At a glance** impact strip full-width under hero; pillar **dedupe** (removed duplicate platform card stack → **Explore further** links); fewer section badges (About / Our Commitment); pillar C link already phase-aware | [x] Baseline shipped · [ ] Deeper charts / authentic imagery when assets ready |

**Depends on:** Wave **B** after ops sign-off; Wave **C** needs migrations + counsel if documents are legal; Wave **D** is parallel design/dev once A is live.

---

## Suggested execution order (next 4–6 weeks)

Phased rollout detail and **automated** preflight: [`SAFE_IMPLEMENTATION_PHASES.md`](./SAFE_IMPLEMENTATION_PHASES.md) (`npm run verify:release-gates`). Work **top to bottom** within your target phase; do not skip legal/ops items if going live.

1. **Phase 1 verify** — run quarterly checklist in [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) + content/legal pass  
2. **Phase 2 tests** — `/api/health` + partner JSON routes in Vitest *(done — `src/app/api/**/route.test.ts`)*  
3. **Phase 2 privacy** — expanded on site *(counsel review)*  
4. **Data** — `SEED_ACCOUNTABILITY_DEMO=1` on staging; then real CSV import dry-run  
5. **Phase 3 partner** — public summary **`/partner-api`** + draft [`PARTNER_API.md`](./PARTNER_API.md) *(counsel + MOU language when contracting)*  
6. **Prisma 7** — schedule upgrade spike  

---

## Updating this file

When you ship a row, change `[ ]` → `[x]` and mention it in [`SPRINT_BACKLOG.md`](./SPRINT_BACKLOG.md) or a short PR description so history stays traceable.
