import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { BackToTop } from "@/components/ui/BackToTop";
import { MBKRUVoiceChatbot } from "@/components/voice/MBKRUVoiceChatbot";
import { AccessibilityVoiceTools } from "@/components/accessibility/AccessibilityVoiceTools";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--primary)]"
      >
        Skip to main content
      </a>
      <div className="sticky top-0 z-50">
        <div className="relative z-[60]">
          <TopBar />
        </div>
        <Header />
      </div>
      <main
        id="main"
        className="min-w-0 flex-1 overflow-x-hidden pb-[max(1rem,env(safe-area-inset-bottom))]"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
      <div className="pointer-events-none fixed bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+1rem))] right-3 z-40 flex max-w-full flex-col-reverse items-end gap-2.5 sm:right-6">
        <div className="pointer-events-auto">
          <BackToTop />
        </div>
        <div className="pointer-events-auto">
          <MBKRUVoiceChatbot />
        </div>
      </div>
      <AccessibilityVoiceTools />
      <AnalyticsScripts />
    </>
  );
}
