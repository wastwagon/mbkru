import { describe, expect, it } from "vitest";

import {
  MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX,
  getPromiseCatalogueApiFields,
  parseManifestoCatalogueRowNotes,
} from "@/lib/promise-catalogue-display";

describe("parseManifestoCatalogueRowNotes", () => {
  it("returns empty shape for null or blank", () => {
    expect(parseManifestoCatalogueRowNotes(null)).toEqual({
      isCatalogueRow: false,
      themeSlug: null,
      themeLabel: null,
      editorVerification: null,
    });
    expect(parseManifestoCatalogueRowNotes("   ").isCatalogueRow).toBe(false);
  });

  it("parses catalogue seed tag and cluster", () => {
    const r = parseManifestoCatalogueRowNotes(
      `${MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX} cluster=economy`,
    );
    expect(r).toEqual({
      isCatalogueRow: true,
      themeSlug: "economy",
      themeLabel: "Economy",
      editorVerification: null,
    });
  });

  it("humanises hyphenated cluster slugs", () => {
    const r = parseManifestoCatalogueRowNotes(
      `${MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX} cluster=infrastructure`,
    );
    expect(r.themeLabel).toBe("Infrastructure");
  });

  it("passes through non-catalogue notes as editor verification", () => {
    const text = "CHRAJ referral pending — verify Hansard line.";
    const r = parseManifestoCatalogueRowNotes(text);
    expect(r.isCatalogueRow).toBe(false);
    expect(r.editorVerification).toBe(text);
  });

  it("getPromiseCatalogueApiFields mirrors catalogue parse", () => {
    expect(
      getPromiseCatalogueApiFields(`${MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX} cluster=jobs`),
    ).toEqual({
      isManifestoCatalogueRow: true,
      catalogueThemeSlug: "jobs",
      catalogueThemeLabel: "Jobs",
    });
    expect(getPromiseCatalogueApiFields("Manual note only.")).toEqual({
      isManifestoCatalogueRow: false,
      catalogueThemeSlug: null,
      catalogueThemeLabel: null,
    });
  });

  it("preserves trailing editor text after cluster token", () => {
    const r = parseManifestoCatalogueRowNotes(
      `${MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX} cluster=health Extra note here.`,
    );
    expect(r.isCatalogueRow).toBe(true);
    expect(r.themeSlug).toBe("health");
    expect(r.themeLabel).toBe("Health");
    expect(r.editorVerification).toBe("Extra note here.");
  });
});
