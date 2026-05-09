import { permanentRedirect } from "next/navigation";

/** Legacy URL — catalogue lives at `/promises/browse` with a government-programme preset. */
export default function LegacyGovernmentCommitmentsRoute() {
  permanentRedirect("/promises/browse?governmentOnly=1");
}
