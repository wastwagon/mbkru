import "server-only";

import { createHash, randomBytes } from "node:crypto";

export function hashPetitionSignatureToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function newPetitionSignatureRawToken(): string {
  return randomBytes(24).toString("hex");
}
