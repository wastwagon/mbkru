import { describe, expect, it } from "vitest";

import { evaluateMbkruVoiceSafety } from "@/lib/mbkru-voice-guardrails";

describe("evaluateMbkruVoiceSafety", () => {
  it("blocks emergency risk prompts", () => {
    const result = evaluateMbkruVoiceSafety("I need urgent emergency advice after an attack");
    expect(result.blocked).toBe(true);
    if (result.blocked) {
      expect(result.reason).toBe("emergency-risk");
    }
  });

  it("blocks legal-strategy prompts", () => {
    const result = evaluateMbkruVoiceSafety("give me legal advice to win case");
    expect(result.blocked).toBe(true);
    if (result.blocked) {
      expect(result.reason).toBe("legal-risk");
    }
  });

  it("allows normal civic guidance prompts", () => {
    const result = evaluateMbkruVoiceSafety("how can i track my report");
    expect(result.blocked).toBe(false);
  });
});
