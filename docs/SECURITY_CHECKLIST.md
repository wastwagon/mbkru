# Security checklist — MBKRU (living)

Use for **releases** and **quarterly** review; not a substitute for a professional penetration test.

## Authentication & sessions

- [ ] **Admin** and **member** session secrets are **≥32** random bytes in production and **rotated** after any leak.
- [ ] **Admin** and **member** secrets are **different** values.
- [ ] **Redis** used in production when you need **server-side session revoke** (`jti`) for members.
- [ ] **`httpOnly`**, **`secure`** (prod), **`sameSite=lax`** on session cookies — verify in browser DevTools.

## Admin surface

- [ ] Admin routes require **valid JWT** (proxy + server actions / `getAdminSession`).
- [ ] **Rate limit** on **`/api/admin/login`** (in place via `allowPublicFormRequest`; Vitest covers 429 path in `src/app/api/admin/login/route.test.ts`).
- [ ] **Rate limit** heavy admin **GET** aggregates — citizen-report JSON + CSV export and petition-pending JSON use `allowAdminSessionRequest` per admin (`RATE_LIMIT_*` window shared with public forms).
- [ ] **File uploads** (media, report attachments) respect size/MIME limits — see `report-attachment-limits` and admin media route.

## Public APIs

- [ ] **Turnstile** enabled in production for public POSTs when bots are a concern.
- [ ] **Rate limits** on contact, auth, reports, and partner read routes — Redis-backed in multi-instance deploys.
- [ ] **`/api/geo/reverse`** uses a **stricter bucket** (`allowGeoReverseRequest`; env `RATE_LIMIT_GEO_REVERSE_*`) so Nominatim is not abused.
- [ ] **Member self-service:** `/api/account/data-export` and `/api/account/delete` (rate-limited; deletion blocked if the member authored petitions — `onDelete: Restrict`).
- [ ] **Regional + community presence:** `/api/regions/*/hub` and **`/api/communities/*/presence`** expose **member display names** only when the viewer is **signed in** (`peerDetailsVisible`). **Aggregate online counts** for guests follow **`MBKRU_PRESENCE_COUNTS_PUBLIC`** when set, else **`MBKRU_REGION_PRESENCE_COUNTS_PUBLIC`** (default: visible); set to `0` / `false` / `no` to hide counts from guests only.
- [ ] **Optional** production stderr JSON errors: set `MBKRU_STRUCTURED_ERRORS=1` if your host aggregates logs.
- [ ] **Zod** validation on JSON bodies; no raw SQL from user input (Prisma parameterized queries).

## Dependencies

- [ ] **`npm audit`** reviewed; **Prisma** major upgrades tracked — [`PRISMA7_NOTES.md`](./PRISMA7_NOTES.md).

## Headers

- [ ] Security headers from **`next.config.ts`** still present after Next upgrades (CSP evolution if you add third-party scripts).

**See also:** [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
