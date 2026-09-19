"use client";

import { Mail, Clock } from "lucide-react";
import { useSite } from "@/lib/site-context";

export default function GrievanceRedressalPage() {
  const { site, isHindi, loading: siteLoading } = useSite();
  const siteName = site?.name || (siteLoading ? "" : "NewsHub");
  const domain = site?.domain?.replace(/\.localhost$/, ".com") || "example.com";
  const grievanceEmail = `grievance@${domain}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{isHindi ? "शिकायत निवारण" : "Grievance Redressal"}</h1>
      <div className="prose prose-lg max-w-none space-y-4 text-gray-700">
        {isHindi ? (
          <>
            <p>{siteName} प्रकाशित सामग्री से संबंधित पाठकों की शिकायतों के त्वरित और निष्पक्ष समाधान के लिए प्रतिबद्ध है।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">शिकायत कैसे दर्ज करें</h2>
            <p>यदि आपको किसी प्रकाशित समाचार, लेख या सामग्री के संबंध में कोई आपत्ति या शिकायत है, तो कृपया नीचे दिए गए ईमेल पते पर विस्तृत जानकारी के साथ हमें लिखें, जिसमें संबंधित लेख का लिंक और आपकी शिकायत का कारण शामिल हो।</p>

            <div className="not-prose bg-gray-50 border border-gray-200 rounded-xl p-5 my-6 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="text-brand mt-1 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-gray-900">शिकायत निवारण अधिकारी से संपर्क</p>
                  <p className="text-gray-600 text-sm">{grievanceEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-brand mt-1 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-gray-900">समाधान की समय-सीमा</p>
                  <p className="text-gray-600 text-sm">शिकायत प्राप्त होने के 24 घंटे के भीतर स्वीकृति और 15 दिनों के भीतर समाधान का प्रयास किया जाएगा।</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">प्रक्रिया</h2>
            <p>प्रत्येक शिकायत की समीक्षा हमारी संपादकीय टीम द्वारा की जाती है। यदि शिकायत उचित पाई जाती है, तो आवश्यकतानुसार सुधार, स्पष्टीकरण या सामग्री हटाने की कार्रवाई की जाती है।</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">संबंधित जानकारी</h2>
            <p>हमारे संपादकीय मानकों की जानकारी के लिए <a href="/editorial-guidelines" className="text-brand hover:underline">संपादकीय दिशानिर्देश</a> पृष्ठ देखें।</p>
          </>
        ) : (
          <>
            <p>{siteName} is committed to the prompt and fair resolution of reader grievances regarding published content.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">How to File a Grievance</h2>
            <p>If you have an objection or complaint about any published news, article, or content, please write to us at the email address below with full details, including a link to the relevant article and the reason for your complaint.</p>

            <div className="not-prose bg-gray-50 border border-gray-200 rounded-xl p-5 my-6 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="text-brand mt-1 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Grievance Officer Contact</p>
                  <p className="text-gray-600 text-sm">{grievanceEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-brand mt-1 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Resolution Timeline</p>
                  <p className="text-gray-600 text-sm">Complaints are acknowledged within 24 hours of receipt, with resolution attempted within 15 days.</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Process</h2>
            <p>Every grievance is reviewed by our editorial team. Where a complaint is found valid, we take appropriate action such as issuing a correction, clarification, or removal of content.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">Related Information</h2>
            <p>For details on our editorial standards, see our <a href="/editorial-guidelines" className="text-brand hover:underline">Editorial Guidelines</a> page.</p>
          </>
        )}
      </div>
    </div>
  );
}
