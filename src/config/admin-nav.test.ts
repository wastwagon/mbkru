import { describe, expect, it } from "vitest";

import { ADMIN_NAV_GROUPS, getAdminDashboardTools } from "@/config/admin-nav";

describe("admin dashboard tools", () => {
  it("excludes overview and preserves labels/group titles", () => {
    const tools = getAdminDashboardTools();

    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some((tool) => tool.href === "/admin")).toBe(false);
    expect(tools.every((tool) => tool.groupTitle !== "Overview")).toBe(true);
  });

  it("has descriptions for all dashboard cards", () => {
    const tools = getAdminDashboardTools();
    const missing = tools.filter((tool) => !tool.description?.trim()).map((tool) => tool.href);
    expect(missing).toEqual([]);
  });

  it("stays in sync with non-overview nav items", () => {
    const nonOverviewCount = ADMIN_NAV_GROUPS.filter((g) => g.title !== "Overview").reduce(
      (sum, group) => sum + group.items.length,
      0,
    );
    expect(getAdminDashboardTools()).toHaveLength(nonOverviewCount);
  });
});
