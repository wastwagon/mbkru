import { expect, test } from "@playwright/test";

test.describe("dashboard route linkage", () => {
  test("admin dashboard linked routes respond without 5xx", async ({ request }) => {
    const adminRoutes = [
      "/admin",
      "/admin/reports",
      "/admin/notifications",
      "/admin/operational-audit",
      "/admin/settings",
      "/admin/community-verifications",
      "/admin/analytics/citizen-reports",
      "/admin/analytics/mbkru-voice",
    ];
    for (const route of adminRoutes) {
      const res = await request.get(route);
      expect(res.status(), `${route} should not return 5xx`).toBeLessThan(500);
    }
  });

  test("user account dashboard linked routes respond without 5xx", async ({ request }) => {
    const memberRoutes = [
      "/account",
      "/account/reports",
      "/account/notifications",
      "/citizens-voice/submit",
      "/track-report",
      "/methodology",
    ];
    for (const route of memberRoutes) {
      const res = await request.get(route);
      expect(res.status(), `${route} should not return 5xx`).toBeLessThan(500);
    }
  });
});
