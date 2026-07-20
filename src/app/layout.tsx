import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { SiteProvider } from "@/lib/site-context";
import { LocationProvider } from "@/lib/location-context";
import { PushNotifications } from "@/components/PushNotifications";
import { ScrollToTop } from "@/components/ScrollToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-hindi", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "NewsHub - Hindi News Portal",
  description: "Latest Hindi news, breaking news, politics, sports, entertainment, rashifal and more",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={`${inter.variable} ${devanagari.variable}`}>
      <head>
        <meta name="theme-color" content="#E53E3E" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
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
                if (document.body) document.body.style.removeProperty('top');
              }
              // Load Google Translate AFTER page fully loads to avoid React hydration conflicts
              window.addEventListener('load', function() {
                var s = document.createElement('script');
                s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                s.async = true;
                document.head.appendChild(s);
                // Poll to hide the banner Google injects after translating
                setInterval(hideGoogBanner, 500);
              });
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-gray-50">
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
