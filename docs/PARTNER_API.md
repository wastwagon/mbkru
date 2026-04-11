# Partner & embed API — draft terms and technical notes

**Status:** Draft for **comms and legal review** before external distribution. The JSON routes below are **read-only**, **rate-limited**, and **cached** at the edge per `Cache-Control` headers.

**Public summary (Phase 2+ builds):** on-site page **`/partner-api`** (same gates as the JSON handlers via `partnerJsonProgramme`).

**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · accountability cache tags in `src/lib/accountability-tags.ts` · handler tests in `src/app/api/**/route.test.ts`

---

## 1. Public JSON endpoints (current)

| Method | Path | Phase gate | Purpose |
|--------|------|------------|---------|
| `GET` | `/api/mps` | `NEXT_PUBLIC_PLATFORM_PHASE` ≥ 2 + `parliamentTrackerData` | Active MP/minister roster (summary + promise counts) |
| `GET` | `/api/promises` | Same | Campaign promises; see **§1.1** for query filters |
| `GET` | `/api/report-card/[year]` | Phase ≥ 2 + `publicReportCard` | Published People’s Report Card cycle (404 if unpublished / missing) |
| `GET` | `/api/export/mps-csv` | Same gates as `/api/mps` | **CSV** roster (`slug`, `name`, `role`, `party`, `constituency_name`, `promise_count`); UTF-8 BOM for Excel; rate-limited like JSON |
| `GET` | `/api/export/promises-csv` | Same gates as `/api/promises` | **CSV** promises (full export, no 50-row JSON cap); optional `?memberSlug=`; UTF-8 BOM; separate rate bucket `promises-export-csv` |

**Health:** `GET /api/health` includes `accountability.parliamentJson` and `accountability.reportCardJson` flags for build-time capability checks (not a data export).

### 1.1 `GET /api/promises` query parameters

| Parameter | Example | Effect |
|-----------|---------|--------|
| `memberSlug` | `?memberSlug=jane-doe` | Promises for that active MP (slug, lowercased) |
| `partySlug` | `?partySlug=ndc` | Filter by `partySlug` on the promise row |
| `electionCycle` | `?electionCycle=2024` | Filter by election cycle tag |
| `governmentOnly` | `?governmentOnly=true` or `1` | Only rows with `isGovernmentProgramme` |
| `policySector` | `?policySector=FISCAL` | One of: `FISCAL`, `GOVERNANCE`, `HEALTH`, `EDUCATION`, `INFRASTRUCTURE`, `ENERGY`, `AGRICULTURE`, `SOCIAL`, `OTHER` |
| `status` | `?status=IN_PROGRESS` | One of: `TRACKING`, `IN_PROGRESS`, `FULFILLED`, `BROKEN`, `DEFERRED` |

JSON responses are capped (50 rows by default, 100 when `memberSlug` is set); use **`GET /api/export/promises-csv`** for full exports with the same filters (`policy_sector` and other columns included).

**Public HTML:** `/promises/browse` on the site mirrors these filters for end users.

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

Final **Terms of Use** for embeds should be signed off by counsel; the public **`/partner-api`** page is the programme-facing summary until contractual terms are attached to MOUs or separate agreements.

---

## 4. API versioning (recommended next step)

There is **no version segment in the URL** today (`/api/mps`, not `/api/v1/mps`). Before breaking changes:

1. Prefer **`Accept`** negotiation, e.g. `Accept: application/vnd.mbkru+json; version=1`, **or**
2. Introduce **`/api/v1/...`** aliases alongside legacy paths for a deprecation window.

Document any change in this file and in release notes; bump Vitest route tests when handlers split.

---

## 5. Operational contacts

Partner onboarding (keys if ever required, traffic expectations, attribution assets): use the public **Contact** page with enquiry type **Partnership** until a dedicated partners inbox exists.
