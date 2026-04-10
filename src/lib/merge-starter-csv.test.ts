import { describe, expect, it } from "vitest";

import { mergeConstituencyCsvTexts, mergeParliamentMemberCsvTexts } from "./merge-starter-csv";

const P_HEAD = "name,slug,role,party,constituency_slug,active\n";
const C_HEAD = "name,slug,region_slug,code\n";

describe("mergeParliamentMemberCsvTexts", () => {
  it("appends starter rows when slug missing from base", () => {
    const base = `${P_HEAD}Ama Bee,ama-bee,MP,NDC,accra,true\n`;
    const starter = `${P_HEAD}Bryan Acheampong,bryan-acheampong,MP,NPP,abetifi,true\n`;
    const out = mergeParliamentMemberCsvTexts(base, starter);
    expect(out.split("\n").filter(Boolean)).toHaveLength(3);
    expect(out).toContain("ama-bee");
    expect(out).toContain("bryan-acheampong");
  });

  it("does not duplicate slug present in base", () => {
    const base = `${P_HEAD}Bryan Acheampong,bryan-acheampong,MP,NPP,abetifi,true\n`;
    const starter = `${P_HEAD}Bryan Acheampong,bryan-acheampong,MP,NPP,wrong,true\n`;
    const out = mergeParliamentMemberCsvTexts(base, starter);
    const lines = out.split("\n").filter(Boolean);
    expect(lines).toHaveLength(2);
    expect(out).toContain("NPP");
    expect(out).not.toContain("wrong");
  });

  it("throws on bad base header", () => {
    expect(() => mergeParliamentMemberCsvTexts("bad\nx,y", starterMin())).toThrow(/columns must match/);
  });
});

describe("mergeConstituencyCsvTexts", () => {
  it("appends starter constituencies missing from base", () => {
    const base = `${C_HEAD}Accra Central,accra-central,greater-accra,\n`;
    const starter = `${C_HEAD}Abetifi,abetifi,eastern,\n`;
    const out = mergeConstituencyCsvTexts(base, starter);
    expect(out.split("\n").filter(Boolean)).toHaveLength(3);
    expect(out).toContain("abetifi");
  });
});

function starterMin(): string {
  return `${P_HEAD}x,y,MP,,,true\n`;
}
