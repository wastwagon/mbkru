import { describe, expect, it } from "vitest";

import { getClientIp } from "./client-ip";

function req(headers: Record<string, string>): Request {
  return new Request("https://example.com", { headers });
}

describe("getClientIp", () => {
  it("uses first x-forwarded-for hop", () => {
    expect(getClientIp(req({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" }))).toBe("203.0.113.1");
  });

  it("trims forwarded-for", () => {
    expect(getClientIp(req({ "x-forwarded-for": "  198.51.100.2  " }))).toBe("198.51.100.2");
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(req({ "x-real-ip": "192.0.2.5" }))).toBe("192.0.2.5");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    expect(
      getClientIp(
        req({ "x-forwarded-for": "203.0.113.9", "x-real-ip": "192.0.2.1" }),
      ),
    ).toBe("203.0.113.9");
  });

  it("returns unknown when no headers", () => {
    expect(getClientIp(req({}))).toBe("unknown");
  });

  it("truncates long forwarded values", () => {
    const long = "a".repeat(100);
    expect(getClientIp(req({ "x-forwarded-for": long })).length).toBe(64);
  });
});
