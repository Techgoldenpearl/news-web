"use client";

import { useSite } from "@/lib/site-context";

export default function PrivacyPage() {
  const { site, isHindi } = useSite();
  const siteName = site?.name || "NewsHub";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "गोपनीयता नीति" : "Privacy Policy"}</h1>
      <div className="prose prose-lg max-w-none space-y-4 text-gray-700">
        {isHindi ? (
          <>
            <p>{siteName} पर हम आपकी गोपनीयता का सम्मान करते हैं। यह नीति बताती है कि हम आपकी व्यक्तिगत जानकारी को कैसे एकत्र, उपयोग और सुरक्षित करते हैं।</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">जानकारी का संग्रह</h2>
            <p>हम केवल वही जानकारी एकत्र करते हैं जो सेवा प्रदान करने के लिए आवश्यक है, जैसे नाम, ईमेल और ब्राउज़िंग डेटा।</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">जानकारी का उपयोग</h2>
            <p>आपकी जानकारी का उपयोग सेवा में सुधार, सामग्री वैयक्तिकरण और संचार के लिए किया जाता है।</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">कुकीज़</h2>
            <p>हम आपके अनुभव को बेहतर बनाने, ट्रैफ़िक का विश्लेषण करने और प्रासंगिक विज्ञापन दिखाने के लिए कुकीज़ का उपयोग करते हैं। आप अपने ब्राउज़र सेटिंग्स से कुकीज़ को नियंत्रित कर सकते हैं।</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">डेटा साझाकरण</h2>
            <p>हम आपकी व्यक्तिगत जानकारी किसी तीसरे पक्ष को नहीं बेचते हैं। कानूनी आवश्यकताओं या सेवा प्रदाताओं (जैसे विज्ञापन नेटवर्क) के साथ सीमित जानकारी साझा की जा सकती है।</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">डेटा सुरक्षा</h2>
            <p>हम आपके डेटा की सुरक्षा के लिए उद्योग-मानक सुरक्षा उपायों का उपयोग करते हैं।</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">संपर्क</h2>
            <p>इस नीति से संबंधित किसी भी प्रश्न के लिए, कृपया हमसे <a href="/contact" className="text-brand hover:underline">संपर्क पृष्ठ</a> के माध्यम से संपर्क करें।</p>
          </>
        ) : (
          <>
            <p>At {siteName}, we respect your privacy. This policy explains how we collect, use, and protect your personal information.</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">Information We Collect</h2>
            <p>We only collect information necessary to provide our service, such as your name, email, and browsing data.</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">How We Use Information</h2>
            <p>Your information is used to improve the service, personalize content, and communicate with you.</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">Cookies</h2>
            <p>We use cookies to improve your experience, analyze traffic, and show relevant ads. You can control cookies through your browser settings.</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">Data Sharing</h2>
            <p>We do not sell your personal information to third parties. Limited information may be shared with service providers (such as ad networks) or as required by law.</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">Data Security</h2>
            <p>We use industry-standard security measures to protect your data.</p>
            <h2 className="text-xl font-semibold text-gray-900 mt-6">Contact</h2>
            <p>For any questions regarding this policy, please reach out to us via our <a href="/contact" className="text-brand hover:underline">contact page</a>.</p>
          </>
        )}
      </div>
    </div>
  );
}
