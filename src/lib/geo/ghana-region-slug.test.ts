import { describe, expect, it } from "vitest";

import { ghanaRegionSlugFromDisplayName } from "./ghana-region-slug";

describe("ghanaRegionSlugFromDisplayName", () => {
  it("matches prisma REGIONS_SEED slugs", () => {
    expect(ghanaRegionSlugFromDisplayName("Greater Accra")).toBe("greater-accra");
    expect(ghanaRegionSlugFromDisplayName("Western North")).toBe("western-north");
    expect(ghanaRegionSlugFromDisplayName("Bono East")).toBe("bono-east");
    expect(ghanaRegionSlugFromDisplayName("Upper West")).toBe("upper-west");
    expect(ghanaRegionSlugFromDisplayName("North East")).toBe("north-east");
  });
});
