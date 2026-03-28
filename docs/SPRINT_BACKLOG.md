# Sprint backlog — Phase 1 polish → Phase 3

**How to use this:** One sprint = roughly **1–2 weeks** for a small team; adjust to your capacity. Do not skip **security / legal** items before turning on public data collection at scale.

**Canonical engineering detail:** [`PHASES_2_3_IMPLEMENTATION.md`](./PHASES_2_3_IMPLEMENTATION.md) · **Product scope:** [`../PHASE1_SCOPE.md`](../PHASE1_SCOPE.md) · **Roadmap:** [`../ROADMAP_2028_ELECTION.md`](../ROADMAP_2028_ELECTION.md)

---

## Sprint 0 — Done (baseline)

- Next.js 16 + Prisma + admin CMS (posts, media)
- Docker / Coolify deploy, migrations, seed, Redis-ready rate limits
- Health checks (`/api/health`), security headers, Zod on public APIs

---

## Sprint 1 — Phase 1 “production ready” (current focus)

| # | Task | Outcome |
|---|------|---------|
| 1 | **Contact email** | Resend (or SMTP) when env set; log-only fallback |
| 2 | **Lead capture** | **Postgres:** `LeadCapture` + APIs (newsletter, early-access, tracker). *Optional later:* ESP webhooks in parallel |
| 3 | **Bot abuse** | Cloudflare Turnstile or reCAPTCHA on public `POST` forms |
| 4 | **Analytics** | GA4 (or Plausible) via env-gated script in `layout` |
| 5 | **Content** | Replace placeholders (contact, footer, about); ship 3–5 real news posts |
| 6 | **Ops** | DB backups, rotate any leaked secrets, `SKIP_DB_SEED=1` after first stable deploy |

---

## Sprint 2 — Phase 2 kickoff: identity

| # | Task | Outcome |
|---|------|---------|
| 1 | **Prisma** | `Member` model migrations + indexes (email unique) |
| 2 | **Auth API** | `POST /api/auth/register`, `login`, `logout` — JWT or session cookie **separate from admin** |
| 3 | **Sessions** | Redis session store when `REDIS_URL` set; fallback cookie strategy documented |
| 4 | **UI** | Minimal `/login` `/register` (or modal) gated by `platformFeatures.authentication(phase)` |
| 5 | **Legal** | Privacy policy updates for accounts + retention |

---

## Sprint 3 — Phase 2: MBKRU Voice (MVP)

| # | Task | Outcome |
|---|------|---------|
| 1 | **Reports API** | `POST /api/reports` (kind, region, narrative, optional geo) |
| 2 | **Tracking** | Public `GET` by opaque tracking code (no PII leak) |
| 3 | **Uploads** | Reuse patterns from admin media; size/type limits; virus scan policy |
| 4 | **Admin** | `/admin/reports` queue + status transitions |
| 5 | **Email** | Notify submitter on status change (provider from Sprint 1) |

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
