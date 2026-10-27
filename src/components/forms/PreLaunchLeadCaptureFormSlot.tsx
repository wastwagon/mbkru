"use client";

import dynamic from "next/dynamic";

const EarlyAccessForm = dynamic(
  () => import("@/components/forms/EarlyAccessForm").then((m) => ({ default: m.EarlyAccessForm })),
  { loading: () => <p className="mt-6 text-sm text-[var(--foreground-secondary)]">Loading form…</p> },
);

const TrackerSignupForm = dynamic(
  () => import("@/components/forms/TrackerSignupForm").then((m) => ({ default: m.TrackerSignupForm })),
  { loading: () => <p className="mt-6 text-sm text-[var(--foreground-secondary)]">Loading form…</p> },
);

type Props = { variant: "early-access" | "tracker" };

/** Async chunks — not loaded on phase 4 builds where the parent panel is not rendered. */
export function PreLaunchLeadCaptureFormSlot({ variant }: Props) {
  return variant === "early-access" ? <EarlyAccessForm /> : <TrackerSignupForm />;
}
