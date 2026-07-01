"use client";

import Link from "next/link";
import { useSite } from "@/lib/site-context";

export function Footer() {
  const { site, isHindi } = useSite();
  const siteName = site?.name || "NewsHub";

  return (
    <footer className="bg-(--ink) text-gray-300 py-10 mt-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-black text-lg mb-3">{siteName}</h3>
          <p className="text-sm">
            {isHindi
              ? "हिंदी समाचार का विश्वसनीय स्रोत — राजनीति, खेल, मनोरंजन और बहुत कुछ।"
              : "Your trusted source for news — politics, sports, entertainment, and more."}
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{isHindi ? "कैटेगरी" : "Categories"}</h4>
          <div className="space-y-2 text-sm">
            <Link href="/category/politics" className="block hover:text-brand transition">{isHindi ? "राजनीति" : "Politics"}</Link>
            <Link href="/category/sports" className="block hover:text-brand transition">{isHindi ? "खेल" : "Sports"}</Link>
            <Link href="/category/entertainment" className="block hover:text-brand transition">{isHindi ? "मनोरंजन" : "Entertainment"}</Link>
            <Link href="/category/business" className="block hover:text-brand transition">{isHindi ? "व्यापार" : "Business"}</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{isHindi ? "फ़ीचर्स" : "Features"}</h4>
          <div className="space-y-2 text-sm">
            <Link href="/rashifal" className="block hover:text-brand transition">{isHindi ? "राशिफल" : "Horoscope"}</Link>
            <Link href="/web-stories" className="block hover:text-brand transition">{isHindi ? "वेब स्टोरीज़" : "Web Stories"}</Link>
            <Link href="/photo-gallery" className="block hover:text-brand transition">{isHindi ? "फोटो गैलरी" : "Photo Gallery"}</Link>
            <Link href="/video" className="block hover:text-brand transition">{isHindi ? "वीडियो" : "Video"}</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{isHindi ? "कंपनी" : "Company"}</h4>
          <div className="space-y-2 text-sm">
            <Link href="/membership" className="block hover:text-brand transition">{isHindi ? "सदस्यता" : "Membership"}</Link>
            <Link href="/about" className="block hover:text-brand transition">{isHindi ? "हमारे बारे में" : "About"}</Link>
            <Link href="/contact" className="block hover:text-brand transition">{isHindi ? "संपर्क करें" : "Contact"}</Link>
            <Link href="/privacy" className="block hover:text-brand transition">{isHindi ? "गोपनीयता नीति" : "Privacy"}</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-700 text-center text-sm">
        &copy; {new Date().getFullYear()} {siteName}. {isHindi ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}
      </div>
    </footer>
  );
}
