/**
 * Lighthouse CI — runs in GitHub Actions after `next build`.
 * @see .github/workflows/ci.yml
 *
 * No DATABASE_URL at collect time so news and other pages use DB-safe fallbacks.
 */
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/contact",
        "http://localhost:3000/news",
      ],
      startServerCommand: "npm run start -- -p 3000",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 120000,
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage",
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.85 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:performance": ["warn", { minScore: 0.35 }],
      },
    },
  },
};
