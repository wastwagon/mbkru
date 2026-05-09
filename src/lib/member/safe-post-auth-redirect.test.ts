import { describe, expect, it } from "vitest";

import { safePostAuthRedirectPath } from "./safe-post-auth-redirect";

describe("safePostAuthRedirectPath", () => {
  it("accepts internal paths", () => {
    expect(safePostAuthRedirectPath("/track-report", "/account")).toBe("/track-report");
    expect(safePostAuthRedirectPath("/citizens-voice/submit?x=1", "/account")).toBe("/citizens-voice/submit?x=1");
  });

  it("rejects open redirects", () => {
    expect(safePostAuthRedirectPath("//evil.com", "/account")).toBe("/account");
    expect(safePostAuthRedirectPath("https://evil.com", "/account")).toBe("/account");
  });

  it("uses fallback when missing", () => {
    expect(safePostAuthRedirectPath(null, "/account")).toBe("/account");
    expect(safePostAuthRedirectPath(undefined, "/account")).toBe("/account");
  });
});
