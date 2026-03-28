import { z } from "zod";

/** Split one CSV line with optional double-quoted fields. */
export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let i = 0;
  let field = "";
  let inQuotes = false;
  while (i < line.length) {
    const c = line[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      result.push(field.trim());
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  result.push(field.trim());
  return result;
}

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseActive(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no" || v === "") return false;
  return true;
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
  role: z.string().trim().min(1).max(120),
  party: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((s) => (s && s.length > 0 ? s : undefined)),
  constituency_slug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((s) => (s && s.length > 0 ? normalizeSlug(s) : undefined)),
  active: z
    .string()
    .trim()
    .transform(parseActive),
});

export type ParsedParliamentRow = z.infer<typeof rowSchema>;

export type ParliamentCsvParseResult =
  | { ok: true; rows: ParsedParliamentRow[] }
  | { ok: false; error: string };

/**
 * Expect header: name,slug,role,party,constituency_slug,active
 * (party and constituency_slug may be empty)
 */
export function parseParliamentMembersCsv(text: string): ParliamentCsvParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { ok: false, error: "CSV must include a header row and at least one data row." };
  }

  const headerCells = splitCsvLine(lines[0]!).map((h) => h.trim().toLowerCase());
  const expected = ["name", "slug", "role", "party", "constituency_slug", "active"];
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

  const rows: ParsedParliamentRow[] = [];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const cells = splitCsvLine(lines[lineIndex]!);
    if (cells.length === 1 && cells[0] === "") continue;
    if (cells.length < expected.length) {
      return { ok: false, error: `Line ${lineIndex + 1}: not enough columns (${cells.length}).` };
    }
    const record = {
      name: cells[0] ?? "",
      slug: cells[1] ?? "",
      role: cells[2] ?? "",
      party: cells[3] ?? "",
      constituency_slug: cells[4] ?? "",
      active: cells[5] ?? "true",
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
