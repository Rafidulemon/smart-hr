"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiCheck, FiCreditCard, FiLock, FiX } from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";
import {
  addOnOptions,
  formatCurrency,
  PLAN_RIBBON_GRADIENTS,
  planOptions,
  type BillingCycle,
} from "@/app/components/hr-admin/planData";

type PlanPaymentClientProps = {
  organizationName: string;
  viewerName: string;
  billingEmail: string;
  nextRenewalIso: string;
  initialPlanId: string;
  initialCycle: BillingCycle;
  initialAddOns: string[];
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/60";

function PlanPaymentClient({
  organizationName,
  viewerName,
  billingEmail,
  nextRenewalIso,
  initialPlanId,
  initialCycle,
  initialAddOns,
}: PlanPaymentClientProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialCycle);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(initialAddOns);
  const [paymentForm, setPaymentForm] = useState({
    cardHolder: viewerName,
    cardNumber: "",
    expiry: "",
    cvc: "",
    billingEmail,
    postalCode: "",
  });
  const pathname = usePathname() ?? "";
  const slug = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const orgIndex = segments.indexOf("org");
    if (orgIndex !== -1 && segments[orgIndex + 1]) {
      return segments[orgIndex + 1];
    }
    return null;
  }, [pathname]);

  const selectedPlan =
    planOptions.find((plan) => plan.id === selectedPlanId) ?? planOptions[0];
  const planPrice = selectedPlan.price[billingCycle] ?? 0;
  const addOnTotal = selectedAddOns.reduce((sum, addOnId) => {
    const addOn = addOnOptions.find((option) => option.id === addOnId);
    if (!addOn) return sum;
    return sum + (addOn.price[billingCycle] ?? 0);
  }, 0);
  const savings = billingCycle === "yearly" ? selectedPlan.savings ?? 0 : 0;
  const totalDue = planPrice + addOnTotal - savings - 89; // includes fake proration credit
  const formattedRenewal = useMemo(() => {
    const date = new Date(nextRenewalIso);
    if (Number.isNaN(date.getTime())) {
      return "Next billing cycle";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, [nextRenewalIso]);

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((previous) =>
      previous.includes(addOnId)
        ? previous.filter((value) => value !== addOnId)
        : [...previous, addOnId],
    );
  };

  const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPaymentForm((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel gap-4">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner dark:bg-slate-800 dark:text-slate-100">
            <FiCreditCard className="text-xl" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Payment
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Secure checkout for {organizationName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Review your selection, enter payment, and receive an instant invoice. You can switch
              plans or add-ons before submitting.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Actor: {viewerName}
          </span>
          <Link
            href={slug ? `/org/${slug}/hr-admin/plan-upgrade` : "../plan-upgrade"}
            className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/70"
          >
            ← Adjust plans & add-ons
          </Link>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Plan
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Confirm subscription
                </h2>
              </div>
              <div className="flex gap-2">
                {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      billingCycle === cycle
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {cycle === "monthly" ? "Monthly" : "Yearly"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {planOptions.map((plan) => {
                const isActive = plan.id === selectedPlanId;
                const ribbonGradient = PLAN_RIBBON_GRADIENTS[plan.id] ?? "from-indigo-500 to-sky-500";
                const priceLabel =
                  plan.displayPrice?.[billingCycle] ??
                  `${formatCurrency(plan.price[billingCycle])}/${billingCycle === "monthly" ? "mo" : "yr"}`;
                return (
                  <div
                    key={plan.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPlanId(plan.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedPlanId(plan.id);
                      }
                    }}
                    className={`relative rounded-[28px] border bg-white p-5 text-center shadow-lg shadow-indigo-100 transition-all dark:border-slate-700 dark:bg-slate-900/70 ${
                      isActive ? "border-indigo-400 scale-[1.01]" : "hover:border-indigo-200"
                    }`}
                  >
                    <div
                      className={`absolute -top-4 left-1/2 w-32 -translate-x-1/2 rounded-full bg-gradient-to-r ${ribbonGradient} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white`}
                    >
                      {plan.name}
                    </div>
                    <p className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">{priceLabel}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>
                    <ul className="mt-4 space-y-2 text-left text-xs">
                      {plan.highlights.slice(0, 3).map((item) => (
                        <li key={`${plan.id}-${item.text}`} className="flex items-center gap-2">
                          {item.available ? (
                            <FiCheck className="text-emerald-500" />
                          ) : (
                            <FiX className="text-rose-500" />
                          )}
                          <span
                            className={`${
                              item.available ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Add-ons
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Finalize extensions
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedAddOns.length} selected
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {addOnOptions.map((option) => {
                const isActive = selectedAddOns.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleAddOn(option.id)}
                    className={`w-full rounded-3xl border p-4 text-left text-sm transition-all ${
                      isActive
                        ? "border-indigo-400 bg-gradient-to-r from-indigo-50 to-sky-50 shadow-lg shadow-indigo-100 dark:border-slate-600 dark:from-slate-900 dark:to-slate-900/70"
                        : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{option.detail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(option.price[billingCycle])}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Summary
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Ready to charge
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                {billingCycle === "monthly" ? "Monthly" : "Yearly"}
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between text-base font-semibold text-slate-900 dark:text-white">
                <span>{selectedPlan.name}</span>
                <span>{formatCurrency(planPrice)}</span>
              </div>
              {selectedAddOns.length === 0 ? (
                <p>No add-ons selected.</p>
              ) : (
                selectedAddOns.map((addOnId) => {
                  const addOn = addOnOptions.find((option) => option.id === addOnId);
                  if (!addOn) return null;
                  return (
                    <div key={addOn.id} className="flex items-center justify-between text-sm">
                      <span>{addOn.label}</span>
                      <span>{formatCurrency(addOn.price[billingCycle])}</span>
                    </div>
                  );
                })
              )}
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Proration credit</span>
                <span>-{formatCurrency(89)}</span>
              </div>
              {savings > 0 ? (
                <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-300">
                  <span>Yearly savings</span>
                  <span>-{formatCurrency(savings)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
                <span>Total due today</span>
                <span>{formatCurrency(Math.max(totalDue, 0))}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Renews on {formattedRenewal}. Future invoices sent to {billingEmail}.
              </p>
            </div>
            <div className="section-divider my-5" />
            <form className="space-y-3">
              <input
                name="cardHolder"
                value={paymentForm.cardHolder}
                onChange={handlePaymentChange}
                placeholder="Cardholder name"
                className={inputClassName}
              />
              <input
                name="cardNumber"
                value={paymentForm.cardNumber}
                onChange={handlePaymentChange}
                placeholder="Card number (Visa, MasterCard, Amex)"
                className={inputClassName}
                inputMode="numeric"
                maxLength={19}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  name="expiry"
                  value={paymentForm.expiry}
                  onChange={handlePaymentChange}
                  placeholder="MM / YY"
                  className={inputClassName}
                />
                <input
                  name="cvc"
                  value={paymentForm.cvc}
                  onChange={handlePaymentChange}
                  placeholder="CVC"
                  className={inputClassName}
                />
                <input
                  name="postalCode"
                  value={paymentForm.postalCode}
                  onChange={handlePaymentChange}
                  placeholder="Postal code"
                  className={inputClassName}
                />
              </div>
              <input
                name="billingEmail"
                value={paymentForm.billingEmail}
                onChange={handlePaymentChange}
                placeholder="Billing email"
                className={inputClassName}
                type="email"
              />
            </form>
            <Button className="mt-5 w-full py-3 text-base font-semibold">
              Confirm upgrade & charge card
            </Button>
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <FiLock /> Encrypted payment · full refund if canceled within 7 days.
            </p>
          </div>
          <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/95 p-6 text-sm text-slate-600 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:text-slate-300 dark:shadow-slate-950/60">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Billing assurances
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Compliance-friendly checkout
            </h2>
            <ul className="mt-4 space-y-2">
              <li>• Card data tokenized with PCI DSS level 1 partners.</li>
              <li>• Audit trail logs {viewerName} and the timestamp for finance.</li>
              <li>• Refunds honored within 7 days if something looks off.</li>
            </ul>
            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
              Need a purchase order? Email{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{billingEmail}</span>{" "}
              or loop in a new finance contact—receipts are issued instantly.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PlanPaymentClient;
