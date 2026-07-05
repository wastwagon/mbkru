#!/usr/bin/env node
/**
 * Fully automated local setup (no manual .env editing required):
 * 1. Create .env from .env.example with random session secrets + dev admin password (if .env missing)
 * 2. docker compose up -d postgres redis
 * 3. Wait for Postgres
 * 4. npm install
 * 5. prisma migrate deploy
 * 6. prisma db seed (accountability starter + SEED_MEMBER_DEMO for local dev)
 *
 * Usage: npm run setup:local  ·  Windows CMD: scripts\\setup-local.cmd
 */
import { execSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

function randomSecret() {
  return crypto.randomBytes(40).toString("base64url");
}

/** Enable local testing without Hubtel, Twilio, or Resend credentials. */
function ensureLocalDevMocks(content) {
  const block = [
    "",
    "# --- Local dev mocks (setup-local.mjs — not for production) ---",
    "HUBTEL_GHANA_CARD_MOCK=1",
    "SMS_PROVIDER=log",
    `CRON_SECRET=${randomSecret()}`,
  ];
  let out = content.replace(/\r\n/g, "\n");
  if (!/^HUBTEL_GHANA_CARD_MOCK=/m.test(out)) out += `${block[0]}${block[1]}\n${block[2]}\n`;
  if (!/^SMS_PROVIDER=/m.test(out)) out += `${block[3]}\n`;
  if (!/^CRON_SECRET=/m.test(out)) out += `${block[4]}\n`;
  return out.endsWith("\n") ? out : `${out}\n`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function run(cmd, opts = {}) {
  execSync(cmd, { cwd: root, stdio: "inherit", ...opts });
}

function dockerPostgresReady() {
  const r = spawnSync(
    "docker",
    ["compose", "exec", "-T", "postgres", "pg_isready", "-U", "mbkru", "-d", "mbkru"],
    { cwd: root, encoding: "utf8" },
  );
  return r.status === 0;
}

async function main() {
  console.log("\n=== MBKRU local setup ===\n");

  if (!fs.existsSync(examplePath)) {
    console.error("Missing .env.example");
    process.exit(1);
  }

  if (!fs.existsSync(envPath)) {
    let content = fs.readFileSync(examplePath, "utf8");
    content = content.replace(/^ADMIN_SESSION_SECRET=.*$/m, `ADMIN_SESSION_SECRET=${randomSecret()}`);
    content = content.replace(/^MEMBER_SESSION_SECRET=.*$/m, `MEMBER_SESSION_SECRET=${randomSecret()}`);
    content = content.replace(/^ADMIN_PASSWORD=.*$/m, "ADMIN_PASSWORD=DevAdmin!mbkru-local-2026");
    if (!/^SEED_ACCOUNTABILITY_DEMO=/m.test(content)) {
      content +=
        "\n# Auto-added by setup-local.mjs\nSEED_ACCOUNTABILITY_DEMO=1\nSEED_COMMUNITIES_DEMO=1\nSEED_ENGAGEMENT_DEMOS=1\nSEED_VOICE_DEMO=1\nSEED_MEMBER_DEMO=1\n";
    }
    content = ensureLocalDevMocks(content);
    fs.writeFileSync(envPath, content, "utf8");
    console.log("Created .env (generated secrets, dev admin password, local API mocks).\n");
  } else {
    console.log("Using existing .env (delete it to regenerate from .env.example).\n");
    let content = fs.readFileSync(envPath, "utf8");
    const patched = ensureLocalDevMocks(content);
    if (patched !== content) {
      fs.writeFileSync(envPath, patched, "utf8");
      console.log("Added missing local dev mock flags to .env (Hubtel mock, SMS log, CRON_SECRET).\n");
    }
  }

  /** Docker publishes Postgres on 55432 by default; host :5432 is often a different local install. */
  const dockerPgPort = process.env.POSTGRES_HOST_PORT || "55432";
  let envRaw = fs.readFileSync(envPath, "utf8");
  const needsPortFix =
    envRaw.includes("@localhost:5432/") ||
    envRaw.includes("@127.0.0.1:5432/") ||
    envRaw.includes("@localhost:5433/") ||
    envRaw.includes("@127.0.0.1:5433/");
  if (needsPortFix) {
    envRaw = envRaw
      .replace(/@localhost:5432\//g, `@localhost:${dockerPgPort}/`)
      .replace(/@127.0.0.1:5432\//g, `@127.0.0.1:${dockerPgPort}/`)
      .replace(/@localhost:5433\//g, `@localhost:${dockerPgPort}/`)
      .replace(/@127.0.0.1:5433\//g, `@127.0.0.1:${dockerPgPort}/`);
    fs.writeFileSync(envPath, envRaw, "utf8");
    console.log(`Updated DATABASE_URL to use host port ${dockerPgPort} (Docker Postgres mapping).\n`);
  }

  dotenv.config({ path: envPath, override: true, quiet: true });

  console.log("Starting Postgres + Redis (docker compose)…");
  try {
    run("docker compose up -d postgres redis");
  } catch {
    console.error(`
Docker Compose failed. Start Docker Desktop, then run: npm run setup:local

Or point DATABASE_URL in .env at a local Postgres instance and run:
  npx prisma migrate deploy && npx prisma db seed
`);
    process.exit(1);
  }

  console.log("\nWaiting for Postgres…");
  for (let i = 0; i < 45; i++) {
    if (dockerPostgresReady()) {
      console.log("Postgres is ready.\n");
      break;
    }
    if (i === 44) {
      console.error("Postgres did not become ready in time. Check: docker compose ps");
      process.exit(1);
    }
    await sleep(1000);
  }

  console.log("npm install…");
  run("npm install");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing after loading .env — check .env path and format.");
    process.exit(1);
  }

  console.log("\nPrisma migrate deploy…");
  run("npx prisma migrate deploy", { env: { ...process.env } });

  console.log("\nPrisma db seed (regions, admin, news, accountability starter, pilot members)…");
  run("npx prisma db seed", {
    env: {
      ...process.env,
      SEED_ACCOUNTABILITY_DEMO: "1",
      SEED_ENGAGEMENT_DEMOS: "1",
      SEED_VOICE_DEMO: "1",
      SEED_MEMBER_DEMO: "1",
    },
  });

  console.log(`
=== Done ===

  App (install deps already):  npm run dev     → http://localhost:1100
  Admin:                        http://localhost:1100/admin/login
    Email:    (from .env ADMIN_EMAIL, default admin@example.com)
    Password: DevAdmin!mbkru-local-2026   (only if this script created .env)

  Pilot members (/login):       pilot.member@mbkru.local / PilotMember!change-me-2026
                                pilot.two@mbkru.local     / same password

  Ghana Card (local mock):      GHA-000000000-0 + any legal name on /account
  Verify everything:            npm run verify:local

  Docker DB (host):             postgresql://mbkru:mbkru_dev@localhost:55432/mbkru  (override with POSTGRES_HOST_PORT)
  Stop services:                docker compose stop postgres redis
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
