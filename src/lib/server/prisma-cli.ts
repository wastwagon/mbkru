import "server-only";

import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PRISMA_TIMEOUT_MS = 180_000;
const MAX_BUFFER = 12 * 1024 * 1024;

function prismaCliPath(): string {
  return path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");
}

export type PrismaMaintenanceAction = "migrate-deploy" | "seed" | "migrate-and-seed";

export type CliStepResult = {
  command: string;
  ok: boolean;
  stdout: string;
  stderr: string;
};

async function runPrismaArgs(args: string[]): Promise<CliStepResult> {
  const command = `prisma ${args.join(" ")}`;
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [prismaCliPath(), ...args], {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: MAX_BUFFER,
      timeout: PRISMA_TIMEOUT_MS,
    });
    return {
      command,
      ok: true,
      stdout: stdout.toString(),
      stderr: stderr.toString(),
    };
  } catch (err: unknown) {
    const e = err as {
      stdout?: Buffer;
      stderr?: Buffer;
      message?: string;
      code?: string;
    };
    return {
      command,
      ok: false,
      stdout: e.stdout?.toString() ?? "",
      stderr: e.stderr?.toString() ?? e.message ?? String(err),
    };
  }
}

/**
 * Run Prisma CLI steps (admin-only callers). Requires DATABASE_URL and prisma package on disk (Docker runner).
 */
export async function runPrismaMaintenance(
  action: PrismaMaintenanceAction,
): Promise<{ steps: CliStepResult[] }> {
  const steps: CliStepResult[] = [];

  if (action === "migrate-deploy" || action === "migrate-and-seed") {
    steps.push(await runPrismaArgs(["migrate", "deploy"]));
  }

  if (action === "seed") {
    steps.push(await runPrismaArgs(["db", "seed"]));
  } else if (action === "migrate-and-seed") {
    const migrateOk = steps[0]?.ok ?? false;
    if (migrateOk) {
      steps.push(await runPrismaArgs(["db", "seed"]));
    }
  }

  return { steps };
}
