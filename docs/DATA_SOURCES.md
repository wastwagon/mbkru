# Public data sources — parliament, constituencies, manifestos

**Purpose:** Point operators and editors to **real-world** sources for seeding **`Constituency`**, **`ParliamentMember`**, **`CampaignPromise`**, and report-card content. MBKRU remains **editorially responsible** for accuracy, non-partisan framing, and rights to republish.

**On-site summary:** the **`/data-sources`** page on the deployed site mirrors the main citations below for visitors.

### Bundled JSON in this repository (`prisma/data/`)

| File | Origin | Verify with |
|------|--------|-------------|
| **`constituencies.seed.json`** | English Wikipedia — [List of parliamentary constituencies of Ghana](https://en.wikipedia.org/wiki/List_of_parliamentary_constituencies_of_Ghana) (CC BY-SA 4.0). Regenerate: `npm run data:refresh-constituencies-seed`. | [Electoral Commission of Ghana](https://ec.gov.gh/) for boundaries and seat changes. |
| **`parliament-members.seed.json`** | English Wikipedia — [List of MPs elected in the 2024 Ghanaian general election](https://en.wikipedia.org/wiki/List_of_MPs_elected_in_the_2024_Ghanaian_general_election) (CC BY-SA 4.0). Regenerate: `npm run data:refresh-members-seed-wikipedia`. See `PARLIAMENT_MEMBERS_SEED_SOURCE.txt`. | [Parliament of Ghana — members](https://www.parliament.gh/members) for the current roster. |
| **`communities.seed.json`** | Descriptions cite Ajumako Traditional Council’s public Queen Mothers page and UENR public reporting on Sunyani Traditional Council. See `COMMUNITIES_SEED_SOURCES.txt`. | Council and university primary sources linked in each community description. |
| **`ndc-2024-manifesto-promises.catalogue.json`** | Editorial abridged-manifesto **themes** (short lines), not a full rights-cleared extract of the PDF. | Cross-check every row against the party’s canonical PDF; add `manifestoPageRef` in admin when signed off. Loaded only when **`SEED_NDC_2024_MANIFESTO_CATALOGUE=1`** alongside the normal accountability seed (not when `SEED_ACCOUNTABILITY_DEMO=0`). |

**Import path (CSV alternative):** Constituencies first → CSV MP import per [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) → promises and scorecards in **admin** (with `sourceLabel` citations).

### What can be bulk-fetched vs manual (honest scope)

There is **no official** state bulk MP JSON API we can call from CI. **open.africa’s** historic “Members of Parliament Ghana” package had **no file resources** when checked (metadata only, 2012 snapshot). **Manifesto text** is not something we bulk-copy without rights and editorial cites. This repo **can** fetch **constituency names** from Wikipedia’s API and **can** convert **ghanamps** JSON to MP CSV **on your machine**.

| Feature | Safe bulk today? | In this repo |
|--------|------------------|--------------|
| **MP roster** | **Yes, locally** via **[ghanamps](https://github.com/yeboahnanaosei/ghanamps)** (`ghanamps members` → JSON). Verify sample rows on [parliament.gh](https://www.parliament.gh/members). | **`npm run data:pull-mps`** → `prisma/data/generated/parliament-members.bulk.csv` (auto-merges [`parliament-members.starter.csv`](../prisma/data/parliament-members.starter.csv)). Or **`MP_JSON_PATH=./mps.json npm run data:pull-mps`** if you saved JSON without the CLI. |
| **Constituency master** | **Partially** — English Wikipedia’s [list page](https://en.wikipedia.org/wiki/List_of_parliamentary_constituencies_of_Ghana) (CC BY-SA) has machine-readable tables; **not** an EC legal boundary source. | **`npm run data:pull-constituencies`** → `prisma/data/generated/constituencies.wikipedia.csv` (~268 rows when links use `(Ghana parliament constituency)`; a few seats use shorter wikilinks — add manually). Merges [`constituencies.starter.csv`](../prisma/data/constituencies.starter.csv). Cross-check with **`npm run data:list-mp-constituency-slugs -- mps.json`**. |
| **Tracked commitments** | **No** automated full extract (copyright + accuracy). | Themes + PDF links in seed; **you** add cited lines in admin. |
| **Report card scores** | **No** — editorial methodology. | Pilot cycle (scores **pending**) shows UI; publish real cycles in admin. |
| **Town halls / forums (programme)** | Roadmap-aligned placeholders only. | **`TownHallEvent`** rows from `prisma db seed` (see **`prisma/data/TOWN_HALL_SEED_SOURCES.txt`**). Replace with confirmed events operationally; admin CRUD can be added later. |
| **Communities / alerts** | **No** single open national dataset for alerts. | Communities: **`communities.seed.json`**; situational intake via Voice forms. |

---

## 1. Members of Parliament (roster)

| Source | What it offers | Caveats |
|--------|----------------|---------|
| **[Parliament of Ghana](https://www.parliament.gh/)** | Official MP profiles, photos, party, constituency | **Canonical** for who sits in Parliament; no single “download all” API documented here — use for **verification** after bulk import. |
| **[ghanamps](https://github.com/yeboahnanaosei/ghanamps)** (community CLI) | `ghanamps members` → JSON array with `name`, `party`, `constituency`, `region`, `photo`, `profile` | **Third-party aggregator**; always **spot-check** against parliament.gh. Photos/profile URLs often point at **parliament.gh** — respect their **terms** and **hotlinking** policy before using images in production. |
| **[ghanamps.com](https://ghanamps.com/)** | Browse 9th Parliament (2025–2029) and filters | Same verification rule as CLI; site is a convenience, not a legal record. |
| **[openAFRICA — Members of Parliament Ghana](https://open.africa/dataset/members-of-parliament-ghana)** | Historical dataset | Often **stale** (e.g. pre-2012 snapshots); use only with date checks, not as current roster. |

**This repo:** Run `npm run data:members-csv -- path/to/members.json > import.csv` to convert **ghanamps-style JSON** into the CSV format expected by **`POST /api/admin/parliament-members/import`**. See `scripts/json-members-to-mbkru-csv.mjs`. **Read-only exports (Phase 2+):** `GET /api/export/mps-csv` (roster) and `GET /api/export/promises-csv` (all promises; optional `?memberSlug=`) — same phase gates as JSON APIs; rate-limited per IP.

**Starter seed (`prisma db seed`, unless `SEED_ACCOUNTABILITY_DEMO=0`):** Inserts three widely listed 9th-Parliament examples — **Bryan Acheampong** (Abetifi), **John Dramani Mahama** (Bole Bamboi), **Zanetor Agyeman-Rawlings** (Klottey Korle) — for UI and import testing. **Always verify** names, party, and constituency against **[parliament.gh members](https://www.parliament.gh/members)** after by-elections or roster changes. Promise rows are **manifesto themes** with PDF links; editors replace with page-level citations before comms. Optional bulk NDC 2024 units: set **`SEED_NDC_2024_MANIFESTO_CATALOGUE=1`** to load `ndc-2024-manifesto-promises.catalogue.json` into `CampaignPromise` (tagged in `verificationNotes` for re-seed idempotency).

**Checked-in CSVs (same roster, import path):** For hosts that use **`SEED_ACCOUNTABILITY_DEMO=0`**, load the same three constituencies and MPs via admin APIs:

| File | Use |
|------|-----|
| [`prisma/data/constituencies.starter.csv`](../prisma/data/constituencies.starter.csv) | `POST /api/admin/constituencies/import` **first** |
| [`prisma/data/parliament-members.starter.csv`](../prisma/data/parliament-members.starter.csv) | Then `POST /api/admin/parliament-members/import` (optional dry-run reconcile before) |

Vitest **`starter-data-csv.test.ts`** asserts both files stay parse-valid.

**Bulk MP CSV (recommended):** install **ghanamps**, then from the repo root:

```bash
npm run data:pull-mps
```

Writes **`prisma/data/generated/parliament-members.bulk.csv`** (not committed — see `prisma/data/generated/.gitignore`). Equivalent manual path: `ghanamps members > mps.json` → `npm run data:members-csv -- mps.json > full.csv` → merge starter if needed (`npm run data:merge-csv -- parliament full.csv`).

**Merge starter into bulk (dedupe by slug):** After generating `full.csv`, ensure the three starter MPs (or starter constituencies) appear even if ghanamps normalisation used different slugs — or simply append any missing starter rows:

```bash
npx tsx scripts/merge-data-csv.ts parliament full.csv > full-with-starter.csv
npx tsx scripts/merge-data-csv.ts constituency constituencies.csv > constituencies-with-starter.csv
```

Logic lives in `src/lib/merge-starter-csv.ts` (Vitest: `merge-starter-csv.test.ts`). Base file column order must match import format; starter rows with a `slug` already in the base file are skipped.

**Note:** CSV import loads **constituencies and MPs only**. Manifesto rows, `CampaignPromise` themes, and the report-card pilot cycle still come from **`prisma db seed`** when the accountability starter runs (default). If you always use **`SEED_ACCOUNTABILITY_DEMO=0`**, add promises and cycles via **admin** or run a one-off seed without that flag to hydrate editorial content, then lock the env for future deploys.

---

## 2. Constituencies (required before MP CSV)

The importer **does not** create `Constituency` rows. You need **`slug`** values that match the CSV `constituency_slug` column (same slug rules as `normalizeSlug` in `src/lib/parliament-csv-parse.ts`).

| Source | Use |
|--------|-----|
| **[Wikipedia — List of parliamentary constituencies of Ghana](https://en.wikipedia.org/wiki/List_of_parliamentary_constituencies_of_Ghana)** | **Reference** for names and counts; Ghana moved from **275** toward **276** seats (e.g. Guan). **Cross-check** with **Electoral Commission** materials before production. |
| **[Electoral Commission of Ghana](https://ec.gov.gh/)** | **Authority** for boundary and constituency changes; use for **sign-off**, not necessarily machine export. |
| **[233/ec (GitHub)](https://github.com/233/ec)** | Polling-station–level CSVs by region (e.g. `data/Ashanti.csv`). Columns are **region / area / …** — useful for **geography**, but **not** a drop-in substitute for parliamentary `Constituency` rows without editorial mapping. |

**Workflow:** Build a **constituency master list** (name → `slug` → `region`), load via **`POST /api/admin/constituencies/import`** (CSV: `name,slug,region_slug,code`), migration, or seed — then **dry-run** `POST /api/admin/parliament-members/reconcile` before **`POST /api/admin/parliament-members/import`**. See [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md).

---

## 3. Tracked commitments & party manifestos (2024 cycle and beyond)

- **Party manifestos** are **party publications**, usually **copyrighted**. Do **not** bulk-copy full PDF text into the database without **permission** or a **clear fair-use / citation** policy from counsel.
- **Production-ready approach:** Obtain the **official PDF or web version** from the **party or coalition**, then **manually** (or with licensed tooling) extract **short, cited** promise lines into **`CampaignPromise`** with **`sourceLabel`** (e.g. “NDC 2024 manifesto, p. 42, education”).
- **Web search** alone is not a source of truth; treat search results as **leads** only until verified against an **official** document.

### 3.1 Official-style publication entry points (verify before import)

Use these only as **starting points** to download or cite the **same document** the party published. **Who governs** after an election is a matter of public record (EC results + inauguration); **which manifesto you track as “government programme”** should follow your **editorial policy** (usually the winning presidential party’s published manifesto for that cycle, plus opposition manifestos if you track comparative promises).

| Party / document (2024 general election context) | Typical host (verify freshness) | Notes |
|--------------------------------------------------|---------------------------------|--------|
| **NPP 2024** — full / highlights PDFs | e.g. party / campaign sites hosting `2024_NPP_Manifesto_Full.pdf`, highlights PDFs | **Copyright:** party material; cite pages/sections in `sourceLabel`; link out where permitted. |
| **NDC 2024** — manifesto (e.g. “Resetting Ghana”) | Official campaign / party file hosts; third-party mirrors (e.g. news CDNs) **only** if checksum matches party original | Track as **opposition** or **comparative** dataset if you publish multi-party promise dashboards. |

**Non-partisan analysis (secondary):** Organisations such as **ACEP**, **Verité Research**, and academic papers may **summarise** manifestos — use them for **research**, not as a substitute for **primary** citations on your `CampaignPromise` rows.

### 3.2 “Governing government” — tracked commitments (how MBKRU fits)

1. **Roster truth:** Who is an MP → **Parliament of Ghana** directory ([members](https://www.parliament.gh/members)) + your imported `ParliamentMember` rows.  
2. **Promise truth:** What was promised → **manifesto excerpts** you have rights to cite, stored as **`CampaignPromise`** with `sourceLabel`, `sourceDate`, `status` (TRACKING → FULFILLED / BROKEN / etc.).  
3. **Performance narrative:** People’s Report Card / scorecards → **MBKRU editorial** methodology on `/methodology`, not raw scrapes.  
4. **Citizen evidence:** **MBKRU Voice** and situational reports are **citizen submissions**, triaged by staff — they support advocacy and journalism-style accountability; they are **not** the Electoral Commission or a court.

---

## 4. Report card / performance metrics

- **Scorecard entries** are **MBKRU editorial** products: methodology on **`/methodology`** when deployed, plus internal evidence trails.
- **Do not** present scraped or unverified numbers as official government performance without sourcing and legal review.

---

## 5. Recommended production checklist

1. Freeze **constituency** list + slugs with **EC-aligned** sign-off.  
2. Import MPs from **JSON → CSV** script, then **verify random sample** on parliament.gh.  
3. Enter **promises** with **sourceLabel**; link out to official manifesto PDFs where allowed.  
4. Publish **report card** cycles only after methodology and comms approval.  
5. Log **data provenance** and update dates in release notes or internal wiki.

**See also:** [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) · [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) · [`PARTNER_API.md`](./PARTNER_API.md)
