import type { LeadCaptureSource } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export function normalizeLeadEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Idempotent: same email + source updates nothing (keeps first createdAt). */
export async function upsertLeadCapture(
  email: string,
  source: LeadCaptureSource,
): Promise<void> {
  const normalized = normalizeLeadEmail(email);
  await prisma.leadCapture.upsert({
    where: {
      email_source: { email: normalized, source },
    },
    create: { email: normalized, source },
    update: {},
  });
}
