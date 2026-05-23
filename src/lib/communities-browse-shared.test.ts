import { describe, expect, it } from "vitest";

import {
  communitiesBrowseHref,
  joinFilterLabel,
  joinPolicyBrowseFilter,
  parseCommunitiesBrowseParams,
  parseCommunitiesJoinFilter,
  parseCommunitiesSort,
  sortLabel,
  verifiedQueenMotherBrowseFilter,
} from "@/lib/communities-browse-shared";

describe("communitiesBrowseHref", () => {
  it("builds query strings for region, search, join, and sort", () => {
    expect(communitiesBrowseHref({})).toBe("/communities");
    expect(communitiesBrowseHref({ region: "central" })).toBe("/communities?region=central");
    expect(communitiesBrowseHref({ q: "ajumako", region: "central" })).toBe(
      "/communities?q=ajumako&region=central",
    );
    expect(communitiesBrowseHref({ region: "central", join: "open", sort: "traditional" })).toBe(
      "/communities?region=central&join=open&sort=traditional",
    );
    expect(communitiesBrowseHref({ verified: true, region: "central" })).toBe(
      "/communities?region=central&verified=1",
    );
  });
});

describe("parseCommunitiesBrowseParams", () => {
  it("normalizes join and sort filters", () => {
    expect(parseCommunitiesBrowseParams({ join: "open", sort: "region" })).toEqual({
      q: "",
      region: undefined,
      join: "open",
      sort: "region",
      verified: false,
    });
    expect(parseCommunitiesBrowseParams({ verified: "1" }).verified).toBe(true);
    expect(parseCommunitiesJoinFilter("nope")).toBe("all");
    expect(parseCommunitiesSort("nope")).toBe("name");
  });
});

describe("verifiedQueenMotherBrowseFilter", () => {
  it("restricts to communities with verified queen mothers", () => {
    expect(verifiedQueenMotherBrowseFilter(true).memberships).toBeDefined();
    expect(verifiedQueenMotherBrowseFilter(false)).toEqual({});
  });
});

describe("joinPolicyBrowseFilter", () => {
  it("maps join filter to prisma where clauses", () => {
    expect(joinPolicyBrowseFilter("open")).toEqual({ joinPolicy: "OPEN" });
    expect(joinPolicyBrowseFilter("approval")).toEqual({ joinPolicy: "APPROVAL_REQUIRED" });
    expect(joinPolicyBrowseFilter("all")).toEqual({});
  });
});

describe("labels", () => {
  it("returns human-readable filter labels", () => {
    expect(joinFilterLabel("open")).toBe("Open to join");
    expect(sortLabel("traditional")).toBe("Traditional area A–Z");
  });
});
