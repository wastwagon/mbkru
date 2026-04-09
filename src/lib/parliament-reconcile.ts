import type { ParsedParliamentRow } from "./parliament-csv-parse";

/** Snapshot shape used for diffing (no Prisma types). */
export type ParliamentMemberReconcileDbRow = {
  slug: string;
  name: string;
  role: string;
  party: string | null;
  constituencySlug: string | null;
  active: boolean;
};

export type ParliamentReconcileFieldChange = {
  field: "name" | "role" | "party" | "constituency_slug" | "active";
  from: string;
  to: string;
};

export type ParliamentReconcileCreate = {
  slug: string;
  name: string;
  role: string;
  party: string | null;
  constituencySlug: string | null;
  active: boolean;
};

export type ParliamentReconcileUpdate = {
  slug: string;
  changes: ParliamentReconcileFieldChange[];
};

export type ParliamentReconcileResult = {
  /** Parse / validation issues (unknown constituency, duplicate slug in file). */
  rowErrors: string[];
  summary: {
    csvRowsTotal: number;
    csvRowsValid: number;
    wouldCreate: number;
    wouldUpdate: number;
    unchanged: number;
    inDatabaseNotInCsv: number;
  };
  wouldCreate: ParliamentReconcileCreate[];
  wouldUpdate: ParliamentReconcileUpdate[];
  unchangedSlugs: string[];
  /** DB members whose slug never appears in the CSV (review for retired / renamed MPs). */
  inDatabaseNotInCsv: ParliamentMemberReconcileDbRow[];
};

/**
 * Dry-run diff: parsed MP CSV vs current DB roster. Does not write.
 * Rows with unknown `constituency_slug` are excluded from create/update/unchanged counts and listed in `rowErrors`.
 */
export function computeParliamentImportReconcile(
  rows: ParsedParliamentRow[],
  dbMembers: ParliamentMemberReconcileDbRow[],
  constituencySlugToId: Map<string, string>,
): ParliamentReconcileResult {
  const rowErrors: string[] = [];
  const seenSlugs = new Set<string>();
  const validRows: ParsedParliamentRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const lineNo = i + 2;
    if (seenSlugs.has(row.slug)) {
      rowErrors.push(`Row ${lineNo}: duplicate slug "${row.slug}" in CSV`);
      continue;
    }
    seenSlugs.add(row.slug);

    if (row.constituency_slug && !constituencySlugToId.has(row.constituency_slug)) {
      rowErrors.push(`Row ${lineNo}: unknown constituency_slug "${row.constituency_slug}"`);
      continue;
    }
    validRows.push(row);
  }

  const dbBySlug = new Map(dbMembers.map((m) => [m.slug, m]));
  const csvSlugSet = new Set(validRows.map((r) => r.slug));

  const wouldCreate: ParliamentReconcileCreate[] = [];
  const wouldUpdate: ParliamentReconcileUpdate[] = [];
  const unchangedSlugs: string[] = [];

  for (const row of validRows) {
    const db = dbBySlug.get(row.slug);
    const partyCsv = row.party ?? null;
    const cSlug = row.constituency_slug ?? null;

    if (!db) {
      wouldCreate.push({
        slug: row.slug,
        name: row.name,
        role: row.role,
        party: partyCsv,
        constituencySlug: cSlug,
        active: row.active,
      });
      continue;
    }

    const changes: ParliamentReconcileFieldChange[] = [];
    if (db.name !== row.name) {
      changes.push({ field: "name", from: db.name, to: row.name });
    }
    if (db.role !== row.role) {
      changes.push({ field: "role", from: db.role, to: row.role });
    }
    const dbParty = db.party ?? "";
    const csvParty = partyCsv ?? "";
    if (dbParty !== csvParty) {
      changes.push({ field: "party", from: dbParty || "(empty)", to: csvParty || "(empty)" });
    }
    const dbC = db.constituencySlug ?? "";
    const csvC = cSlug ?? "";
    if (dbC !== csvC) {
      changes.push({
        field: "constituency_slug",
        from: dbC || "(none)",
        to: csvC || "(none)",
      });
    }
    if (db.active !== row.active) {
      changes.push({ field: "active", from: String(db.active), to: String(row.active) });
    }

    if (changes.length > 0) {
      wouldUpdate.push({ slug: row.slug, changes });
    } else {
      unchangedSlugs.push(row.slug);
    }
  }

  const inDatabaseNotInCsv = dbMembers.filter((m) => !csvSlugSet.has(m.slug));

  return {
    rowErrors,
    summary: {
      csvRowsTotal: rows.length,
      csvRowsValid: validRows.length,
      wouldCreate: wouldCreate.length,
      wouldUpdate: wouldUpdate.length,
      unchanged: unchangedSlugs.length,
      inDatabaseNotInCsv: inDatabaseNotInCsv.length,
    },
    wouldCreate,
    wouldUpdate,
    unchangedSlugs,
    inDatabaseNotInCsv,
  };
}
