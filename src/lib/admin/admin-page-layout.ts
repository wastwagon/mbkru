/**
 * Standard admin content widths. Prefer `default` unless the page truly needs another measure.
 *
 * - **default** — lists, dashboards, most admin tables (`max-w-5xl`)
 * - **narrow** — settings, medium forms (`max-w-4xl`)
 * - **form** — long single-column editors (`max-w-3xl`)
 * - **compact** — short identity / confirmation style pages (`max-w-2xl`)
 * - **wide** — wide tables, audit filters (`max-w-6xl`)
 */
export type AdminPageWidth = "default" | "narrow" | "form" | "compact" | "wide";

export function adminPageWidthClass(width: AdminPageWidth): string {
  switch (width) {
    case "narrow":
      return "max-w-4xl";
    case "form":
      return "max-w-3xl";
    case "compact":
      return "max-w-2xl";
    case "wide":
      return "max-w-6xl";
    default:
      return "max-w-5xl";
  }
}
