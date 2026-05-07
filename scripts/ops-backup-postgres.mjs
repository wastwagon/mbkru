#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("[ops-backup] DATABASE_URL is required.");
  process.exit(1);
}

const outDir = resolve(process.cwd(), process.env.BACKUP_OUT_DIR?.trim() || "backups");
await mkdir(outDir, { recursive: true });

const now = new Date();
const stamp = now.toISOString().replace(/[:.]/g, "-");
const outPath = resolve(outDir, `mbkru-${stamp}.sql.gz`);

const cmd = `pg_dump "${databaseUrl}" | gzip > "${outPath}"`;
console.log(`[ops-backup] writing ${outPath}`);

await new Promise((resolvePromise, rejectPromise) => {
  const child = spawn("sh", ["-lc", cmd], { stdio: "inherit" });
  child.on("error", rejectPromise);
  child.on("exit", (code) => {
    if (code === 0) resolvePromise();
    else rejectPromise(new Error(`backup command exited with ${code}`));
  });
});

console.log("[ops-backup] backup completed");
