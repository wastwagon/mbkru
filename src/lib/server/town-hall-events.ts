import "server-only";

import type { ProgrammeEventKind } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

type ProgrammeQuery = {
  kind?: ProgrammeEventKind;
};

/** Programme listings for /town-halls and /debates — excludes cancelled rows. */
export async function getProgrammeTownHallEvents(options?: ProgrammeQuery) {
  return prisma.townHallEvent.findMany({
    where: {
      status: { not: "CANCELLED" },
      ...(options?.kind != null ? { kind: options.kind } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }, { slug: "asc" }],
    include: {
      region: { select: { name: true, slug: true } },
      constituency: { select: { name: true, slug: true } },
    },
  });
}
