import { describe, expect, it } from "vitest";

import {
  MPS_ROSTER_TAG,
  PROMISES_INDEX_TAG,
  REPORT_CARD_INDEX_TAG,
  promisesMemberTag,
  reportCardYearTag,
} from "./accountability-tags";

describe("accountability-tags", () => {
  it("uses stable index tag", () => {
    expect(PROMISES_INDEX_TAG).toBe("mbkru:promises-index");
    expect(REPORT_CARD_INDEX_TAG).toBe("mbkru:report-card-index");
    expect(MPS_ROSTER_TAG).toBe("mbkru:mps-roster");
  });

  it("scopes member slug", () => {
    expect(promisesMemberTag("jane-doe")).toBe("mbkru:promises-member:jane-doe");
  });

  it("scopes year", () => {
    expect(reportCardYearTag(2028)).toBe("mbkru:report-card-year:2028");
  });
});
