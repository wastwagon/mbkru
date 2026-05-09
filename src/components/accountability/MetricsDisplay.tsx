import type { ReactNode } from "react";

function labelizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderLeaf(v: unknown): ReactNode {
  if (v == null || v === "") return <span className="text-[var(--muted-foreground)]">—</span>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number")
    return Number.isFinite(v) && !Number.isInteger(v)
      ? v.toLocaleString("en-GB", { maximumFractionDigits: 4 })
      : String(v);
  if (typeof v === "string") return v;
  return null;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Renders scorecard `metrics` JSON as readable labels and values (not a raw JSON dump).
 */
export function MetricsDisplay({
  value,
  className = "",
  maxDepth = 14,
}: {
  value: unknown;
  className?: string;
  /** Limits recursion so pathological JSON cannot blow the stack or stall SSR. */
  maxDepth?: number;
}) {
  if (value == null) return null;
  if (maxDepth <= 0) {
    return (
      <p className={`text-xs text-[var(--muted-foreground)] ${className}`.trim()} title="Nested metrics truncated">
        …
      </p>
    );
  }

  const leaf = renderLeaf(value);
  if (leaf != null) {
    return <p className={`text-sm text-[var(--foreground)] ${className}`.trim()}>{leaf}</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const allPrimitive = value.every(
      (x) => x === null || ["string", "number", "boolean"].includes(typeof x),
    );
    if (allPrimitive) {
      return (
        <ul className={`list-disc space-y-1 pl-5 text-sm text-[var(--foreground)] ${className}`.trim()}>
          {value.map((x, i) => (
            <li key={i}>{renderLeaf(x) ?? String(x)}</li>
          ))}
        </ul>
      );
    }
    return (
      <ul className={`space-y-3 ${className}`.trim()}>
        {value.map((item, i) => (
          <li key={i} className="rounded-lg border border-[var(--border)] bg-[var(--section-light)]/40 p-3">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Item {i + 1}</p>
            <div className="mt-2">
              <MetricsDisplay value={item} maxDepth={maxDepth - 1} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return null;
    return (
      <dl className={`grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] ${className}`.trim()}>
        {entries.map(([k, v]) => {
          const innerLeaf = renderLeaf(v);
          return (
            <div key={k} className="contents">
              <dt className="text-[var(--muted-foreground)]">{labelizeKey(k)}</dt>
              <dd className="text-[var(--foreground)]">
                {innerLeaf != null ? (
                  innerLeaf
                ) : (
                  <div className="rounded-md border border-[var(--border)]/60 bg-white/50 p-2">
                    <MetricsDisplay value={v} maxDepth={maxDepth - 1} />
                  </div>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }

  return <p className={`text-sm text-[var(--muted-foreground)] ${className}`.trim()}>{String(value)}</p>;
}
