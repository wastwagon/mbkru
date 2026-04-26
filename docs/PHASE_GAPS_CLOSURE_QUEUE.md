# Phase gaps — closure queue (Phases 1–3 first)

**Rule:** Work **this queue top to bottom** for Phases **1 → 2 → 3**. Do **not** start Phase **4+** (`F–M` communities depth, PMO stretch, Prisma 7 spike) until items here are either **done** or **explicitly waived in writing** by programme lead — otherwise “recognition launch” and “full platform” get mixed.

**Living backlog with checkboxes:** [`PHASE_TASKS.md`](./PHASE_TASKS.md)  
**Earlier public launch:** [`EARLY_RECOGNITION_LAUNCH_PLAN.md`](./EARLY_RECOGNITION_LAUNCH_PLAN.md)  
**Safe phased rollout (ops + legal + data order, automation):** [`SAFE_IMPLEMENTATION_PHASES.md`](./SAFE_IMPLEMENTATION_PHASES.md) — run `npm run verify:release-gates` for the automated slice.

---

## Tier 0 — Stop-the-line (any phase)

| # | Item | Type | Doc / route |
|---|------|------|---------------|
| 0.1 | Production ops verify (backups, `SKIP_DB_SEED`, secrets) | Ops | [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) |
| 0.2 | Counsel pass on Privacy / Terms / Voice disclosures | Legal | `privacy`, `terms`, `PHASE_TASKS` Phase 2 |
| 0.3 | Real accountability data: import dry-run + **editorial** sign-off before marketing “live data” | Ops + editorial | [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) |

---

## Tier 1 — Phase 1 “complete” (recognition-ready marketing)

| # | Item | Type | Doc / route |
|---|------|------|---------------|
| 1.1 | Citation & claims policy published (repo + on-site summary) | Doc + product | [`CITATION_AND_CLAIMS_POLICY.md`](./CITATION_AND_CLAIMS_POLICY.md), `/methodology#claims-and-citations` |
| 1.2 | Replace seed news with live editorial calendar | Content | `/admin/posts`, homepage |
| 1.3 | Resources: real assets or honest “coming soon” | Content | `/admin/resources`, `/resources` |
| 1.4 | Partners page: real logos / MOU status | Content | `/partners` |

---

## Tier 2 — Phase 2 “complete” (trustworthy participation)

| # | Item | Type | Doc / route |
|---|------|------|---------------|
| 2.1 | Voice triage SLA + abuse path documented | Ops | runbook + internal RACI |
| 2.2 | Pilot geography narrative matches config (no “all regions” overclaim) | Comms | homepage, `site-content` |
| 2.3 | Communities governance snapshot acknowledged by moderators | Ops | [`COMMUNITIES_PUBLIC_GOVERNANCE.md`](./COMMUNITIES_PUBLIC_GOVERNANCE.md) |
| 2.4 | Newsletter/contact **ops sign-off** (ESP, inboxes) | Ops | `PHASE_TASKS` Wave B |

---

## Tier 3 — Phase 3 “complete” (flagship credibility)

| # | Item | Type | Doc / route |
|---|------|------|---------------|
| 3.1 | `NEXT_PUBLIC_PLATFORM_PHASE=3` in prod **only** after 0.3 + 1.1 + methodology alignment | Ops | `PHASE_TASKS` Phase 3 row |
| 3.2 | Partner API **public** terms / attribution page | Legal + product | **`/partner-api`** (Phase 2+); technical draft [`PARTNER_API.md`](./PARTNER_API.md) — **counsel** still for MOU / contractual language |
| 3.3 | Election-observation copy reviewed for overclaim | Legal + product | `/election-observation` |

---

## Tier 4 — Deferred (explicitly after 1–3)

- **F–M** full communities programme  
- **N** deeper whistleblower / Voice **programme dashboards** (baseline: `/admin/analytics/citizen-reports` + CSV export)  
- **O** extra test/security matrix beyond current checklist  
- **Prisma 7** spike  
- **PMO** bills/votes stretch  

---

## Changelog

| Date | Note |
|------|------|
| 2026-04 | Initial queue — phases 1–3 first |
