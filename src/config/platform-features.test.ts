import { describe, expect, it } from "vitest";

import { platformFeatures } from "./platform";

describe("platformFeatures", () => {
  it("phase 1: only phase-1-safe flags", () => {
    expect(platformFeatures.authentication(1)).toBe(false);
    expect(platformFeatures.citizensVoicePlatform(1)).toBe(false);
    expect(platformFeatures.parliamentTrackerData(1)).toBe(false);
    expect(platformFeatures.accountabilityScorecards(1)).toBe(false);
    expect(platformFeatures.legalEmpowermentDesk(1)).toBe(false);
    expect(platformFeatures.townHallDirectory(1)).toBe(false);
    expect(platformFeatures.electionObservatory(1)).toBe(false);
  });

  it("phase 2: voice and parliament JSON, not scorecard flagship", () => {
    expect(platformFeatures.citizensVoicePlatform(2)).toBe(true);
    expect(platformFeatures.parliamentTrackerData(2)).toBe(true);
    expect(platformFeatures.accountabilityScorecards(2)).toBe(false);
    expect(platformFeatures.legalEmpowermentDesk(2)).toBe(true);
  });

  it("phase 3: all accountability surfaces", () => {
    expect(platformFeatures.accountabilityScorecards(3)).toBe(true);
    expect(platformFeatures.electionObservatory(3)).toBe(true);
  });
});
