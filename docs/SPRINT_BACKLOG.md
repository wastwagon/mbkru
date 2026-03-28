# Sprint backlog — Phase 1 polish → Phase 3

**How to use this:** One sprint = roughly **1–2 weeks** for a small team; adjust to your capacity. Do not skip **security / legal** items before turning on public data collection at scale.

**Canonical engineering detail:** [`PHASES_2_3_IMPLEMENTATION.md`](./PHASES_2_3_IMPLEMENTATION.md) · **Product scope:** [`../PHASE1_SCOPE.md`](../PHASE1_SCOPE.md) · **Roadmap:** [`../ROADMAP_2028_ELECTION.md`](../ROADMAP_2028_ELECTION.md)

---

## Sprint 0 — Done (baseline)

- Next.js 16 + Prisma + admin CMS (posts, media)
- Docker / Coolify deploy, migrations, seed, Redis-ready rate limits
- Health checks (`/api/health`), security headers, Zod on public APIs

---

## Sprint 1 — Phase 1 “production ready” (baseline shipped)

| # | Task | Outcome |
|---|------|---------|
| 1 | **Contact email** | Resend (or SMTP) when env set; log-only fallback |
| 2 | **Lead capture** | **Postgres:** `LeadCapture` + APIs (newsletter, early-access, tracker). *Optional later:* ESP webhooks in parallel |
| 3 | **Bot abuse** | **Turnstile:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` — contact + newsletter + early-access + tracker |
| 4 | **Analytics** | **`(main)/layout`:** GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) and/or Plausible (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) |
| 5 | **Content** | **Done (baseline):** footer + contact copy; placeholders clarified; **5 published posts** seeded (upsert by slug) — edit in `/admin` |
| 6 | **Ops** | **`docs/OPS_RUNBOOK.md`** — backups, `SKIP_DB_SEED=1`, secrets, rebuild for `NEXT_PUBLIC_*` |

---

## Sprint 2 — Phase 2 kickoff: identity (baseline shipped)

| # | Task | Outcome |
|---|------|---------|
| 1 | **Prisma** | **`Member`** already in schema + migration; email unique |
| 2 | **Auth API** | **`POST /api/auth/register`**, **`login`**, **`logout`**; **`GET /api/auth/me`** — cookie **`mbkru_member`**, secret **`MEMBER_SESSION_SECRET`** |
| 3 | **Sessions** | **JWT** in httpOnly cookie; **`jti` + Redis** when `REDIS_URL` set (server-side logout); Edge middleware verifies JWT only — full check in RSC / APIs |
| 4 | **UI** | **`/login`**, **`/register`**, **`/account`** + header **Sign in** when `NEXT_PUBLIC_PLATFORM_PHASE` ≥ 2 |
| 5 | **Legal** | Privacy policy — **Member accounts (Phase 2+)** |

---

## Sprint 3 — Phase 2: MBKRU Voice (MVP) — baseline shipped

| # | Task | Outcome |
|---|------|---------|
| 1 | **Reports API** | **`POST /api/reports`** (kind, title, body, category, region, lat/lng, submitterEmail); **`GET /api/reports/me`** (member); gated `platformFeatures.citizensVoicePlatform` |
| 2 | **Tracking** | **`GET /api/reports/track/[code]`** — status/kind/dates only · UI **`/track-report`** |
| 3 | **Uploads** | **`POST /api/reports/[id]/attachments`** — multipart, disk under `public/uploads/reports/{id}/`, max 3 × 5 MB (JPEG/PNG/WebP/PDF); **member session** or **`attachmentUploadToken`** when **`REPORT_ATTACHMENT_HMAC_SECRET`** is set; rate limit `reports-attach`. No in-app AV — ops policy in runbook / `report-attachment-limits` |
| 4 | **Admin** | **`/admin/reports`** list + **`/admin/reports/[id]`** status form + server action |
| 5 | **Email** | **`sendReportStatusNotification`** (Resend) when staff changes status → `submitterEmail` or member email |
| — | **Public UI** | **`/citizens-voice/submit`**, pilot CTA on **`/citizens-voice`**, **`/account/reports`** |

---

## Sprint 4 — Phase 2: alerts + tracker data prep

| # | Task | Outcome |
|---|------|---------|
| 1 | **Situational alerts** | **Shipped (MVP):** `/situational-alerts/submit` (locked `SITUATIONAL_ALERT`), Engagement page CTAs, admin `/admin/reports?kind=…` filters + detail moderation notes for situational / election kinds. Further: playbooks, SLA fields — later |
| 2 | **Parliament tracker** | **Shipped (MVP):** `LeadCapture` + `/api/tracker-signup` + **Admin `/admin/leads`** (filter Parliament tracker / newsletter / early access) — *notify when pilot opens* still depends on Resend broadcast or ESP export |
| 3 | **Maps** | **Shipped (MVP):** optional **lazy** map in report form (`<details>` + dynamic Leaflet); **region suggestion** from nearest regional centroid (`src/lib/geo/ghana-region-centroids.ts`) — not boundary-accurate |
| 4 | **Rate limits** | **Done:** public POSTs + **admin login** use `allowPublicFormRequest` (Redis when `REDIS_URL` set) |

---

## Sprint 5 — Phase 3: accountability datasets

| # | Task | Outcome |
|---|------|---------|
| 1 | **Import pipeline** | **Shipped:** CSV → **`POST /api/admin/parliament-members/import`** + **`/admin/parliament`** list |
| 2 | **Promises** | **Shipped:** **`/admin/parliament/[id]`** + public **`GET /api/mps`**, **`GET /api/promises`**; browse UI **`/promises`**, **`/promises/[slug]`** (Phase 2+) |
| 3 | **Methodology page** | **Shipped:** **`/methodology`** — principles, promise tracking, score-style disclaimer |

---

## Sprint 6 — Phase 3: People’s Report Card

| # | Task | Outcome |
|---|------|---------|
| 1 | **Cycles** | **Shipped (MVP):** Admin **`/admin/report-card`** create cycle, **publish / unpublish** |
| 2 | **Scorecards** | **Shipped (MVP):** Admin **`/admin/report-card/[cycleId]`** upsert entries; public **`/report-card`**, **`/report-card/[year]`** (Phase 3); **tagged `unstable_cache`**, **`revalidateTag`**, partner **`Cache-Control`** (200 + 404 policy) |
| 3 | **Election window** | **Shipped (MVP):** election-observation **form notice**, **track-report** + **submit** copy; **OPS** election/moderation notes — *surge staffing is operational, not code* |
| 4 | **Embeds** | **Shipped (MVP):** **`GET /api/report-card/[year]`** (Phase 3, rate-limited) — partner scope/comms still TBD |

---

## Sprint 7 — Phase continuity (in progress)

| # | Task | Outcome |
|---|------|---------|
| 1 | **PHASES checklist** | **Done:** [`PHASES_2_3_IMPLEMENTATION.md`](PHASES_2_3_IMPLEMENTATION.md) §7 aligned with shipped vs open work |
| 2 | **Pillar flags → routes** | **Shipped:** **`/legal-empowerment`**, **`/town-halls`** when phase ≥ 2; **Header** nav + **sitemap**; `isLegalEmpowermentPageEnabled` / `isTownHallDirectoryPageEnabled` in `accountability-pages.ts` |
| 3 | **Trust UX** | **Shipped:** post-submit **“How we use your report”** `<details>` on **VoiceReportForm** success |
| 4 | **Contact audit trail** | **Shipped:** **`ContactSubmission`** model + migrate; **`POST /api/contact`** writes DB before email; **`/admin/contact-submissions`** |
| 5 | **Platform hygiene** | **Started:** **`vitest`** + **`npm run test`** in CI + README; **`accountability-http`**, **`normalize-email`**, **`accountability-tags`** (cache tag strings); **`platformFeatures`** tests. *Next:* **`middleware` → `proxy`**; Prisma config migration; expand API tests |
| 6 | **Marketing UX (phase-aware)** | **Shipped:** Homepage **live tools** strip + hero chips; pillar / footer links to **Legal desk**, **Town halls**, **Submit**/**Track**; admin **metrics** row; accountability hub **linked cards**; account **quick links**; Voice header copy when pilot on |

---

## Cross-cutting (every sprint)

- **Accessibility:** WCAG 2.2 AA on new flows; `prefers-reduced-motion`
- **Security:** Review admin routes, CSRF/session cookies, dependency audit
- **Docs:** Update `ARCHITECTURE.md` and this file when shipping major surfaces

---

## Explicit non-goals (until scoped)

- Replacing CHRAJ / EC official systems
- Full mobile native apps (web-first; PWA later if needed)
- Real-time chat support
