import type { ReactNode } from "react";

import { isPreLaunchLeadCaptureEnabled } from "@/lib/platform/pre-launch-lead-capture";
import { PreLaunchLeadCapturePanel } from "@/components/forms/PreLaunchLeadCapturePanel";

type Variant = "early-access" | "tracker";

type Props = {
  variant: Variant;
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

/** Renders waitlist UI only when `publicLaunchPolish` is off (phases 1–3). */
export function PreLaunchLeadCaptureSection(props: Props) {
  if (!isPreLaunchLeadCaptureEnabled()) return null;
  return <PreLaunchLeadCapturePanel {...props} />;
}
