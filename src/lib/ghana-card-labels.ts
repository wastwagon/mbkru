import type { MemberGhanaCardVerificationStatus } from "@prisma/client";

export function ghanaCardStatusLabel(status: MemberGhanaCardVerificationStatus): string {
  switch (status) {
    case "UNVERIFIED":
      return "Ghana Card not verified";
    case "VERIFIED":
      return "Ghana Card verified";
    case "FAILED":
      return "Ghana Card verification failed";
    default:
      return status;
  }
}

export function ghanaCardStatusDescription(status: MemberGhanaCardVerificationStatus): string {
  switch (status) {
    case "UNVERIFIED":
      return "Verify your Ghana Card to submit MP performance reports. We check your name against the National Identification Authority via Hubtel — we do not store your full card number.";
    case "VERIFIED":
      return "Your Ghana Card identity check passed. MP performance submissions are enabled for this account.";
    case "FAILED":
      return "The details you entered did not match NIA records. Check your card number and legal name, then try again. Contact us if you believe this is an error.";
    default:
      return "";
  }
}
