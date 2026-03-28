import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { BackToTop } from "@/components/ui/BackToTop";

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
      <TopBar />
      <Header />
      <main
        id="main"
        className="min-w-0 flex-1 overflow-x-hidden pt-16 pb-[max(1rem,env(safe-area-inset-bottom))]"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
      <BackToTop />
      <AnalyticsScripts />
    </>
  );
}
