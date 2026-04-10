# Parliament roster CSV import — operator runbook

**Where:** Admin **`/admin/parliament`** — **constituency** CSV (if needed), **dry-run reconcile**, then **MP import**.

| Action | Endpoint |
|--------|----------|
| Upsert constituencies | **`POST /api/admin/constituencies/import`** (multipart `file`) |
| Compare CSV vs DB (no writes) | **`POST /api/admin/parliament-members/reconcile`** |
| Apply MP roster | **`POST /api/admin/parliament-members/import`** |

**Code:** MP parser in `src/lib/parliament-csv-parse.ts` (tests: `parliament-csv-parse.test.ts`); server re-export in `src/lib/server/parliament-csv.ts`. Constituency parser: `src/lib/constituency-csv-parse.ts`. Reconcile logic: `src/lib/parliament-reconcile.ts`.

**Real-world roster sources & manifesto rights:** [`docs/DATA_SOURCES.md`](./DATA_SOURCES.md). **Bulk constituencies (Wikipedia API):** `npm run data:pull-constituencies` → `prisma/data/generated/constituencies.wikipedia.csv` (CC BY-SA — verify against EC). **Bulk MP file (local ghanamps):** `npm run data:pull-mps` → `prisma/data/generated/parliament-members.bulk.csv`. **JSON → CSV:** `npm run data:members-csv -- path/to/members.json > import.csv`. **Merge starter rows** (dedupe by slug): `npm run data:merge-csv -- parliament import.csv > merged.csv`.

---

## 1. Prerequisites

1. **`Constituency` rows must already exist** in Postgres with **`slug`** values matching the MP CSV. Unknown `constituency_slug` values produce **row errors** on import/reconcile.
2. **Regions** are seeded by default (`prisma/seed.mjs`). Load constituencies with **`POST /api/admin/constituencies/import`** (see §2), a migration, or SQL.
3. **Starter seed:** Default `npx prisma db seed` adds three sample MPs (verify on parliament.gh) and manifesto-linked promise themes. Use **`SEED_ACCOUNTABILITY_DEMO=0`** for CSV-only loads; then import **`prisma/data/constituencies.starter.csv`**, then **`prisma/data/parliament-members.starter.csv`** (same three MPs — see [`DATA_SOURCES.md`](./DATA_SOURCES.md)).
4. **Example constituency file:** `prisma/data/constituencies.example.csv` (format only; extend with your EC-aligned master list).

---

## 2. Constituency CSV format

- **Header (exact):** `name,slug,region_slug,code`
- **`region_slug`:** must match `Region.slug` (e.g. `greater-accra`, `ashanti`).
- **`code`:** optional EC/reference code; may be empty.
- **Max size:** 2 MB.

---

## 3. MP roster CSV format

- **Encoding:** UTF-8.
- **Max size:** **2 MB** (see import route).
- **Header row (exact order, lowercase):**

```text
name,slug,role,party,constituency_slug,active
```

| Column | Required | Notes |
|--------|----------|--------|
| `name` | Yes | Display name |
| `slug` | Yes | URL-safe; normalized to lowercase, hyphens |
| `role` | Yes | e.g. `MP` |
| `party` | No | Empty allowed |
| `constituency_slug` | No | Must match existing `Constituency.slug` if set |
| `active` | Yes | `true` / `false` / `0` / `no` / empty → treated as documented in `parseActive` |

---

## 4. Dry-run workflow (recommended)

1. Copy **production** or **staging** schema to a **local** or **throwaway** database (never experiment on prod).
2. **Import constituencies** first if slugs are missing (or use demo seed).
3. Upload the same MP file you plan to import to **Dry-run reconcile** on **`/admin/parliament`**. Review `wouldCreate`, `wouldUpdate`, `inDatabaseNotInCsv`, and `rowErrors` in the JSON (unknown constituencies, duplicate slugs in file).
4. **Import** a small MP CSV (2–3 rows) and confirm **`/admin/parliament`**, **`/promises`**, and **`GET /api/mps`**.
5. Fix header/row errors from JSON responses; repeat on **staging** with a full file; then **production** during a low-traffic window.

**Reconciliation cadence:** After each bulk roster refresh (e.g. quarterly vs parliament.gh), run reconcile against the new export before applying import.

---

## 5. After import

- **Cache:** Import already calls **`revalidateTag`** for roster and promise-related tags; public pages should update within TTL even without redeploy.
- **Accuracy:** Parliament data is **your editorial responsibility**; align with legal/comms before publishing claims.

**See also:** [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) · [`PARTNER_API.md`](./PARTNER_API.md)
