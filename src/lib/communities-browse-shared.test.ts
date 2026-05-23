import { describe, expect, it } from "vitest";

import { communitiesBrowseHref } from "@/lib/communities-browse-shared";

describe("communitiesBrowseHref", () => {
  it("builds query strings for region and search", () => {
    expect(communitiesBrowseHref({})).toBe("/communities");
    expect(communitiesBrowseHref({ region: "central" })).toBe("/communities?region=central");
    expect(communitiesBrowseHref({ q: "ajumako", region: "central" })).toBe(
      "/communities?q=ajumako&region=central",
    );
  });
});
