#!/usr/bin/env node
import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const backupFile = process.env.BACKUP_FILE?.trim();
const scratchDatabaseUrl = process.env.SCRATCH_DATABASE_URL?.trim();

if (!backupFile) {
  console.error("[ops-restore-verify] BACKUP_FILE is required.");
  process.exit(1);
}
if (!scratchDatabaseUrl) {
  console.error("[ops-restore-verify] SCRATCH_DATABASE_URL is required.");
  process.exit(1);
}

const absBackup = resolve(process.cwd(), backupFile);
await access(absBackup);

const restoreCmd = `gunzip -c "${absBackup}" | psql "${scratchDatabaseUrl}"`;
const smokeCmd = `psql "${scratchDatabaseUrl}" -c "select now() as restore_verified_at;"`;

async function run(cmd, label) {
  console.log(`[ops-restore-verify] ${label}`);
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn("sh", ["-lc", cmd], { stdio: "inherit" });
    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${label} failed with ${code}`));
    });
  });
}

await run(restoreCmd, "restoring backup into scratch database");
await run(smokeCmd, "running smoke query");

console.log("[ops-restore-verify] restore verification completed");
