import { Prisma } from "@prisma/client";

/** Missing table (P2021) or column (P2022) — e.g. migrations not yet applied. */
export function isRecoverablePrismaSchemaError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P2021" || err.code === "P2022")
  );
}
