import { describe, expect, it } from "vitest";

import { publicCauseSupportBodySchema } from "./civic-engagement";

describe("publicCauseSupportBodySchema", () => {
  it("defaults action to add", () => {
    const r = publicCauseSupportBodySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.action).toBe("add");
  });

  it("accepts remove", () => {
    const r = publicCauseSupportBodySchema.safeParse({ action: "remove" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.action).toBe("remove");
  });

  it("rejects invalid action", () => {
    const r = publicCauseSupportBodySchema.safeParse({ action: "delete" });
    expect(r.success).toBe(false);
  });
});
