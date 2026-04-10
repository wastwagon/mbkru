import "server-only";

import { prisma } from "@/lib/db/prisma";

export type PetitionPendingByPetitionRow = {
  petitionId: string;
  slug: string;
  title: string;
  petitionStatus: string;
  activePending: number;
  expiredPending: number;
};

export type PetitionPendingAnalytics = {
  generatedAt: string;
  totals: {
    /** Rows with expiresAt in the future. */
    activePending: number;
    /** Rows past expiry (cleanup target). */
    expiredPending: number;
    /** active + expired */
    allPendingRows: number;
    /** Confirmed signatures (members + verified guests). */
    verifiedSignatures: number;
  };
  createdCounts: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  /** Petitions with any pending row, sorted by total pending desc. */
  byPetition: PetitionPendingByPetitionRow[];
};

const MAX_PETITIONS = 40;

function mergePetitionsCounts(
  active: { petitionId: string; _count: { _all: number } }[],
  expired: { petitionId: string; _count: { _all: number } }[],
): Map<string, { active: number; expired: number }> {
  const map = new Map<string, { active: number; expired: number }>();
  for (const row of active) {
    map.set(row.petitionId, { active: row._count._all, expired: 0 });
  }
  for (const row of expired) {
    const cur = map.get(row.petitionId) ?? { active: 0, expired: 0 };
    cur.expired = row._count._all;
    map.set(row.petitionId, cur);
  }
  return map;
}

/** Aggregate pending guest-signature queue stats (emails hashed in DB; no PII in response). */
export async function getPetitionPendingAnalytics(): Promise<PetitionPendingAnalytics> {
  const now = new Date();
  const d24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    activePending,
    expiredPending,
    created24,
    created7,
    created30,
    verifiedSignatures,
    activeByPet,
    expiredByPet,
  ] = await Promise.all([
    prisma.petitionSignaturePending.count({ where: { expiresAt: { gte: now } } }),
    prisma.petitionSignaturePending.count({ where: { expiresAt: { lt: now } } }),
    prisma.petitionSignaturePending.count({ where: { createdAt: { gte: d24 } } }),
    prisma.petitionSignaturePending.count({ where: { createdAt: { gte: d7 } } }),
    prisma.petitionSignaturePending.count({ where: { createdAt: { gte: d30 } } }),
    prisma.petitionSignature.count(),
    prisma.petitionSignaturePending.groupBy({
      by: ["petitionId"],
      where: { expiresAt: { gte: now } },
      _count: { _all: true },
    }),
    prisma.petitionSignaturePending.groupBy({
      by: ["petitionId"],
      where: { expiresAt: { lt: now } },
      _count: { _all: true },
    }),
  ]);

  const merged = mergePetitionsCounts(activeByPet, expiredByPet);
  const petitionIds = [...merged.keys()];
  const petitions =
    petitionIds.length === 0
      ? []
      : await prisma.petition.findMany({
          where: { id: { in: petitionIds } },
          select: { id: true, slug: true, title: true, status: true },
        });
  const petMap = new Map(petitions.map((p) => [p.id, p]));

  const byPetition: PetitionPendingByPetitionRow[] = petitionIds
    .map((petitionId) => {
      const counts = merged.get(petitionId)!;
      const p = petMap.get(petitionId);
      return {
        petitionId,
        slug: p?.slug ?? petitionId,
        title: p?.title ?? "(removed petition)",
        petitionStatus: p?.status ?? "UNKNOWN",
        activePending: counts.active,
        expiredPending: counts.expired,
      };
    })
    .sort((a, b) => b.activePending + b.expiredPending - (a.activePending + a.expiredPending))
    .slice(0, MAX_PETITIONS);

  return {
    generatedAt: now.toISOString(),
    totals: {
      activePending,
      expiredPending,
      allPendingRows: activePending + expiredPending,
      verifiedSignatures,
    },
    createdCounts: {
      last24h: created24,
      last7d: created7,
      last30d: created30,
    },
    byPetition,
  };
}
