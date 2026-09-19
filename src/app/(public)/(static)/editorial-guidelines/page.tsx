"use client";

import { useSite } from "@/lib/site-context";

export default function EditorialGuidelinesPage() {
  const { site, isHindi, loading: siteLoading } = useSite();
  const siteName = site?.name || (siteLoading ? "" : "NewsHub");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "संपादकीय दिशानिर्देश" : "Editorial Guidelines"}</h1>
      <div className="prose prose-lg max-w-none space-y-4 text-gray-700">
        {isHindi ? (
          <>
            <p>{siteName} पर प्रकाशित सभी समाचार और सामग्री निम्नलिखित संपादकीय सिद्धांतों के अनुसार तैयार की जाती है।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">सटीकता एवं तथ्य-जांच</h2>
            <p>हम प्रकाशन से पहले हर समाचार की सटीकता की पुष्टि करने का प्रयास करते हैं। स्रोतों की विश्वसनीयता की जांच की जाती है और जहां संभव हो, एक से अधिक स्रोतों से पुष्टि ली जाती है।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">निष्पक्षता</h2>
            <p>हमारी रिपोर्टिंग किसी भी राजनीतिक दल, संगठन या व्यक्ति के पक्ष या विपक्ष में नहीं होती। हम सभी पक्षों को निष्पक्ष रूप से प्रस्तुत करने का प्रयास करते हैं।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">स्रोतों की सुरक्षा</h2>
            <p>जहां आवश्यक हो, हम अपने स्रोतों की पहचान गोपनीय रखते हैं, विशेष रूप से संवेदनशील या जोखिमपूर्ण मामलों में।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">सुधार एवं संशोधन</h2>
            <p>यदि किसी प्रकाशित समाचार में तथ्यात्मक त्रुटि पाई जाती है, तो हम उसे यथाशीघ्र सुधारते हैं और जहां उचित हो, स्पष्ट सुधार नोट के साथ प्रकाशित करते हैं।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">विज्ञापन एवं संपादकीय पृथक्करण</h2>
            <p>विज्ञापन और प्रायोजित सामग्री को हमेशा स्पष्ट रूप से चिह्नित किया जाता है ताकि पाठक इसे नियमित संपादकीय सामग्री से अलग पहचान सकें।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">आचार संहिता</h2>
            <p>हमारे पत्रकार और संपादक पत्रकारिता की नैतिकता, गोपनीयता के सम्मान और कानून के पालन के प्रति प्रतिबद्ध हैं।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">संपर्क</h2>
            <p>संपादकीय मानकों से संबंधित किसी भी प्रश्न या शिकायत के लिए, कृपया हमारे <a href="/grievance-redressal" className="text-brand hover:underline">शिकायत निवारण</a> पृष्ठ के माध्यम से संपर्क करें।</p>
          </>
        ) : (
          <>
            <p>All news and content published on {siteName} is prepared in accordance with the following editorial principles.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Accuracy & Fact-Checking</h2>
            <p>We strive to verify the accuracy of every story before publication. Source credibility is checked, and where possible, information is confirmed with more than one source.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Fairness & Impartiality</h2>
            <p>Our reporting does not favor or oppose any political party, organization, or individual. We aim to represent all sides fairly.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Protection of Sources</h2>
            <p>Where necessary, we keep the identity of our sources confidential, especially in sensitive or high-risk matters.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Corrections & Amendments</h2>
            <p>If a factual error is found in a published story, we correct it as soon as possible and, where appropriate, publish it with a clear correction note.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Advertising & Editorial Separation</h2>
            <p>Advertisements and sponsored content are always clearly labeled so readers can distinguish them from regular editorial content.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Code of Conduct</h2>
            <p>Our journalists and editors are committed to journalistic ethics, respect for privacy, and compliance with the law.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Contact</h2>
            <p>For any questions or complaints regarding our editorial standards, please reach out via our <a href="/grievance-redressal" className="text-brand hover:underline">Grievance Redressal</a> page.</p>
          </>
        )}
      </div>
    </div>
  );
}
