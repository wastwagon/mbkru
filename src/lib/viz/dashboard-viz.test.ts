import { describe, expect, it } from "vitest";

import {
  CITIZEN_REPORT_STATUS_COLORS,
  conicGradientFromCounts,
  formatYearMonthLabel,
} from "@/lib/viz/dashboard-viz";

describe("dashboard-viz", () => {
  it("formats year-month labels", () => {
    expect(formatYearMonthLabel("2026-01")).toMatch(/Jan/);
    expect(formatYearMonthLabel("2026-01")).toMatch(/26/);
  });

  it("builds conic stops proportional to counts", () => {
    const gradient = conicGradientFromCounts([
      { count: 50, color: CITIZEN_REPORT_STATUS_COLORS.RECEIVED },
      { count: 50, color: CITIZEN_REPORT_STATUS_COLORS.CLOSED },
    ]);
    expect(gradient).toContain("0%");
    expect(gradient).toContain("50%");
    expect(gradient).toContain("100%");
  });

  it("returns transparent for empty totals", () => {
    expect(conicGradientFromCounts([])).toBe("transparent 0% 100%");
    expect(conicGradientFromCounts([{ count: 0, color: "red" }])).toBe("transparent 0% 100%");
  });
});
