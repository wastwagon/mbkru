#!/usr/bin/env node
/**
 * Exit 0 when GET /api/health returns 200 with status ok or degraded; exit 1 otherwise.
 * Use in cron, Coolify health hooks, or CI smoke against a deployed URL.
 *
 *   node scripts/monitor-health.mjs https://your.host/api/health
 *   HEALTHCHECK_URL=https://your.host/api/health node scripts/monitor-health.mjs
 */
const url =
  process.argv[2]?.trim() ||
  process.env.HEALTHCHECK_URL?.trim() ||
  `${(process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "")}/api/health`;

async function main() {
  let res;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    console.error(`[monitor-health] fetch failed: ${url}`, e?.message ?? e);
    process.exit(1);
  }

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    console.error(`[monitor-health] non-JSON response HTTP ${res.status}: ${text.slice(0, 200)}`);
    process.exit(1);
  }

  if (res.status !== 200) {
    console.error(`[monitor-health] HTTP ${res.status}`, body);
    process.exit(1);
  }

  const st = body.status;
  if (st !== "ok" && st !== "degraded") {
    console.error(`[monitor-health] unhealthy payload:`, body);
    process.exit(1);
  }

  console.log(`[monitor-health] OK (${st})`, url);
}

await main();
