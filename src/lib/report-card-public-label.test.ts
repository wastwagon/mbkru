import { describe, expect, it } from "vitest";

import { publicReportCardCycleTitle, reportCardPublicVersusStoredLabel } from "./report-card-public-label";

describe("publicReportCardCycleTitle", () => {
  it("replaces internal pilot / layout labels with stable public title", () => {
    expect(publicReportCardCycleTitle(2026, "People's Report Card — pilot (layout & workflow)")).toBe(
      "People's Report Card 2026",
    );
  });

  it("preserves clean editorial labels", () => {
    expect(publicReportCardCycleTitle(2027, "Mid-term accountability snapshot")).toBe("Mid-term accountability snapshot");
  });
});

describe("reportCardPublicVersusStoredLabel", () => {
  it("flags when internal wording is masked on the public site", () => {
    const v = reportCardPublicVersusStoredLabel(2026, "People's Report Card — pilot (layout & workflow)");
    expect(v.publicTitle).toBe("People's Report Card 2026");
    expect(v.storedLabel).toContain("pilot");
    expect(v.showStoredLine).toBe(true);
  });

  it("hides the extra line when stored matches public", () => {
    const v = reportCardPublicVersusStoredLabel(2027, "Mid-term accountability snapshot");
    expect(v.showStoredLine).toBe(false);
  });
});
