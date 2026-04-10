import type { Metadata, Viewport } from "next";
import { Kumbh_Sans, Lora, Playfair_Display } from "next/font/google";
import { heroContent } from "@/lib/site-content";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mbkruadvocates.org";

const kumbhSans = Kumbh_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `MBKRU Advocates | ${heroContent.tagline}`,
    template: "%s | MBKRU Advocates",
  },
  description:
    "My Brother's Keeper Restoration United (MBKRU) — A direct voice between the President and people of Ghana. Advocate for the disenfranchised, watchdog for accountability, catalyst for poverty eradication.",
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
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kumbhSans.variable} ${lora.variable} ${playfairDisplay.variable} font-sans flex min-h-screen flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
