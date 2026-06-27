import { describe, expect, it } from "vitest";

import { parseGhanaCardVerifyBody } from "@/lib/validation/ghana-card-verify";

describe("parseGhanaCardVerifyBody", () => {
  it("parses valid body with normalized card", () => {
    const r = parseGhanaCardVerifyBody({
      ghanaCardNumber: "GHA-123456789-0",
      surname: "Mensah",
      forenames: "Ama",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.normalizedCard).toBe("GHA-123456789-0");
      expect(r.value.surname).toBe("Mensah");
    }
  });

  it("rejects invalid card format", () => {
    const r = parseGhanaCardVerifyBody({
      ghanaCardNumber: "not-a-card",
      surname: "Mensah",
      forenames: "Ama",
    });
    expect(r.ok).toBe(false);
  });
});
