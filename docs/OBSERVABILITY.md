# Observability — practical notes for MBKRU

**Goal:** Enough signal to detect abuse, outages, and regressions without over-building before scale.

## Today (in-repo)

- **`GET /api/health`** — JSON for load balancers; includes Postgres/Redis probe results, build-time accountability flags, and **`deployment`** hints (`publicSiteUrlHttps`, `openAiVoiceConfigured`, etc.).
- **`npm run ops:monitor-health`** — curls `/api/health` (pass URL as argv or set `HEALTHCHECK_URL`); exits **1** if the service is unhealthy or unreachable (cron-friendly).
- **GitHub Actions CI** — `lint`, `vitest`, `prisma validate`, `next build`.
- **Server logs** — Next.js / Node `console` output on stdout (Docker / Coolify captures this).

## Recommended next steps (no code required to adopt)

1. **Log retention:** Point container logs at your host’s central store (e.g. Loki, CloudWatch, Datadog) with **30–90 day** retention for security incidents.
2. **Alerts:** Pager / Slack when **`/api/health`** returns **503** repeatedly or **5xx** rate spikes on `/api/*`.
3. **Form abuse:** Track **429** rates per route (`contact`, `reports`, `auth/login`) in your reverse proxy metrics; sudden jumps often mean bot traffic or misconfigured clients.

## Optional product additions (when you need them)

- **Sentry** (or similar) for uncaught server exceptions — add DSN via env; exclude PII in breadcrumbs.
- **Structured JSON logs** — replace ad-hoc `console.error` in critical API routes with one small logger helper (`{ level, route, message, requestId }`) if log volume grows.

## What not to log

- Raw **passwords**, full **JWTs**, or **Turnstile** secrets.
- Entire **report bodies** or **attachments** in application logs — use report IDs only.

**See also:** [`OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
