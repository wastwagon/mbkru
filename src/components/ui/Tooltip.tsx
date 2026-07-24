import type { ReactNode } from "react";

type Placement = "top" | "bottom";

type Props = {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  className?: string;
  /**
   * When true, do not wrap children in a focusable span (use when children is already
   * a link/button — `group-focus-within` still works).
   */
  interactive?: boolean;
};

/**
 * CSS tooltip (Untitled UI Tooltips → MBKRU tokens).
 * Hover + keyboard focus via `group-hover` / `group-focus-within` — safe in RSC.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  className = "",
  interactive = false,
}: Props) {
  const pos =
    placement === "bottom"
      ? "top-full mt-2 left-1/2 -translate-x-1/2"
      : "bottom-full mb-2 left-1/2 -translate-x-1/2";

  return (
    <span className={`group relative inline-flex max-w-full ${className}`.trim()}>
      {interactive ? (
        children
      ) : (
        <span
          tabIndex={0}
          className="inline-flex max-w-full cursor-help outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 focus-visible:ring-offset-1"
        >
          {children}
        </span>
      )}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-40 w-max max-w-[16rem] rounded-lg border border-[var(--border)] bg-[var(--foreground)] px-2.5 py-1.5 text-left text-xs font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${pos}`}
      >
        {content}
      </span>
    </span>
  );
}
