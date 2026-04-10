import { splitCsvLine } from "./parliament-csv-parse";

function csvCell(s: string): string {
  const t = String(s ?? "");
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

const PARL_HEADER_NORM = "name,slug,role,party,constituency_slug,active";
const CONST_HEADER_NORM = "name,slug,region_slug,code";

function normalizeHeaderLine(line: string): string {
  return splitCsvLine(line.trim())
    .map((h) => h.trim().toLowerCase())
    .join(",");
}

function parseCsvGrid(text: string): { headerRaw: string; headerNorm: string; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    throw new Error("CSV is empty.");
  }
  const headerRaw = lines[0]!.trim();
  const headerNorm = normalizeHeaderLine(headerRaw);
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    rows.push(splitCsvLine(lines[i]!));
  }
  return { headerRaw, headerNorm, rows };
}

function padRow(row: string[], len: number): string[] {
  const out = [...row];
  while (out.length < len) out.push("");
  return out.slice(0, len);
}

/**
 * Merge `starter` into `base`: keep all base rows in order, then append starter rows whose `slug`
 * is not already present in `base` (case-insensitive). Headers must match MBKRU import format.
 */
export function mergeParliamentMemberCsvTexts(baseText: string, starterText: string): string {
  const base = parseCsvGrid(baseText);
  const starter = parseCsvGrid(starterText);
  if (base.headerNorm !== PARL_HEADER_NORM) {
    throw new Error(`Base CSV columns must match: ${PARL_HEADER_NORM}`);
  }
  if (starter.headerNorm !== PARL_HEADER_NORM) {
    throw new Error(`Starter CSV columns must match: ${PARL_HEADER_NORM}`);
  }

  const slugSeen = new Set<string>();
  for (const row of base.rows) {
    const slug = (row[1] ?? "").trim().toLowerCase();
    if (slug) slugSeen.add(slug);
  }

  const merged: string[][] = base.rows.map((r) => padRow(r, 6));
  for (const row of starter.rows) {
    const slug = (row[1] ?? "").trim().toLowerCase();
    if (!slug || slugSeen.has(slug)) continue;
    slugSeen.add(slug);
    merged.push(padRow(row, 6));
  }

  const lines = [base.headerRaw.trim()];
  for (const row of merged) {
    lines.push(
      [csvCell(row[0]!), csvCell(row[1]!), csvCell(row[2]!), csvCell(row[3]!), csvCell(row[4]!), csvCell(row[5]!)].join(
        ",",
      ),
    );
  }
  return `${lines.join("\n")}\n`;
}

/**
 * Same as {@link mergeParliamentMemberCsvTexts} for constituency CSV (`name,slug,region_slug,code`).
 */
export function mergeConstituencyCsvTexts(baseText: string, starterText: string): string {
  const base = parseCsvGrid(baseText);
  const starter = parseCsvGrid(starterText);
  if (base.headerNorm !== CONST_HEADER_NORM) {
    throw new Error(`Base CSV columns must match: ${CONST_HEADER_NORM}`);
  }
  if (starter.headerNorm !== CONST_HEADER_NORM) {
    throw new Error(`Starter CSV columns must match: ${CONST_HEADER_NORM}`);
  }

  const slugSeen = new Set<string>();
  for (const row of base.rows) {
    const slug = (row[1] ?? "").trim().toLowerCase();
    if (slug) slugSeen.add(slug);
  }

  const merged: string[][] = base.rows.map((r) => padRow(r, 4));
  for (const row of starter.rows) {
    const slug = (row[1] ?? "").trim().toLowerCase();
    if (!slug || slugSeen.has(slug)) continue;
    slugSeen.add(slug);
    merged.push(padRow(row, 4));
  }

  const lines = [base.headerRaw.trim()];
  for (const row of merged) {
    lines.push([csvCell(row[0]!), csvCell(row[1]!), csvCell(row[2]!), csvCell(row[3]!)].join(","));
  }
  return `${lines.join("\n")}\n`;
}
