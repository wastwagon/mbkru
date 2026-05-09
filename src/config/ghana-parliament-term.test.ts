import { describe, expect, it } from "vitest";

import {
  GHANA_ACCOUNTABILITY_PARLIAMENT_TERM,
  ghanaParliamentTermShortLabel,
} from "./ghana-parliament-term";

describe("ghanaParliamentTermShortLabel", () => {
  it("matches configured term bounds", () => {
    expect(GHANA_ACCOUNTABILITY_PARLIAMENT_TERM.startYear).toBe(2024);
    expect(GHANA_ACCOUNTABILITY_PARLIAMENT_TERM.generalElectionYear).toBe(2028);
    expect(ghanaParliamentTermShortLabel()).toBe("2024–2028");
  });
});
