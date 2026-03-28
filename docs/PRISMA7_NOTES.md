# Prisma 7 upgrade — spike checklist

**Why:** Stay current with Prisma releases and clear **`npm audit`** findings tied to the `effect` / `@prisma/config` chain when you are ready (not a same-day chore).

**Before you start**

- [ ] Read [Prisma upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides) for your target major.
- [ ] Branch / backup production database; run full test suite + `npm run build` on current Prisma 6 baseline.

**During spike (local)**

- [ ] Bump `prisma` and `@prisma/client` together to the same version.
- [ ] Run `npx prisma validate` and `npx prisma generate`; fix schema or config breaks.
- [ ] Confirm `prisma.config.ts` still matches [Prisma config reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference) for that version.
- [ ] Run migrations against a **copy** of prod schema (`prisma migrate deploy` or diff).
- [ ] Exercise: admin login, `POST` a report, CSV import, `GET /api/health`.

**Deploy**

- [ ] Rebuild Docker image; run `migrate deploy` in entrypoint as today.
- [ ] Monitor first deploy for query errors and connection pool behaviour.

**Docs to update after upgrade:** `ARCHITECTURE.md`, `PHASE_TASKS.md` (cross-cutting row), this file’s status line below.

**Status:** *Not upgraded in-repo yet — spike TBD.*
