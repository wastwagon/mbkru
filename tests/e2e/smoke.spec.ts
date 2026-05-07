import { expect, test } from "@playwright/test";

test.describe("public and auth smoke", () => {
  test("critical pages respond without 5xx", async ({ request }) => {
    const routes = ["/", "/admin/login", "/login", "/citizens-voice/submit", "/track-report"];
    for (const route of routes) {
      const res = await request.get(route);
      expect(res.status(), `${route} should not return 5xx`).toBeLessThan(500);
    }
  });

  test("health endpoint returns expected status envelope", async ({ request }) => {
    const res = await request.get("/api/health");
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("dependencies");
  });

  test("report track API validates malformed tracking code", async ({ request }) => {
    const res = await request.get("/api/reports/track/not-a-valid-tracking-code");
    expect([400, 404]).toContain(res.status());
  });
});
