import "server-only";

import { randomInt } from "crypto";

import type { PrismaClient } from "@prisma/client";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Opaque public tracking code (no ambiguous 0/O/1/I). */
export async function allocateTrackingCode(prisma: PrismaClient): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    let code = "";
    for (let i = 0; i < 12; i++) code += ALPHABET[randomInt(ALPHABET.length)]!;
    const exists = await prisma.citizenReport.findUnique({
      where: { trackingCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Could not allocate a unique tracking code");
}
