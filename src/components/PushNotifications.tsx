"use client";

import { useEffect, useState } from "react";
import { publicApi, customerApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { Bell, X } from "lucide-react";

const DISMISS_KEY = "pushPromptDismissed";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushNotifications() {
  const { isHindi } = useSite();
  const [showBanner, setShowBanner] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});

    if (!("Notification" in window) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    setShowBanner(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShowBanner(false);
  };

  const enable = async () => {
    setEnabling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { dismiss(); return; }

      const registration = await navigator.serviceWorker.ready;
      const { data } = await publicApi.vapidPublicKey();
      if (!data?.publicKey) { dismiss(); return; }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
      const json = subscription.toJSON();

      await customerApi.pushSubscribe({
        endpoint: json.endpoint,
        p256dhKey: json.keys?.p256dh,
        authKey: json.keys?.auth,
        userAgent: navigator.userAgent,
      });

      setShowBanner(false);
    } catch {
      dismiss();
    } finally {
      setEnabling(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-white border rounded-xl shadow-lg p-4 flex items-start gap-3">
      <div className="p-2 bg-brand-tint rounded-lg text-brand shrink-0">
        <Bell size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">
          {isHindi ? "ब्रेकिंग न्यूज़ अलर्ट पाएं" : "Get breaking news alerts"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {isHindi ? "महत्वपूर्ण खबरों की सूचना सीधे पाएं" : "Be notified the moment big stories break"}
        </p>
        <div className="flex gap-2 mt-3">
          <button onClick={enable} disabled={enabling}
            className="px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
            {enabling ? (isHindi ? "सक्षम हो रहा है..." : "Enabling...") : (isHindi ? "सक्षम करें" : "Enable")}
          </button>
          <button onClick={dismiss} className="px-3 py-1.5 text-gray-500 text-xs font-medium hover:text-gray-700">
            {isHindi ? "बाद में" : "Not now"}
          </button>
        </div>
      </div>
      <button onClick={dismiss} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
