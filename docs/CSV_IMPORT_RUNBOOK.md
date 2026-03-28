# Parliament roster CSV import — operator runbook

**Where:** Admin **`/admin/parliament`** → upload CSV → **`POST /api/admin/parliament-members/import`**.

**Code:** Column contract in `src/lib/server/parliament-csv.ts` (`parseParliamentMembersCsv`).

---

## 1. Prerequisites

1. **`Constituency` rows must already exist** in Postgres with **`slug`** values matching the CSV. The importer does **not** create constituencies; unknown `constituency_slug` values produce **row errors** and skip that row.
2. **Regions** are seeded by default (`prisma/seed.mjs`). Add constituencies via migration, admin tooling, or direct SQL/Prisma as your process allows.
3. **Local demo:** `SEED_ACCOUNTABILITY_DEMO=1 npx prisma db seed` creates fictional constituencies (`demo-constituency-accra-north`, `demo-constituency-kumasi-east`) and demo MPs — useful for UI tests without real electoral data.

---

## 2. CSV format

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

## 3. Dry-run workflow (recommended)

1. Copy **production** or **staging** schema to a **local** or **throwaway** database (never experiment on prod).
2. Ensure constituencies are loaded for the slugs you will use.
3. Import a **small CSV** (2–3 rows) and confirm **`/admin/parliament`**, **`/promises`**, and **`GET /api/mps`** look correct.
4. Fix header/row errors from the JSON response (`error` or per-row messages).
5. Repeat on **staging** with a full file; then schedule **production** import during a low-traffic window.

---

## 4. After import

- **Cache:** Import already calls **`revalidateTag`** for roster and promise-related tags; public pages should update within TTL even without redeploy.
- **Accuracy:** Parliament data is **your editorial responsibility**; align with legal/comms before publishing claims.

**See also:** [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) · [`PARTNER_API.md`](./PARTNER_API.md)
