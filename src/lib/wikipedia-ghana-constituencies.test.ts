import { describe, expect, it } from "vitest";

import {
  mapWikipediaRegionLinkToSlug,
  parseGhanaConstituenciesFromWikipediaWikitext,
  wikiConstituenciesToCsvText,
} from "./wikipedia-ghana-constituencies";

describe("wikipedia-ghana-constituencies", () => {
  it("maps region links to MBKRU region slugs", () => {
    expect(mapWikipediaRegionLinkToSlug("Greater Accra Region")).toBe("greater-accra");
    expect(mapWikipediaRegionLinkToSlug("Central Region, Ghana")).toBe("central");
    expect(mapWikipediaRegionLinkToSlug("North East Region, Ghana")).toBe("north-east");
  });

  it("parses a minimal wikitext snippet", () => {
    const wiki = `
==[[Eastern Region, Ghana|Eastern Region]]==
{| class="wikitable"
|-
| [[Kwahu East District|Kwahu East]] || [[Abetifi]] || [[Abetifi (Ghana parliament constituency)|Abetifi]]
|-
| [[X]] || [[Y]] || [[Klottey Korle (Ghana parliament constituency)|Korle Klottey]]
|}
`;
    const rows = parseGhanaConstituenciesFromWikipediaWikitext(wiki);
    expect(rows.map((r) => r.slug).sort()).toEqual(["abetifi", "korle-klottey"]);
    expect(rows.find((r) => r.slug === "abetifi")?.region_slug).toBe("eastern");
  });

  it("produces valid CSV header", () => {
    const csv = wikiConstituenciesToCsvText([
      { name: "Abetifi", slug: "abetifi", region_slug: "eastern" },
    ]);
    expect(csv.startsWith("name,slug,region_slug,code\n")).toBe(true);
    expect(csv).toContain("abetifi,eastern");
  });
});
