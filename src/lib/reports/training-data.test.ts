import { describe, expect, it, afterEach, vi } from "vitest";

import {
  excludeTrainingDataFromPublicSurfaces,
  isTrainingCitizenReport,
  isTrainingCitizenReportTrackingCode,
  trainingDataExcludedFromPublicWhere,
} from "@/lib/reports/training-data";

describe("training-data", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects seed and demo tracking prefixes", () => {
    expect(isTrainingCitizenReportTrackingCode("MBKRU-DEMO-COHORT-V-3")).toBe(true);
    expect(isTrainingCitizenReportTrackingCode("MBKRU-SEED-VOICE-1")).toBe(true);
    expect(isTrainingCitizenReportTrackingCode("5SH38TSTPNE3")).toBe(false);
  });

  it("detects testing phase titles", () => {
    expect(isTrainingCitizenReport({ trackingCode: "5SH38TSTPNE3", title: "Testing Phase Title" })).toBe(
      true,
    );
    expect(isTrainingCitizenReport({ trackingCode: "ABCDEFGHJKLM", title: "Street lighting concern" })).toBe(
      false,
    );
  });

  it("excludes training data in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("INCLUDE_TRAINING_DATA_ON_PUBLIC", "");
    vi.stubEnv("EXCLUDE_TRAINING_DATA_FROM_PUBLIC", "");
    expect(excludeTrainingDataFromPublicSurfaces()).toBe(true);
    expect(Object.keys(trainingDataExcludedFromPublicWhere()).length).toBeGreaterThan(0);
  });

  it("includes training data locally unless forced off", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("INCLUDE_TRAINING_DATA_ON_PUBLIC", "");
    vi.stubEnv("EXCLUDE_TRAINING_DATA_FROM_PUBLIC", "");
    expect(excludeTrainingDataFromPublicSurfaces()).toBe(false);
    expect(trainingDataExcludedFromPublicWhere()).toEqual({});
  });

  it("INCLUDE_TRAINING_DATA_ON_PUBLIC=1 wins in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("INCLUDE_TRAINING_DATA_ON_PUBLIC", "1");
    expect(excludeTrainingDataFromPublicSurfaces()).toBe(false);
  });
});
