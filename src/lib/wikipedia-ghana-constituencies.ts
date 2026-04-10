/**
 * Parse English Wikipedia wikitext for [[List of parliamentary constituencies of Ghana]]
 * into MBKRU constituency rows (name, slug, region_slug).
 *
 * **Source:** https://en.wikipedia.org/wiki/List_of_parliamentary_constituencies_of_Ghana
 * Content is CC BY-SA; verify boundaries and names against the Electoral Commission before production.
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

function wikiRegionKey(rawLink: string): string {
  return rawLink
    .trim()
    .toLowerCase()
    .replace(/,\s*ghana$/i, "")
    .trim();
}

/** Map Wikipedia ==[[… Region]]== link target → Region.slug in MBKRU seed. */
export function mapWikipediaRegionLinkToSlug(rawLink: string): string | null {
  const key = wikiRegionKey(rawLink);
  const table: Record<string, string> = {
    "ahafo region": "ahafo",
    "ashanti region": "ashanti",
    "bono region": "bono",
    "bono east region": "bono-east",
    "central region": "central",
    "eastern region": "eastern",
    "greater accra region": "greater-accra",
    "north east region": "north-east",
    "northern region": "northern",
    "oti region": "oti",
    "savannah region": "savannah",
    "upper east region": "upper-east",
    "upper west region": "upper-west",
    "volta region": "volta",
    "western region": "western",
    "western north region": "western-north",
  };
  return table[key] ?? null;
}

const REGION_SECTION = /^==\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\s*==\s*$/;

/** `[[Name (Ghana parliament constituency)|Label]]` or `[[Name (Ghana parliament constituency)]]` */
const CONSTITUENCY_LINK =
  /\[\[([^\]|]+?)\s*\(Ghana parliament constituency\)(?:\|([^\]]+))?\]\]/g;

export type ParsedWikiConstituency = {
  name: string;
  slug: string;
  region_slug: string;
};

/**
 * Walk wikitext line-by-line: track current region from `==[[X Region]]==`, collect constituency links in tables.
 */
export function parseGhanaConstituenciesFromWikipediaWikitext(wikitext: string): ParsedWikiConstituency[] {
  const lines = wikitext.split(/\r?\n/);
  let regionSlug: string | null = null;
  const out: ParsedWikiConstituency[] = [];
  const seenSlug = new Set<string>();

  for (const line of lines) {
    const rm = line.match(REGION_SECTION);
    if (rm) {
      const raw = rm[1] ?? "";
      regionSlug = mapWikipediaRegionLinkToSlug(raw);
      continue;
    }

    if (!regionSlug) continue;

    CONSTITUENCY_LINK.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = CONSTITUENCY_LINK.exec(line)) !== null) {
      const technical = (m[1] ?? "").trim();
      const display = (m[2] ?? technical.replace(/\s*\(Ghana parliament constituency\)\s*$/i, "")).trim();
      if (!display) continue;
      const slug = normalizeSlug(display);
      if (!slug) continue;
      if (seenSlug.has(slug)) continue;
      seenSlug.add(slug);
      out.push({
        name: display,
        slug,
        region_slug: regionSlug,
      });
    }
  }

  return out;
}

function csvCell(s: string): string {
  const t = String(s ?? "");
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

/** Build import-ready CSV (header name,slug,region_slug,code). */
export function wikiConstituenciesToCsvText(rows: ParsedWikiConstituency[]): string {
  const header = "name,slug,region_slug,code";
  const lines = [header];
  for (const r of rows) {
    lines.push([csvCell(r.name), csvCell(r.slug), csvCell(r.region_slug), ""].join(","));
  }
  return `${lines.join("\n")}\n`;
}
