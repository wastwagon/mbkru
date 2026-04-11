import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("resourceCategoryLabel", () => {
  it("maps enum values to labels", async () => {
    const { resourceCategoryLabel } = await import("./resource-documents");
    expect(resourceCategoryLabel("REPORTS")).toBe("Reports");
    expect(resourceCategoryLabel("POLICY_BRIEFS")).toBe("Policy briefs");
    expect(resourceCategoryLabel("RESEARCH")).toBe("Research");
    expect(resourceCategoryLabel("OTHER")).toBe("Other");
  });
});

describe("formatResourceFileSize", () => {
  it("formats bytes", async () => {
    const { formatResourceFileSize } = await import("./resource-documents");
    expect(formatResourceFileSize(null)).toBe("");
    expect(formatResourceFileSize(0)).toBe("");
    expect(formatResourceFileSize(500)).toBe("500 B");
    expect(formatResourceFileSize(2048)).toBe("2.0 KB");
    expect(formatResourceFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
