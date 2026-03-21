import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-[var(--primary)]/20">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[var(--muted-foreground)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button href="/" className="mt-8">
          Back to Home
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
