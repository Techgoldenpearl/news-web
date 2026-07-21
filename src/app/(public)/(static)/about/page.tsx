"use client";

import { useSite } from "@/lib/site-context";

export default function AboutPage() {
  const { site, isHindi } = useSite();
  const siteName = site?.name || "NewsHub";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "हमारे बारे में" : "About Us"}</h1>
      <div className="prose prose-lg max-w-none">
        {isHindi ? (
          <>
            <p className="text-gray-700 leading-relaxed">
              {siteName} एक विश्वसनीय समाचार मंच है जो आपको सटीक और निष्पक्ष समाचार प्रदान करता है।
              हमारी टीम अनुभवी पत्रकारों और संपादकों से बनी है जो गुणवत्तापूर्ण पत्रकारिता के लिए समर्पित हैं।
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              हमारा उद्देश्य समाज को सही और समय पर जानकारी प्रदान करना है।
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-700 leading-relaxed">
              {siteName} is a trusted news platform delivering accurate and unbiased news.
              Our team consists of experienced journalists and editors committed to quality journalism.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Our goal is to provide society with correct and timely information.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
