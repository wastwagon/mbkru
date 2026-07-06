import { describe, expect, it } from "vitest";

import {
  parseReportCardBrowseTab,
  reportCardIndexHref,
  showReportCardBrowseTabs,
} from "@/lib/report-card-browse-query";

describe("report-card-browse-query", () => {
  it("defaults to voice when both modes are on", () => {
    expect(parseReportCardBrowseTab(undefined, { voiceOn: true, showScores: true })).toBe("voice");
    expect(parseReportCardBrowseTab("scores", { voiceOn: true, showScores: true })).toBe("scores");
  });

  it("shows tabs only when voice and scores coexist", () => {
    expect(showReportCardBrowseTabs({ voiceOn: true, showScores: true, hasCycles: true })).toBe(true);
    expect(showReportCardBrowseTabs({ voiceOn: true, showScores: false, hasCycles: true })).toBe(false);
  });

  it("builds tabbed href with hash", () => {
    expect(reportCardIndexHref({ tab: "scores", year: 2026 })).toBe("/report-card?year=2026&tab=scores#browse-scores");
  });
});
