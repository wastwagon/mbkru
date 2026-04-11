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
- [ ] **Zod** validation on JSON bodies; no raw SQL from user input (Prisma parameterized queries).

## Dependencies

- [ ] **`npm audit`** reviewed; **Prisma** major upgrades tracked — [`PRISMA7_NOTES.md`](./PRISMA7_NOTES.md).

## Headers

- [ ] Security headers from **`next.config.ts`** still present after Next upgrades (CSP evolution if you add third-party scripts).

**See also:** [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
