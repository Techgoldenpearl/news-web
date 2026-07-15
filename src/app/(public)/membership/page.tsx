"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { publicApi, customerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSite } from "@/lib/site-context";
import { Check, Star, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function MembershipPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();
  const { isHindi } = useSite();
  const router = useRouter();

  useEffect(() => { publicApi.plans().then((r) => setPlans(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (!user) { setLoadingSubscription(false); return; }
    customerApi.mySubscription()
      .then((r) => setSubscription(r.data))
      .catch(() => {})
      .finally(() => setLoadingSubscription(false));
  }, [user]);

  const handleSubscribe = async (planId: number) => {
    if (!user) { router.push("/login"); return; }
    try {
      const res = await customerApi.subscribe({ planId });
      toast.success(isHindi ? "सदस्यता सफल!" : "Subscription successful!");
      setSubscription(res.data.subscription);
    } catch (err: any) {
      toast.error(err.response?.data?.error || (isHindi ? "सदस्यता विफल" : "Subscription failed"));
    }
  };

  const handleCancel = async () => {
    if (!confirm(isHindi ? "क्या आप वाकई अपनी सदस्यता रद्द करना चाहते हैं?" : "Are you sure you want to cancel your subscription?")) return;
    setCancelling(true);
    try {
      await customerApi.cancelSubscription();
      toast.success(isHindi ? "सदस्यता रद्द कर दी गई" : "Subscription cancelled");
      setSubscription((s: any) => s ? { ...s, status: "cancelled" } : s);
    } catch (err: any) {
      toast.error(err.response?.data?.error || (isHindi ? "रद्द करने में विफल" : "Failed to cancel"));
    } finally {
      setCancelling(false);
    }
  };

  const isActiveSubscription = subscription && subscription.status === "active";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">{isHindi ? "सदस्यता योजनाएं" : "Membership Plans"}</h1>
        <p className="text-gray-500 mt-2">{isHindi ? "अपने लिए सही योजना चुनें" : "Choose the plan that fits you best"}</p>
      </div>

      {user && !loadingSubscription && isActiveSubscription && (
        <div className="bg-white rounded-2xl border-2 border-brand p-6 mb-10 max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={20} className="text-brand" />
            <h2 className="text-lg font-bold">{isHindi ? "आपकी सदस्यता" : "Your Membership"}</h2>
          </div>
          <p className="text-xl font-bold">{isHindi ? (subscription.planName) : subscription.planName}</p>
          <p className="text-sm text-gray-500 mt-1">
            {isHindi ? "समाप्ति तिथि" : "Renews/expires on"}: {new Date(subscription.endDate).toLocaleDateString()}
          </p>
          <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            {isHindi ? "सक्रिय" : "Active"}
          </span>
          <div className="mt-4 flex gap-2">
            <button onClick={handleCancel} disabled={cancelling}
              className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-50 transition">
              {cancelling ? (isHindi ? "रद्द किया जा रहा है..." : "Cancelling...") : (isHindi ? "सदस्यता रद्द करें" : "Cancel Subscription")}
            </button>
          </div>
        </div>
      )}

      {user && !loadingSubscription && subscription && !isActiveSubscription && (
        <div className="bg-gray-50 rounded-2xl border p-4 mb-10 max-w-xl mx-auto text-center text-sm text-gray-500">
          {isHindi ? "आपकी पिछली सदस्यता" : "Your last plan"}: <span className="font-medium text-gray-700">{subscription.planName}</span> —{" "}
          <span className="capitalize">{subscription.status}</span>
        </div>
      )}

      {(!isActiveSubscription || !user) && (
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
      )}
      {(!isActiveSubscription || !user) && plans.length === 0 && (
        <p className="text-center text-gray-400 py-12">{isHindi ? "कोई योजना उपलब्ध नहीं" : "No plans available"}</p>
      )}
    </div>
  );
}
