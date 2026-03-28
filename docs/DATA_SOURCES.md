# Public data sources — parliament, constituencies, manifestos

**Purpose:** Point operators and editors to **real-world** sources for seeding **`Constituency`**, **`ParliamentMember`**, **`CampaignPromise`**, and report-card content. MBKRU remains **editorially responsible** for accuracy, non-partisan framing, and rights to republish.

**Import path:** Constituencies first → CSV MP import per [`CSV_IMPORT_RUNBOOK.md`](./CSV_IMPORT_RUNBOOK.md) → promises and scorecards in **admin** (with `sourceLabel` citations).

---

## 1. Members of Parliament (roster)

| Source | What it offers | Caveats |
|--------|----------------|---------|
| **[Parliament of Ghana](https://www.parliament.gh/)** | Official MP profiles, photos, party, constituency | **Canonical** for who sits in Parliament; no single “download all” API documented here — use for **verification** after bulk import. |
| **[ghanamps](https://github.com/yeboahnanaosei/ghanamps)** (community CLI) | `ghanamps members` → JSON array with `name`, `party`, `constituency`, `region`, `photo`, `profile` | **Third-party aggregator**; always **spot-check** against parliament.gh. Photos/profile URLs often point at **parliament.gh** — respect their **terms** and **hotlinking** policy before using images in production. |
| **[ghanamps.com](https://ghanamps.com/)** | Browse 9th Parliament (2025–2029) and filters | Same verification rule as CLI; site is a convenience, not a legal record. |
| **[openAFRICA — Members of Parliament Ghana](https://open.africa/dataset/members-of-parliament-ghana)** | Historical dataset | Often **stale** (e.g. pre-2012 snapshots); use only with date checks, not as current roster. |

**This repo:** Run `npm run data:members-csv -- path/to/members.json > import.csv` to convert **ghanamps-style JSON** into the CSV format expected by **`POST /api/admin/parliament-members/import`**. See `scripts/json-members-to-mbkru-csv.mjs`.

---

## 2. Constituencies (required before MP CSV)

The importer **does not** create `Constituency` rows. You need **`slug`** values that match the CSV `constituency_slug` column (same slug rules as `normalizeSlug` in `src/lib/parliament-csv-parse.ts`).

| Source | Use |
|--------|-----|
| **[Wikipedia — List of parliamentary constituencies of Ghana](https://en.wikipedia.org/wiki/List_of_parliamentary_constituencies_of_Ghana)** | **Reference** for names and counts; Ghana moved from **275** toward **276** seats (e.g. Guan). **Cross-check** with **Electoral Commission** materials before production. |
| **[Electoral Commission of Ghana](https://ec.gov.gh/)** | **Authority** for boundary and constituency changes; use for **sign-off**, not necessarily machine export. |
| **[233/ec (GitHub)](https://github.com/233/ec)** | Polling-station–level CSVs by region (e.g. `data/Ashanti.csv`). Columns are **region / area / …** — useful for **geography**, but **not** a drop-in substitute for parliamentary `Constituency` rows without editorial mapping. |

**Workflow:** Build a **constituency master list** (name → `slug` → `regionId`), load via migration/seed/SQL once, then import MPs.

---

## 3. Campaign promises & party manifestos (e.g. NDC)

- **Party manifestos** (including **NDC**) are **party publications**, usually **copyrighted**. Do **not** bulk-copy full PDF text into the database without **permission** or a **clear fair-use / citation** policy from counsel.
- **Production-ready approach:** Obtain the **official PDF or web version** from the **party or coalition**, then **manually** (or with licensed tooling) extract **short, cited** promise lines into **`CampaignPromise`** with **`sourceLabel`** (e.g. “NDC 2024 manifesto, p. 42, education”).
- **Web search** alone is not a source of truth; treat search results as **leads** only until verified against an **official** document.

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
