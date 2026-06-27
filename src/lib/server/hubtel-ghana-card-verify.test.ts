import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { verifyGhanaCardWithHubtel } from "@/lib/server/hubtel-ghana-card-verify";

describe("verifyGhanaCardWithHubtel mock mode", () => {
  const mockConfig = {
    clientId: "mock",
    clientSecret: "mock",
    baseUrl: "https://example.com",
    verifyPath: "/v1/identityverify/ghanacard",
    timeoutMs: 5000,
    mockMode: true,
  };

  it("accepts dev test card", async () => {
    const r = await verifyGhanaCardWithHubtel(mockConfig, {
      ghanaCardNumber: "GHA-000000000-0",
      surname: "Test",
      forenames: "User",
    });
    expect(r.ok).toBe(true);
  });

  it("rejects other cards in mock mode", async () => {
    const r = await verifyGhanaCardWithHubtel(mockConfig, {
      ghanaCardNumber: "GHA-123456789-0",
      surname: "Test",
      forenames: "User",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("NO_MATCH");
  });
});
