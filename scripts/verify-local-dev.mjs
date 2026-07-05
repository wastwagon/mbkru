#!/usr/bin/env node
/**
 * Full local verification: automated release gates + Playwright smoke/dashboards.
 *
 * Prerequisites:
 *   npm run setup:local   (creates .env, Docker Postgres/Redis, migrate, seed)
 *
 * Usage:
 *   npm run verify:local
 *   npm run verify:local -- --skip-e2e   (unit/tsc only — faster)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const skipE2e = process.argv.includes("--skip-e2e");

function run(label, command, args, extra = {}) {
  console.log(`\n▶ ${label}\n`);
  const r = spawnSync(command, args, {
    stdio: "inherit",
    cwd: root,
    shell: process.platform === "win32",
    ...extra,
  });
  const code = r.status ?? (r.signal ? 1 : 0);
  if (code !== 0) {
    console.error(`\n✖ ${label} failed (exit ${code})\n`);
    process.exit(code);
  }
}

function dockerPostgresReady() {
  const r = spawnSync(
    "docker",
    ["compose", "exec", "-T", "postgres", "pg_isready", "-U", "mbkru", "-d", "mbkru"],
    { cwd: root, encoding: "utf8" },
  );
  return r.status === 0;
}

function ensurePlaywrightChromium() {
  const probe = spawnSync("npx", ["playwright", "install", "--dry-run", "chromium"], {
    cwd: root,
    encoding: "utf8",
  });
  const out = `${probe.stdout ?? ""}${probe.stderr ?? ""}`;
  if (/already installed|is already downloaded/i.test(out)) return;
  console.log("\n▶ Playwright Chromium (first-time download)\n");
  run("Playwright install chromium", "npx", ["playwright", "install", "chromium"]);
}

function main() {
  console.log("\n=== MBKRU local verification ===\n");

  if (!fs.existsSync(envPath)) {
    console.error("Missing .env — run: npm run setup:local\n");
    process.exit(1);
  }

  dotenv.config({ path: envPath, override: true, quiet: true });

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is unset in .env\n");
    process.exit(1);
  }

  if (!dockerPostgresReady()) {
    console.warn("⚠ Postgres container not ready — starting docker compose…");
    const up = spawnSync("docker", ["compose", "up", "-d", "postgres", "redis"], {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (up.status !== 0) {
      if (skipE2e) {
        console.warn(
          "⚠ Docker unavailable — continuing with unit tests only. Start Docker and run `npm run setup:local` for full DB-backed local dev.\n",
        );
      } else {
        console.error(
          "Postgres is required for full local verification. Start Docker Desktop, then: npm run setup:local\n",
        );
        process.exit(1);
      }
    } else {
      let ready = false;
      for (let i = 0; i < 30; i++) {
        if (dockerPostgresReady()) {
          ready = true;
          break;
        }
        spawnSync("sleep", ["1"]);
      }
      if (!ready) {
        console.error("Postgres did not become ready. Run: npm run setup:local\n");
        process.exit(1);
      }
    }
  }

  console.log("Environment checks:");
  console.log(`  DATABASE_URL        ${process.env.DATABASE_URL.includes("55432") ? "✓ Docker host port" : "✓ set"}`);
  console.log(`  MEMBER_SESSION      ${process.env.MEMBER_SESSION_SECRET ? "✓ set" : "✗ missing (Phase 2+ needs this)"}`);
  console.log(`  HUBTEL_GHANA_CARD   ${process.env.HUBTEL_GHANA_CARD_MOCK === "1" ? "✓ mock mode (local)" : process.env.HUBTEL_CLIENT_ID ? "✓ real Hubtel" : "○ not configured (MP verify blocked)"}`);
  console.log(`  SMS                 ${process.env.SMS_PROVIDER || "none (ok locally)"}`);
  console.log(`  RESEND              ${process.env.RESEND_API_KEY ? "✓ configured" : "○ skipped (forms save to DB)"}`);
  console.log(`  OPENAI (Voice chat) ${process.env.OPENAI_API_KEY ? "✓ configured" : "○ skipped (chat 503)"}`);

  run("Release gates (Prisma + tsc + Vitest)", "npm", ["run", "verify:release-gates"]);

  if (!skipE2e) {
    ensurePlaywrightChromium();
    run("E2E smoke", "npm", ["run", "test:e2e:smoke"]);
    run("E2E dashboards", "npm", ["run", "test:e2e:dashboards"]);
  } else {
    console.log("\n⏭ Skipping Playwright (--skip-e2e)\n");
  }

  console.log(`
=== Local verification passed ===

  Dev server:     npm run dev  →  http://localhost:1100
  Admin login:    http://localhost:1100/admin/login
  Pilot member:   pilot.member@mbkru.local / PilotMember!change-me-2026

  Ghana Card mock (local only): card GHA-000000000-0 + any legal name on /account

  Pending real API integrations (expected locally):
    • Hubtel production credentials
    • Resend email delivery
    • Twilio SMS
    • OpenAI / Tavily (Voice chat)
    • Mailchimp / ConvertKit (newsletter ESP)
    • Cloudflare Turnstile (optional bot protection)

  Gap inventory: docs/LOCAL_DEV_GAPS.md
`);
}

main();
