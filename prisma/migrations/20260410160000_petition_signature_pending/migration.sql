-- Guest petition signatures: email confirmation before counting (optional via PETITION_VERIFY_GUEST_SIGNATURES).

CREATE TABLE "PetitionSignaturePending" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "signerEmail" VARCHAR(254) NOT NULL,
    "signerName" VARCHAR(120),
    "consentShowName" BOOLEAN NOT NULL DEFAULT false,
    "consentUpdates" BOOLEAN NOT NULL DEFAULT false,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetitionSignaturePending_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PetitionSignaturePending_tokenHash_key" ON "PetitionSignaturePending"("tokenHash");
CREATE UNIQUE INDEX "PetitionSignaturePending_petitionId_signerEmail_key" ON "PetitionSignaturePending"("petitionId", "signerEmail");
CREATE INDEX "PetitionSignaturePending_petitionId_idx" ON "PetitionSignaturePending"("petitionId");
CREATE INDEX "PetitionSignaturePending_expiresAt_idx" ON "PetitionSignaturePending"("expiresAt");

ALTER TABLE "PetitionSignaturePending" ADD CONSTRAINT "PetitionSignaturePending_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
