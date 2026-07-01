"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { Check, Star } from "lucide-react";
import { toast } from "sonner";

export default function MembershipPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const { user } = useAuth();
  const { isHindi } = useSite();
  const router = useRouter();

  useEffect(() => { publicApi.plans().then((r) => setPlans(r.data)).catch(() => {}); }, []);

  const handleSubscribe = async (planId: number) => {
    if (!user) { router.push("/login"); return; }
    try {
      await customerApi.subscribe({ planId });
      toast.success(isHindi ? "सदस्यता सफल!" : "Subscription successful!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || (isHindi ? "सदस्यता विफल" : "Subscription failed"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">{isHindi ? "सदस्यता योजनाएं" : "Membership Plans"}</h1>
        <p className="text-gray-500 mt-2">{isHindi ? "अपने लिए सही योजना चुनें" : "Choose the plan that fits you best"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.id} className={`bg-white rounded-2xl shadow-sm border p-6 relative ${p.isPopular ? "ring-2 ring-brand shadow-lg" : ""}`}>
            {p.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <Star size={12} /> {isHindi ? "सबसे लोकप्रिय" : "Most Popular"}
              </div>
            )}
            <h3 className="text-xl font-bold">{isHindi ? (p.nameHindi || p.name) : p.name}</h3>
            {!isHindi && p.nameHindi && <p className="text-sm text-gray-500">{p.nameHindi}</p>}
            <div className="mt-4">
              <span className="text-4xl font-bold">₹{p.price}</span>
              <span className="text-gray-400">/{p.interval}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{p.description}</p>
            <ul className="mt-4 space-y-2">
              {p.features?.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm"><Check size={16} className="text-green-500" />{f}</li>
              ))}
            </ul>
            <button onClick={() => handleSubscribe(p.id)} className={`w-full mt-6 py-3 rounded-xl font-medium transition ${
              p.isPopular ? "bg-brand text-white hover:opacity-90" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
              {isHindi ? "सदस्यता लें" : "Subscribe Now"}
            </button>
          </div>
        ))}
      </div>
      {plans.length === 0 && <p className="text-center text-gray-400 py-12">{isHindi ? "कोई योजना उपलब्ध नहीं" : "No plans available"}</p>}
    </div>
  );
}
