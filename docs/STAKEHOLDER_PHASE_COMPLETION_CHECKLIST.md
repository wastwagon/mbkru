# Stakeholder checklist — platform phases & go-live readiness

**Purpose:** A single printable / slide-friendly sheet for demos and governance conversations. It separates **what the codebase ships** from **what your organisation must still sign off** (legal, content, data truth, ops).

**How to use tomorrow**

- Tick **Engineering** when you have run the automated checks and spot-checked the demo environment.
- Tick **Organisation** only when the named owner has signed (legal, editorial, ops). Blank rows mean “not claimed complete.”
- If someone asks “are all phases done?” — answer precisely: **Platform Phase 3 features are implemented in this repo**; **full programme completion** also requires the Organisation column for tiers you care about.

---

## 1. Three different “phases” (avoid confusion)


| Term                                              | Meaning                                                                                                                                                                      | Where to read more                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Platform phase (`NEXT_PUBLIC_PLATFORM_PHASE`)** | **1** = marketing + admin CMS; **2** = + members, Voice, promises/MPs; **3** = + report card flagship & related UX. Set at **build time** (Docker rebuild if you change it). | `[ARCHITECTURE.md](./ARCHITECTURE.md)`, `[.env.example](../.env.example)` |
| **Safe implementation phases (0–4+)**             | **Order of rollout**: engineering safety → marketing truth → participation ops → accountability data → optional full platform. Not the same as the single digit 1/2/3 flag.  | `[SAFE_IMPLEMENTATION_PHASES.md](./SAFE_IMPLEMENTATION_PHASES.md)`        |
| **Launch verification phases (1–4)**              | **Pre-go-live smoke**: automated tests, API/DB contracts, role walkthroughs, cron/backup/malware policy.                                                                     | `[LAUNCH_VERIFICATION_PHASES.md](./LAUNCH_VERIFICATION_PHASES.md)`        |


---

## 2. Platform capabilities by build phase (engineering)

Use this table to show **scope shipped in software**. Confirm your **deploy** uses the intended `NEXT_PUBLIC_PLATFORM_PHASE` and migrations are applied.


| Platform phase | Capabilities (summary)                                                                                                                                | Engineering verified? | Notes / owner                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------- |
| **1**          | Public site, news/resources/partners/contact, admin CMS, leads                                                                                        | ☐                     | No member login surface if phase stays at 1                     |
| **2**          | + Member auth, MBKRU Voice & reports, tracking, situational/election intake, parliament import & public promises/MPs, communities (per config)        | ☐                     | Needs `MEMBER_SESSION_SECRET`, Postgres, optional Redis         |
| **3**          | + Published People’s Report Card (`/report-card`), partner JSON `GET /api/report-card/[year]`, methodology & election-observation flows as documented | ☐                     | **Do not** present seeded/simulated scores as official findings |


**Quick technical preflight (before the meeting)**


| Check                       | Command / action                                                                                                | Done |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- | ---- |
| Automated gates             | `npm run verify:release-gates`                                                                                  | ☐    |
| Smoke E2E (if you run them) | `npm run test:e2e:smoke`                                                                                        | ☐    |
| Health endpoint             | `GET /api/health` → 200, `dependencies.postgres` ok; review `deployment` (HTTPS URL, optional OpenAI for voice) | ☐    |
| Canonical URL               | Production `NEXT_PUBLIC_SITE_URL` = real **HTTPS** origin (sitemap, OG, health hints)                           | ☐    |


---

## 3. Programme “complete” — organisation sign-offs (Tier 0–3)

These items define **trustworthy** public launch; many are **not** automatic from code. Full detail: `[PHASE_GAPS_CLOSURE_QUEUE.md](./PHASE_GAPS_CLOSURE_QUEUE.md)`.


| Tier  | Topic                                                                               | Organisation complete? | Owner / date |
| ----- | ----------------------------------------------------------------------------------- | ---------------------- | ------------ |
| **0** | Production ops: backups, secrets, seed policy                                       | ☐                      |              |
| **0** | Counsel: Privacy, Terms, Voice disclosures                                          | ☐                      |              |
| **0** | Real accountability data: import + **editorial** sign-off before “live data” claims | ☐                      |              |
| **1** | Citation/claims policy live + aligned content                                       | ☐                      |              |
| **1** | Editorial news calendar (not demo posts only)                                       | ☐                      |              |
| **1** | Resources & partners match reality                                                  | ☐                      |              |
| **2** | Voice triage SLA + abuse path documented                                            | ☐                      |              |
| **2** | Pilot geography / copy matches what you operate                                     | ☐                      |              |
| **2** | Communities governance acknowledged by moderators                                   | ☐                      |              |
| **2** | Newsletter/contact ops sign-off                                                     | ☐                      |              |
| **3** | Phase 3 in prod only when methodology + data policy aligned                         | ☐                      |              |
| **3** | Partner API / MOU language with counsel as needed                                   | ☐                      |              |
| **3** | Election-observation copy reviewed for overclaim                                    | ☐                      |              |


---

## 4. Launch verification (technical smoke)

For **go-live** or **staging sign-off**, walk through `[LAUNCH_VERIFICATION_PHASES.md](./LAUNCH_VERIFICATION_PHASES.md)`:

- Phase 1 — Automated linkage + route health  
- Phase 2 — API/DB contracts (health, track, notifications retry, migrations)  
- Phase 3 — Admin / member / anonymous walkthroughs  
- Phase 4 — Cron, backup/restore, malware policy, outbox/audit review

**Exit:** No P0/P1; Go/No-Go recorded.

---

## 5. Honest one-liner for stakeholders

> **The platform’s Phase 1–3 *software capabilities* are implemented and testable in this repository.**  
> **Declaring the *programme* fully complete** still requires your organisation’s checks on legal pages, operational runbooks, real data/editorial sign-off, and production configuration — use §3 and §4 above.

**Living engineering backlog:** `[PHASE_TASKS.md](./PHASE_TASKS.md)`  
**Ops runbook:** `[OPS_RUNBOOK.md](./OPS_RUNBOOK.md)`  
**Observability:** `[OBSERVABILITY.md](./OBSERVABILITY.md)`