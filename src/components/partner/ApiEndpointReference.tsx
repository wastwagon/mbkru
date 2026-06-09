import Link from "next/link";
import type { ReactNode } from "react";

export type ApiEndpointRow = {
  path: string;
  purpose: ReactNode;
};

type Props = {
  endpoints: ApiEndpointRow[];
};

/** Mobile card list + desktop table for API endpoint reference. */
export function ApiEndpointReference({ endpoints }: Props) {
  return (
    <>
      <ul className="mt-6 space-y-3 sm:hidden">
        {endpoints.map((row) => (
          <li
            key={row.path}
            className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 p-4 shadow-sm"
          >
            <p className="font-mono text-sm font-semibold text-[var(--foreground)]">{row.path}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">{row.purpose}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 hidden overflow-x-auto rounded-lg border border-[var(--border)] sm:block">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead className="bg-[var(--section-light)] text-[var(--foreground)]">
            <tr>
              <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Path</th>
              <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-[var(--foreground-secondary)]">
            {endpoints.map((row, index) => (
              <tr key={row.path}>
                <td
                  className={`border-b border-[var(--border)] px-3 py-2 font-mono text-[13px] text-[var(--foreground)] ${
                    index === endpoints.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {row.path}
                </td>
                <td className={`border-b border-[var(--border)] px-3 py-2 ${index === endpoints.length - 1 ? "border-b-0" : ""}`}>
                  {row.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
