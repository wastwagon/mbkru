import { describe, expect, it } from "vitest";

import { ghanaCardLastFour, hashGhanaCardNumber, normalizeGhanaCardNumber } from "@/lib/ghana-card";

describe("normalizeGhanaCardNumber", () => {
  it("accepts standard GHA format", () => {
    expect(normalizeGhanaCardNumber("GHA-123456789-0")).toBe("GHA-123456789-0");
  });

  it("normalizes compact input", () => {
    expect(normalizeGhanaCardNumber("GHA1234567890")).toBe("GHA-123456789-0");
  });

  it("rejects invalid numbers", () => {
    expect(normalizeGhanaCardNumber("GHA-123-0")).toBeNull();
    expect(normalizeGhanaCardNumber("")).toBeNull();
  });
});

describe("hashGhanaCardNumber", () => {
  it("returns stable hex hash when secret configured", () => {
    process.env.MEMBER_SESSION_SECRET = "test-secret-at-least-32-characters-long";
    const a = hashGhanaCardNumber("GHA-123456789-0");
    const b = hashGhanaCardNumber("GHA-123456789-0");
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("ghanaCardLastFour", () => {
  it("returns last four digits", () => {
    expect(ghanaCardLastFour("GHA-123456789-0")).toBe("7890");
  });
});
