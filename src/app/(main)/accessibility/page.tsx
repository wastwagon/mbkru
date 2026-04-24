import { PageHeader } from "@/components/ui/PageHeader";

export default function AccessibilityPage() {
  return (
    <div className="bg-[var(--section-light)]">
      <PageHeader
        title="Accessibility Statement"
        subtitle="Inclusive access across keyboard, speech, and readable content experiences."
      />
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-6 sm:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Current accessibility support</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--foreground)]">
            <li>Keyboard-first navigation with visible focus styles and skip-to-content support.</li>
            <li>Text-to-speech page summary and read-selected-text controls.</li>
            <li>Speech-to-text input with language options: English (Ghana), Twi, Ga, Hausa, and Ewe.</li>
            <li>MBKRU Voice chatbot with microphone input and optional read-aloud responses.</li>
            <li>Fallback behavior when browser speech engines are unavailable.</li>
          </ul>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Some voice capabilities depend on operating-system language packs and browser support. If you need help using
            these features, contact MBKRU support through the contact page.
          </p>
        </div>
      </section>
    </div>
  );
}
