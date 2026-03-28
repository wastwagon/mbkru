import { describe, expect, it } from "vitest";

import { normalizeLeadEmail } from "./normalize-email";

describe("normalizeLeadEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeLeadEmail("  User@Example.COM \n")).toBe("user@example.com");
  });
});
