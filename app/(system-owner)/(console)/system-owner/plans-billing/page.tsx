import { FiCalendar, FiCheckCircle, FiCreditCard, FiDownload, FiShield } from "react-icons/fi";
import { MdOutlineInsights } from "react-icons/md";

import Button from "@/app/components/atoms/buttons/Button";

const planHighlights = [
  {
    label: "Current plan",
    value: "Enterprise Scale",
    helper: "Includes proactive compliance automation and 24/7 support.",
    pill: "Active",
  },
  {
    label: "Seats committed",
    value: "180",
    helper: "146 used / 34 available",
    pill: "Annual commit",
  },
  {
    label: "Upcoming invoice",
    value: "$8,450",
    helper: "Renews May 01, 2025",
    pill: "Auto-pay",
  },
];

const paymentMethods = [
  {
    label: "Corporate card",
    detail: "Visa •••• 4242",
    status: "Primary",
    helper: "$250k limit - 3D Secure enforced",
  },
  {
    label: "Backup ACH",
    detail: "Bank •••• 0199",
    status: "Failover",
    helper: "US Checking • Settles in < 1 day",
  },
];

const addOns = [
  {
    name: "Priority response (15m SLA)",
    scope: "All tenants",
    amount: "$1,200 / mo",
  },
  {
    name: "AI compliance pack",
    scope: "4 organizations",
    amount: "$880 / mo",
  },
  {
    name: "Sandbox tenants",
    scope: "x2 isolated workspaces",
    amount: "$300 / mo",
  },
];

const invoiceHistory = [
  {
    id: "INV-2033",
    date: "Apr 01, 2025",
    amount: "$7,900",
    status: "Paid",
    method: "Visa •••• 4242",
  },
  {
    id: "INV-2032",
    date: "Mar 01, 2025",
    amount: "$7,680",
    status: "Paid",
    method: "Visa •••• 4242",
  },
  {
    id: "INV-2031",
    date: "Feb 01, 2025",
    amount: "$7,680",
    status: "Paid",
    method: "Visa •••• 4242",
  },
  {
    id: "INV-2030",
    date: "Jan 01, 2025",
    amount: "$7,420",
    status: "Paid",
    method: "ACH •••• 0199",
  },
];

const timelineSteps = [
  {
    title: "Usage snapshot locked",
    date: "Apr 15",
    detail: "Seats and inference packs captured for the billing cycle.",
  },
  {
    title: "Invoice draft",
    date: "Apr 28",
    detail: "Finance preview shared, AI consumption reconciled.",
  },
  {
    title: "Auto-charge",
    date: "May 01",
    detail: "Primary card billed at 04:00 UTC.",
  },
];

const assuranceControls = [
  {
    title: "SOC 2 & ISO export",
    helper: "Latest reports shared with finance & security.",
  },
  {
    title: "Spend guardrail",
    helper: "Alerting at 90% of commit with finance escalation.",
  },
];

const statusClasses: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-200",
};

export default function SystemOwnerPlansBillingPage() {
  const seatUsage = { used: 146, committed: 180, change: "+12 seats this month" };
  const usagePercent = Math.min(
    100,
    Math.round((seatUsage.used / seatUsage.committed) * 100),
  );

  return (
    <div className="space-y-8">
      <div className="glass-panel gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
            Billing center
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Plans & Billing
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track committed spend, seat consumption, and invoice history for every tenant.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button theme="secondary">Adjust commitment</Button>
          <Button>Export statement</Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {planHighlights.map((highlight) => (
          <div
            key={highlight.label}
            className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-lg shadow-indigo-100 transition-colors duration-200 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  {highlight.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {highlight.value}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {highlight.helper}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                {highlight.pill}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Seat usage
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {seatUsage.used} of {seatUsage.committed} seats
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <FiCheckCircle />
                {seatUsage.change}
              </span>
            </div>
            <div className="mt-5">
              <div className="h-3 w-full rounded-full bg-slate-200/80 dark:bg-slate-800/70">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 shadow-inner shadow-indigo-200/60 dark:shadow-slate-950/40"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Committed</span>
                <span>{usagePercent}% used</span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">AI inference packs</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">1.8M tokens</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Auto bursts enabled to +25%.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Overage guardrail</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">$12,000 ceiling</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Notifications at 90% and 100%.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Billing timeline
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Current cycle overview
                </h2>
              </div>
              <Button theme="white" className="text-xs">
                Schedule reminder
              </Button>
            </div>
            <div className="mt-6 space-y-5">
              {timelineSteps.map((step, index) => (
                <div key={step.title} className="relative pl-8">
                  {index !== timelineSteps.length - 1 && (
                    <span className="absolute left-[10px] top-5 h-full w-px bg-gradient-to-b from-indigo-200 to-transparent dark:from-slate-700" />
                  )}
                  <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-[10px] font-semibold text-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    {index + 1}
                  </span>
                  <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{step.title}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <FiCalendar />
                        {step.date}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Payment methods
              </p>
              <Button theme="white" className="text-xs">
                Add method
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.label}
                  className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-2xl bg-indigo-50 p-2 text-indigo-600 dark:bg-slate-800 dark:text-slate-200">
                        <FiCreditCard />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {method.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{method.detail}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                      {method.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{method.helper}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Auto top-up</p>
              <p>Enabled at 85% of commitment. Sends alerts to finance & security.</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-slate-800 dark:text-slate-100">
                <FiShield className="text-lg" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Assurance
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Billing controls
                </h3>
              </div>
            </div>
            <ul className="mt-5 space-y-4 text-sm">
              {assuranceControls.map((control) => (
                <li
                  key={control.title}
                  className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/70"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{control.title}</p>
                  <p className="text-slate-500 dark:text-slate-400">{control.helper}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-slate-900/60">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                forecasting
              </p>
              <MdOutlineInsights className="text-2xl" />
            </div>
            <p className="mt-3 text-xl font-semibold">Projected spend: $96k / yr</p>
            <p className="text-sm text-white/70">
              Based on the last 90 days of seat and AI consumption trends.
            </p>
            <Button href="#" theme="white" className="mt-5 text-sm font-semibold text-slate-900">
              Download projection
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr,1.2fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Add-ons
            </p>
            <Button theme="white" className="text-xs">
              Configure
            </Button>
          </div>
          <div className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {addOns.map((addon) => (
              <div key={addon.name} className="py-3">
                <p className="font-semibold text-slate-900 dark:text-white">{addon.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{addon.scope}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{addon.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Invoice history
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Last 4 cycles
              </h2>
            </div>
            <Button theme="secondary" className="text-xs">
              View ledger
            </Button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-900/40 dark:text-slate-500">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
                {invoiceHistory.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-3 font-semibold">{invoice.id}</td>
                    <td className="px-4 py-3 text-sm">{invoice.date}</td>
                    <td className="px-4 py-3 text-right">{invoice.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[invoice.status] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-200"}`}
                        >
                          {invoice.status}
                        </span>
                        <Button theme="white" className="px-3 py-1 text-xs">
                          <span className="flex items-center gap-2">
                            <FiDownload />
                            PDF
                          </span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
