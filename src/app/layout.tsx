import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Kumbh_Sans, Lora, Playfair_Display } from "next/font/google";
import { colorThemeBootScript } from "@/lib/client/color-theme";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { heroContent } from "@/lib/site-content";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mbkruadvocates.org";

const buildPhase = Number.parseInt(process.env.NEXT_PUBLIC_PLATFORM_PHASE ?? "1", 10);
const launchPolishMeta = buildPhase >= 4;
const defaultOgImage = "/images/mbkru-voice-digital.jpg";

/**
 * Disable `link rel=preload` for all Google fonts. Next still injects `@font-face` styles — fonts load normally without
 * preload hints, which avoids Chrome “preloaded but not used within a few seconds” warnings (common when many weights
 * are bundled or secondary families paint after hero).
 */
const kumbhSans = Kumbh_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const playfairDisplay = Playfair_Display({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0f766e" },
  ],
};

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: launchPolishMeta
      ? "MBKRU Advocates | Independent civic accountability in Ghana"
      : `MBKRU Advocates | ${heroContent.tagline}`,
    template: "%s | MBKRU Advocates",
  },
  description: launchPolishMeta
    ? "MBKRU Advocates — independent civic accountability for Ghana. Report issues, track public commitments, and explore the People's Report Card and MP tracker."
    : "My Brother's Keeper Restoration United (MBKRU) — A direct voice between the President and people of Ghana. Advocate for the disenfranchised, watchdog for accountability, catalyst for poverty eradication.",
  keywords: [
    "Ghana",
    "civic accountability",
    "citizens engagement",
    "government accountability",
    "parliament",
    "MP tracker",
    "citizens voice",
  ],
  authors: [{ name: "MBKRU Advocates" }],
  openGraph: {
    type: "website",
    locale: "en_GH",
    ...(launchPolishMeta
      ? {
          images: [
            {
              url: defaultOgImage,
              width: 1200,
              height: 630,
              alt: "MBKRU Advocates — civic accountability in Ghana",
            },
          ],
        }
      : {}),
  },
  twitter: launchPolishMeta
    ? {
        card: "summary_large_image",
        images: [defaultOgImage],
      }
    : undefined,
  robots: {
    index: true,
    follow: true,
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  appleWebApp: {
    capable: true,
    title: "MBKRU",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="mbkru-color-theme-boot" strategy="beforeInteractive">
          {colorThemeBootScript}
        </Script>
        {launchPolishMeta ? <OrganizationJsonLd /> : null}
      </head>
      <body
        className={`${kumbhSans.variable} ${lora.variable} ${playfairDisplay.variable} font-sans flex min-h-screen flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
