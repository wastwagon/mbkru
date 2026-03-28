import "server-only";

import { NextResponse } from "next/server";

import { getMemberSessionSecretKey } from "./jwt-config";
import { isMemberAuthEnabled } from "./phase-gate";

export function memberAuthNotEnabledResponse(): NextResponse {
  return NextResponse.json(
    { error: "Member accounts are not enabled for this deployment." },
    { status: 403 },
  );
}

export function memberAuthMisconfiguredResponse(): NextResponse {
  return NextResponse.json(
    { error: "Member auth is not configured (MEMBER_SESSION_SECRET, min 32 characters)." },
    { status: 503 },
  );
}

/** Returns a NextResponse if the request must be rejected; otherwise null. */
export function guardMemberAuthApi(): NextResponse | null {
  if (!isMemberAuthEnabled()) return memberAuthNotEnabledResponse();
  if (!getMemberSessionSecretKey()) return memberAuthMisconfiguredResponse();
  return null;
}
