import type { MemberIdentityVerificationStatus } from "@prisma/client";

/** Member-facing copy (staff notes stay admin-only). */
export function memberIdentityStatusLabel(status: MemberIdentityVerificationStatus): string {
  switch (status) {
    case "UNVERIFIED":
      return "Not verified";
    case "PENDING_REVIEW":
      return "Verification in progress";
    case "VERIFIED":
      return "Verified";
    case "REJECTED":
      return "Could not verify";
    default:
      return status;
  }
}

export function memberIdentityStatusDescription(status: MemberIdentityVerificationStatus): string {
  switch (status) {
    case "UNVERIFIED":
      return "You can use MBKRU Voice with email registration. Stronger identity checks may be added later; staff may upgrade your status after manual review.";
    case "PENDING_REVIEW":
      return "Our team is reviewing your account against programme rules. You will be notified when the status changes.";
    case "VERIFIED":
      return "Your membership has been confirmed for programme purposes. This is not a government ID check.";
    case "REJECTED":
      return "We could not confirm eligibility under current rules. Use Contact if you think this is a mistake.";
    default:
      return "";
  }
}
