"use client";

import { useSite } from "@/lib/site-context";

export default function TermsPage() {
  const { site, isHindi } = useSite();
  const siteName = site?.name || "NewsHub";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "नियम एवं शर्तें" : "Terms & Conditions"}</h1>
      <div className="prose prose-lg max-w-none space-y-4 text-gray-700">
        {isHindi ? (
          <>
            <p>{siteName} का उपयोग करके, आप इन नियमों और शर्तों से सहमत होते हैं। कृपया इन्हें ध्यान से पढ़ें।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">सेवा का उपयोग</h2>
            <p>आप इस वेबसाइट का उपयोग केवल वैध उद्देश्यों के लिए कर सकते हैं। किसी भी प्रकार की धोखाधड़ी, दुरुपयोग या अवैध गतिविधि सख्त वर्जित है।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">सामग्री एवं कॉपीराइट</h2>
            <p>इस वेबसाइट पर प्रकाशित सभी लेख, फ़ोटो, वीडियो और अन्य सामग्री {siteName} की संपत्ति हैं या लाइसेंस के तहत उपयोग की जाती हैं। बिना पूर्व अनुमति के सामग्री की नकल, वितरण या पुनः प्रकाशन निषिद्ध है।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">उपयोगकर्ता खाता</h2>
            <p>यदि आप खाता बनाते हैं, तो आप अपने लॉगिन विवरण की सुरक्षा के लिए स्वयं ज़िम्मेदार हैं। हमें संदिग्ध गतिविधि पर किसी भी खाते को निलंबित करने का अधिकार है।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">विज्ञापन एवं तृतीय-पक्ष लिंक</h2>
            <p>हमारी वेबसाइट पर विज्ञापन और बाहरी वेबसाइटों के लिंक हो सकते हैं। इन तृतीय-पक्ष साइटों की सामग्री या नीतियों के लिए हम ज़िम्मेदार नहीं हैं।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">दायित्व की सीमा</h2>
            <p>हम सटीक और समय पर जानकारी प्रदान करने का प्रयास करते हैं, लेकिन सामग्री में त्रुटियों या चूक के कारण होने वाले किसी भी नुकसान के लिए {siteName} उत्तरदायी नहीं होगा।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">नियमों में परिवर्तन</h2>
            <p>हम किसी भी समय इन नियमों और शर्तों को बदलने का अधिकार सुरक्षित रखते हैं। परिवर्तन इस पृष्ठ पर प्रकाशित होते ही प्रभावी माने जाएंगे।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">संपर्क</h2>
            <p>इन नियमों से संबंधित किसी भी प्रश्न के लिए, कृपया हमसे <a href="/contact" className="text-brand hover:underline">संपर्क पृष्ठ</a> के माध्यम से संपर्क करें।</p>
          </>
        ) : (
          <>
            <p>By using {siteName}, you agree to these terms and conditions. Please read them carefully.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Use of Service</h2>
            <p>You may use this website only for lawful purposes. Any fraud, misuse, or illegal activity is strictly prohibited.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Content & Copyright</h2>
            <p>All articles, photos, videos, and other content published on this website are the property of {siteName} or used under license. Copying, distributing, or republishing content without prior permission is prohibited.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">User Accounts</h2>
            <p>If you create an account, you are responsible for safeguarding your login details. We reserve the right to suspend any account for suspicious activity.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Advertising & Third-Party Links</h2>
            <p>Our website may contain advertisements and links to external websites. We are not responsible for the content or policies of these third-party sites.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Limitation of Liability</h2>
            <p>We strive to provide accurate and timely information, but {siteName} shall not be liable for any loss arising from errors or omissions in the content.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Changes to Terms</h2>
            <p>We reserve the right to change these terms and conditions at any time. Changes take effect as soon as they are published on this page.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Contact</h2>
            <p>For any questions regarding these terms, please reach out to us via our <a href="/contact" className="text-brand hover:underline">contact page</a>.</p>
          </>
        )}
      </div>
    </div>
  );
}
