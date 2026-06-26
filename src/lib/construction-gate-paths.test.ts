import { describe, expect, it } from "vitest";

import {
  isConstructionGateExemptPath,
  isConstructionGatedApiPath,
} from "@/lib/construction-gate-paths";

describe("construction-gate-paths", () => {
  it("exempts admin, site-gate, health, and holding page", () => {
    expect(isConstructionGateExemptPath("/under-construction")).toBe(true);
    expect(isConstructionGateExemptPath("/admin/login")).toBe(true);
    expect(isConstructionGateExemptPath("/api/admin/site-config")).toBe(true);
    expect(isConstructionGateExemptPath("/api/site-gate")).toBe(true);
    expect(isConstructionGateExemptPath("/api/health")).toBe(true);
    expect(isConstructionGateExemptPath("/contact")).toBe(true);
    expect(isConstructionGateExemptPath("/api/contact")).toBe(true);
  });

  it("gates public programme routes and member surfaces", () => {
    expect(isConstructionGateExemptPath("/")).toBe(false);
    expect(isConstructionGateExemptPath("/login")).toBe(false);
    expect(isConstructionGateExemptPath("/account")).toBe(false);
    expect(isConstructionGateExemptPath("/communities/ashanti/portal")).toBe(false);
    expect(isConstructionGateExemptPath("/api/mps")).toBe(false);
  });

  it("classifies gated API paths", () => {
    expect(isConstructionGatedApiPath("/api/mps")).toBe(true);
    expect(isConstructionGatedApiPath("/api/health")).toBe(false);
    expect(isConstructionGatedApiPath("/api/site-gate")).toBe(false);
  });
});
