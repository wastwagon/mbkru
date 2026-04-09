import { z } from "zod";

import { splitCsvLine } from "./parliament-csv-parse";

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const rowSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .transform(normalizeSlug)
    .refine((s) => s.length > 0, "Invalid slug"),
  region_slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .transform(normalizeSlug)
    .refine((s) => s.length > 0, "Invalid region_slug"),
  code: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((s) => (s && s.length > 0 ? s : undefined)),
});

export type ParsedConstituencyRow = z.infer<typeof rowSchema>;

export type ConstituencyCsvParseResult =
  | { ok: true; rows: ParsedConstituencyRow[] }
  | { ok: false; error: string };

/**
 * Header: name,slug,region_slug,code
 * `code` may be empty (EC reference code when available).
 */
export function parseConstituenciesCsv(text: string): ConstituencyCsvParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { ok: false, error: "CSV must include a header row and at least one data row." };
  }

  const headerCells = splitCsvLine(lines[0]!).map((h) => h.trim().toLowerCase());
  const expected = ["name", "slug", "region_slug", "code"];
  if (headerCells.length < expected.length) {
    return {
      ok: false,
      error: `Expected columns: ${expected.join(", ")}. Found: ${headerCells.join(", ")}`,
    };
  }

  for (let i = 0; i < expected.length; i++) {
    if (headerCells[i] !== expected[i]) {
      return {
        ok: false,
        error: `Column ${i + 1} should be "${expected[i]}"; got "${headerCells[i] ?? ""}".`,
      };
    }
  }

  const rows: ParsedConstituencyRow[] = [];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const cells = splitCsvLine(lines[lineIndex]!);
    if (cells.length === 1 && cells[0] === "") continue;
    if (cells.length < expected.length) {
      return { ok: false, error: `Line ${lineIndex + 1}: not enough columns (${cells.length}).` };
    }
    const record = {
      name: cells[0] ?? "",
      slug: cells[1] ?? "",
      region_slug: cells[2] ?? "",
      code: cells[3] ?? "",
    };
    const parsed = rowSchema.safeParse(record);
    if (!parsed.success) {
      return {
        ok: false,
        error: `Line ${lineIndex + 1}: ${parsed.error.issues.map((x) => x.message).join("; ")}`,
      };
    }
    rows.push(parsed.data);
  }

  if (rows.length === 0) {
    return { ok: false, error: "No data rows after the header." };
  }

  return { ok: true, rows };
}
