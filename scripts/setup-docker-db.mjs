#!/usr/bin/env node
/**
 * Apply migrations + seed to Postgres configured in `.env` (DATABASE_URL).
 * Use after Docker Postgres/Redis are up (`docker compose up -d postgres redis`).
 *
 * Typical local DATABASE_URL uses host port 55432 → postgresql://mbkru:mbkru_dev@localhost:55432/mbkru
 *
 * Env (optional, same names as prisma/seed.mjs):
 *   SEED_STAKEHOLDER_ACCOUNTABILITY_SIM=1  — illustrative report-card row per active MP
 *   SEED_STAKEHOLDER_SIM_PROMISES=0        — omit one-promise-per-MP when sim is on
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env — copy .env.example to .env and set DATABASE_URL (e.g. Docker port 55432).");
  process.exit(1);
}

dotenv.config({ path: envPath, override: true });

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is empty in .env");
  process.exit(1);
}

function run(label, cmd, extraEnv = {}) {
  console.log(`\n▶ ${label}\n`);
  const r = spawnSync(cmd[0], cmd.slice(1), {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
    shell: false,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function dockerPostgresComposeReady() {
  const r = spawnSync(
    "docker",
    ["compose", "exec", "-T", "postgres", "pg_isready", "-U", "mbkru", "-d", "mbkru"],
    { cwd: root, encoding: "utf8" },
  );
  return r.status === 0;
}

console.log("=== Docker DB hydrate (migrate + seed) ===\n");
if (!dockerPostgresComposeReady()) {
  console.warn(
    "⚠ Postgres service `postgres` not reachable via `docker compose exec` — continuing anyway if DATABASE_URL points at your DB.\n" +
      "  Start stack: docker compose up -d postgres redis\n",
  );
} else {
  console.log("✓ Postgres `pg_isready` OK (compose service `postgres`).\n");
}

run("prisma migrate deploy", ["npx", "prisma", "migrate", "deploy"]);

run("prisma db seed", ["npx", "prisma", "db", "seed"], {
  SEED_ACCOUNTABILITY_DEMO: process.env.SEED_ACCOUNTABILITY_DEMO ?? "1",
  SEED_COMMUNITIES_DEMO: process.env.SEED_COMMUNITIES_DEMO ?? "1",
  SEED_TOWN_HALL_PROGRAMME: process.env.SEED_TOWN_HALL_PROGRAMME ?? "1",
});

console.log("\n=== Done ===\nSeed flags came from `.env` and defaults above (`SEED_*`).\n");
