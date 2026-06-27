import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ghanaCardLastFour, hashGhanaCardNumber } from "@/lib/ghana-card";
import { createMemberNotification } from "@/lib/server/member-notifications";
import {
  getHubtelGhanaCardConfig,
  isHubtelGhanaCardConfigured,
  mpPerformanceCooldownDays,
  mpSubmitRequiresGhanaCard,
} from "@/lib/server/hubtel-ghana-card-config";
import { verifyGhanaCardWithHubtel } from "@/lib/server/hubtel-ghana-card-verify";

export type MpPerformanceSubmitGateResult =
  | { ok: true }
  | { ok: false; status: 403 | 429; code: string; message: string };

export async function assertMpPerformanceSubmitAllowed(
  memberId: string,
  parliamentMemberId: string,
): Promise<MpPerformanceSubmitGateResult> {
  if (mpSubmitRequiresGhanaCard()) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { ghanaCardVerificationStatus: true },
    });
    if (!member || member.ghanaCardVerificationStatus !== "VERIFIED") {
      return {
        ok: false,
        status: 403,
        code: "GHANA_CARD_REQUIRED",
        message: "Verify your Ghana Card on your account before submitting MP performance reports.",
      };
    }
  }

  const cooldownDays = mpPerformanceCooldownDays();
  const since = new Date(Date.now() - cooldownDays * 24 * 60 * 60 * 1000);
  const recent = await prisma.citizenReport.findFirst({
    where: {
      memberId,
      kind: "MP_PERFORMANCE",
      parliamentMemberId,
      createdAt: { gte: since },
      status: { not: "ARCHIVED" },
    },
    select: { createdAt: true, trackingCode: true },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    return {
      ok: false,
      status: 429,
      code: "MP_REPORT_COOLDOWN",
      message: `You already submitted an MP performance report for this MP within the last ${cooldownDays} days. You can submit again after the cooldown.`,
    };
  }

  return { ok: true };
}

export type MemberGhanaCardVerifyOutcome =
  | { ok: true; verifiedAt: string; lastFour: string | null }
  | {
      ok: false;
      code:
        | "NOT_CONFIGURED"
        | "ALREADY_VERIFIED"
        | "CARD_IN_USE"
        | "NO_MATCH"
        | "PROVIDER_ERROR"
        | "PROVIDER_UNAVAILABLE";
      message: string;
    };

export async function verifyMemberGhanaCard(input: {
  memberId: string;
  normalizedCard: string;
  surname: string;
  forenames: string;
  dateOfBirth?: string;
}): Promise<MemberGhanaCardVerifyOutcome> {
  if (!isHubtelGhanaCardConfigured()) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Ghana Card verification is not configured on this deployment.",
    };
  }

  const config = getHubtelGhanaCardConfig();
  if (!config) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Ghana Card verification is not configured on this deployment.",
    };
  }

  const member = await prisma.member.findUnique({
    where: { id: input.memberId },
    select: { ghanaCardVerificationStatus: true },
  });
  if (!member) {
    return { ok: false, code: "PROVIDER_ERROR", message: "Account not found." };
  }
  if (member.ghanaCardVerificationStatus === "VERIFIED") {
    return {
      ok: false,
      code: "ALREADY_VERIFIED",
      message: "This account already has a verified Ghana Card.",
    };
  }

  let cardHash: string;
  try {
    cardHash = hashGhanaCardNumber(input.normalizedCard);
  } catch {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Ghana Card verification is not configured on this deployment.",
    };
  }

  const existing = await prisma.member.findFirst({
    where: { ghanaCardNumberHash: cardHash, NOT: { id: input.memberId } },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      code: "CARD_IN_USE",
      message: "This Ghana Card is already linked to another MBKRU account.",
    };
  }

  const hubtel = await verifyGhanaCardWithHubtel(config, {
    ghanaCardNumber: input.normalizedCard,
    surname: input.surname,
    forenames: input.forenames,
    dateOfBirth: input.dateOfBirth ?? null,
  });

  if (!hubtel.ok) {
    await prisma.member.update({
      where: { id: input.memberId },
      data: { ghanaCardVerificationStatus: "FAILED" },
    });
    return {
      ok: false,
      code:
        hubtel.reason === "NO_MATCH"
          ? "NO_MATCH"
          : hubtel.reason === "PROVIDER_UNAVAILABLE"
            ? "PROVIDER_UNAVAILABLE"
            : "PROVIDER_ERROR",
      message: hubtel.message,
    };
  }

  const verifiedAt = new Date();
  const lastFour = ghanaCardLastFour(input.normalizedCard);

  await prisma.member.update({
    where: { id: input.memberId },
    data: {
      ghanaCardVerificationStatus: "VERIFIED",
      ghanaCardNumberHash: cardHash,
      ghanaCardLastFour: lastFour,
      ghanaCardVerifiedAt: verifiedAt,
      ghanaCardLegalSurname: input.surname.trim(),
      ghanaCardLegalForenames: input.forenames.trim(),
      ghanaCardHubtelRef: hubtel.reference,
    },
  });

  await createMemberNotification(input.memberId, "ghana_card_verified", {
    lastFour,
    verifiedAt: verifiedAt.toISOString(),
  });

  return { ok: true, verifiedAt: verifiedAt.toISOString(), lastFour };
}
