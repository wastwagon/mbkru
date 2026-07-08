/** Explains admin-only preview while the construction gate is on. */
export function PreLaunchModeCallout() {
  return (
    <div className="mb-8 rounded-2xl border border-[var(--primary)]/25 bg-gradient-to-br from-[var(--primary)]/8 to-white px-5 py-4 sm:px-6">
      <p className="font-display text-base font-semibold text-[var(--foreground)]">Pre-launch mode</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">
        The public under-construction gate is <strong className="text-[var(--foreground)]">on</strong>. Visitors and
        members see the holding page only. Signed-in <strong className="text-[var(--foreground)]">admins</strong> can
        preview the full site for training and editorial work. On launch day, uncheck{" "}
        <strong className="text-[var(--foreground)]">Public site under construction</strong> below after this checklist
        is clear.
      </p>
    </div>
  );
}
