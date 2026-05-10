import { expect, test } from "@playwright/test";

const defaultPort = Number(process.env.PLAYWRIGHT_PORT ?? "1101");
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://127.0.0.1:${Number.isFinite(defaultPort) ? defaultPort : 1101}`;

async function fetchWithoutFollowingRedirects(path: string): Promise<Response> {
  return fetch(new URL(path, baseURL), { redirect: "manual" });
}

/** Phase 1 may return 404 (Voice off); Phase 2+ guests get a redirect to `/login` from `src/proxy.ts`. */
function expectGuestGateOrVoiceDisabled(res: Response) {
  expect(res.status).toBeLessThan(500);
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get("location") ?? "";
    expect(loc).toMatch(/\/login/);
    expect(loc).toMatch(/next=/);
  } else {
    expect(res.status).toBe(404);
  }
}

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

  test("report track API requires sign-in", async ({ request }) => {
    const res = await request.get("/api/reports/track/not-a-valid-tracking-code");
    expect(res.status()).toBe(401);
  });

  test("regions hub API returns JSON envelope when a region exists", async ({ request }) => {
    const listRes = await request.get("/api/regions");
    test.skip(listRes.status() !== 200, "/api/regions unavailable (e.g. no DATABASE_URL)");

    const listBody = (await listRes.json()) as { regions?: { slug: string }[] };
    const slug = listBody.regions?.[0]?.slug;
    test.skip(!slug, "no regions seeded");

    const hubRes = await request.get(`/api/regions/${encodeURIComponent(slug)}/hub`);
    expect(hubRes.status(), "hub route should not 5xx").toBeLessThan(500);
    test.skip(hubRes.status() !== 200, "/api/regions/[slug]/hub not 200");

    const j = (await hubRes.json()) as Record<string, unknown>;
    expect(j).toHaveProperty("region");
    expect(j).toHaveProperty("onlineCount");
    expect(j).toHaveProperty("onlineCountsVisible");
    expect(j).toHaveProperty("peerDetailsVisible");
    expect(j).toHaveProperty("onlinePeers");
    expect(j.peerDetailsVisible).toBe(false);
  });
});

test.describe("proxy member gates (guest, no cookies)", () => {
  test("Voice submit — redirect to login or Voice disabled (404)", async () => {
    const res = await fetchWithoutFollowingRedirects("/citizens-voice/submit");
    expectGuestGateOrVoiceDisabled(res);
  });

  test("Election Voice submit — redirect to login or gate off (404)", async () => {
    const res = await fetchWithoutFollowingRedirects("/citizens-voice/submit/election");
    expect(res.status).toBeLessThan(500);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location") ?? "";
      expect(loc).toMatch(/\/login/);
      expect(loc).toMatch(/next=/);
    } else {
      expect(res.status).toBe(404);
    }
  });

  test("Track report page — redirect to login or Voice disabled (404)", async () => {
    const res = await fetchWithoutFollowingRedirects("/track-report");
    expectGuestGateOrVoiceDisabled(res);
  });

  test("Situational submit — redirect to login or intake disabled (404)", async () => {
    const res = await fetchWithoutFollowingRedirects("/situational-alerts/submit");
    expect(res.status).toBeLessThan(500);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location") ?? "";
      expect(loc).toMatch(/\/login/);
      expect(loc).toMatch(/next=/);
    } else {
      expect(res.status).toBe(404);
    }
  });

  test("New petition — redirect to login or petitions off (404)", async () => {
    const res = await fetchWithoutFollowingRedirects("/petitions/new");
    expect(res.status).toBeLessThan(500);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location") ?? "";
      expect(loc).toMatch(/\/login/);
      expect(loc).toMatch(/next=/);
    } else {
      expect(res.status).toBe(404);
    }
  });
});
