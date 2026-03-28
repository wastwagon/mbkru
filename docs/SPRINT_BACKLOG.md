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
| 3 | **Uploads** | **Deferred:** `CitizenReportAttachment` model exists — wire multipart + virus policy in a follow-up sprint |
| 4 | **Admin** | **`/admin/reports`** list + **`/admin/reports/[id]`** status form + server action |
| 5 | **Email** | **`sendReportStatusNotification`** (Resend) when staff changes status → `submitterEmail` or member email |
| — | **Public UI** | **`/citizens-voice/submit`**, pilot CTA on **`/citizens-voice`**, **`/account/reports`** |

---

## Sprint 4 — Phase 2: alerts + tracker data prep

| # | Task | Outcome |
|---|------|---------|
| 1 | **Situational alerts** | Intake path + moderation workflow (reuse `CitizenReport` kinds) |
| 2 | **Parliament tracker** | Data model wiring for waitlist → notify when pilot opens |
| 3 | **Maps** | Lazy map picker; region from coordinates where feasible |
| 4 | **Rate limits** | Redis token bucket on all anonymous `POST` (enforce in code paths) |

---

## Sprint 5 — Phase 3: accountability datasets

| # | Task | Outcome |
|---|------|---------|
| 1 | **Import pipeline** | CSV → `ParliamentMember` (+ review in admin) |
| 2 | **Promises** | `CampaignPromise` CRUD in admin + public read API |
| 3 | **Methodology page** | Static page explaining score dimensions (TI/IPU-inspired, adapted) |

---

## Sprint 6 — Phase 3: People’s Report Card

| # | Task | Outcome |
|---|------|---------|
| 1 | **Cycles** | `ReportCardCycle` + publish workflow |
| 2 | **Scorecards** | `ScorecardEntry` public views + caching |
| 3 | **Election window** | Hardened moderation + legal disclaimers for alerts |
| 4 | **Embeds** | Read-only API or static exports for partners (scope with comms) |

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
