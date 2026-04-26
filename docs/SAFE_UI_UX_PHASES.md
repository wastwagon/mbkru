# Safe UI/UX phases — clarity, unification, less duplication

**Purpose:** Roll out **copy and layout** improvements in **small, reversible steps** without breaking URLs or the public API. Complements [`SAFE_IMPLEMENTATION_PHASES.md`](./SAFE_IMPLEMENTATION_PHASES.md) (ops + data).

---

## Phase 1 — Centralized copy (shipped in repo)

| Change | Rationale |
|--------|-----------|
| `promiseCardSurfaceExplainerShort` for **homepage** live embeds only | Full explainer stays on `/government-commitments` and `/promises/browse`; home no longer repeats the long block twice. |
| `parliamentTrackerHubOrientation` under the hub `PageHeader` | Orients users to **Government commitments** vs **Browse all** without renaming the legal page title. |
| Roster line uses **“catalogue row(s)”** | Matches the By MP index and catalogue language. |
| `PromiseCatalogueSurfacesCallout` (browse): main text without raw `GET` in the primary paragraph; **Partners & developers** `<details>` for JSON | General readers first; API detail on demand. Partner link falls back to **Data sources** when `/partner-api` is phase-gated. |
| `HomeParticipateHub` Phase 1 tiles | Removes leftover “score promises” / generic preview copy; aligns with catalogue terminology. |

**Do not** change `/promises/*` URLs in this phase (stable permalinks).

---

## Phase 2 — Deeper unification (optional, product-led)

| Item | Status |
|------|--------|
| **Glossary** in `/methodology#key-terms` | **Shipped** — `methodologyKeyTerms` in `accountability-catalogue-destinations.ts` (dl on methodology page). |
| **Parliament hub `PageHeader`** | **Shipped** — first sentence names **Parliament tracker**; then long programme title (no H1/SEO change). |
| **Report card vs scorecards** | **Shipped** — disambiguation on `/report-card` + link to glossary; third hub tool card text points to methodology and distinguishes PRC. |
| **Nav / H1 = “Parliament tracker”** | **Shipped** — `PageHeader` and `<title>` on `/parliament-tracker` use `parliamentPageDocumentTitle` (root layout `template` appends the site name). |
| **Homepage density** (one compact block) | **Shipped (browse only)** — home “Live catalogue” block uses `homeTeaser` in `PromisesBrowseLive` (KPIs + 5 rows + CTA; government block stays full filters). |

---

## Phase 3 — Internationalisation & A11Y (when needed)

- Glossary `dl` on `/methodology` is `aria-labelledby` the section heading.  
- Full `PromisesBrowseLive` filter panel is exposed as a `search` region with a concise `aria-label`.  
- Deeper: screen-reader order for filter toolbars and stats strip; shorter `summary` for future `<details>`.

---

## Changelog

| Date | Note |
|------|------|
| 2026-04 | Phase 1 copy + callout + hub orientation |
| 2026-04 | Phase 2 glossary, hub header alias, report-card disambiguation, tool card copy |
| 2026-04 | H1 = Parliament tracker, home browse teaser, a11y pass on glossary + filter region |
