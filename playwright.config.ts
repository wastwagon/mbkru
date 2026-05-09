import { defineConfig } from "@playwright/test";

/** Dedicated port so `npm run dev` on 1100 does not satisfy Playwright with a stale bundle. */
const e2ePort = Number(process.env.PLAYWRIGHT_PORT ?? "1101");
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${Number.isFinite(e2ePort) ? e2ePort : 1101}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npx next dev -p ${Number.isFinite(e2ePort) ? e2ePort : 1101} --webpack`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
