import { describe, expect, it } from "vitest";

import { generateTemporaryPassword } from "./generate-temporary-password";

describe("generateTemporaryPassword", () => {
  it("returns passwords of the requested length", () => {
    expect(generateTemporaryPassword(16)).toHaveLength(16);
    expect(generateTemporaryPassword(20)).toHaveLength(20);
  });

  it("generates distinct values", () => {
    const a = generateTemporaryPassword();
    const b = generateTemporaryPassword();
    expect(a).not.toBe(b);
  });
});
