#!/usr/bin/env node
/**
 * Automated checks before promoting an environment or cutting a release candidate.
 * Does not replace manual ops/legal gates — see docs/SAFE_IMPLEMENTATION_PHASES.md.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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

run("Prisma schema validate", "npx", ["prisma", "validate"]);
run("TypeScript (noEmit)", "npx", ["tsc", "--noEmit"]);
run("Vitest", "npm", ["run", "test"]);

console.log("\n✓ Release gates passed (automated slice only).\n");
