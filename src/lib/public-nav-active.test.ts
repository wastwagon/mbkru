import { describe, expect, it } from "vitest";

import { publicNavLeafIsActive } from "./public-nav-active";

function sp(entries: Record<string, string>) {
  return new URLSearchParams(entries);
}

describe("publicNavLeafIsActive", () => {
  it("matches government commitment tracker only when governmentOnly=1", () => {
    const leaf = {
      href: "/promises/browse?governmentOnly=1",
      activeWhenPathStartsWith: "/promises/browse",
      activeQuery: { governmentOnly: "1" },
    };
    expect(publicNavLeafIsActive("/promises/browse", sp({ governmentOnly: "1" }), leaf)).toBe(true);
    expect(publicNavLeafIsActive("/promises/browse", sp({}), leaf)).toBe(false);
  });

  it("matches parliamentarians hub and MP pledge routes but not catalogue browse", () => {
    const leaf = {
      href: "/parliament-tracker",
      activeWhenPathStartsWith: ["/parliament-tracker", "/promises"],
      activeExcludePathStartsWith: "/promises/browse",
    };
    expect(publicNavLeafIsActive("/parliament-tracker", sp({}), leaf)).toBe(true);
    expect(publicNavLeafIsActive("/promises", sp({}), leaf)).toBe(true);
    expect(publicNavLeafIsActive("/promises/some-mp", sp({}), leaf)).toBe(true);
    expect(publicNavLeafIsActive("/promises/browse", sp({}), leaf)).toBe(false);
  });

  it("matches People's Report Card subtree", () => {
    const leaf = {
      href: "/report-card",
      activeWhenPathStartsWith: "/report-card",
    };
    expect(publicNavLeafIsActive("/report-card", sp({}), leaf)).toBe(true);
    expect(publicNavLeafIsActive("/report-card/2026", sp({}), leaf)).toBe(true);
  });
});
