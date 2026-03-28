import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma skips automatic `.env` loading when `prisma.config.ts` exists; mirror the usual lookup.
const envOpts = { quiet: true } as const;
loadEnv({ path: resolve(process.cwd(), ".env"), ...envOpts });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true, ...envOpts });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
});
