import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Inter, Tiro_Devanagari_Hindi, Mukta } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { SiteProvider } from "@/lib/site-context";
import { LocationProvider } from "@/lib/location-context";
import { PushNotifications } from "@/components/PushNotifications";
import { ScrollToTop } from "@/components/ScrollToTop";
import { serverApi } from "@/lib/server-api";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-hindi", weight: ["400", "500", "600", "700"] });
const serifHindi = Tiro_Devanagari_Hindi({ subsets: ["devanagari", "latin"], variable: "--font-serif-hi", weight: "400" });
const mukta = Mukta({ subsets: ["devanagari", "latin"], variable: "--font-mukta", weight: ["400", "500", "600", "700"] });

const DEFAULT_TITLE = "NewsHub - Hindi News Portal";
const DEFAULT_DESCRIPTION = "Latest Hindi news, breaking news, politics, sports, entertainment, rashifal and more";

// This app serves 7+ tenant domains from one deployment, differentiated only
// by the incoming Host header. Metadata here resolves the site per-request
// via serverApi.site(), so this route tree must render dynamically —
// otherwise Next prerenders a page like /home once (e.g. for whichever
// domain requests it first) and reuses that cached HTML, title included,
// for every other domain that shares the same path.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await serverApi.site();

  return {
    title: site?.name ? `${site.name} - Hindi News Portal` : DEFAULT_TITLE,
    description: site?.description || site?.seoDefaults?.metaDescription || DEFAULT_DESCRIPTION,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await serverApi.site();
  const themeColor = site?.primaryColor || "#E53E3E";

  return (
    <html lang="hi" className={`${inter.variable} ${devanagari.variable} ${serifHindi.variable} ${mukta.variable}`}>
      <head>
        <meta name="theme-color" content={themeColor} />
        {site?.logoUrl && <link rel="apple-touch-icon" href={site.logoUrl} />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement(
                  { pageLanguage: 'hi', includedLanguages: 'en,hi,bn,ta,te,mr,gu,kn,ml,pa,ur', autoDisplay: false },
                  'google_translate_element'
                );
              }
              function hideGoogBanner() {
                var b = document.querySelector('.goog-te-banner-frame');
                if (b) b.style.cssText = 'display:none!important';
                var m = document.querySelectorAll('.goog-te-menu-frame, iframe[class*="goog-te"]');
                for (var i = 0; i < m.length; i++) m[i].style.cssText = 'display:none!important';
                if (document.body) document.body.style.removeProperty('top');
              }
              // Load Google Translate AFTER page fully loads to avoid React hydration conflicts.
              // Guarded by a window flag because a full page load (hard refresh, deep link)
              // must only inject/fetch the widget script once per tab — without this guard a
              // user who hard-refreshes or opens multiple links quickly can trip Google's own
              // rate limit (429) on the translate_a/element.js endpoint.
              window.addEventListener('load', function() {
                if (window.__gtLoaded) return;
                window.__gtLoaded = true;
                var s = document.createElement('script');
                s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                s.async = true;
                document.head.appendChild(s);
                // Poll to hide the banner Google injects after translating.
                // Capped rather than infinite — a reader can switch languages
                // repeatedly at any point in a long-lived tab, so this can't
                // just stop after the first hide, but running forever for
                // the entire tab lifetime (hours, for a news site) wastes
                // CPU/battery long after anyone would plausibly translate.
                var pollElapsedMs = 0;
                var pollCapMs = 20 * 60 * 1000; // 20 minutes
                var pollId = setInterval(function() {
                  hideGoogBanner();
                  pollElapsedMs += 500;
                  if (pollElapsedMs > pollCapMs) clearInterval(pollId);
                }, 500);
              });
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <AuthProvider>
          <SiteProvider>
            <LocationProvider>
              <ScrollToTop />
              {children}
            </LocationProvider>
            <PushNotifications />
          </SiteProvider>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
