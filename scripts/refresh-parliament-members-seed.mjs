#!/usr/bin/env node
/**
 * Fetch ghanamps members JSON (or MP_JSON_PATH) and write prisma/data/parliament-members.seed.json.
 * @see prisma/seed.mjs seedParliamentMembersFromBundledJson
 */
import { spawnSync, execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = resolve(ROOT, "prisma/data/generated/.mps-for-seed.tmp.json");
const CONVERTER = resolve(dirname(fileURLToPath(import.meta.url)), "json-to-parliament-members-seed.mjs");

function runGhanampsMembers() {
  const bin = process.env.GHANAMPS_BIN?.trim() || "ghanamps";
  const r = spawnSync(bin, ["members"], {
    encoding: "utf-8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.error) {
    console.error(
      `Could not run "${bin} members": ${r.error.message}\n` +
        "Install ghanamps or set MP_JSON_PATH to a JSON array file.",
    );
    process.exit(1);
  }
  if (r.status !== 0) {
    console.error(`"${bin} members" exited ${r.status}\n${r.stderr || ""}`);
    process.exit(1);
  }
  return r.stdout;
}

const jsonPath = process.env.MP_JSON_PATH?.trim();
const raw = jsonPath ? readFileSync(resolve(process.cwd(), jsonPath), "utf8") : runGhanampsMembers();

mkdirSync(resolve(ROOT, "prisma/data/generated"), { recursive: true });
writeFileSync(TMP, raw, "utf8");
try {
  execFileSync(process.execPath, [CONVERTER, TMP], { stdio: "inherit", cwd: ROOT });
} finally {
  try {
    unlinkSync(TMP);
  } catch {
    /* ignore */
  }
}
