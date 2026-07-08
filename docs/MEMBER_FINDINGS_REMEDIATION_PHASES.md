# Member findings — safe remediation phases

**Purpose:** Close gaps from the July 2026 live-site review ([mbkru.org](https://mbkru.org/)) in **small, reversible steps** — without mixing demo data, legal sign-off, and production claims.

**Related:** [`SAFE_IMPLEMENTATION_PHASES.md`](./SAFE_IMPLEMENTATION_PHASES.md) · [`PHASE_GAPS_CLOSURE_QUEUE.md`](./PHASE_GAPS_CLOSURE_QUEUE.md) · [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md)

**Automated gate (every engineering phase):** `npm run verify:release-gates`

**Live status for admins:** `/admin/settings` → **Launch readiness** panel shows current blockers (training data present, published cycles missing scores, gate state) plus manual sign-off reminders (legal, Hubtel, backups).

---

## How to use this doc

| Role | Start here |
|------|------------|
| **Ops / programme lead** | **Phase R0** — under-construction gate (keeps all content; admins preview only) |
| **Engineering** | Deploy R0 + R1a code → R2+ while gate is on |
| **Counsel / editorial** | Phase R3–R4 in parallel (admin preview) |
| **Comms** | Site is “coming soon” until **Launch (R5)** |

### Pre-launch operating model (July 2026)

While **Public site under construction** is checked in `/admin/settings`:

- **Public visitors and members** → holding page only (`/under-construction`, `/contact` still work).
- **Signed-in admins** → full site preview (amber bar on public pages).
- **Training/demo content** stays in the database; production filters hide it from public surfaces when the gate opens.
- **Launch day** → clear Launch readiness checklist, then uncheck the construction box (or `npm run ops:construction:off`).

Each phase has **stop lines** — do not open the public site until **R5**.

---

## Phase R0 — Under construction (day 0) — **primary strategy**

**Goal:** mbkru.org shows a holding page to the public. **All programme content stays in the database** — nothing is deleted. **Only signed-in admins** can browse the full site (preview mode).

### How it works (already built)

| Visitor | Sees |
|---------|------|
| Public guest | `/under-construction` (+ `/contact` still works) |
| Member `/login` | Gated — same holding page |
| **Admin** `/admin/login` → then `/` | Full site + amber **Admin preview** bar |

### R0 ops — enable on production

**Option A — database (recommended; editable in admin UI):**

```bash
npm run ops:construction:on
npm run ops:construction:status
```

**Option B — deploy env (belt-and-braces; overrides DB until unset):**

```bash
PUBLIC_UNDER_CONSTRUCTION=1
```

**Option C — admin UI:** `/admin/settings` → **Public site under construction** → Save.

**Admin workflow:** Sign in at `/admin/login`, then open `/` or `/report-card` in the **same browser** to continue editorial work, import data, and triage reports.

**Disable at launch:**

```bash
npm run ops:construction:off
# and unset PUBLIC_UNDER_CONSTRUCTION in production env
```

| # | Action | Owner | Done when |
|---|--------|-------|-----------|
| R0.1 | Enable construction gate on mbkru.org | Ops | Public URL shows holding page |
| R0.2 | Confirm `SKIP_DB_SEED=1` or no `RUN_DB_SEED_ON_BOOT` on production | Ops | [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) |
| R0.3 | Pause external promotion of live accountability data | Comms | Team briefed |
| R0.4 | Schedule counsel kickoff | Programme | Date on calendar |

**Stop:** Do not run `ops:construction:off` until **R5** exit criteria pass.

**Do not** archive or delete demo/seed content while the gate is on — admins need it for training and QA.

---

## Phase R1 — Ready for public launch (code + optional data hygiene)

**Goal:** When the gate opens, public surfaces are honest. **No content removal required** if gate stayed on through editorial work.

### R1a — Engineering (deploy while gate is on)

| # | Action | Status |
|---|--------|--------|
| R1a.1 | Public browse/stats exclude training rows in **production** when gate opens (`src/lib/reports/training-data.ts`) | Shipped |
| R1a.2 | Local dev still shows training rows unless `EXCLUDE_TRAINING_DATA_FROM_PUBLIC=1` | Shipped |
| R1a.3 | Pillar badge “Live data” → “Platform live” | Shipped |
| R1a.4 | Training filter on public causes browse + API | Shipped |

### R1b — Ops (**optional** before launch; not required while gate is on)

| # | Action | Command |
|---|--------|---------|
| R1b.1 | List training reports (dry-run) | `npm run ops:archive-training-reports` |
| R1b.2 | Archive training reports — **optional**; reversible in admin | `npm run ops:archive-training-reports -- --apply` |

**Exit R1 (for launch):** Training filter deployed; optionally archive demo rows before `ops:construction:off`.

---

## Phase R2 — Report Card & catalogue honesty (week 1–2)

**Goal:** Published accountability content matches editorial reality.

| # | Action | Owner |
|---|--------|-------|
| R2.1 | **Unpublish** 2026 Report Card cycle OR keep with banner “Pilot — scores pending review” | Editorial + admin; **pilot banner shipped** on `/report-card` |
| R2.2 | Do not publish cycles until methodology + evidence sign-off recorded | Programme |
| R2.3 | Hide or complete commitment rows with “Page ref pending” / “Citation date not set” on **promoted** views | Editorial; **public catalogue API filtered in production** |
| R2.4 | Filter incomplete catalogue rows from homepage teaser (`src/lib/promises/incomplete-citations.ts`; production default) | Shipped |

**Stop:** No MP score marketing until R2.1–R2.2 complete.

---

## Phase R3 — Organisation gates (weeks 2–4)

| Week | Action | Doc |
|------|--------|-----|
| 2 | MP/constituency CSV import dry-run + EC sample check | [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) |
| 2 | Counsel sign-off Privacy / Terms / Voice disclosures | Tier 0.2 in [`PHASE_GAPS_CLOSURE_QUEUE.md`](./PHASE_GAPS_CLOSURE_QUEUE.md) |
| 3 | Hubtel Ghana Card production credentials + test on `/account` | [`LOCAL_DEV_GAPS.md`](./LOCAL_DEV_GAPS.md) §B |
| 3 | Backup + restore drill | `npm run ops:backup` + `npm run ops:restore-verify` |
| 4 | First **real** citizen reports encouraged (pilot geography) | Ops runbook |

---

## Phase R4 — UX & visualization (weeks 3–6, after R1–R2)

Reversible product work — see [`SAFE_UI_UX_PHASES.md`](./SAFE_UI_UX_PHASES.md).

| # | Item | Risk |
|---|------|------|
| R4.1 | Split Report Card: Voice tab vs Scores tab (reduce filter overload) | Shipped |
| R4.2 | “Has attachment” on public report cards | Shipped |
| R4.3 | Regional heat map on `/regions/[slug]` (reuse `/transparency` component) | Shipped |
| R4.4 | Charts on `/transparency` for kind/status (not only text lists) | Shipped |
| R4.5 | Training badge on cards when `INCLUDE_TRAINING_DATA_ON_PUBLIC=1` | Shipped |
| R4.6 | Sign-in policy: keep members-only vs anonymous + Turnstile | **Product decision** |
| R4.7 | Brand palette alignment (Ghana red/gold/green prominence) | Design review |

---

## Phase R5 — Launch (open the public site)

1. Complete **R2** editorial + **R3** org gates (or accept documented waivers).
2. Confirm **Launch readiness** in `/admin/settings` shows no blockers.
3. Optionally run `ops:archive-training-reports -- --apply`.
4. `npm run ops:construction:off` and unset `PUBLIC_UNDER_CONSTRUCTION`.
5. Smoke public URLs as a **logged-out** visitor (not admin).
6. Comms may promote the programme.

All must be true:

- [ ] Construction gate **off** (and env override unset)
- [ ] Public browse shows **zero** training rows (filter + optional archive)
- [ ] Report Card cycle published **with** signed-off scores OR still unpublished
- [ ] Counsel sign-off recorded
- [ ] Hubtel verified if MP performance path is promoted
- [ ] Backup restore tested once
- [ ] `npm run verify:release-gates` on release image

---

## Rollback

| Change | Rollback |
|--------|----------|
| Construction gate | `npm run ops:construction:on` or toggle in `/admin/settings` |
| R1a training filter | Redeploy previous image or `INCLUDE_TRAINING_DATA_ON_PUBLIC=1` (not recommended on prod) |
| R1b archive | Admin → restore report status from backup |
| R2 unpublish cycle | Admin → republish when ready |

---

## Changelog

| Date | Note |
|------|------|
| 2026-07 | R0 = under-construction gate (preserve content); ops:construction:* scripts |
| 2026-07 | Initial doc + Phase R1a training-data filter + optional archive script |
| 2026-07 | Launch readiness panel, construction-gate env helper, final polish |
| 2026-07 | Incomplete citation filter, public-causes training filter, attachment badge, verify:local |
| 2026-07 | Report Card browse tabs, regional heat map on region hubs |
| 2026-07 | Pre-launch callout, pilot banner, catalogue browse filter, construction copy defaults |
