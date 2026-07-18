import Image from "next/image";

/**
 * MP headshot with initials fallback when `portraitPath` is null
 * (admin can upload later via /admin/parliament/[id]).
 */
export function MpPortrait({
  name,
  portraitPath,
  size = "md",
  className = "",
}: {
  name: string;
  portraitPath?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? 40 : size === "lg" ? 96 : 56;
  const text = size === "sm" ? "text-xs" : size === "lg" ? "text-2xl" : "text-sm";
  const initials = name
    .replace(/^(hon\.?\s*|rt\.?\s*hon\.?\s*)+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--section-light)] ${className}`}
      style={{ width: dim, height: dim }}
      aria-hidden={portraitPath ? undefined : true}
    >
      {portraitPath ? (
        <Image
          src={portraitPath}
          alt=""
          width={dim}
          height={dim}
          className="h-full w-full object-cover object-top"
          sizes={`${dim}px`}
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center font-semibold text-[var(--primary)] ${text}`}
          title={`${name} — portrait not yet available`}
        >
          {initials || "MP"}
        </span>
      )}
    </span>
  );
}
