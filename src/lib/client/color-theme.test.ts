import { describe, expect, it } from "vitest";

import { colorThemeBootScript, colorThemeStorageKey } from "@/lib/client/color-theme";

describe("color-theme", () => {
  it("uses a stable storage key", () => {
    expect(colorThemeStorageKey).toBe("mbkru-color-theme");
  });

  it("boot script reads the same key", () => {
    expect(colorThemeBootScript).toContain(colorThemeStorageKey);
    expect(colorThemeBootScript).toContain("data-color-theme");
  });
});
