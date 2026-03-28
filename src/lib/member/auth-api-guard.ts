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

/**
 * GET /api/auth/me only: when Phase 2+ but `MEMBER_SESSION_SECRET` is missing, return 200 so the
 * browser does not log a failed network request on every page (operators still fix env for login).
 */
export function guardMemberAuthMeRoute(): NextResponse | null {
  if (!isMemberAuthEnabled()) return memberAuthNotEnabledResponse();
  if (!getMemberSessionSecretKey()) {
    return NextResponse.json({ member: null, authConfigured: false }, { status: 200 });
  }
  return null;
}

/** Returns a NextResponse if the request must be rejected; otherwise null. */
export function guardMemberAuthApi(): NextResponse | null {
  if (!isMemberAuthEnabled()) return memberAuthNotEnabledResponse();
  if (!getMemberSessionSecretKey()) return memberAuthMisconfiguredResponse();
  return null;
}
