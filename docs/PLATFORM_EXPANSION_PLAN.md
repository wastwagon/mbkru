# Platform expansion — data reality, promise tracking, Queen Mothers communities

**Purpose:** Turn the product vision into **phased, buildable work**: reliable inputs for **MPs and promises**, clarity on **government manifesto tracking**, stronger **citizen / whistleblower** positioning, and a new **Queen Mothers & communities** pillar. This doc is the **master task source** for scope beyond current Phase 2/3 code.

**Companion:** [`DATA_SOURCES.md`](./DATA_SOURCES.md) · [`PHASE_TASKS.md`](./PHASE_TASKS.md) · **[`FULL_PLATFORM_IMPLEMENTATION_PLAN.md`](./FULL_PLATFORM_IMPLEMENTATION_PLAN.md)** (full implementation map, workstreams A–O) · [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) · [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md)

---

## 1. Principles (non‑negotiable)

1. **Primary sources for facts:** Parliament roster, EC materials, party manifestos (with copyright respect), your own editorial scorecards.  
2. **Citizen reports:** Evidence-forward, moderated, with clear disclaimers (already aligned with Voice / situational flows).  
3. **Queen Mothers module:** **Verified leadership** roles, **community guidelines**, and **moderation** before scale — not anonymous chaos.  
4. **Whistleblowing:** MBKRU can **document and signpost** official channels (e.g. CHRAJ, OSP, police, sector regulators); **legal design** required before marketing “whistleblower” as a legal category.

---

## 2. Reliable data sources — operational stack

| Need | Primary source | In this repo today | Gap / next tasks |
|------|----------------|--------------------|------------------|
| **Current MPs** | [parliament.gh/members](https://www.parliament.gh/members) | CSV import + `ghanamps` JSON → CSV script | [ ] Scheduled **reconciliation** job or quarterly runbook step: diff import vs parliament.gh |
| **Constituencies** | [EC Ghana](https://ec.gov.gh/) + editorial slug list | Manual `Constituency` rows | [ ] Published **constituency seed** or migration once EC-aligned list is frozen |
| **Governing party manifesto (2024+)** | Official party PDFs (see [`DATA_SOURCES.md`](./DATA_SOURCES.md) §3.1) | Admin `CampaignPromise` CRUD | [ ] **Rights review** + curated import template; [ ] optional **public “Government commitments”** view filtered by party/election |
| **Opposition / other parties** | Same | Same model, different tags | [ ] Add `electionCycle`, `partySlug` (or metadata JSON) if you need multi-party dashboards |
| **Citizen evidence** | N/A (user-generated) | `CitizenReport` + attachments | [ ] Retention policy; [ ] optional **secure intake** spike (see §5) |

---

## 3. Full task list — data & promise visibility (Phase 3+)

- [ ] **Legal:** Manifesto excerpt policy; attribution on site; partner API terms ([`PARTNER_API.md`](./PARTNER_API.md)).  
- [ ] **Data:** Complete constituency master + MP import for **current Parliament**; spot-check 10% against parliament.gh.  
- [ ] **Editorial:** Enter **government manifesto** promises (short lines + `sourceLabel` + page/section refs).  
- [ ] **Product:** Public page “**Government commitments**” (filter: ruling party / cycle) — uses existing `/promises` patterns or new route.  
- [ ] **Ops:** Document **update cadence** when ministers change or by-elections occur.  
- [ ] **Engineering (optional):** `ManifestoDocument` table (title, url, sha256, party, year) for traceability without storing full PDF text.

---

## 4. Citizen reporting & whistleblowers — expansion tasks

Existing **MBKRU Voice**, **situational alerts**, and **election observation** already cover **intake + triage + tracking codes**.

- [ ] **Content:** Dedicated `/whistleblowing` or section on `/citizens-voice` explaining **difference** between MBKRU intake and **CHRAJ / OSP / police** (with official links — verify URLs with counsel).  
- [ ] **Trust:** Optional **PGP** or secure channel spike; **do not** promise legal whistleblower protection unless counsel approves copy.  
- [ ] **Admin:** Queue SLAs tied to `slaDueAt` (already in DB); [ ] **escalation playbook** links in `operationsPlaybookKey` taxonomy.  
- [ ] **Analytics:** Aggregate **non-identifying** stats for annual report (counts by region/kind).

---

## 5. Queen Mothers & communities — product definition

**Vision:** Hundreds of **place- or tradition-based communities** (your target **200+** is a **product scale goal**; exact enumeration should come from **partners** — e.g. regional houses, federations, NCCE, academic partners — not guessed in code).

### 5.1 Core concepts

| Concept | Description |
|---------|-------------|
| **Community** | A group with name, slug, region/traditional area metadata, optional verified partner org. |
| **Membership** | `Member` (or new `User`) joins; roles: `MEMBER`, `MODERATOR`, `QUEEN_MOTHER_VERIFIED`. |
| **Feed** | Posts, announcements, concerns — moderation before public or trust levels. |
| **Queen Mother channel** | Only **verified** accounts post as “official voice” for that community (badge + audit log). |

### 5.2 Engineering backlog (new — not in current schema)

- [ ] **Schema:** `Community`, `CommunityMembership`, `CommunityPost`, `CommunityAnnouncement`, enums for role and post status.  
- [ ] **Verification:** Document upload + admin/partner approval for `QUEEN_MOTHER_VERIFIED` (or integration with partner registry if one exists).  
- [ ] **API:** CRUD + rate limits + Redis (same patterns as reports).  
- [ ] **UI:** Directory (`/communities`), community home, join/leave, thread view, **Queen Mother** pinned announcements.  
- [ ] **Safety:** Report post, block user, appeal flow; **minors** policy if youth participate.  
- [ ] **Notifications:** Email digest; optional SMS for announcements (reuse Twilio path).  
- [ ] **Search:** Postgres full-text or Meilisearch/Algolia later for 200+ communities.  
- [ ] **Governance:** Terms + community rules template; **data residency** note in privacy policy.

### 5.3 Partner & research tasks (offline)

- [ ] Map **national / regional** Queen Mothers and traditional leaders’ networks (desk research + partner intros).  
- [ ] Pilot with **one region** before 200+ scale.  
- [ ] MOU template for **verified** community onboarding.

---

## 6. “Full platform” — phased roadmap

| Phase | Name | Scope |
|-------|------|--------|
| **A** | **Data truth** | Constituencies, MPs, manifesto promises cited, public promises UI polished. |
| **B** | **Accountability surface** | Published report cards; methodology comms; partner JSON terms signed. |
| **C** | **Communities MVP** | Communities + membership + posts + verification v1 + moderation. |
| **D** | **Communities scale** | Search, digests, regional dashboards, partner SSO optional. |
| **E** | **Advanced trust** | Optional encrypted intake, formal whistleblower copy (legal), integrations. |

---

## 7. How this connects to `PHASE_TASKS.md`

- Items still **open** there (e.g. **real datasets**, **tracker leads**, **partner legal**) remain **prerequisites** for “data reality.”  
- **Queen Mothers** and **communities** are **Phase 4+**; add checkbox rows to [`PHASE_TASKS.md`](./PHASE_TASKS.md) when you start execution, or track epics in your issue tracker with links to this doc.

---

## 8. Immediate next actions (recommended order)

1. Counsel + comms: **manifesto citation** and **whistleblower** language.  
2. Data team: **constituency freeze** + **MP import** + sample promise rows from **official** 2024 PDFs.  
3. Product: wire **“Government commitments”** narrative on top of existing `/promises` + `CampaignPromise`.  
4. Partnerships: **one** Queen Mothers pilot community spec before building full social graph.  
5. Engineering: create **GitHub issues** from §§3–5 checkboxes and estimate sprints.

---

*This plan is a living document — update when election cycles, governing party, or partner agreements change.*
