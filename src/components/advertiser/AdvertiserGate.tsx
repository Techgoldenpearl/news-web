"use client";

import { useAdvertiserAuth } from "@/lib/advertiser-auth-context";
import { AdvertiserHeader } from "./AdvertiserHeader";
import { ReactNode } from "react";
import Link from "next/link";
import { Ban } from "lucide-react";

export function AdvertiserGate({ children }: { children: ReactNode }) {
  const { advertiser, loading } = useAdvertiserAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-brand" />
      </div>
    );
  }

  if (!advertiser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gray-600 mb-4">कृपया विज्ञापनदाता पोर्टल में लॉगिन करें</p>
          <Link href="/advertiser/login" className="inline-block bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition">लॉगिन करें</Link>
        </div>
      </div>
    );
  }

  if (advertiser.status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <Ban size={40} className="text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">खाता निलंबित</h1>
          <p className="text-gray-500 text-sm">आपका खाता निलंबित कर दिया गया है। अधिक जानकारी के लिए संपर्क करें।</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdvertiserHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
