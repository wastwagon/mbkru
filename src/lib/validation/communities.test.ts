import { describe, expect, it } from "vitest";

import {
  communityPostCreateSchema,
  communityPostReportSchema,
  normalizeCommunitySearchQuery,
} from "./communities";

describe("communityPostCreateSchema", () => {
  it("accepts valid payload", () => {
    const r = communityPostCreateSchema.safeParse({ kind: "GENERAL", body: "Hello" });
    expect(r.success).toBe(true);
  });

  it("rejects empty body", () => {
    const r = communityPostCreateSchema.safeParse({ kind: "CONCERN", body: "   " });
    expect(r.success).toBe(false);
  });

  it("rejects invalid kind", () => {
    const r = communityPostCreateSchema.safeParse({ kind: "OTHER", body: "x" });
    expect(r.success).toBe(false);
  });
});

describe("normalizeCommunitySearchQuery", () => {
  it("returns null when too short", () => {
    expect(normalizeCommunitySearchQuery("")).toBeNull();
    expect(normalizeCommunitySearchQuery("a")).toBeNull();
    expect(normalizeCommunitySearchQuery("  ")).toBeNull();
  });

  it("normalizes whitespace and caps length", () => {
    expect(normalizeCommunitySearchQuery("  east  area  ")).toBe("east area");
    const long = "x".repeat(200);
    expect(normalizeCommunitySearchQuery(long)?.length).toBe(120);
  });
});

describe("communityPostReportSchema", () => {
  it("accepts reason with optional details", () => {
    const r = communityPostReportSchema.safeParse({ reason: "Spam or abuse", details: "More context" });
    expect(r.success).toBe(true);
  });

  it("rejects short reason", () => {
    const r = communityPostReportSchema.safeParse({ reason: "no" });
    expect(r.success).toBe(false);
  });
});
