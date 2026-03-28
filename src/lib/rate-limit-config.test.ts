import { describe, expect, it } from "vitest";

import { parseRateLimitMax, parseRateLimitWindowMs } from "./rate-limit-config";

describe("parseRateLimitWindowMs", () => {
  it("defaults when missing, empty, non-numeric, or zero", () => {
    expect(parseRateLimitWindowMs(undefined)).toBe(60_000);
    expect(parseRateLimitWindowMs("")).toBe(60_000);
    expect(parseRateLimitWindowMs("x")).toBe(60_000);
    expect(parseRateLimitWindowMs("0")).toBe(60_000);
  });

  it("clamps to [5000, 3600000]", () => {
    expect(parseRateLimitWindowMs("1000")).toBe(5_000);
    expect(parseRateLimitWindowMs("5000")).toBe(5_000);
    expect(parseRateLimitWindowMs("120000")).toBe(120_000);
    expect(parseRateLimitWindowMs("999999999")).toBe(3_600_000);
  });
});

describe("parseRateLimitMax", () => {
  it("defaults when missing, empty, non-numeric, or zero", () => {
    expect(parseRateLimitMax(undefined)).toBe(30);
    expect(parseRateLimitMax("")).toBe(30);
    expect(parseRateLimitMax("nope")).toBe(30);
    expect(parseRateLimitMax("0")).toBe(30);
  });

  it("clamps to [5, 1000]", () => {
    expect(parseRateLimitMax("1")).toBe(5);
    expect(parseRateLimitMax("5")).toBe(5);
    expect(parseRateLimitMax("30")).toBe(30);
    expect(parseRateLimitMax("2000")).toBe(1000);
  });
});
