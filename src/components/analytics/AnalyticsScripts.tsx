import Script from "next/script";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
const plausibleScriptSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL?.trim() ?? "https://plausible.io/js/script.js";

/**
 * Loads third-party analytics only when public env vars are set.
 * Render inside the public route group layout so `/admin` is excluded.
 */
export function AnalyticsScripts() {
  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="mbkru-ga4" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)});
            `.trim()}
          </Script>
        </>
      ) : null}
      {plausibleDomain ? (
        <Script
          defer
          strategy="afterInteractive"
          src={plausibleScriptSrc}
          data-domain={plausibleDomain}
        />
      ) : null}
    </>
  );
}
