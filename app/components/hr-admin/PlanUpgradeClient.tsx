"use client";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiAward, FiCheck, FiCreditCard, FiX } from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";
import {
  addOnOptions,
  formatCurrency,
  PLAN_RIBBON_GRADIENTS,
  planComparisonRows,
  planOptions,
  type BillingCycle,
} from "@/app/components/hr-admin/planData";

type PlanUpgradeClientProps = {
  organizationName: string;
  viewerName: string;
  currentPlan: string;
  billingEmail: string;
  nextRenewalIso: string;
};


const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/60";

function PlanUpgradeClient({
  organizationName,
  viewerName,
  currentPlan,
  billingEmail,
  nextRenewalIso,
}: PlanUpgradeClientProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(planOptions[0]?.id ?? "growth");
  const [billingCycle] = useState<BillingCycle>("monthly");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(["ai"]);
  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const slug = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const orgIndex = segments.indexOf("org");
    if (orgIndex !== -1 && segments[orgIndex + 1]) {
      return segments[orgIndex + 1];
    }
    return null;
  }, [pathname]);

  const selectedPlan = useMemo(
    () => planOptions.find((plan) => plan.id === selectedPlanId) ?? planOptions[0],
    [selectedPlanId],
  );

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

  const planPrice = selectedPlan?.price[billingCycle] ?? 0;
  const addOnTotal = selectedAddOns.reduce((sum, addOnId) => {
    const addOn = addOnOptions.find((option) => option.id === addOnId);
    if (!addOn) return sum;
    return sum + (addOn.price[billingCycle] ?? 0);
  }, 0);
  const savings = billingCycle === "yearly" ? selectedPlan?.savings ?? 0 : 0;
  const subtotal = planPrice + addOnTotal;
  const totalDue = subtotal - savings;

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((previous) =>
      previous.includes(addOnId)
        ? previous.filter((value) => value !== addOnId)
        : [...previous, addOnId],
    );
  };

  const paymentSearch = useMemo(() => {
    const params = new URLSearchParams({
      plan: selectedPlanId,
      cycle: billingCycle,
    });
    if (selectedAddOns.length) {
      params.set("addons", selectedAddOns.join(","));
    }
    return params.toString();
  }, [billingCycle, selectedAddOns, selectedPlanId]);

  const handleContinueToPayment = () => {
    const destination = slug
      ? `/org/${slug}/hr-admin/plan-upgrade/payment?${paymentSearch}`
      : `payment?${paymentSearch}`;
    router.push(destination);
  };

  const stepBadges = [
    { label: "Current plan", helper: currentPlan },
    { label: "Select plan", helper: selectedPlan?.name ?? "—" },
    { label: "Payment", helper: "Confirm & activate" },
  ];

  return (
    <div className="space-y-8">
      <div className="glass-panel gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner dark:bg-slate-800 dark:text-slate-100">
              <FiCreditCard className="text-xl" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Subscription
              </p>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                Upgrade plan for {organizationName}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You&apos;re currently on the {currentPlan} plan. Choose a tier, lock in pricing, and
                update payment without leaving the HR console.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {stepBadges.map((step) => (
              <div
                key={step.label}
                className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
              >
                <p className="uppercase tracking-[0.3em]">{step.label}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{step.helper}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 text-sm dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Seat usage</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">362 / 400</p>
            <p className="text-slate-500 dark:text-slate-400">
              HR, finance, and IT already provisioned with admin seats.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 text-sm dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Next renewal</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{formattedRenewal}</p>
            <p className="text-slate-500 dark:text-slate-400">
              Switch tiers now. Proration preview updates instantly.
            </p>
          </div>
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 p-5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
              Owner access
            </p>
            <p className="mt-2 text-2xl font-semibold">{viewerName}</p>
            <p className="text-slate-600 dark:text-slate-400">
              Org Owner rights confirmed. All changes are logged for auditors.
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="rounded border border-white/70 bg-white/95 p-4 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {planOptions.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
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
                    className={`relative min-w-[260px] flex-1 rounded-[36px] border border-white/80 bg-white px-8 py-12 text-center shadow-2xl shadow-indigo-100 transition-all dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/70 ${
                      isSelected ? "ring-2 ring-indigo-400" : "hover:border-indigo-200"
                    }`}
                  >
                    <div
                      className={`absolute -top-4 left-1/2 flex w-44 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r ${ribbonGradient} px-4 py-1 text-xs font-bold uppercase tracking-[0.35em] text-white shadow-lg`}
                    >
                      {plan.name}
                    </div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                      Per month
                    </p>
                    <p className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">{priceLabel}</p>
                    <ul className="mt-6 space-y-3 text-left text-sm">
                      {plan.highlights.map((item) => (
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
                    <Button className="mt-8 w-full rounded-full py-3 text-xs uppercase tracking-[0.35em]">
                      {isSelected ? "Selected" : "Order now"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Step 2
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Add-ons & controls
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedAddOns.length} add-ons selected
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {addOnOptions.map((option) => {
                const isActive = selectedAddOns.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleAddOnToggle(option.id)}
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
                    {isActive ? (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <FiCheck /> Included in upgrade
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Enter coupon
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  className={inputClassName}
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                />
                <Button theme="secondary" className="px-5 py-2 text-xs">
                  Apply
                </Button>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-[0.3em]">
                Partner & launch coupons auto-sync from billing provider.
              </p>
            </div>
          </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Step 3
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Review before payment
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                {billingCycle === "monthly" ? "Monthly" : "Yearly"} billing
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between text-base font-semibold text-slate-900 dark:text-white">
                <span>{selectedPlan?.name ?? "Plan"}</span>
                <span>{formatCurrency(planPrice)}</span>
              </div>
              {selectedAddOns.length === 0 ? (
                <p>No add-ons selected.</p>
              ) : (
                selectedAddOns.map((addOnId) => {
                  const addOn = addOnOptions.find((option) => option.id === addOnId);
                  if (!addOn) {
                    return null;
                  }
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
            <Button onClick={handleContinueToPayment} className="mt-5 w-full py-3 text-base font-semibold">
              Continue to payment
            </Button>
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              You&apos;ll confirm card details on the next screen. No charges yet.
            </p>
          </div>
          <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/95 p-6 text-sm text-slate-600 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:text-slate-300 dark:shadow-slate-950/60">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Need approvals?
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Share this upgrade package
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>• Download the comparison matrix for leadership.</li>
              <li>• CC finance teams at {billingEmail} to keep them in the loop.</li>
              <li>• Payment page logs the actor + timestamp in billing audit trails.</li>
            </ul>
            <Button theme="secondary" className="mt-4 w-full text-xs">
              Copy approval summary
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Subscription plans (BDT)
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Compare Free, Pro, and Enterprise
            </h2>
          </div>
          <Button theme="secondary" className="text-xs">
            Download plan PDF
          </Button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                <th className="py-3 pr-4 font-semibold">Features</th>
                <th className="py-3 pr-4 font-semibold">Free tier</th>
                <th className="py-3 pr-4 font-semibold">Pro plan</th>
                <th className="py-3 font-semibold">Enterprise plan</th>
              </tr>
            </thead>
            <tbody>
              {planComparisonRows.map((row, index) => (
                <tr
                  key={row.feature}
                  className={index % 2 === 0 ? "bg-slate-50/70 dark:bg-slate-900/50" : ""}
                >
                  <td className="px-4 py-4 text-slate-900 dark:text-white">{row.feature}</td>
                  <td className="px-4 py-4">{row.free}</td>
                  <td className="px-4 py-4">{row.pro}</td>
                  <td className="px-4 py-4">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default PlanUpgradeClient;
