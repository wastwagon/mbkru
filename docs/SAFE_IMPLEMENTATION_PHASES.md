# Safe implementation phases — execution order

**Purpose:** Ship remaining programme work **without mixing risky layers** (demo data vs production claims, legal vs engineering, bulk import vs editorial). This doc is the **operational companion** to [`PHASE_TASKS.md`](./PHASE_TASKS.md) and [`PHASE_GAPS_CLOSURE_QUEUE.md`](./PHASE_GAPS_CLOSURE_QUEUE.md).

**Automated slice (run locally or in CI):** `npm run verify:release-gates` — Prisma validate, `tsc --noEmit`, Vitest. It does **not** cover backups, counsel review, or data truth.

**UI/UX (copy, duplication, navigation clarity):** [`SAFE_UI_UX_PHASES.md`](./SAFE_UI_UX_PHASES.md) — phased, reversible; Phase 1 is copy-only in config + small components.

---

## Phase 0 — Engineering & schema safety (repeat every release)

| Step | Action | Done when |
|------|--------|-----------|
| 0.1 | `npm run verify:release-gates` | Exits 0 |
| 0.2 | `npm run lint` | Exits 0 |
| 0.3 | Production image build with intended `NEXT_PUBLIC_PLATFORM_PHASE` | Matches what you are allowed to show publicly |
| 0.4 | Manual: [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) — backups, secrets, `SKIP_DB_SEED` policy | Ops owner signed |

**Stop:** Do not market “live accountability data” until Phase 3 data steps below are complete.

---

## Phase 1 — Marketing truthfulness (content + legal)

| Step | Action | Done when |
|------|--------|-----------|
| 1.1 | Citation / claims: [`CITATION_AND_CLAIMS_POLICY.md`](./CITATION_AND_CLAIMS_POLICY.md) + on-site [`/methodology`](../src/app/(main)/methodology/) | Published and linked from relevant pages |
| 1.2 | Replace seed **News** with editorial calendar | `/admin/posts`, homepage reflects real posts |
| 1.3 | **Resources** — real `ResourceDocument` rows or honest placeholders | `/resources` matches reality |
| 1.4 | **Partners** — logos / MOU status honest | `/partners` |
| 1.5 | **Counsel** — Privacy, Terms, Voice disclosures, community/partner public terms | Written sign-off recorded |

**Stop:** Phase 2 “trustworthy participation” comms should not outrun 1.5.

---

## Phase 2 — Participation ops (Voice + communities governance)

| Step | Action | Done when |
|------|--------|-----------|
| 2.1 | Voice triage SLA + abuse path documented | Internal runbook + owner |
| 2.2 | Homepage / pilot geography copy matches config | No “all regions” overclaim |
| 2.3 | Moderators acknowledge [`COMMUNITIES_PUBLIC_GOVERNANCE.md`](./COMMUNITIES_PUBLIC_GOVERNANCE.md) | Recorded |
| 2.4 | Newsletter / contact ops sign-off (ESP, inboxes) | Wave B in [`PHASE_TASKS.md`](./PHASE_TASKS.md) |

---

## Phase 3 — Accountability datasets (import + editorial, then prod phase flag)

| Step | Action | Done when |
|------|--------|-----------|
| 3.1 | Constituency master imported | [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) |
| 3.2 | MP roster CSV dry-run reconcile, then import | Verified sample against [parliament.gh](https://www.parliament.gh/members) |
| 3.3 | Promises: admin or controlled seed — **short cited lines**, `manifestoPageRef` where you claim precision | [`DATA_SOURCES.md`](./DATA_SOURCES.md) |
| 3.4 | Optional NDC catalogue bulk: `SEED_NDC_2024_MANIFESTO_CATALOGUE=1` only after editorial policy is clear | Rows verified against party PDF |
| 3.5 | Report card cycles: publish only with methodology sign-off | Scores not presented as official government stats |
| 3.6 | **`NEXT_PUBLIC_PLATFORM_PHASE=3` in production** | Only after 0.4 + 1.5 + 3.1–3.3 minimum (per [`PHASE_GAPS_CLOSURE_QUEUE.md`](./PHASE_GAPS_CLOSURE_QUEUE.md) Tier 3) |

---

## Phase 4+ — Full platform (explicit waiver or completion of Phases 0–3)

Workstreams **F–M** (full communities depth), **O** (extended test/security matrix), **Prisma 7** spike, **PMO** stretch — see [`PHASE_TASKS.md`](./PHASE_TASKS.md) Phase 4+ table and [`FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](./FULL_PLATFORM_IMPLEMENTATION_PLAN.md).

**Rule:** Do not start F–M until programme lead **waives in writing** or Tier 0–3 items intended for your launch are done — see [`PHASE_GAPS_CLOSURE_QUEUE.md`](./PHASE_GAPS_CLOSURE_QUEUE.md).

---

## Changelog

| Date | Note |
|------|------|
| 2026-04 | Initial safe phased rollout doc + `npm run verify:release-gates` |
