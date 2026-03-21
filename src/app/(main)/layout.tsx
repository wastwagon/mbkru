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
      <main id="main" className="flex-1 pt-16" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
