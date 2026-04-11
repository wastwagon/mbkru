# Early recognition launch — gaps & implementation phases

**Purpose:** Plan a **sooner public launch** to earn credibility, media, partners, and citizen adoption **before** the full 2028-aligned programme calendar in [`programmeRoadmap`](../src/lib/site-content.ts) and [`ROADMAP_2028_ELECTION.md`](../ROADMAP_2028_ELECTION.md).  
**Principle:** Separate **(A) calendar milestones** (election cycle, scorecard publication windows) from **(B) recognition milestones** (when MBKRU is discoverable, trustworthy, and minimally interactive).  
**Execution order:** Close **Phases 1–3** gaps before Phase 4+ build — see [`PHASE_GAPS_CLOSURE_QUEUE.md`](./PHASE_GAPS_CLOSURE_QUEUE.md).

**Last updated:** April 2026

---

## 1. Two timelines (do not conflate)

| Track | What it measures | Examples |
|-------|------------------|----------|
| **Programme calendar** | Field programme & flagship outputs vs 2028 | First People’s Report Card cycle, Aug–Sep 2028 scorecards, nationwide debates |
| **Recognition launch** | When the *digital* brand is ready to be promoted at scale | Consistent news, verified data on site, safe Voice pilot, partner logos, press kit, SEO |

**Build-time phase** (`NEXT_PUBLIC_PLATFORM_PHASE` / `PLATFORM_PHASE`) controls **which routes and APIs exist** in a deployment. It can be **3** while the **programme calendar** is still in 2026–2027 — that is intentional when you want election-observation surfaces and full accountability browsing **without** claiming every 2028 field milestone is complete.

| Recognition track (sooner) | Typical relationship to 2028 programme calendar |
|-----------------------------|-----------------------------------------------|
| R0 → R1 (trust + discoverability) | Can complete **before** calendar “Q2 2026 platform” wording if you prioritise CMS + legal |
| R2 (credible data) | Often **lags** first CSV import; can **lead** first *published* report card if you ship a pilot year |
| R3 (pilot participation) | Should **align** with calendar Voice pilot / regional choice — avoid claiming “all 16 regions” until true |
| R4 (partnerships at scale) | May **lead** pre-2028 scorecards if partners co-publish methodology pilots |

---

## 2. Remaining gaps (inventory)

Below is what still typically blocks a **credible early launch** even when code for Phase 2/3 exists. Status is **planning** — update rows as you ship.

### 2.1 Trust, legal, and operations

| Gap | Why it matters for early recognition | Primary references |
|-----|--------------------------------------|----------------------|
| Counsel review of Privacy / Terms / Voice disclosures | Avoid launching public intake on copy that has not been signed off | [`docs/PHASE_TASKS.md`](./PHASE_TASKS.md) Phase 2 |
| Production ops checklist (backups, secrets, `SKIP_DB_SEED`) | Recognition traffic amplifies failure cost | [`docs/OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) |
| Incident / abuse response path | CSOs and media will ask who answers at 22:00 when a report blows up | Runbook + internal RACI (document owner) |
| **Real** accountability data sign-off before marketing “live data” | Prevents reputational damage if CSV or promise tagging is wrong | [`docs/CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md), [`docs/DATA_SOURCES.md`](./DATA_SOURCES.md) |

### 2.2 Editorial and content

| Gap | Why it matters |
|-----|----------------|
| Steady news / press rhythm | SEO and journalists look for recency |
| Replace seed posts with live voice | Homepage and news trust |
| Resources: real PDFs / concept note link | “Skeleton” undermines institutional seriousness |
| Methodology page aligned to **what you actually publish** | Reduces “scorecard washing” criticism |
| Partner page: real logos, MOU status, contact | Due diligence from funders |

### 2.3 Product and data (technical backlog highlights)

| Gap | Notes |
|-----|--------|
| **Phase 3 prod gate:** “Real datasets” row in [`PHASE_TASKS.md`](./PHASE_TASKS.md) | Do not toggle Phase 3 in production until import + editorial sign-off |
| Phase 4+ expansion (communities depth, whistleblower analytics, manifesto depth) | Optional for *recognition* MVP; required for *full* platform vision — see [`FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](./FULL_PLATFORM_IMPLEMENTATION_PLAN.md) |
| Partner API **terms** page + caching commitments | Public summary **`/partner-api`** (Phase 2+); [`PARTNER_API.md`](./PARTNER_API.md) — **counsel** for contractual / MOU language |
| Wave B ESP / newsletter **ops sign-off** | [`PHASE_TASKS.md`](./PHASE_TASKS.md) Feature-gap programme |
| Stretch PMO verticals (bills, votes) | Explicitly out of early recognition unless scoped |

### 2.4 Go-to-market (non-code)

| Gap | Notes |
|-----|--------|
| Media kit & spokesperson training | Short quotes, fact checks, escalation tree |
| Pilot geography narrative | “Greater Accra first” beats “all 16 regions” if that is the truth |
| Diaspora and youth channel strategy | Already have routes; needs campaign not only UI |
| CHRAJ / EC / party engagement **paper trail** | Programme doc ≠ regulatory endorsement |

---

## 3. Implementation phases (recognition track)

These **R-phases** are **programme / GTM** slices. Map them to **engineering** phases as shown — you can run R1–R2 on `NEXT_PUBLIC_PLATFORM_PHASE=1` if you only need marketing + CMS.

| Recognition phase | Goal | Typical engineering alignment | Exit criteria (examples) |
|---------------------|------|--------------------------------|---------------------------|
| **R0 — Trust baseline** | Site is safe to promote | Phase **1** + admin CMS | Legal templates reviewed; ops checklist green; contact form monitored |
| **R1 — Discoverable** | SEO + press can cite mbkru | Phase **1** | Sitemap + metadata; regular `Post` publishing; no broken flagship claims |
| **R2 — Credible surfaces** | “We have receipts” | Phase **2** (+ DB) | Vetted MP/promise import OR clearly labelled demo; methodology matches exports |
| **R3 — Participatory pilot** | Citizens can *do* something bounded | Phase **2** (subset) | Voice submit + triage SLAs in **named** pilot region(s); transparency aggregates honest |
| **R4 — Partnership scale** | Funders & CSOs co-brand | Phase **2–3** | Partner API terms public; report card or scorecard **pilot** year published if claiming scores |

**Accelerating recognition** means pulling **R1–R2 forward** (content + data sign-off) even if **C2–C3** (full national Voice, multi-year report cards) on the 2028 calendar stays later.

---

## 4. Suggested sequencing (next 90 days — example)

Order assumes you want **recognition before** full national rollout. Adjust dates to your board decision.

1. **R0 complete** — legal/ops + content owner named  
2. **R1 in parallel** — 2–4 news items / month; partners page refresh; `/resources` real assets  
3. **Staging R2** — import dry-run + internal QA on promises/report card **or** keep demo data but **never** imply it is EC-verified  
4. **Pilot R3** — one region + clear “beta” labelling on home and Voice; staff capacity for triage  
5. **Press moment** — only after R2 exit criteria (you can point to live methodology + real or defensible data)  
6. **Calendar sync** — update [`programmeRoadmap`](../src/lib/site-content.ts) copy once board approves **new** public quarter labels (optional; keep 2028 election anchor in `ROADMAP_2028_ELECTION.md`)

---

## 5. Documentation map

| Document | Role |
|----------|------|
| This file | **Recognition vs calendar** + gaps + R-phases |
| [`ROADMAP_2028_ELECTION.md`](../ROADMAP_2028_ELECTION.md) | Election-cycle **north star** |
| [`docs/PHASE_TASKS.md`](./PHASE_TASKS.md) | Engineering backlog by `NEXT_PUBLIC_PLATFORM_PHASE` |
| [`docs/PLATFORM_EXPANSION_PLAN.md`](./PLATFORM_EXPANSION_PLAN.md) | Broader product expansion |
| [`docs/FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](./FULL_PLATFORM_IMPLEMENTATION_PLAN.md) | Deep build order (A–O) |

---

## 6. Changelog

| Date | Change |
|------|--------|
| 2026-04 | Initial doc — early recognition track split from 2028 calendar |

When you adopt concrete launch dates, add a row here and optionally add a short “Public programme dates” subsection to `ROADMAP_2028_ELECTION.md` pointing back to this plan.
