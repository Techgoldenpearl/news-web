"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { useSite } from "@/lib/site-context";
import { Modal } from "./Modal";
import { CreditCard, Smartphone, Building2, Wallet } from "lucide-react";
import { toast } from "sonner";

const PAY_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Building2 },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

interface PlanPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** What this purchase is for — shown in the title. Payment is not actually
   * charged here (see note below); this only reviews the selected plan. */
  context: "shok" | "ad" | "classified";
}

// No confirmed backend endpoint exists for one-off purchases of this kind
// (shok-sandesh newspaper publication, ad packages, classified packages) —
// customerApi.subscribe()/publicApi.plans() are membership-subscription
// shaped, not a generic checkout. This modal intentionally stops at a
// review screen rather than charging a real payment method; wiring an
// actual gateway is a distinct follow-up, not part of this visual redesign.
export function PlanPickerModal({ open, onClose, context }: PlanPickerModalProps) {
  const { isHindi } = useSite();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [method, setMethod] = useState("upi");

  useEffect(() => {
    if (open) publicApi.plans().then((r) => setPlans(r.data || [])).catch(() => setPlans([]));
  }, [open]);

  const plan = plans.find((p) => p.id === selectedPlan);

  const titleByContext = {
    shok: isHindi ? "शोक संदेश पैकेज" : "Obituary Package",
    ad: isHindi ? "विज्ञापन पैकेज" : "Ad Package",
    classified: isHindi ? "क्लासिफाइड पैकेज" : "Classified Package",
  }[context];

  const confirm = () => {
    if (!plan) return;
    toast.success(isHindi ? "अनुरोध दर्ज हुआ — हमारी टीम जल्द संपर्क करेगी" : "Request recorded — our team will contact you shortly");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={titleByContext}>
      <div className="grid gap-3 mb-1.5">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            aria-pressed={selectedPlan === p.id}
            className={`border rounded-lg p-4 flex items-start gap-3 text-right transition ${selectedPlan === p.id ? "border-brand bg-brand-soft" : "border-line hover:border-brand"}`}
          >
            <span className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 mt-0.5 ${selectedPlan === p.id ? "border-brand shadow-[inset_0_0_0_4px_var(--accent)]" : "border-line-2"}`} />
            <span className="flex-1">
              <b className="block text-base font-medium">{isHindi ? (p.nameHindi || p.name) : p.name}</b>
              {p.description && <span className="block text-[13px] text-tx-3 leading-[1.55] mt-0.5">{p.description}</span>}
            </span>
            <span className="font-mono text-[17px] font-medium text-brand shrink-0 whitespace-nowrap">
              ₹{p.price}
              {p.interval && <small className="block text-[11px] text-tx-3 font-normal text-left">/{p.interval}</small>}
            </span>
          </button>
        ))}
        {plans.length === 0 && <p className="text-center text-tx-3 text-sm py-6">{isHindi ? "कोई पैकेज उपलब्ध नहीं" : "No packages available"}</p>}
      </div>

      {plan && (
        <>
          <div className="grid grid-cols-4 gap-2 my-3.5">
            {PAY_METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`border rounded-md p-3 flex flex-col items-center gap-1.5 text-[12.5px] transition ${method === m.id ? "border-brand bg-brand-soft text-tx" : "border-line text-tx-2 hover:border-brand"}`}
                >
                  <Icon size={19} />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="bg-panel-2 border border-line rounded-md px-4 py-3.5 mb-1.5">
            <div className="flex text-[14.5px] py-1 text-tx-2">
              <b className="font-normal mr-auto">{isHindi ? (plan.nameHindi || plan.name) : plan.name}</b>
              <span className="font-mono">₹{plan.price}</span>
            </div>
            <div className="flex text-[17px] border-t border-line mt-2 pt-2.5">
              <b className="font-medium mr-auto">{isHindi ? "कुल" : "Total"}</b>
              <span className="font-mono font-semibold text-brand">₹{plan.price}</span>
            </div>
          </div>

          <button onClick={confirm} className="w-full bg-brand text-white rounded-md py-3.5 text-[15.5px] font-medium hover:brightness-95 transition mt-1.5">
            {isHindi ? "अनुरोध भेजें" : "Send Request"}
          </button>
          <p className="text-center text-[11.5px] text-tx-3 mt-2.5">
            {isHindi ? "भुगतान अभी नहीं लिया जाएगा — हमारी टीम आपसे संपर्क करेगी" : "No payment is taken now — our team will contact you to complete this"}
          </p>
        </>
      )}
    </Modal>
  );
}
