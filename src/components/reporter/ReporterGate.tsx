"use client";

import { useReporterAuth } from "@/lib/reporter-auth-context";
import { ReporterHeader } from "./ReporterHeader";
import { ReactNode } from "react";
import Link from "next/link";
import { Clock, Ban, XCircle } from "lucide-react";

export function ReporterGate({ children }: { children: ReactNode }) {
  const { reporter, loading } = useReporterAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-brand" />
      </div>
    );
  }

  if (!reporter) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gray-600 mb-4">कृपया पत्रकार पोर्टल में लॉगिन करें</p>
          <Link href="/patrakar/login" className="inline-block bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition">लॉगिन करें</Link>
        </div>
      </div>
    );
  }

  if (reporter.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <Clock size={40} className="text-amber-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">समीक्षा प्रतीक्षित</h1>
          <p className="text-gray-500 text-sm">आपका आवेदन अभी समीक्षा में है। स्वीकृति मिलने पर आपको सूचित किया जाएगा।</p>
        </div>
      </div>
    );
  }

  if (reporter.status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <Ban size={40} className="text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">खाता निलंबित</h1>
          <p className="text-gray-500 text-sm">आपका खाता निलंबित कर दिया गया है। अधिक जानकारी के लिए संपादक से संपर्क करें।</p>
        </div>
      </div>
    );
  }

  if (reporter.status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <XCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">आवेदन अस्वीकृत</h1>
          <p className="text-gray-500 text-sm">आपका पत्रकार आवेदन अस्वीकृत कर दिया गया है।</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReporterHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
