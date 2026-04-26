import { describe, expect, it } from "vitest";

import { getMbkruVoiceSiteKnowledgeForMessage } from "./mbkru-voice-site-knowledge";

describe("getMbkruVoiceSiteKnowledgeForMessage", () => {
  it("returns empty for short or irrelevant text", () => {
    const a = getMbkruVoiceSiteKnowledgeForMessage("x");
    expect(a.block).toBe("");
    expect(a.pagePaths).toEqual([]);
  });

  it("matches passport / diaspora to /diaspora", () => {
    const a = getMbkruVoiceSiteKnowledgeForMessage("I need a Ghanaian passport from New York");
    expect(a.pagePaths).toContain("/diaspora");
    expect(a.block).toContain("/diaspora");
  });

  it("matches 17th region briefing", () => {
    const a = getMbkruVoiceSiteKnowledgeForMessage("What was the 17th region diaspora summit about?");
    expect(a.pagePaths).toContain("/news/diaspora-17th-region-2025");
  });

  it("matches resources and about when asked", () => {
    const r = getMbkruVoiceSiteKnowledgeForMessage("Where is the resources page for PDFs?");
    expect(r.pagePaths).toContain("/resources");
    const a = getMbkruVoiceSiteKnowledgeForMessage("What is MBKRU about?");
    expect(a.pagePaths).toContain("/about");
  });
});
