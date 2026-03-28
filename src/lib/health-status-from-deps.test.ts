import { describe, expect, it } from "vitest";

import {
  healthHttpStatus,
  healthStatusFromDependencies,
} from "./health-status-from-deps";

describe("healthStatusFromDependencies", () => {
  it("ok when postgres ok or not configured and redis ok or not configured", () => {
    expect(healthStatusFromDependencies("ok", "ok")).toBe("ok");
    expect(healthStatusFromDependencies("not_configured", "not_configured")).toBe("ok");
    expect(healthStatusFromDependencies("ok", "not_configured")).toBe("ok");
    expect(healthStatusFromDependencies("not_configured", "ok")).toBe("ok");
  });

  it("degraded when redis errors but postgres is not failing", () => {
    expect(healthStatusFromDependencies("ok", "error")).toBe("degraded");
    expect(healthStatusFromDependencies("not_configured", "error")).toBe("degraded");
  });

  it("unhealthy when postgres errors (redis state ignored)", () => {
    expect(healthStatusFromDependencies("error", "ok")).toBe("unhealthy");
    expect(healthStatusFromDependencies("error", "error")).toBe("unhealthy");
    expect(healthStatusFromDependencies("error", "not_configured")).toBe("unhealthy");
  });
});

describe("healthHttpStatus", () => {
  it("maps aggregate status to HTTP code", () => {
    expect(healthHttpStatus("ok")).toBe(200);
    expect(healthHttpStatus("degraded")).toBe(200);
    expect(healthHttpStatus("unhealthy")).toBe(503);
  });
});
