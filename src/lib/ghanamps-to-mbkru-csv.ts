/**
 * Convert ghanamps-style MP JSON → MBKRU parliament CSV import format.
 * Keep slug rules aligned with `normalizeSlug` in `parliament-csv-parse.ts`.
 *
 * @see scripts/json-members-to-mbkru-csv.mjs (same logic for file-based CLI)
 */

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function csvCell(s: string): string {
  const t = String(s ?? "");
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

export type GhanampsMemberLike = {
  name?: string;
  party?: string;
  constituency?: string;
};

export function parseGhanampsMembersJson(data: unknown): GhanampsMemberLike[] {
  if (!Array.isArray(data)) {
    throw new Error("Expected top-level JSON array of member objects.");
  }
  return data as GhanampsMemberLike[];
}

export function listConstituencySlugsFromGhanampsJson(data: unknown): string[] {
  const members = parseGhanampsMembersJson(data);
  const slugs = new Set<string>();
  for (const m of members) {
    const constituency = (m.constituency ?? "").trim();
    const cSlug = constituency ? normalizeSlug(constituency) : "";
    if (cSlug) slugs.add(cSlug);
  }
  return [...slugs].sort();
}

/** One CSV text block: header + data rows (no trailing newline required). */
export function ghanampsMembersToCsvText(data: unknown): string {
  const members = parseGhanampsMembersJson(data);
  const rows: {
    name: string;
    slug: string;
    role: string;
    party: string;
    constituency_slug: string;
    active: string;
  }[] = [];
  const slugCounts = new Map<string, number>();

  for (const m of members) {
    const name = (m.name ?? "").trim();
    if (!name) continue;

    const baseSlug = normalizeSlug(name);
    if (!baseSlug) continue;
    const n = (slugCounts.get(baseSlug) ?? 0) + 1;
    slugCounts.set(baseSlug, n);
    const slug = n === 1 ? baseSlug : `${baseSlug}-${n}`;

    const party = (m.party ?? "").trim() || "";
    const constituency = (m.constituency ?? "").trim();
    const cSlug = constituency ? normalizeSlug(constituency) : "";

    rows.push({
      name,
      slug,
      role: "MP",
      party,
      constituency_slug: cSlug,
      active: "true",
    });
  }

  const header = "name,slug,role,party,constituency_slug,active";
  const lines = [header];
  for (const r of rows) {
    lines.push(
      [csvCell(r.name), csvCell(r.slug), csvCell(r.role), csvCell(r.party), csvCell(r.constituency_slug), csvCell(r.active)].join(
        ",",
      ),
    );
  }
  return `${lines.join("\n")}\n`;
}
