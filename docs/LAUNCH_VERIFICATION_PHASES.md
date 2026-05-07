# Launch Verification Phases

Structured sign-off plan for admin linking, user dashboard linking, API contracts, and DB-backed feature integrity.

## Phase 1 — Automated linkage and route health

- [ ] Run `npm run verify:release-gates`
- [ ] Run `npm run test:e2e:smoke`
- [ ] Run `npm run test:e2e:dashboards`
- [ ] Confirm all admin dashboard links return non-5xx (200/3xx/401 allowed)
- [ ] Confirm all user account/dashboard links return non-5xx (200/3xx/401 allowed)

## Phase 2 — API/DB contract consistency

- [ ] Validate critical JSON contracts:
  - `GET /api/health`
  - `GET /api/reports/track/:code`
  - `POST /api/admin/notifications/retry` (auth + 429 + success)
- [ ] Confirm outbox/audit migrations applied in target environment.
- [ ] Confirm admin pages consuming new tables render without schema errors:
  - `/admin/notifications`
  - `/admin/operational-audit`

## Phase 3 — Manual role walkthrough

- [ ] Admin walkthrough:
  - login, dashboard links, reports queue, outbox retry/reset, operational audit view
- [ ] Member walkthrough:
  - login, `/account`, `/account/reports`, `/account/notifications`
- [ ] Anonymous walkthrough:
  - homepage, report submit, track report, public accountability pages

## Phase 4 — Production operations sign-off

- [ ] Cron jobs configured and tested:
  - `/api/cron/cleanup-petition-pending`
  - `/api/cron/notifications-outbox`
- [ ] Backup + restore verification executed
- [ ] Malware scanning mode verified per environment policy
- [ ] Notification failure queue and operational audit reviewed post-test

## Exit criteria

- [ ] No P0/P1 failures in phases 1-4
- [ ] All launch blockers resolved or formally accepted
- [ ] Go/No-Go decision recorded by owners
