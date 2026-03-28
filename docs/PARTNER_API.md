# Partner & embed API — draft terms and technical notes

**Status:** Draft for **comms and legal review** before external distribution. The JSON routes below are **read-only**, **rate-limited**, and **cached** at the edge per `Cache-Control` headers.

**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · accountability cache tags in `src/lib/accountability-tags.ts` · handler tests in `src/app/api/**/route.test.ts`

---

## 1. Public JSON endpoints (current)

| Method | Path | Phase gate | Purpose |
|--------|------|------------|---------|
| `GET` | `/api/mps` | `NEXT_PUBLIC_PLATFORM_PHASE` ≥ 2 + `parliamentTrackerData` | Active MP/minister roster (summary + promise counts) |
| `GET` | `/api/promises` | Same | Campaign promises; optional `?memberSlug=` filter |
| `GET` | `/api/report-card/[year]` | Phase ≥ 3 + `accountabilityScorecards` | Published People’s Report Card cycle (404 if unpublished / missing) |
| `GET` | `/api/export/mps-csv` | Same gates as `/api/mps` | **CSV** roster (`slug`, `name`, `role`, `party`, `constituency_name`, `promise_count`); UTF-8 BOM for Excel; rate-limited like JSON |
| `GET` | `/api/export/promises-csv` | Same gates as `/api/promises` | **CSV** promises (full export, no 50-row JSON cap); optional `?memberSlug=`; UTF-8 BOM; separate rate bucket `promises-export-csv` |

**Health:** `GET /api/health` includes `accountability.parliamentJson` and `accountability.reportCardJson` flags for build-time capability checks (not a data export).

---

## 2. Caching and freshness

- Successful responses use **shared cache** directives suitable for CDNs (`s-maxage` where configured — see `accountabilityPublicCacheControl()` in code).
- **404** responses for accountability APIs use a **shorter** cache policy so missing years or disabled features do not stick incorrectly (`accountabilityApiNotFoundCacheControl()`).
- Admin publish/update flows should call **`revalidateTag`** (already wired) so partners see updates without waiting for full TTL where applicable.

Partners should **respect `Cache-Control`** and not hammer origin; expect **429** when rate limits apply.

---

## 3. Attribution and use (draft — not legal advice)

- **Attribute** MBKRU as the source when displaying derived tables, charts, or excerpts.
- **Do not** imply endorsement by MBKRU, Parliament, or government bodies.
- **Accuracy:** Datasets are compiled for **civic accountability**; partners should surface **methodology** and **update dates** (JSON includes timestamps / labels where applicable).
- **No warranty:** Data is provided **as-is**; MBKRU may correct or withdraw published entries subject to editorial and legal review.

Final **Terms of Use** for embeds should be signed off by counsel and published on the public site when the partner programme launches.

---

## 4. API versioning (recommended next step)

There is **no version segment in the URL** today (`/api/mps`, not `/api/v1/mps`). Before breaking changes:

1. Prefer **`Accept`** negotiation, e.g. `Accept: application/vnd.mbkru+json; version=1`, **or**
2. Introduce **`/api/v1/...`** aliases alongside legacy paths for a deprecation window.

Document any change in this file and in release notes; bump Vitest route tests when handlers split.

---

## 5. Operational contacts

Partner onboarding (keys if ever required, traffic expectations, attribution assets): use the public **Contact** page with enquiry type **Partnership** until a dedicated partners inbox exists.
